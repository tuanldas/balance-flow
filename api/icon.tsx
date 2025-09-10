import ApiCaller from '@/api/apiCaller.tsx';

export const callApiGetWalletIcons = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await new ApiCaller().setUrl(`/wallets/icons?page=${pageParam}`).get();
    return data;
};
export const callApiDeleteWalletIcons = async (iconId: string) => {
    const { data } = await new ApiCaller().setUrl(`/wallets/icons/${iconId}`).delete();
    return data;
};
