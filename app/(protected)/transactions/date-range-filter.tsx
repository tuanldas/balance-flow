'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRangeValue {
    from: Date | undefined;
    to: Date | undefined;
}

export type DateRangePreset = 'today' | 'this_week' | 'this_month' | 'custom';

interface DateRangeFilterProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Helper functions for preset ranges
    const getToday = (): DateRangeValue => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return { from: today, to: endOfDay };
    };

    const getThisWeek = (): DateRangeValue => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as first day
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { from: monday, to: sunday };
    };

    const getThisMonth = (): DateRangeValue => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);

        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);

        return { from: firstDay, to: lastDay };
    };

    const presetOptions: { value: DateRangePreset; label: string; getRangeValue: () => DateRangeValue }[] = [
        { value: 'today', label: t('transactions.dateRange.today'), getRangeValue: getToday },
        { value: 'this_week', label: t('transactions.dateRange.thisWeek'), getRangeValue: getThisWeek },
        { value: 'this_month', label: t('transactions.dateRange.thisMonth'), getRangeValue: getThisMonth },
    ];

    const handlePresetClick = (preset: DateRangePreset) => {
        const option = presetOptions.find((opt) => opt.value === preset);
        if (option) {
            const rangeValue = option.getRangeValue();
            onChange(rangeValue);
            setIsOpen(false);
        }
    };

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        if (range) {
            onChange({
                from: range.from,
                to: range.to,
            });
        }
    };

    const formatDateRange = () => {
        if (!value.from) {
            return t('transactions.dateRange.selectRange');
        }

        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(date);
        };

        if (!value.to) {
            return formatDate(value.from);
        }

        return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    };

    const hasValue = value.from !== undefined;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('gap-1.5 justify-start text-left font-normal', hasValue && 'border-primary')}
                >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{formatDateRange()}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
                <div className="flex">
                    {/* Preset buttons */}
                    <div className="flex flex-col gap-1 border-r border-border p-3">
                        {presetOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant="ghost"
                                size="sm"
                                className="justify-start font-normal"
                                onClick={() => handlePresetClick(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="p-3">
                        <Calendar
                            mode="range"
                            selected={{ from: value.from, to: value.to }}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                            defaultMonth={value.from}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
