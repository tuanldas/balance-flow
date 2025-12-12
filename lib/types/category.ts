// Category types based on API response structure

export type CategoryType = 'income' | 'expense';

export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    category_type: CategoryType;
    parent_id: string | null;
    icon: string;
    color: string;
    is_system: boolean;
    created_at: string;
    updated_at: string;
    subcategories_count?: number;
    children?: Category[];
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
}

export interface CategoryDetailResponse {
    success: boolean;
    data: Category;
}

export interface CreateCategoryData {
    name: string;
    category_type: CategoryType;
    parent_id?: string | null;
    icon?: string;
    icon_file?: File;
    color?: string;
}

export interface UpdateCategoryData {
    name?: string;
    category_type?: CategoryType;
    parent_id?: string | null;
    icon?: string;
    icon_file?: File;
    color?: string;
}

export interface DeleteCategoryResponse {
    success: boolean;
    message: string;
}

export interface CategoryFilters {
    type?: CategoryType;
    per_page?: number;
    page?: number;
}
