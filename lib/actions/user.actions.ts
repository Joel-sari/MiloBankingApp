"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

/**
 * Interface for Appwrite session response
 * Sessions can return either a 'secret' or '$id' depending on the SDK version
 */
interface AppwriteSession {
  secret?: string;
  $id?: string;
}

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
    const token = (session as any).secret || (session as any).$id || "";

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
  } catch (error) {
    console.error("Error during sign in:", error);
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
export const signUp = async (userData: SignUpParams) => {

  // Extract the essential fields from the signup form
  const { email, password, firstName, lastName } = userData
  try {

    // Create admin client to create new account
    const { account } = await createAdminClient();

    // Create new user account in Appwrite
    // ID.unique() generates a unique 36-char ID for this user
    // The name field combines first and last name
    const newUserAccount = await account.create(
      ID.unique(),                                              // userId: unique identifier
      email,                                                    // email: login email
      password,                                                 // password: hashed by Appwrite
      `${firstName ?? ""} ${lastName ?? ""}`.trim()            // name: display name
    );

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
    const token = (session as any).secret || (session as any).$id || "";

    // Store the session in a secure cookie (same security settings as signIn)
    const cookieStore = await cookies();
    cookieStore.set("my-custom-session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Return new account data to client (confirms account was created)
    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error during sign up:", error);
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
export async function getLoggedInUser(){
  try{
    // Create session client using the cookie from sign-in
    // This validates the user is authenticated and has a valid session
    const { account } = await createSessionClient();
    
    // Fetch the current user's profile data from Appwrite
    const user = await account.get();

    // Return user data (ID, email, name, metadata, etc.)
    return parseStringify(user);
  } catch(error){
    // Return null if user is not authenticated or session is invalid
    // This happens when: no cookie exists, cookie is expired, or cookie is invalid
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
  }
  catch (error){
    console.log("Error during logout")
    return null;

  }
    

}