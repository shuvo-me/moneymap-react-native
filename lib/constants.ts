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
    // ... add more
]

export const ALL_CATEGORIES = [
    // PERSONAL GROUP
    { id: "gym", label: "Gym", icon: Dumbbell, group: "personal", color: "$secondary" },
    { id: "wellness", label: "Wellness", icon: Pill, group: "personal", color: "$secondary" },
    { id: "giving", label: "Giving", icon: HeartPulse, group: "personal", color: "$secondary" },
    { id: "bills", label: "Bills", icon: Zap, group: "personal", color: "$secondary" },
    // FAMILY GROUP
    { id: "family", label: "Family", icon: Users, group: "family", color: "$primary" },
    { id: "wife", label: "Wife", icon: HeartPulse, group: "family", color: "$primary" },
    { id: "food", label: "Food", icon: Coffee, group: "family", color: "$primary" },
    { id: "shopping", label: "Shopping", icon: ShoppingBag, group: "family", color: "$primary" },
];