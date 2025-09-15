'use client';

import { FC } from 'react';
import { callApiDeleteWallet } from '@/api/wallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteWalletDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    walletId?: string;
    walletName?: string;
}

export const DeleteWalletDialog: FC<DeleteWalletDialogProps> = ({ isOpen, onOpenChange, walletId, walletName }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const deleteWalletMutation = useMutation({
        mutationFn: () => {
            if (!walletId) throw new Error(t('wallet.errors.id_required') || 'Wallet id is required');
            return callApiDeleteWallet(walletId);
        },
        onSuccess: () => {
            toast.success(t('wallet.delete_success') || 'Wallet deleted');
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            onOpenChange(false);
        },
        onError: (error) => {
            const message = (error as Error)?.message || (t('wallet.delete_error') ?? 'Failed to delete wallet');
            toast.error(message);
        },
    });

    const handleConfirmDelete = () => {
        deleteWalletMutation.mutate();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('wallet.delete_dialog.title') || 'Delete wallet'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('wallet.delete_dialog.description') || 'This action cannot be undone.'}{' '}
                        {walletName ? `(${walletName})` : ''}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('wallet.delete_dialog.cancel') || 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {t('wallet.delete_dialog.confirm') || 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteWalletDialog;


