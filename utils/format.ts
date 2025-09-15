export function formatMoneyCompact(value: string | number, options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
}): string {
    const { minimumFractionDigits = 0, maximumFractionDigits = 0, locale } = options || {};
    const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[\,\s]/g, ''));
    if (Number.isNaN(numeric)) return String(value);
    try {
        return new Intl.NumberFormat(locale, {
            style: 'decimal',
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(numeric);
    } catch {
        return String(numeric);
    }
}


