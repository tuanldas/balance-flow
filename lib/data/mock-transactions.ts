import type { Transaction } from '@/lib/types/transaction';

// Helper to generate dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

// Mock accounts
export const mockAccounts = [
    {
        id: 'acc-1',
        name: 'Main Checking',
        bankName: 'Chase Bank',
        lastFourDigits: '4521',
    },
    {
        id: 'acc-2',
        name: 'Savings Account',
        bankName: 'Bank of America',
        lastFourDigits: '8734',
    },
    {
        id: 'acc-3',
        name: 'Business Account',
        bankName: 'Wells Fargo',
        lastFourDigits: '2156',
    },
];

// Mock categories
export const mockCategories = [
    { id: 'cat-1', name: 'Food & Dining', icon: 'utensils', color: '#F97316' },
    { id: 'cat-2', name: 'Shopping', icon: 'shopping-bag', color: '#8B5CF6' },
    { id: 'cat-3', name: 'Transportation', icon: 'car', color: '#3B82F6' },
    { id: 'cat-4', name: 'Entertainment', icon: 'film', color: '#EC4899' },
    { id: 'cat-5', name: 'Groceries', icon: 'shopping-cart', color: '#10B981' },
    { id: 'cat-6', name: 'Bills & Utilities', icon: 'receipt', color: '#EF4444' },
    { id: 'cat-7', name: 'Health & Fitness', icon: 'heart', color: '#14B8A6' },
    { id: 'cat-8', name: 'Salary', icon: 'banknote', color: '#22C55E' },
    { id: 'cat-9', name: 'Freelance', icon: 'laptop', color: '#6366F1' },
    { id: 'cat-10', name: 'Investment', icon: 'trending-up', color: '#F59E0B' },
];

