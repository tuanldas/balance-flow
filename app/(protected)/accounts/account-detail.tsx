'use client';

import { useState } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { ArrowLeft, Edit, Info, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Account } from '@/lib/types/account';
import { useDeleteAccount, useToggleAccountActive } from '@/hooks/use-accounts';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AccountDetailProps {
    account: Account | null;
    onBack?: () => void;
    isMobile?: boolean;
    onEditClick?: () => void;
    onDeleteSuccess?: () => void;
}

export function AccountDetail({ account, onBack, isMobile = false, onEditClick, onDeleteSuccess }: AccountDetailProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteAccount();
    const toggleActiveMutation = useToggleAccountActive();

    const handleDelete = async () => {
        if (!account) return;

        try {
            await deleteMutation.mutateAsync(account.id);
            toast.success(t('accounts.messages.deleteSuccess'));
            setIsDeleteDialogOpen(false);
            onDeleteSuccess?.();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(t('accounts.messages.deleteError'));
        }
    };

    const handleToggleActive = async () => {
        if (!account) return;

        try {
            await toggleActiveMutation.mutateAsync(account.id);
            toast.success(t('accounts.messages.toggleSuccess'));
        } catch (error) {
            console.error('Toggle active error:', error);
            toast.error(t('accounts.messages.toggleError'));
        }
    };

    // Empty state - no account selected
    if (!account) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('accounts.detail.noSelection')}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">{t('accounts.detail.selectPrompt')}</p>
                </div>
            </div>
        );
    }

    const formattedBalance = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: account.currency,
        minimumFractionDigits: 2,
    }).format(parseFloat(account.balance));

    const formattedCreatedAt = new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(account.created_at));

    const formattedUpdatedAt = new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(account.updated_at));

    return (
        <>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        {isMobile && onBack && (
                            <Button variant="ghost" size="icon" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <h2 className="text-lg font-semibold">{t('accounts.detail.title')}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onEditClick}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {/* Account Icon and Name */}
                        <div className="flex items-center gap-4">
                            <div
                                className="h-16 w-16 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: account.color || '#6b7280' }}
                            >
                                <span className="text-white text-3xl font-bold uppercase">
                                    {account.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{account.name}</h3>
                                <p className="text-sm text-muted-foreground">{account.account_type?.name}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Tabs */}
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">{t('accounts.detail.tabs.details')}</TabsTrigger>
                                <TabsTrigger value="transactions" disabled>
                                    {t('accounts.detail.tabs.transactions')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-6 pt-4">
                                {/* Balance */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">
                                        {t('accounts.detail.info.balance')}
                                    </Label>
                                    <p className="text-2xl font-bold">{formattedBalance}</p>
                                </div>

                                <Separator />

                                {/* Currency */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">
                                        {t('accounts.detail.info.currency')}
                                    </Label>
                                    <p className="font-medium">{account.currency}</p>
                                </div>

                                {/* Account Type */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">
                                        {t('accounts.detail.info.accountType')}
                                    </Label>
                                    <p className="font-medium">{account.account_type?.name || '-'}</p>
                                </div>

                                {/* Description */}
                                {account.description && (
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">
                                            {t('accounts.detail.info.description')}
                                        </Label>
                                        <p className="text-sm">{account.description}</p>
                                    </div>
                                )}

                                <Separator />

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            {t('accounts.detail.info.status')}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {account.is_active
                                                ? t('accounts.detail.actions.deactivate')
                                                : t('accounts.detail.actions.activate')}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={account.is_active}
                                        onCheckedChange={handleToggleActive}
                                        disabled={toggleActiveMutation.isPending}
                                    />
                                </div>

                                <Separator />

                                {/* Metadata */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">
                                            {t('accounts.detail.info.createdAt')}
                                        </Label>
                                        <p className="text-sm">{formattedCreatedAt}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">
                                            {t('accounts.detail.info.updatedAt')}
                                        </Label>
                                        <p className="text-sm">{formattedUpdatedAt}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="transactions" className="pt-4">
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('accounts.detail.tabs.transactions')} - Coming soon
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('accounts.messages.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('accounts.messages.deleteWarning')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? t('common.messages.loading') : t('common.buttons.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
