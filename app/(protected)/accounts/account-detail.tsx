'use client';

import { useEffect, useState } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Banknote, Trash2, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Account } from '@/lib/types/account';
import type { AccountType } from '@/lib/types/account-type';
import { useCreateAccount, useDeleteAccount, useUpdateAccount } from '@/hooks/use-accounts';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { accountSchema, type AccountFormData } from './account-schema';

// Predefined colors for random selection (outside component to avoid re-creation)
const ACCOUNT_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
];

const getRandomColor = () => ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)];

interface AccountDetailProps {
    account: Account | null;
    mode?: 'view' | 'create';
    accountTypes?: AccountType[];
    onBack?: () => void;
    isMobile?: boolean;
    onDeleteSuccess?: () => void;
    onCreateSuccess?: () => void;
    onEditSuccess?: () => void;
}

export function AccountDetail({
    account,
    mode = 'view',
    accountTypes = [],
    onBack,
    isMobile = false,
    onDeleteSuccess,
    onCreateSuccess,
    onEditSuccess,
}: AccountDetailProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteAccount();
    const createMutation = useCreateAccount();
    const updateMutation = useUpdateAccount();

    const currencyOptions = [
        { value: 'VND', label: 'VND (₫)' },
        { value: 'USD', label: 'USD ($)' },
    ];

    // Form for create/edit mode
    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            account_type_id: '',
            name: '',
            balance: 0,
            currency: 'VND',
            icon: '💰',
            color: getRandomColor(),
            description: '',
        },
    });

    // Reset form when mode changes or account changes
    useEffect(() => {
        if (mode === 'create') {
            form.reset({
                account_type_id: '',
                name: '',
                balance: 0,
                currency: 'VND',
                icon: '💰',
                color: getRandomColor(),
                description: '',
            });
        } else if (account) {
            form.reset({
                account_type_id: account.account_type_id,
                name: account.name,
                balance: parseFloat(account.balance),
                currency: account.currency,
                icon: account.icon || '💰',
                color: account.color || '#6b7280',
                description: account.description || '',
            });
        }
    }, [mode, account, form]);

    const handleSave = async (data: AccountFormData) => {
        try {
            if (mode === 'create') {
                await createMutation.mutateAsync(data);
                toast.success(t('accounts.messages.createSuccess'));
                onCreateSuccess?.();
            } else if (account) {
                await updateMutation.mutateAsync({
                    id: account.id,
                    data: {
                        name: data.name,
                        icon: data.icon,
                        color: data.color,
                        description: data.description,
                    },
                });
                toast.success(t('accounts.messages.updateSuccess'));
                onEditSuccess?.();
            }
        } catch (error) {
            console.error('Error saving account:', error);
            toast.error(mode === 'create' ? t('accounts.messages.createError') : t('accounts.messages.updateError'));
        }
    };

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

    const isLoading = mode === 'create' ? createMutation.isPending : updateMutation.isPending;

    // Empty state - no account selected and not in create mode
    if (!account && mode !== 'create') {
        return (
            <div className="h-full flex items-center justify-center p-8 bg-muted/30">
                <div className="text-center space-y-3">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="font-semibold text-lg">{t('accounts.detail.noSelection')}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">{t('accounts.detail.selectPrompt')}</p>
                </div>
            </div>
        );
    }

    // Format balance for display (view mode only)
    const formattedBalance =
        mode === 'view' && account
            ? new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: account.currency,
                  minimumFractionDigits: 0,
              }).format(parseFloat(account.balance))
            : '';

    return (
        <ScrollArea className="h-full">
            <div className="p-6">
                {/* Mobile back button */}
                {isMobile && onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2 gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.buttons.back')}
                    </Button>
                )}

                {/* Title for Create Mode */}
                {mode === 'create' && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">{t('accounts.form.createTitle')}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{t('accounts.form.createDescription')}</p>
                    </div>
                )}

                {/* Balance Header - View Mode Only */}
                {mode === 'view' && account && (
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="h-14 w-14 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: account.color || '#6b7280' }}
                            >
                                <span className="text-white text-2xl font-bold uppercase">
                                    {account.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{account.name}</h2>
                                <p className="text-sm text-muted-foreground">{account.account_type?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Banknote className="h-4 w-4" />
                            <span className="text-sm">{t('accounts.detail.info.balance')}</span>
                        </div>
                        <p className="text-3xl font-bold">{formattedBalance}</p>
                    </div>
                )}

                <Separator className="mb-6" />

                {/* Editable Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                        {/* Account Type - Create Mode Only (editable), View Mode (read-only) */}
                        {mode === 'create' ? (
                            <FormField
                                control={form.control}
                                name="account_type_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('accounts.form.accountType')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t('accounts.form.accountTypePlaceholder')}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accountTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    {t('accounts.form.accountType')}
                                </Label>
                                <div className="px-3 py-2 border rounded-md bg-muted/50">
                                    <span className="text-sm">{account?.account_type?.name || '-'}</span>
                                </div>
                            </div>
                        )}

                        {/* Name - Always Editable */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('accounts.form.namePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Balance - Create Mode Only (editable), View Mode (read-only info shown above) */}
                        {mode === 'create' && (
                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('accounts.form.balance')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={t('accounts.form.balancePlaceholder')}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Currency - Create Mode Only */}
                        {mode === 'create' && (
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('accounts.form.currency')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('accounts.form.currencyPlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currencyOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Currency - View Mode (read-only) */}
                        {mode === 'view' && account && (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">{t('accounts.form.currency')}</Label>
                                <div className="px-3 py-2 border rounded-md bg-muted/50">
                                    <span className="text-sm">{account.currency}</span>
                                </div>
                            </div>
                        )}

                        {/* Color - Always Editable */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.color')}</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                                            <Input type="text" placeholder="#000000" {...field} className="flex-1" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description - Always Editable */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('accounts.form.descriptionPlaceholder')}
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-3">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading
                                    ? t('common.messages.loading')
                                    : mode === 'create'
                                      ? t('accounts.form.createButton')
                                      : t('common.buttons.save')}
                            </Button>
                            {mode === 'view' && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full gap-2"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {t('common.buttons.delete')}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <AlertDialogTitle>{t('accounts.messages.confirmDelete')}</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="pt-2">
                                {t('accounts.messages.deleteWarning')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteMutation.isPending}>
                                {t('common.buttons.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? t('common.messages.loading') : t('common.buttons.delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ScrollArea>
    );
}
