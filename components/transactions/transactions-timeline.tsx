'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Bus, CreditCard, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { formatMoneyCompact } from '@/utils/format';
import type { TimelineDay, TimelineMonth } from '@/utils/transactions-timeline';

export function CategoryBadge({ name, icon }: { name: string; icon?: 'transportation' | 'entertainment' | 'other' }) {
    return (
        <Badge appearance="light" variant="outline" className="gap-1 text-xs">
            {icon === 'transportation' ? (
                <Bus size={14} className="me-1" />
            ) : icon === 'entertainment' ? (
                <Ticket size={14} className="me-1" />
            ) : (
                <CreditCard size={14} className="me-1" />
            )}
            {name}
        </Badge>
    );
}

function DaySection({ day, currencyFallback }: { day: TimelineDay; currencyFallback?: string }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{day.label}</div>
            <div className="flex flex-col">
                {day.items.map(item => {
                    const amountNum = item.amount.value;
                    const isIncome = amountNum > 0;
                    const sign = isIncome ? '+' : '-';
                    return (
                        <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                            <Checkbox className="mt-0.5" />
                            <div className="flex flex-col grow min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="text-mono text-sm font-medium truncate">{item.title}</div>
                                    <span className="text-xs text-secondary-foreground truncate">{format(new Date(item.date), 'p')}</span>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                                <CategoryBadge name={item.category.name} icon={item.category.icon} />
                                <span className={isIncome ? 'text-green-600 text-sm font-medium text-mono' : 'text-sm font-medium text-mono'}>
                                    {sign}
                                    {formatMoneyCompact(Math.abs(amountNum), { minimumFractionDigits: 0 })} {item.amount.currency ?? currencyFallback}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function TransactionsTimeline({
    grouped,
    currencyFallback,
}: {
    grouped: { today: TimelineDay | null; months: TimelineMonth[] };
    currencyFallback?: string;
}) {
    const { t } = useTranslation();
    const today = grouped.today;

    return (
        <div className="space-y-6">
            {today ? (
                <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                        {t('common.today') ?? 'Today'}
                    </div>
                    <DaySection day={today} currencyFallback={currencyFallback} />
                    <div className="border-b border-input" />
                </div>
            ) : null}

            {grouped.months.map((month, monthIndex) => (
                <div key={`${month.label}-${monthIndex}`} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-mono">{month.label}</h3>
                        <span className={'text-base font-semibold text-mono ' + (month.total.value > 0 ? 'text-green-600' : '')}>
                            {month.total.value < 0 ? '-' : month.total.value > 0 ? '+' : ''}
                            {formatMoneyCompact(Math.abs(month.total.value), { minimumFractionDigits: 0 })} {month.total.currency ?? currencyFallback}
                        </span>
                    </div>
                    {month.days.map((day, dayIndex) => (
                        <DaySection key={`${day.label}-${dayIndex}`} day={day} currencyFallback={currencyFallback} />
                    ))}
                </div>
            ))}
        </div>
    );
}


