// Material Icons commonly used for categories
export const CATEGORY_ICONS = [
    // Income icons
    { value: 'work', label: 'Work', category: 'income' },
    { value: 'card_giftcard', label: 'Gift', category: 'income' },
    { value: 'trending_up', label: 'Investment', category: 'income' },
    { value: 'business', label: 'Business', category: 'income' },
    { value: 'sync_alt', label: 'Transfer', category: 'both' },
    { value: 'attach_money', label: 'Money', category: 'both' },
    { value: 'payments', label: 'Payments', category: 'both' },
    { value: 'account_balance', label: 'Bank', category: 'both' },

    // Expense icons - Food
    { value: 'restaurant', label: 'Restaurant', category: 'expense' },
    { value: 'breakfast_dining', label: 'Breakfast', category: 'expense' },
    { value: 'lunch_dining', label: 'Lunch', category: 'expense' },
    { value: 'dinner_dining', label: 'Dinner', category: 'expense' },
    { value: 'local_cafe', label: 'Coffee', category: 'expense' },
    { value: 'local_bar', label: 'Bar', category: 'expense' },
    { value: 'fastfood', label: 'Fast Food', category: 'expense' },
    { value: 'local_pizza', label: 'Pizza', category: 'expense' },

    // Expense icons - Shopping
    { value: 'shopping_cart', label: 'Shopping', category: 'expense' },
    { value: 'shopping_bag', label: 'Shopping Bag', category: 'expense' },
    { value: 'checkroom', label: 'Clothing', category: 'expense' },
    { value: 'devices', label: 'Electronics', category: 'expense' },
    { value: 'face', label: 'Cosmetics', category: 'expense' },

    // Expense icons - Transportation
    { value: 'directions_car', label: 'Car', category: 'expense' },
    { value: 'local_gas_station', label: 'Gas', category: 'expense' },
    { value: 'local_parking', label: 'Parking', category: 'expense' },
    { value: 'local_taxi', label: 'Taxi', category: 'expense' },
    { value: 'directions_bus', label: 'Bus', category: 'expense' },
    { value: 'two_wheeler', label: 'Motorcycle', category: 'expense' },

    // Expense icons - Housing
    { value: 'home', label: 'Home', category: 'expense' },
    { value: 'apartment', label: 'Apartment', category: 'expense' },
    { value: 'water_drop', label: 'Water', category: 'expense' },
    { value: 'bolt', label: 'Electricity', category: 'expense' },
    { value: 'wifi', label: 'Internet', category: 'expense' },

    // Expense icons - Health
    { value: 'local_hospital', label: 'Hospital', category: 'expense' },
    { value: 'medication', label: 'Medicine', category: 'expense' },
    { value: 'medical_services', label: 'Medical', category: 'expense' },
    { value: 'fitness_center', label: 'Fitness', category: 'expense' },

    // Expense icons - Education
    { value: 'school', label: 'School', category: 'expense' },
    { value: 'menu_book', label: 'Book', category: 'expense' },
    { value: 'translate', label: 'Language', category: 'expense' },

    // Expense icons - Entertainment
    { value: 'movie', label: 'Movie', category: 'expense' },
    { value: 'videogame_asset', label: 'Gaming', category: 'expense' },
    { value: 'sports_esports', label: 'Esports', category: 'expense' },
    { value: 'music_note', label: 'Music', category: 'expense' },
    { value: 'theater_comedy', label: 'Theater', category: 'expense' },
    { value: 'flight', label: 'Travel', category: 'expense' },

    // Expense icons - Bills & Services
    { value: 'receipt', label: 'Receipt', category: 'expense' },
    { value: 'receipt_long', label: 'Bills', category: 'expense' },
    { value: 'security', label: 'Insurance', category: 'expense' },
    { value: 'phonelink', label: 'Phone', category: 'expense' },

    // Other
    { value: 'pets', label: 'Pets', category: 'expense' },
    { value: 'redeem', label: 'Gift/Donation', category: 'expense' },
    { value: 'celebration', label: 'Celebration', category: 'expense' },
    { value: 'category', label: 'Other', category: 'both' },
];

// Predefined color palette for categories
export const CATEGORY_COLORS = [
    // Green tones (income)
    { value: '#4CAF50', label: 'Green', category: 'income' },
    { value: '#8BC34A', label: 'Light Green', category: 'income' },
    { value: '#009688', label: 'Teal', category: 'income' },
    { value: '#00BCD4', label: 'Cyan', category: 'income' },
    { value: '#03A9F4', label: 'Light Blue', category: 'income' },

    // Red/Orange tones (expense)
    { value: '#FF5722', label: 'Deep Orange', category: 'expense' },
    { value: '#E91E63', label: 'Pink', category: 'expense' },
    { value: '#9C27B0', label: 'Purple', category: 'expense' },
    { value: '#673AB7', label: 'Deep Purple', category: 'expense' },
    { value: '#3F51B5', label: 'Indigo', category: 'expense' },
    { value: '#2196F3', label: 'Blue', category: 'expense' },
    { value: '#00BCD4', label: 'Cyan', category: 'expense' },
    { value: '#009688', label: 'Teal', category: 'expense' },
    { value: '#4CAF50', label: 'Green', category: 'expense' },
    { value: '#F44336', label: 'Red', category: 'expense' },
    { value: '#FF9800', label: 'Orange', category: 'expense' },
    { value: '#FFC107', label: 'Amber', category: 'expense' },
    { value: '#FFEB3B', label: 'Yellow', category: 'expense' },

    // Neutral
    { value: '#9E9E9E', label: 'Grey', category: 'both' },
    { value: '#607D8B', label: 'Blue Grey', category: 'both' },
    { value: '#795548', label: 'Brown', category: 'both' },
];
