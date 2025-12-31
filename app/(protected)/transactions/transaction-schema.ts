import i18n from 'i18next';
import { z } from 'zod';

export const getTransactionSchema = () => {
    return z.object({
        name: z.string().optional(),
        category_id: z.string().min(1, { message: i18n.t('transactions.validation.categoryRequired') }),
        amount: z
            .number({ message: i18n.t('transactions.validation.amountInvalid') })
            .positive({ message: i18n.t('transactions.validation.amountPositive') }),
        transaction_date: z.string().min(1, { message: i18n.t('transactions.validation.dateRequired') }),
        notes: z.string().optional(),
    });
};

export type TransactionSchemaType = z.infer<ReturnType<typeof getTransactionSchema>>;
