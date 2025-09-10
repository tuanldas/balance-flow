import { AxiosResponse } from 'axios';
import ApiCaller from './apiCaller';

/**
 * Interfaces & Types
 */

// Type định nghĩa vai trò của người dùng
export interface IUserRole {
    id: string | number;
    name: string;
    title: string;
}

// Type định nghĩa một user
export interface IUserData {
    id: string | number;
    name: string;
    email: string;
    roles?: IUserRole[];
}

// Type cho dữ liệu tạo mới user
export interface ICreateUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
}

// Type cho dữ liệu cập nhật user
export interface IUpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}

// Type cho phản hồi API phân trang
export interface IPaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

/**
 * API Functions
 */

/**
 * Lấy danh sách người dùng có phân trang và tìm kiếm
 */
export const getUsers = async (
    page = 1,
    perPage = 10,
    search = '',
): Promise<AxiosResponse<IPaginatedResponse<IUserData>>> => {
    return new ApiCaller().setUrl(`/users?page=${page}&per_page=${perPage}&search=${search}`).get();
};

/**
 * Lấy thông tin chi tiết của một người dùng theo ID
 */
export const getUser = async (id: string | number): Promise<AxiosResponse<IUserData>> => {
    return new ApiCaller().setUrl(`/users/${id}`).get();
};

/**
 * Tạo người dùng mới
 */
export const createUser = async (userData: ICreateUserData): Promise<AxiosResponse<IUserData>> => {
    return new ApiCaller().setUrl('/users').post({ data: userData });
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUser = async (id: string | number, userData: IUpdateUserData): Promise<AxiosResponse<IUserData>> => {
    return new ApiCaller().setUrl(`/users/${id}`).put({ data: userData });
};

/**
 * Xóa người dùng
 */
export const deleteUser = async (id: string | number): Promise<AxiosResponse<{ message: string }>> => {
    return new ApiCaller().setUrl(`/users/${id}`).delete();
};

/**
 * Gán vai trò cho người dùng
 */
export const assignRole = async (
    userId: string | number,
    role: string,
): Promise<AxiosResponse<{ message: string }>> => {
    return new ApiCaller().setUrl('/users/assign-role').post({ data: { user_id: userId, role } });
};

/**
 * Gỡ bỏ vai trò của người dùng
 */
export const removeRole = async (
    userId: string | number,
    role: string,
): Promise<AxiosResponse<{ message: string }>> => {
    return new ApiCaller().setUrl('/users/remove-role').post({ data: { user_id: userId, role } });
};

/**
 * Lấy danh sách các vai trò hệ thống
 */
export const getRoles = async (): Promise<AxiosResponse<IUserRole[]>> => {
    return new ApiCaller().setUrl('/roles').get();
};