export const mockTransactions: Transaction[] = [
    // Today
    {
        id: 'txn-1',
        date: today.toISOString(),
        merchant: 'Starbucks',
        merchantLogo: 'https://logo.clearbit.com/starbucks.com',
        amount: 5.75,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[0],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Morning coffee',
        tags: ['coffee', 'daily'],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
    },
    {
        id: 'txn-2',
        date: today.toISOString(),
        merchant: 'Amazon',
        merchantLogo: 'https://logo.clearbit.com/amazon.com',
        amount: 129.99,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[1],
        account: mockAccounts[0],
        status: 'to_review',
        notes: 'New headphones',
        tags: ['electronics', 'personal'],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
    },
    {
        id: 'txn-3',
        date: today.toISOString(),
        merchant: 'Company Payroll',
        amount: 3500.0,
        currency: 'USD',
        type: 'income',
        category: mockCategories[7],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Monthly salary',
        tags: ['salary', 'regular'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
    },
    // Yesterday
    {
        id: 'txn-4',
        date: yesterday.toISOString(),
        merchant: 'Uber',
        merchantLogo: 'https://logo.clearbit.com/uber.com',
        amount: 24.5,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[2],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Ride to airport',
        tags: ['travel'],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
    },
    {
        id: 'txn-5',
        date: yesterday.toISOString(),
        merchant: 'Netflix',
        merchantLogo: 'https://logo.clearbit.com/netflix.com',
        amount: 15.99,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[3],
        account: mockAccounts[1],
        status: 'completed',
        notes: 'Monthly subscription',
        tags: ['subscription', 'entertainment'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
    },
    {
        id: 'txn-6',
        date: yesterday.toISOString(),
        merchant: 'Whole Foods',
        merchantLogo: 'https://logo.clearbit.com/wholefoodsmarket.com',
        amount: 87.34,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[4],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Weekly groceries',
        tags: ['groceries', 'food'],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
    },
    // 2 days ago
    {
        id: 'txn-7',
        date: twoDaysAgo.toISOString(),
        merchant: 'Electric Company',
        amount: 145.0,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[5],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Monthly electricity bill',
        tags: ['bills', 'utilities'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: twoDaysAgo.toISOString(),
        updatedAt: twoDaysAgo.toISOString(),
    },
    {
        id: 'txn-8',
        date: twoDaysAgo.toISOString(),
        merchant: 'Gym Membership',
        merchantLogo: 'https://logo.clearbit.com/planetfitness.com',
        amount: 29.99,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[6],
        account: mockAccounts[1],
        status: 'completed',
        notes: 'Monthly gym fee',
        tags: ['health', 'fitness'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: twoDaysAgo.toISOString(),
        updatedAt: twoDaysAgo.toISOString(),
    },
    // 3 days ago
    {
        id: 'txn-9',
        date: threeDaysAgo.toISOString(),
        merchant: 'Freelance Client',
        amount: 750.0,
        currency: 'USD',
        type: 'income',
        category: mockCategories[8],
        account: mockAccounts[2],
        status: 'completed',
        notes: 'Website development project',
        tags: ['freelance', 'work'],
        createdAt: threeDaysAgo.toISOString(),
        updatedAt: threeDaysAgo.toISOString(),
    },
    {
        id: 'txn-10',
        date: threeDaysAgo.toISOString(),
        merchant: 'Target',
        merchantLogo: 'https://logo.clearbit.com/target.com',
        amount: 67.89,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[1],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Household items',
        tags: ['shopping', 'home'],
        createdAt: threeDaysAgo.toISOString(),
        updatedAt: threeDaysAgo.toISOString(),
    },
    // 1 week ago
    {
        id: 'txn-11',
        date: oneWeekAgo.toISOString(),
        merchant: 'Chipotle',
        merchantLogo: 'https://logo.clearbit.com/chipotle.com',
        amount: 12.5,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[0],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Lunch',
        tags: ['food', 'lunch'],
        createdAt: oneWeekAgo.toISOString(),
        updatedAt: oneWeekAgo.toISOString(),
    },
    {
        id: 'txn-12',
        date: oneWeekAgo.toISOString(),
        merchant: 'Spotify',
        merchantLogo: 'https://logo.clearbit.com/spotify.com',
        amount: 9.99,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[3],
        account: mockAccounts[1],
        status: 'completed',
        notes: 'Monthly subscription',
        tags: ['subscription', 'music'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: oneWeekAgo.toISOString(),
        updatedAt: oneWeekAgo.toISOString(),
    },
    {
        id: 'txn-13',
        date: oneWeekAgo.toISOString(),
        merchant: 'Investment Dividend',
        amount: 125.5,
        currency: 'USD',
        type: 'income',
        category: mockCategories[9],
        account: mockAccounts[1],
        status: 'completed',
        notes: 'Quarterly dividend payment',
        tags: ['investment', 'passive'],
        createdAt: oneWeekAgo.toISOString(),
        updatedAt: oneWeekAgo.toISOString(),
    },
    // 2 weeks ago
    {
        id: 'txn-14',
        date: twoWeeksAgo.toISOString(),
        merchant: 'Gas Station',
        amount: 45.0,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[2],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Car fuel',
        tags: ['transportation', 'car'],
        createdAt: twoWeeksAgo.toISOString(),
        updatedAt: twoWeeksAgo.toISOString(),
    },
    {
        id: 'txn-15',
        date: twoWeeksAgo.toISOString(),
        merchant: 'Apple',
        merchantLogo: 'https://logo.clearbit.com/apple.com',
        amount: 0.99,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[3],
        account: mockAccounts[0],
        status: 'to_review',
        notes: 'App purchase',
        tags: ['apps', 'entertainment'],
        createdAt: twoWeeksAgo.toISOString(),
        updatedAt: twoWeeksAgo.toISOString(),
    },
    {
        id: 'txn-16',
        date: twoWeeksAgo.toISOString(),
        merchant: 'Starbucks',
        merchantLogo: 'https://logo.clearbit.com/starbucks.com',
        amount: 6.25,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[0],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Coffee and snack',
        tags: ['coffee', 'snack'],
        createdAt: twoWeeksAgo.toISOString(),
        updatedAt: twoWeeksAgo.toISOString(),
    },
    {
        id: 'txn-17',
        date: twoWeeksAgo.toISOString(),
        merchant: 'Water Company',
        amount: 35.0,
        currency: 'USD',
        type: 'expense',
        category: mockCategories[5],
        account: mockAccounts[0],
        status: 'completed',
        notes: 'Monthly water bill',
        tags: ['bills', 'utilities'],
        isRecurring: true,
        recurringFrequency: 'monthly',
        createdAt: twoWeeksAgo.toISOString(),
        updatedAt: twoWeeksAgo.toISOString(),
    },
];

// Helper function to get similar transactions by merchant
export function getSimilarTransactions(merchantName: string, excludeId: string): Transaction[] {
    return mockTransactions
        .filter((txn) => txn.merchant.toLowerCase() === merchantName.toLowerCase() && txn.id !== excludeId)
        .slice(0, 5);
}

// Helper function to get unique tags from all transactions
export function getUniqueTags(): { id: string; name: string }[] {
    const tagsSet = new Set<string>();
    mockTransactions.forEach((txn) => {
        txn.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet)
        .sort()
        .map((tag) => ({ id: tag, name: tag }));
}

// Advanced filter function supporting all filter types
export function filterTransactionsAdvanced(
    transactions: Transaction[],
    filters: {
        search?: string;
        accountIds?: string[];
        categoryIds?: string[];
        tags?: string[];
        type?: 'income' | 'expense';
    },
    sortBy: 'date' | 'amount_asc' | 'amount_desc',
): Transaction[] {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
            (txn) =>
                txn.merchant.toLowerCase().includes(searchLower) ||
                txn.category.name.toLowerCase().includes(searchLower) ||
                txn.notes?.toLowerCase().includes(searchLower) ||
                txn.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
        );
    }

    // Account filter
    if (filters.accountIds?.length) {
        filtered = filtered.filter((txn) => filters.accountIds!.includes(txn.account.id));
    }

    // Category filter
    if (filters.categoryIds?.length) {
        filtered = filtered.filter((txn) => filters.categoryIds!.includes(txn.category.id));
    }

    // Tags filter
    if (filters.tags?.length) {
        filtered = filtered.filter((txn) => txn.tags?.some((tag) => filters.tags!.includes(tag)));
    }

    // Type filter
    if (filters.type) {
        filtered = filtered.filter((txn) => txn.type === filters.type);
    }

    // Sort
    switch (sortBy) {
        case 'date':
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
        case 'amount_asc':
            filtered.sort((a, b) => a.amount - b.amount);
            break;
        case 'amount_desc':
            filtered.sort((a, b) => b.amount - a.amount);
            break;
    }

    return filtered;
}

// Helper function to group transactions by date
export function groupTransactionsByDate(
    transactions: Transaction[],
    t: (key: string, options?: Record<string, unknown>) => string,
): { label: string; date: string; transactions: Transaction[] }[] {
    const groups: Map<string, Transaction[]> = new Map();

    transactions.forEach((txn) => {
        const txnDate = new Date(txn.date);
        const dateKey = txnDate.toISOString().split('T')[0];

        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(txn);
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const result: { label: string; date: string; transactions: Transaction[] }[] = [];

    groups.forEach((txns, dateKey) => {
        const date = new Date(dateKey);
        let label: string;

        if (dateKey === today.toISOString().split('T')[0]) {
            label = t('transactions.dateGroups.today');
        } else if (dateKey === yesterday.toISOString().split('T')[0]) {
            label = t('transactions.dateGroups.yesterday');
        } else {
            label = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
            });
        }

        result.push({ label, date: dateKey, transactions: txns });
    });

    // Sort groups by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
}
