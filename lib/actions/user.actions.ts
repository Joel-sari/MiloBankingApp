"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath, updateTag } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_TABLE_ID: USER_TABLE_ID,
  APPWRITE_BANKS_TABLE_ID: BANK_TABLE_ID
} = process.env;

interface SessionResponse {
  secret?: string;
  $id?: string;
}

const normalizeUser = <T extends Record<string, unknown> & {
  firstName?: string;
  lastName?: string;
}>(user: T) => ({
  ...user,
  name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
});

/**
 * SIGN IN - Server action that authenticates an existing user
 * 
 * Flow:
 * 1. Accepts email and password credentials from client
 * 2. Creates an admin client to access Appwrite without a session
 * 3. Creates an email/password session with Appwrite
 * 4. Stores the session token in an HTTP-only cookie (secure, server-side only)
 * 5. Returns the session data to the client for confirmation
 * 
 * Security notes:
 * - httpOnly: prevents JavaScript from accessing the cookie (protects against XSS)
 * - sameSite: "strict" prevents cross-site cookie sending
 * - secure: true means cookie only sent over HTTPS (production)
 * 
 * @param credentials - Object containing email and password
 * @returns Session object if successful, null if failed
 */

export const getUserInfo = async ( { userId }: getUserInfoProps )=>{
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_TABLE_ID!,
      [Query.equal('userId', [userId])]

    )
    return parseStringify(user.documents[0]);
  }
  catch(error){
    
  }
}
export const signIn = async (credentials: signInProps) => {
  try {
    const { email, password } = credentials;

    // Create admin client - used to authenticate without an existing session
    const { account } = await createAdminClient();

    // Create a new session with email and password
    // This authenticates the user and returns a session token
    let session;
    
    if (account.createEmailPasswordSession) {
      session = await account.createEmailPasswordSession(email, password);
    } else {
      throw new Error("createEmailPasswordSession method not available");
    }

    // Validate session was created successfully
    if (!session) {
      throw new Error("Failed to create session");
    }

    // Extract the session token - different Appwrite versions use different field names
    const sessionData = session as SessionResponse;
    const token = sessionData.secret || sessionData.$id || "";

    // Store session token in a secure HTTP-only cookie
    // This allows the server to verify the user's identity on future requests
    const cookieStore = await cookies();
    cookieStore.set("my-custom-session", token, {
      path: "/",                  // Cookie available on all routes
      httpOnly: true,             // Only server can read (JS cannot access)
      sameSite: "strict",         // Only send cookie with same-site requests
      secure: true,               // Only send over HTTPS (production)
    });

    // Return session data to client (confirms successful sign-in)
    return parseStringify(session);
  } catch (error: unknown) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error during sign in:", message);
    // Return null on failure - client checks for null and shows error message
    return null;
  }
};


/**
 * SIGN UP - Server action that creates a new user account
 * 
 * Flow:
 * 1. Accepts user data (email, password, name, address info, etc.)
 * 2. Creates an admin client to access Appwrite
 * 3. Creates a new user account with Appwrite
 * 4. Automatically creates a session for the new user (auto-login after sign-up)
 * 5. Stores the session token in an HTTP-only cookie (same security as signIn)
 * 6. Returns the new user account data
 * 
 * @param userData - User registration data including email, password, name, address
 * @returns New user account object if successful, null if failed
 */
export const signUp = async ({password, ...userData}: SignUpParams) => {

  // Extract the essential fields from the signup form
  const {
    email,
    firstName,
    lastName,
    address1,
    city,
    state,
    postalCode,
    dateOfBirth,
    ssn,
  } = userData

  let newUserAccount;
  try {

    // Create admin client to create new account
    const { account, database } = await createAdminClient();

    // Create new user account in Appwrite
    // ID.unique() generates a unique 36-char ID for this user
    // The name field combines first and last name
    newUserAccount = await account.create(
      ID.unique(),                                              // userId: unique identifier
      email,                                                    // email: login email
      password,                                                 // password: hashed by Appwrite
      `${firstName ?? ""} ${lastName ?? ""}`.trim()            // name: display name
    );
    if(!newUserAccount) throw new Error('Error creating user')

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type:"personal",
    })

    if (!dwollaCustomerUrl) throw new Error('Error creating Dwolla Customer');

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_TABLE_ID!,
      ID.unique(),
      {
        firstName,
        lastName,
        address1,
        city,
        state,
        postalCode,
        dateOfBirth,
        ssn,
        email,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl

      }
    )


    // After account creation, automatically log the user in
    // This creates a session so the user doesn't have to sign in again
    let session;
    if (account.createEmailPasswordSession) {
      session = await account.createEmailPasswordSession(email, password);
    } else {
      throw new Error("createEmailPasswordSession method not available");
    }

    // Validate session was created
    if (!session) {
      throw new Error("Failed to create session");
    }

    // Extract session token (same process as in signIn)
    const sessionData = session as SessionResponse;
    const token = sessionData.secret || sessionData.$id || "";

    // Store the session in a secure cookie (same security settings as signIn)
    const cookieStore = await cookies();
    cookieStore.set("my-custom-session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Return new account data to client (confirms account was created)
    return parseStringify(normalizeUser(newUser)) as unknown as User;
  } catch (error: unknown) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error during sign up:", message);
    // Return null on failure - client shows error message
    return null;
  }
};


