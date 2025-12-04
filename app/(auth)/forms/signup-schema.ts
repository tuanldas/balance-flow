import i18n from 'i18next';
import { z } from 'zod';
import { getPasswordSchema } from './password-schema';

export const getSignupSchema = () => {
    return z
        .object({
            name: z
                .string()
                .min(1, { message: i18n.t('auth.validation.nameRequired') })
                .min(2, { message: i18n.t('auth.validation.nameMinLength') }),
            email: z
                .string()
                .min(1, { message: i18n.t('auth.validation.emailRequired') })
                .email({ message: i18n.t('auth.validation.emailInvalid') }),
            password: getPasswordSchema(),
            passwordConfirmation: z.string().min(1, {
                message: i18n.t('auth.validation.confirmPasswordRequired'),
            }),
        })
        .refine((data) => data.password === data.passwordConfirmation, {
            message: i18n.t('auth.validation.passwordsNotMatch'),
            path: ['passwordConfirmation'],
        });
};

export type SignupSchemaType = z.infer<ReturnType<typeof getSignupSchema>>;
