// Category icon types based on API response structure

export interface CategoryIcon {
    name: string; // icon name without extension (e.g., 'salary')
    filename: string; // full filename (e.g., 'salary.svg')
    url: string; // full URL to icon file
}

export interface CategoryIconsResponse {
    success: boolean;
    data: CategoryIcon[];
}
