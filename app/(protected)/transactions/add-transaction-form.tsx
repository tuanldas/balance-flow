'use client';

import { useMemo, useState } from 'react';
import { getTransactionCategoryOptions } from '@/api/transaction-categories';
import {
    callApiCreateWalletTransaction,
    callApiGetWalletOptions,
    type CreateWalletTransactionPayload,
} from '@/api/wallet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Option = { id: string; name: string };

export default function AddTransactionForm({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const qc = useQueryClient();

    const { data: walletOptionsRaw } = useQuery<unknown>({
        queryKey: ['wallet-options'],
        queryFn: async () => await callApiGetWalletOptions({ limit: 50 }),
        staleTime: 60_000,
    });

    const { data: categoryOptionsRaw } = useQuery<unknown>({
        queryKey: ['category-options'],
        queryFn: async () => await getTransactionCategoryOptions({ limit: 50 }),
        staleTime: 60_000,
    });

    const walletOptions: Option[] = useMemo(() => {
        if (!walletOptionsRaw) return [];
        let payload: unknown = walletOptionsRaw as unknown;
        if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
            payload = (payload as { data?: unknown }).data;
        }
        if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
            payload = (payload as { data?: unknown }).data;
        }
        return Array.isArray(payload) ? (payload as Option[]) : [];
    }, [walletOptionsRaw]);

    const categoryOptions: Option[] = useMemo(() => {
        if (!categoryOptionsRaw) return [];
        let payload: unknown = categoryOptionsRaw as unknown;
        if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
            payload = (payload as { data?: unknown }).data;
        }
        if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
            payload = (payload as { data?: unknown }).data;
        }
        return Array.isArray(payload) ? (payload as Option[]) : [];
    }, [categoryOptionsRaw]);

    const [walletId, setWalletId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
    const [description, setDescription] = useState<string>('');

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['create-transaction'],
        mutationFn: async () => {
            const payload: CreateWalletTransactionPayload = {
                category_id: categoryId,
                amount: amount,
                transaction_date: date,
                transaction_type: type,
                description: description || undefined,
            };
            return await callApiCreateWalletTransaction(walletId, payload);
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['transactions'] });
            onOpenChange(false);
            // reset
            setCategoryId('');
            setAmount('');
            setDate('');
            setType('expense');
            setDescription('');
        },
    });

    const canSubmit = walletId && categoryId && amount && date && type;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('transactions.add') ?? 'Add transaction'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>{t('wallets.title') ?? 'Wallet'}</Label>
                        <Select value={walletId} onValueChange={setWalletId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('wallet.untitled') ?? 'Select wallet'} />
                            </SelectTrigger>
                            <SelectContent>
                                {walletOptions.map((w) => (
                                    <SelectItem key={w.id} value={w.id}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('transactions.category') ?? 'Category'}</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('transactions.category') ?? 'Category'} />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('wallet.form.initial_balance') ?? 'Amount'}</Label>
                        <Input
                            type="number"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('transactions.date') ?? 'Date'}</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('transactions.type') ?? 'Type'}</Label>
                        <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense' | 'transfer')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('wallet.form.description') ?? 'Description'}</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        {t('common.buttons.cancel') ?? 'Cancel'}
                    </Button>
                    <Button disabled={!canSubmit || isPending} onClick={() => mutateAsync()}>
                        {t('common.buttons.submit') ?? 'Submit'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
