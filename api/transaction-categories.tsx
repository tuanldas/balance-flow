import ApiCaller from './apiCaller';

export interface TransactionCategory {
    id: string;
    name: string;
    description: string;
    type: 'expense' | 'income' | 'transfer';
    image: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface TransactionCategoryResponse {
    data: TransactionCategory[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

export const getTransactionCategories = async (params?: {
    per_page?: number;
    type?: 'expense' | 'income' | 'transfer';
    page?: number;
}) => {
    try {
        const apiCaller = new ApiCaller().setUrl('/transaction-categories');
        if (params) {
            apiCaller.setHeaders({
                params,
            });
        }
        const response = await apiCaller.get();
        return response;
    } catch (error) {
        console.error('API error in getTransactionCategories:', error);
        throw error;
    }
};

export const getTransactionCategoryOptions = async (params?: {
    search?: string;
    type?: 'expense' | 'income';
    limit?: number;
}) => {
    try {
        const apiCaller = new ApiCaller().setUrl('/transaction-categories-options');
        if (params) {
            apiCaller.setHeaders({
                params,
            });
        }
        const response = await apiCaller.get();
        return response;
    } catch (error) {
        console.error('API error in getTransactionCategoryOptions:', error);
        throw error;
    }
};

export const getTransactionCategoryById = async (id: string) => {
    try {
        const response = await new ApiCaller().setUrl(`/transaction-categories/${id}`).get();
        return response;
    } catch (error) {
        console.error(`API error in getTransactionCategoryById for ID ${id}:`, error);
        throw error;
    }
};

export const createTransactionCategory = async (formData: FormData) => {
    try {
        const response = await new ApiCaller()
            .setUrl('/transaction-categories')
            .setHeaders({
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .post({
                data: formData,
            });
        return response;
    } catch (error) {
        console.error('API error in createTransactionCategory:', error);
        throw error;
    }
};

export const updateTransactionCategory = async (id: string, formData: FormData) => {
    try {
        formData.append('_method', 'PUT');
        const response = await new ApiCaller()
            .setUrl(`/transaction-categories/${id}`)
            .setHeaders({
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .post({
                data: formData,
            });
        return response;
    } catch (error) {
        console.error(`API error in updateTransactionCategory for ID ${id}:`, error);
        throw error;
    }
};

export const deleteTransactionCategory = async (id: string) => {
    try {
        const response = await new ApiCaller().setUrl(`/transaction-categories/${id}`).delete();
        return response;
    } catch (error) {
        console.error(`API error in deleteTransactionCategory for ID ${id}:`, error);
        throw error;
    }
};

export const getTrashedTransactionCategories = async (params?: { per_page?: number; page?: number }) => {
    try {
        const apiCaller = new ApiCaller().setUrl('/transaction-categories/trashed');
        if (params) {
            apiCaller.setHeaders({
                params,
            });
        }
        const response = await apiCaller.get();
        return response;
    } catch (error) {
        console.error('API error in getTrashedTransactionCategories:', error);
        throw error;
    }
};

export const restoreTransactionCategory = async (id: string) => {
    try {
        const response = await new ApiCaller().setUrl(`/transaction-categories/${id}/restore`).post({
            data: null,
        });
        return response;
    } catch (error) {
        console.error(`API error in restoreTransactionCategory for ID ${id}:`, error);
        throw error;
    }
};

export const forceDeleteTransactionCategory = async (id: string) => {
    try {
        const response = await new ApiCaller().setUrl(`/transaction-categories/${id}/force`).delete();
        return response;
    } catch (error) {
        console.error(`API error in forceDeleteTransactionCategory for ID ${id}:`, error);
        throw error;
    }
};
