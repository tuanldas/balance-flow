'use client';

import { memo } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import type { Account } from '@/lib/types/account';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface AccountRowProps {
    account: Account;
    onClick: () => void;
    isSelected?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

function AccountRowComponent({ account, onClick, isSelected, isChecked, onCheckChange }: AccountRowProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);

    const formattedBalance = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: account.currency,
        minimumFractionDigits: 2,
    }).format(parseFloat(account.balance));

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/50',
                isSelected && 'bg-accent',
                isChecked && 'bg-accent',
            )}
        >
            {/* Checkbox for bulk selection */}
            <div
                className="flex items-center pr-3"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={onCheckChange}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            </div>

            {/* Left side: Icon and Account info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: account.color || '#6b7280' }}
                >
                    <span className="text-white text-lg font-semibold uppercase">{account.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {account.account_type?.name || t('accounts.fields.accountType')}
                    </p>
                </div>
            </div>

            {/* Right side: Balance and status */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <p className="font-semibold text-sm tabular-nums">{formattedBalance}</p>
                    <Badge variant={account.is_active ? 'success' : 'secondary'} className="text-xs">
                        {account.is_active ? t('accounts.status.active') : t('accounts.status.inactive')}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export const AccountRow = memo(AccountRowComponent);
