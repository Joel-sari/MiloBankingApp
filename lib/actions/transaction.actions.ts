"use server";

import { Query } from "node-appwrite";

import { createAdminClient } from "../appwrite";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_TABLE_ID: TRANSACTION_TABLE_ID,
} = process.env;

export const getTransactionsByBankId = async ({
  bankId,
}: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    if (!DATABASE_ID || !TRANSACTION_TABLE_ID) {
      return { documents: [] };
    }

    return await database.listDocuments(DATABASE_ID, TRANSACTION_TABLE_ID, [
      Query.equal("senderBankId", bankId),
    ]);
  } catch (error) {
    console.error("An error occurred while getting transfer transactions:", error);
    return { documents: [] };
  }
};
