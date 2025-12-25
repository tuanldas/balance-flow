import i18n from 'i18next';
import { z } from 'zod';

export const getTransactionSchema = () => {
    return z.object({
        category_id: z.string().min(1, { message: i18n.t('transactions.validation.categoryRequired') }),
        amount: z
            .number({ message: i18n.t('transactions.validation.amountInvalid') })
            .positive({ message: i18n.t('transactions.validation.amountPositive') }),
        transaction_date: z.string().min(1, { message: i18n.t('transactions.validation.dateRequired') }),
        merchant_name: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
    });
};

export type TransactionSchemaType = z.infer<ReturnType<typeof getTransactionSchema>>;
