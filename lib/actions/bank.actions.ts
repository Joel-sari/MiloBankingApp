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

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get all banks from the DB (appwrite)
    const banks = (((await getBanks({ userId })) ?? []) as unknown) as Bank[];
    console.log("[getAccounts] bank documents", {
      userId,
      count: banks.length,
      banks: banks.map((bank) => ({
        $id: bank.$id,
        accountId: bank.accountId,
        bankId: bank.bankId,
        fundingSourceUrl: bank.fundingSourceUrl,
        userId: bank.userId,
        shareableId: bank.shareableId,
      })),
    });

    // getting access to all the accounts from all of the banks, at the same time
    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts.find(
          (account) => account.account_id === bank.accountId,
        );

        if (!accountData) {
          throw new Error(`Plaid account not found for ${bank.accountId}`);
        }

        // get institution info from plaid
        const plaidInstitutionId = accountsResponse.data.item.institution_id!;
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

    const result = { data: accounts, totalBanks, totalCurrentBalance };
    console.log("[getAccounts] returning", result);

    return parseStringify(result);
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
    console.log("[getAccount] bank document", {
      appwriteItemId,
      bank: {
        $id: bank.$id,
        accountId: bank.accountId,
        bankId: bank.bankId,
        fundingSourceUrl: bank.fundingSourceUrl,
        userId: bank.userId,
        shareableId: bank.shareableId,
      },
    });

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts.find(
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
    const plaidInstitutionId = accountsResponse.data.item.institution_id!;
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

    const result = {
      data: account,
      transactions: allTransactions,
    };
    console.log("[getAccount] returning", {
      data: result.data,
      transactionCount: result.transactions.length,
      transactions: result.transactions,
    });

    return parseStringify(result);
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the institution:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
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
  } catch (error) {
    console.error("An error occurred while getting Plaid transactions:", error);
    return [];
  }
};
