import ApiCaller from '@/api/apiCaller.tsx';

export const callApiLogin = ({ email, password }: { email: string; password: string }) => {
    return new ApiCaller().setUrl('/auth/login').post({
        data: {
            email: email,
            password: password,
        },
    });
};

export const callApiLogout = () => {
    return new ApiCaller().setUrl('/auth/logout').post();
};

export const callApiGetUserProfile = () => {
    return new ApiCaller().setUrl('/me').get();
};
