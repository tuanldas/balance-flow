import { z } from 'zod';

/**
 * Zod schema for account creation and editing
 */
export const accountSchema = z.object({
    account_type_id: z.string().min(1, 'accounts.validation.accountTypeRequired'),
    name: z.string().min(2, 'accounts.validation.nameMinLength').max(255),
    balance: z.number().min(0, 'accounts.validation.balancePositive'),
    currency: z.string().min(1, 'accounts.validation.currencyRequired'),
    icon: z.string().optional(),
    color: z.string().optional(),
    description: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