/**
 * GET LOGGED IN USER - Server action that retrieves the current user's data
 * 
 * Flow:
 * 1. Creates a session client (uses the cookie we stored during sign-in/sign-up)
 * 2. The session client validates the cookie and proves who the user is
 * 3. Fetches the current user's profile from Appwrite
 * 4. Returns user data if authenticated, null if no valid session
 * 
 * This is used by:
 * - Protected pages to verify user is logged in
 * - Navigation to show user name and profile
 * - Any server action that needs to know who the current user is
 * 
 * @returns User object if authenticated, null if not logged in
 */
export async function getLoggedInUser(): Promise<User | null> {
  try{
    // Create session client using the cookie from sign-in
    // This validates the user is authenticated and has a valid session
    const { account } = await createSessionClient();
    
    // Fetch the authenticated Appwrite account first.
    const accountUser = await account.get();
    

    const { database } = await createAdminClient();
    const users = await database.listDocuments(
      DATABASE_ID!,
      USER_TABLE_ID!,
      [Query.equal("userId", accountUser.$id)]
    );

    const user = users.documents[0];

    if (!user) return null;

    // Cast through unknown to satisfy TypeScript without losing the server-side shape
    return parseStringify(normalizeUser(user)) as unknown as User;
  } catch (error: unknown) {
    unstable_rethrow(error);
    // Return null if user is not authenticated or session is invalid
    // This happens when: no cookie exists, cookie is expired, or cookie is invalid
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching logged in user:", message);
    return null;
  }
}


export const logoutAccount = async () => {
  try {
    // we need to retrieve the already created session
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    (await cookies()).delete('my-custom-session');

    return true;
  } catch (error: unknown) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error during logout:", message);
    return null;
  }
};

export const createLinkToken = async( user: User) => {
  try{
    const tokenParams = {
      user: {
        // specific Plaid ID structure 
        client_user_id: user.$id
      },
      client_name: user.name,
      products: [Products.Auth, Products.Transactions],
      transactions: {
        days_requested: 180,
      },
      language: 'en',
      country_codes:['US'] as CountryCode[],

    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({linkToken: response.data.link_token})

  }
  catch(error){
    console.log(error);
    
}
}

// Strictly creating a bank acocunt within Appwrite (our database)
export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,


}: createBankAccountProps)=> {
  try{
    //createAdminClient allows us to create/add to the database
    const { database } = await createAdminClient();

    const existingBankAccount = await database.listDocuments(
      DATABASE_ID!,
      BANK_TABLE_ID!,
      [
        Query.equal("userId", [userId]),
        Query.equal("fundingSourceUrl", [fundingSourceUrl]),
      ],
    );

    if (existingBankAccount.documents[0]) {
      console.warn("[createBankAccount] bank account already exists", {
        userId,
        fundingSourceUrl,
        bankDocumentId: existingBankAccount.documents[0].$id,
      });
      return parseStringify(existingBankAccount.documents[0]);
    }

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_TABLE_ID!,
      ID.unique(),
      {
        userId, 
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      },
    );

    return parseStringify(bankAccount);

  }
  catch(error){
    console.error("Error creating bank account:", {
      userId,
      bankId,
      accountId,
      fundingSourceUrl,
      shareableId,
      error,
    });
    throw error;
  }
}

