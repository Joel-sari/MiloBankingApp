import type { Transaction as PlaidTransaction } from "plaid";

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const formatPlaidCategory = (value?: string | null) =>
  value ? titleCase(value) : "";

export const normalizePlaidTransactionName = (
  transaction: PlaidTransaction,
) => {
  const sourceName = transaction.merchant_name ?? transaction.name;
  const normalizedName = sourceName.trim().toUpperCase();
  const category = getRawCategory(transaction).toUpperCase();

  if (
    normalizedName === "FUN" &&
    (category.includes("GENERAL MERCHANDISE") || category.includes("GIFT"))
  ) {
    return "Gift Shop";
  }

  return sourceName;
};

const getRawCategory = (transaction: PlaidTransaction) =>
  formatPlaidCategory(transaction.personal_finance_category?.detailed) ||
  formatPlaidCategory(transaction.personal_finance_category?.primary) ||
  transaction.category?.[0] ||
  "";

const shortenPlaidCategory = (category: string) => {
  const normalizedCategory = category.toUpperCase();

  if (normalizedCategory.includes("FAST FOOD")) {
    return "Fast Food";
  }

  if (normalizedCategory.includes("COFFEE")) {
    return "Coffee";
  }

  if (normalizedCategory.includes("FOOD AND DRINK")) {
    return "Food";
  }

  if (normalizedCategory.includes("TRANSPORTATION")) {
    return "Transportation";
  }

  if (normalizedCategory.includes("TRAVEL")) {
    return "Travel";
  }

  if (
    normalizedCategory.includes("GENERAL MERCHANDISE") ||
    normalizedCategory.includes("GIFT") ||
    normalizedCategory.includes("SHOPPING")
  ) {
    return "Shopping";
  }

  return category;
};

export const normalizePlaidTransactionCategory = (
  transaction: PlaidTransaction,
) => {
  const sourceName = (transaction.merchant_name ?? transaction.name)
    .trim()
    .toUpperCase();
  const detailedCategory = formatPlaidCategory(
    transaction.personal_finance_category?.detailed,
  );
  const primaryCategory = formatPlaidCategory(
    transaction.personal_finance_category?.primary,
  );
  const legacyCategory = transaction.category?.[0] ?? "";
  const combinedCategory = `${detailedCategory} ${primaryCategory} ${legacyCategory}`.toUpperCase();

  if (
    sourceName.includes("CREDIT CARD") &&
    sourceName.includes("PAYMENT")
  ) {
    return "Card Payment";
  }

  if (
    sourceName.includes("INTRST") ||
    sourceName.includes("INTEREST") ||
    combinedCategory.includes("TRANSFER IN")
  ) {
    return "Transfer In";
  }

  const category = detailedCategory || primaryCategory || legacyCategory || "Other";

  return shortenPlaidCategory(category);
};

export const normalizePlaidPaymentChannel = (
  transaction: PlaidTransaction,
) => transaction.payment_channel || "Other";
