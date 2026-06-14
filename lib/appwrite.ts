"use server";

// Appwrite SDK imports for Node.js
import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

/**
 * Load and validate environment variables from .env file
 * These are required to connect to Appwrite backend
 */
const appwriteEndpoint = getRequiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");     // URL where Appwrite server is running
const appwriteProjectId = getRequiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");   // Project ID in Appwrite
const appwriteKey = getRequiredEnv("NEXT_APPWRITE_KEY");                       // Secret API key for admin operations

/**
 * Helper function to ensure required environment variables exist
 * Throws error if variable is missing (prevents runtime errors)
 */
function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * CREATE SESSION CLIENT - Authenticates as a specific user
 * 
 * Used when: You need to access data as the currently logged-in user
 * 
 * How it works:
 * 1. Reads the session cookie set during sign-in/sign-up
 * 2. Proves to Appwrite "I am this authenticated user"
 * 3. Can only access data the user has permission to see
 * 4. Cannot perform admin operations (create new accounts, delete other users, etc.)
 * 
 * Used in: getLoggedInUser(), fetching user's bank accounts, transactions, etc.
 * 
 * @throws Error if user is not authenticated (no valid session cookie)
 * @returns Object with 'account' property for user operations
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId);

  // Retrieve the session token from the secure HTTP-only cookie
  // This cookie was set during sign-in or sign-up
  const session = (await cookies()).get("my-custom-session");
  if (!session || !session.value) {
    // Throw error if user is not authenticated
    throw new Error("No session");
  }

  // Authenticate with Appwrite using the session token
  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

/**
 * CREATE ADMIN CLIENT - Full backend access with secret API key
 * 
 * Used when: You need to perform privileged operations
 * 
 * How it works:
 * 1. Uses the secret API key (NEXT_APPWRITE_KEY) which should never be exposed to client
 * 2. Can perform any operation in Appwrite without user session
 * 3. Can create accounts, delete records, update any user's data, etc.
 * 4. Must only be used in server code (never send to client)
 * 
 * Used in: signIn(), signUp(), and other admin operations
 * 
 * Security: The API key is stored in .env and never sent to the browser
 * 
 * @returns Object with 'account', 'database', and 'user' properties for admin operations
 */
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setKey(appwriteKey);  // Secret key - only available on server

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    },
  };
}