export const exchangePublicToken = async ({
  publicToken,
  user, 
}: exchangePublicTokenProps)=> {

  try {
    // We need to exchnage the public token for access token and an item ID given by PLAID 
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,

    })

    // now we destrcuture the informaation received from our response
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using the account token 
    const accountsResponse = await plaidClient.accountsGet
    ({
      access_token: accessToken,
    });
    const selectedAccounts = accountsResponse.data.accounts;
    console.log("[exchangePublicToken] Plaid accounts returned", {
      itemId,
      userId: user.$id,
      count: selectedAccounts.length,
      accounts: selectedAccounts.map((account) => ({
        accountId: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
      })),
    });

    if (!selectedAccounts.length) {
      throw new Error("No Plaid accounts were returned for this item");
    }

    const dwollaSupportedAccounts = selectedAccounts.filter((account) =>
      ["checking", "savings", "money market"].includes(account.subtype ?? ""),
    );

    if (!dwollaSupportedAccounts.length) {
      throw new Error(
        "No selected Plaid accounts can be used with Dwolla. Select a checking, savings, or money market account.",
      );
    }

    const skippedAccounts = selectedAccounts.filter(
      (account) => !dwollaSupportedAccounts.includes(account),
    );

    if (skippedAccounts.length) {
      console.warn("[exchangePublicToken] skipping unsupported Dwolla accounts", {
        accounts: skippedAccounts.map((account) => ({
          accountId: account.account_id,
          name: account.name,
          subtype: account.subtype,
        })),
      });
    }

    const bankAccounts = await Promise.all(
      dwollaSupportedAccounts.map(async (accountData) => {
        // Creating a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
          access_token: accessToken,
          account_id: accountData.account_id,
          processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse =
          await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        // Now we need to create a funding source URL for each selected account.
        const fundingSourceUrl = await addFundingSource({
          dwollaCustomerId: user.dwollaCustomerId,
          processorToken,
          bankName: accountData.name,
        });

        if (!fundingSourceUrl) {
          throw new Error(
            `Error creating funding source for ${accountData.name}`,
          );
        }

        return createBankAccount({
          userId: user.$id,
          bankId: itemId,
          accountId: accountData.account_id,
          accessToken,
          fundingSourceUrl,
          shareableId: encryptId(accountData.account_id),
        });
      }),
    );
    console.log("[exchangePublicToken] bank accounts created", {
      count: bankAccounts.length,
      bankAccounts: bankAccounts.map((bankAccount) => ({
        $id: bankAccount?.$id,
        userId: bankAccount?.userId,
        accountId: bankAccount?.accountId,
        bankId: bankAccount?.bankId,
        fundingSourceUrl: bankAccount?.fundingSourceUrl,
        shareableId: bankAccount?.shareableId,
      })),
    });

    //Lastly we need to revalidate the path to reflect the changes
    updateTag("plaid-accounts");
    updateTag("plaid-transactions");
    revalidatePath("/");

    //Return a success message!
    return parseStringify({
      publicTokenExchange: "complete",
      accountsAdded: bankAccounts.length,
    })


  }
  catch(error){
    console.error("Error exchanging public token:", error);
    throw error;
  }
}
export const getBanks = async ({ userId }: getBanksProps) => {

  try {
    const { database }= await createAdminClient();
    
    // we want t get the banks inside our database, using our database ID, BankID, and most importantly, we query with the follwowing syntax for our appwrite db: Qeury.equal('userId'), [userId])
    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_TABLE_ID!,
      [Query.equal('userId', [userId])]
    )
    console.log("[getBanks] returning", {
      userId,
      count: banks.documents.length,
      banks: banks.documents.map((bank) => ({
        $id: bank.$id,
        accountId: bank.accountId,
        bankId: bank.bankId,
        fundingSourceUrl: bank.fundingSourceUrl,
        userId: bank.userId,
        shareableId: bank.shareableId,
      })),
    });
    return parseStringify(banks.documents);

  }
  catch(error){
    console.log(error)
  }
}

export const getBank = async ({ documentId } : getBankProps ) => {
  try {
    const { database } = await createAdminClient();

    // we want t get the banks inside our database, using our database ID, BankID, and most importantly, we query with the follwowing syntax for our appwrite db: Qeury.equal('userId'), [userId])
    const bank = await database.listDocuments(DATABASE_ID!, BANK_TABLE_ID!, [
      Query.equal("$id", [documentId]),
    ]);
    console.log("[getBank] returning", {
      documentId,
      found: Boolean(bank.documents[0]),
      bank: bank.documents[0]
        ? {
            $id: bank.documents[0].$id,
            accountId: bank.documents[0].accountId,
            bankId: bank.documents[0].bankId,
            fundingSourceUrl: bank.documents[0].fundingSourceUrl,
            userId: bank.documents[0].userId,
            shareableId: bank.documents[0].shareableId,
          }
        : null,
    });
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error);
  }
};
