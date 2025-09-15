'use client';

import * as React from 'react';
import currencyCodes from 'currency-codes';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, ButtonArrow } from '@/components/ui/button';
import {
    Command,
    CommandCheck,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const POPULAR_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD'];

type CurrencyComboboxProps = {
    value: string;
    onChange: (value: string) => void;
};

interface CurrencyItem {
    code: string;
    country: string;
    display: string;
}

export default function CurrencyCombobox({ value, onChange }: CurrencyComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [currencies, setCurrencies] = React.useState<CurrencyItem[]>([]);
    const { t } = useTranslation();

    React.useEffect(() => {
        type CurrencySourceItem = { code: string; countries?: string[] };
        const source = (currencyCodes as unknown as { data: CurrencySourceItem[] }).data;
        const allCurrencies: CurrencyItem[] = source.map((currency: CurrencySourceItem) => {
            const countryName = currency.countries?.[0] || '';
            const display = countryName ? `${countryName} - ${currency.code}` : currency.code;

            return {
                code: currency.code,
                country: countryName,
                display,
            };
        });

        const popularCurrencies: CurrencyItem[] = allCurrencies.filter((c: CurrencyItem) =>
            POPULAR_CURRENCIES.includes(c.code),
        );
        const otherCurrencies: CurrencyItem[] = allCurrencies.filter(
            (c: CurrencyItem) => !POPULAR_CURRENCIES.includes(c.code),
        );

        setCurrencies([...popularCurrencies, ...otherCurrencies]);
    }, []);

    const selectedCurrency = currencies.find((currency) => currency.code === value);
    const displayValue = selectedCurrency?.code || t('wallet.form.currency_placeholder') || 'Select currency';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    mode="input"
                    placeholder={!selectedCurrency}
                    aria-expanded={open}
                    className="w-full"
                >
                    <span className="truncate">{displayValue}</span>
                    <ButtonArrow />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder={t('wallet.form.currency_search') || 'Search currency...'} />
                    <CommandList>
                        <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                            <CommandEmpty>{t('wallet.form.currency_not_found') || 'No currency found'}</CommandEmpty>
                            <CommandGroup>
                                {currencies.map((currency) => (
                                    <CommandItem
                                        key={currency.code}
                                        value={currency.code}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? '' : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <span className="truncate">{currency.display}</span>
                                        {value === currency.code && <CommandCheck />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
