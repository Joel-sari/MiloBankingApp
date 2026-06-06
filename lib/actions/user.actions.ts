"use server";

// server actions are typically used for POST requests, but can be used for any HTTP method. They allow you to perform server-side logic and then return a response to the client. In this case, we are defining a signIn action that will handle the logic for signing in a user.

export const signIn = async () => {
  try {
    // Mutation or modification of the database
  } catch (error) {
    console.error("Error during sign in:", error);
  }
};

export const signUp = async (userData: SignUpParams) => {
  try {
    // Mutation or modification of the database
  } catch (error) {
    console.error("Error during sign up:", error);
  }
};