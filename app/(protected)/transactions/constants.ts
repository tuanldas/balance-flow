import {
    Banknote,
    Car,
    Film,
    Heart,
    Laptop,
    Receipt,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Utensils,
} from 'lucide-react';

// Map category icon names to Lucide icons
export const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    utensils: Utensils,
    'shopping-bag': ShoppingBag,
    car: Car,
    film: Film,
    'shopping-cart': ShoppingCart,
    receipt: Receipt,
    heart: Heart,
    banknote: Banknote,
    laptop: Laptop,
    'trending-up': TrendingUp,
};

// Default icon when category icon not found
export const DefaultCategoryIcon = ShoppingBag;

// Map i18n language code to Intl locale for formatting
export const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
};
