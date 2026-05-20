import { ShoppingBag } from "@tamagui/lucide-icons-2";
import { format, isToday } from "date-fns";
import { ALL_CATEGORIES } from "./constants";

export const formatCurrency = (amount: number, currencySymbol: string = "$") => {
  if (!amount || amount === 0) return `${currencySymbol}0`;

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  let formattedValue = "";

  // 1. Check Billion FIRST (Largest)
  if (absAmount >= 1_000_000_000) {
    const value = absAmount / 1_000_000_000;
    formattedValue = `${value.toFixed(value % 1 === 0 ? 0 : 1)} b`;
  }
  // 2. Check Million SECOND
  else if (absAmount >= 1_000_000) {
    const value = absAmount / 1_000_000;
    formattedValue = `${value.toFixed(value % 1 === 0 ? 0 : 1)} m`;
  }
  // 3. Check Lac THIRD
  else if (absAmount >= 100_000) {
    const value = absAmount / 100_000;
    formattedValue = `${value.toFixed(value % 1 === 0 ? 0 : 1)} lac`;
  }
  // 4. Everything else (Standard formatting below 100k)
  else {
    formattedValue = absAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  return `${sign}${currencySymbol}${formattedValue}`;
};

export const getIconForCategory = (category: string) => {
  const icon = ALL_CATEGORIES.find((c) => c.id === category)?.icon;
  if (icon) {
    return icon;
  }
  return ShoppingBag;
}

export const formatLogDate = (timeStamp: any) => {
  const date = timeStamp.toDate ? timeStamp.toDate() : new Date(timeStamp);
  if (isToday(date)) {
    return "Today";
  }

  return format(date, 'dd MMM, yyyy');
}

export const getPastelAlphaColor = (hex: string, alpha: number = 0.12): string => {
  // Clean the string if it includes the hash symbol
  const cleanHex = hex.replace('#', '');

  // Parse out the individual RGB decimal channels
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};