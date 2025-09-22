export type TimelineAmount = {
    value: number;
    currency?: string;
};

export type TimelineCategory = {
    name: string;
    icon?: 'transportation' | 'entertainment' | 'other';
};

export type TimelineItem = {
    id: string;
    title: string;
    account: string;
    category: TimelineCategory;
    amount: TimelineAmount;
    date: Date;
};

export type TimelineDay = {
    label: string;
    items: TimelineItem[];
};

export type TimelineMonth = {
    label: string;
    total: TimelineAmount;
    days: TimelineDay[];
};

function formatDate(date: Date, locales?: string | string[], opts?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locales, opts).format(date);
}

export function groupTimelineItems(
    items: TimelineItem[],
    locale?: string,
): { today: TimelineDay | null; months: TimelineMonth[] } {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayItems = items.filter((i) => i.date >= startOfToday);
    const todayLabel = formatDate(today, locale, { weekday: 'long' }).toUpperCase();
    const todayDay: TimelineDay | null =
        todayItems.length > 0
            ? {
                  label: todayLabel,
                  items: todayItems.sort((a, b) => b.date.getTime() - a.date.getTime()),
              }
            : null;

    // Group remaining items strictly by day, not by month
    const byDay = new Map<string, TimelineDay>();
    items
        .filter((i) => i.date < startOfToday)
        .forEach((i) => {
            const dayLabel = formatDate(i.date, locale, {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
            }).toUpperCase();
            if (!byDay.has(dayLabel)) {
                byDay.set(dayLabel, { label: dayLabel, items: [] });
            }
            const day = byDay.get(dayLabel)!;
            day.items.push(i);
        });

    const days = Array.from(byDay.values()).map((d) => ({
        label: d.label,
        items: d.items.sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));

    // Sort days by most recent
    days.sort((a, b) => {
        const da = a.items[0]?.date?.getTime() ?? 0;
        const db = b.items[0]?.date?.getTime() ?? 0;
        return db - da;
    });

    // Keep return type stable: put all days into a single "month" placeholder
    const months: TimelineMonth[] = [
        {
            label: '',
            total: { value: 0, currency: undefined },
            days,
        },
    ];

    return { today: todayDay, months };
}
