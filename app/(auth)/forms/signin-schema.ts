import { z } from 'zod';

export const getSigninSchema = (t?: (key: string) => string) => {
    const translate = t ?? ((key: string) => key);

    return z.object({
        email: z
            .string()
            .email({ message: translate('auth.signin.validation.email_invalid') })
            .min(1, { message: translate('auth.signin.validation.email_required') }),
        password: z
            .string()
            .min(6, { message: translate('auth.signin.validation.password_min') })
            .min(1, { message: translate('auth.signin.validation.password_required') }),
    });
};

export type SigninSchemaType = z.infer<ReturnType<typeof getSigninSchema>>;
