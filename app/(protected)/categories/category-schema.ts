import i18n from 'i18next';
import { z } from 'zod';

export const getCategorySchema = () => {
    return z.object({
        name: z
            .string()
            .min(1, { message: i18n.t('categories.validation.nameRequired') })
            .min(2, { message: i18n.t('categories.validation.nameMinLength') }),
        category_type: z.enum(['income', 'expense'], {
            message: i18n.t('categories.validation.typeRequired'),
        }),
        parent_id: z.string().nullable().optional(),
        icon: z.string(), // Can be empty when icon_file is provided
    });
};

export type CategorySchemaType = z.infer<ReturnType<typeof getCategorySchema>>;
