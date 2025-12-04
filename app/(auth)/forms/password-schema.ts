import i18n from 'i18next';
import { z } from 'zod';

export const getPasswordSchema = (minLength = 8) => {
    return z
        .string()
        .min(1, {
            message: i18n.t('auth.validation.passwordRequired'),
        })
        .min(minLength, {
            message: i18n.t('auth.validation.passwordMinLength', { minLength }),
        })
        .regex(/[A-Z]/, {
            message: i18n.t('auth.validation.passwordUppercase'),
        })
        .regex(/[a-z]/, {
            message: i18n.t('auth.validation.passwordLowercase'),
        })
        .regex(/\d/, {
            message: i18n.t('auth.validation.passwordNumber'),
        })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, {
            message: i18n.t('auth.validation.passwordSpecialChar'),
        });
};
