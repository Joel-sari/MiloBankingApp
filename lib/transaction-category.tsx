import {
  ArrowDownToLine,
  CarTaxiFront,
  Coffee,
  CreditCard,
  Plane,
  ShoppingBag,
  Tag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { transactionCategoryStyles } from "@/constants";

export const getTransactionCategoryStyle = (category: string) => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("food and drink")) {
    return transactionCategoryStyles["Food and Drink"];
  }

  if (normalizedCategory.includes("coffee")) {
    return transactionCategoryStyles.Coffee;
  }

  if (normalizedCategory.includes("transportation")) {
    return transactionCategoryStyles.Transportation;
  }

  if (normalizedCategory.includes("travel")) {
    return transactionCategoryStyles.Travel;
  }

  if (
    normalizedCategory.includes("general merchandise") ||
    normalizedCategory.includes("shopping") ||
    normalizedCategory.includes("gifts")
  ) {
    return transactionCategoryStyles.Shopping;
  }

  if (normalizedCategory.includes("card payment")) {
    return transactionCategoryStyles["Card Payment"];
  }

  if (normalizedCategory.includes("transfer in")) {
    return transactionCategoryStyles["Transfer In"];
  }

  if (normalizedCategory.includes("transfer")) {
    return transactionCategoryStyles.Transfer;
  }

  return (
    transactionCategoryStyles[
      category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default
  );
};

export const getTransactionCategoryIcon = (category: string): LucideIcon => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("transportation")) {
    return CarTaxiFront;
  }

  if (normalizedCategory.includes("travel")) {
    return Plane;
  }

  if (normalizedCategory.includes("coffee")) {
    return Coffee;
  }

  if (
    normalizedCategory.includes("fast food") ||
    normalizedCategory.includes("food")
  ) {
    return Utensils;
  }

  if (
    normalizedCategory.includes("shopping") ||
    normalizedCategory.includes("gifts")
  ) {
    return ShoppingBag;
  }

  if (normalizedCategory.includes("card payment")) {
    return CreditCard;
  }

  if (normalizedCategory.includes("transfer")) {
    return ArrowDownToLine;
  }

  return Tag;
};
