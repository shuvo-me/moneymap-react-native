import {
    Coffee,
    Dumbbell,
    HeartPulse,
    Pill,
    ShoppingBag,
    Users,
    Zap
} from "@tamagui/lucide-icons-2";

export const CURRENCIES = [
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

export const ALL_CATEGORIES = [
  { id: "gym", label: "Gym", icon: Dumbbell, group: "personal", chartColor: "#546354" },
  { id: "wellness", label: "Wellness", icon: Pill, group: "personal", chartColor: "#8f4c42" },
  { id: "giving", label: "Giving", icon: HeartPulse, group: "personal", chartColor: "#a68a56" },
  { id: "bills", label: "Bills", icon: Zap, group: "personal", chartColor: "#5b7a8c" },
  { id: "family", label: "Family", icon: Users, group: "family", chartColor: "#7d6a8f" },
  { id: "wife", label: "Wife", icon: HeartPulse, group: "family", chartColor: "#aa371c" },
  { id: "food", label: "Food", icon: Coffee, group: "family", chartColor: "#d99152" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, group: "family", chartColor: "#6a8f82" },
];