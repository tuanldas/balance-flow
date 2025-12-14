import type { Transaction } from '@/lib/types/transaction';

export function groupTransactionsByDate(
    transactions: Transaction[],
    t: (key: string) => string,
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

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
}
