"use server";
// Fetch bank data that we need!
// We map over all the data, and return only the data that we actually need.
import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";
import { unstable_cache } from "next/cache";
import {
  normalizePlaidPaymentChannel,
  normalizePlaidTransactionCategory,
  normalizePlaidTransactionName,
} from "../plaid-normalizers";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

type PlaidInstitution = {
  institution_id?: string;
};

const getCachedPlaidAccounts = unstable_cache(
  async (accessToken: string) => {
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return parseStringify(accountsResponse.data);
  },
  ["plaid-accounts"],
  {
    tags: ["plaid-accounts"],
    revalidate: 300,
  },
);

const getCachedPlaidInstitution = unstable_cache(
  async (institutionId: string) => {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    return parseStringify(institutionResponse.data.institution);
  },
  ["plaid-institution"],
  {
    tags: ["plaid-institutions"],
    revalidate: 3600,
  },
);

const getCachedPlaidTransactions = unstable_cache(
  async (accessToken: string) => {
    let hasMore = true;
    let transactions: Transaction[] = [];

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
          days_requested: 180,
        },
      });

      const data = response.data;

      const addedTransactions = response.data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: normalizePlaidTransactionName(transaction),
        paymentChannel: normalizePlaidPaymentChannel(transaction),
        type: transaction.amount > 0 ? "debit" : "credit",
        accountId: transaction.account_id,
        amount: Math.abs(transaction.amount),
        pending: transaction.pending,
        category: normalizePlaidTransactionCategory(transaction),
        date: transaction.date,
        image: transaction.logo_url,
      }));

      transactions = [...transactions, ...addedTransactions];
      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  },
  ["plaid-transactions"],
  {
    tags: ["plaid-transactions"],
    revalidate: 300,
  },
);

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get all banks from the DB (appwrite)
    const banks = (((await getBanks({ userId })) ?? []) as unknown) as Bank[];
    // getting access to all the accounts from all of the banks, at the same time
    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsData = await getCachedPlaidAccounts(bank.accessToken);
        const accountData = accountsData.accounts.find(
          (account) => account.account_id === bank.accountId,
        );

        if (!accountData) {
          throw new Error(`Plaid account not found for ${bank.accountId}`);
        }

        // get institution info from plaid
        const plaidInstitutionId = accountsData.item.institution_id!;
        const institution = (await getInstitution({
          institutionId: plaidInstitutionId,
        })) as PlaidInstitution | undefined;

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution?.institution_id ?? plaidInstitutionId,
          name: accountData.name,
          officialName: accountData.official_name ?? accountData.name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };

        return account;
      }),
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    if (!bank) throw new Error("Bank not found");
    // get account info from plaid
    const accountsData = await getCachedPlaidAccounts(bank.accessToken);
    const accountData = accountsData.accounts.find(
      (account) => account.account_id === bank.accountId,
    );

    if (!accountData) {
      throw new Error(`Plaid account not found for ${bank.accountId}`);
    }

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferDocuments =
      (transferTransactionsData.documents as unknown as Transaction[]) ?? [];

    const transferTransactions = transferDocuments.map((transferData) => ({
        id: transferData.$id ?? transferData.id,
        name: transferData.name,
        amount: transferData.amount,
        date: transferData.$createdAt ?? transferData.date,
        paymentChannel: transferData.channel ?? transferData.paymentChannel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      }));

    // get institution info from plaid
    const plaidInstitutionId = accountsData.item.institution_id!;
    const institution = (await getInstitution({
      institutionId: plaidInstitutionId,
    })) as PlaidInstitution | undefined;

    const transactions = ((await getTransactions({
      accessToken: bank?.accessToken,
    })) ?? []) as Transaction[];
    const accountTransactions = transactions.filter(
      (transaction) => transaction.accountId === bank.accountId,
    );

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution?.institution_id ?? plaidInstitutionId,
      name: accountData.name,
      officialName: accountData.official_name ?? accountData.name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [
      ...accountTransactions,
      ...transferTransactions,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    return getCachedPlaidInstitution(institutionId);
  } catch (error) {
    console.error("An error occurred while getting the institution:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  try {
    return getCachedPlaidTransactions(accessToken);
  } catch (error) {
    console.error("An error occurred while getting Plaid transactions:", error);
    return [];
  }
};
