import { ShoppingBag } from "@tamagui/lucide-icons-2";
import { format, isToday } from "date-fns";
import { ALL_CATEGORIES } from "./constants";

export const formatCurrency = (amount: number, currencySymbol: string = "$") => {
  return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
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

    return format(date, 'dd mm yyyy');
  }