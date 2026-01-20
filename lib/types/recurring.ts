export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
    name?: string;
    minAmount?: number;
    maxAmount?: number;
    dayOfMonth?: 'any' | number;
    frequency: RecurringFrequency;
}

export interface RecurringTransaction {
    id: string;
    date: string;
    amount: number;
    currency: string;
    description: string;
    categoryName: string;
    accountName: string;
    accountLastFour?: string;
    isPaid: boolean;
}

export interface RecurringMetric {
    year: number;
    spentPerYear: number;
    avgTransaction: number;
}

export interface RecurringAccount {
    id: string;
    name: string;
    lastFour?: string;
    icon?: string;
    color?: string;
    lastUsed: string;
    balance: number;
    changePercent: number;
    sparklineData?: number[];
}

export interface Recurring {
    id: string;
    name: string;
    icon?: string;
    color: string;
    frequency: RecurringFrequency;
    amount: number;
    currency: string;
    nextPaymentDate: string;
    nextPaymentAmount: number;
    categoryName: string;
    isOverdue: boolean;
    isPaid: boolean;
    rules: RecurringRule;
    metrics: RecurringMetric[];
    lastAccountUsed?: RecurringAccount;
    transactions: RecurringTransaction[];
    paymentHistory: {
        date: string;
        amount: number;
    }[];
}

export interface RecurringSummary {
    leftToPay: number;
    paidSoFar: number;
    totalAmount: number;
    currency: string;
}
