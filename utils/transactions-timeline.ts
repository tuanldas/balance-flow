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

    const byMonth = new Map<string, TimelineMonth & { __currencies: Set<string | undefined> }>();
    items
        .filter((i) => i.date < startOfToday)
        .forEach((i) => {
            const monthLabel = formatDate(i.date, locale, { month: 'long', year: 'numeric' });
            const key = `${i.date.getFullYear()}-${i.date.getMonth()}`;
            if (!byMonth.has(key)) {
                byMonth.set(key, {
                    label: monthLabel,
                    total: { value: 0, currency: i.amount.currency },
                    days: [],
                    __currencies: new Set(),
                });
            }
            const month = byMonth.get(key)!;

            const dayLabel = formatDate(i.date, locale, {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
            }).toUpperCase();

            let day = month.days.find((d) => d.label === dayLabel);
            if (!day) {
                day = { label: dayLabel, items: [] };
                month.days.push(day);
            }

            day.items.push(i);
            month.__currencies.add(i.amount.currency);
            if (month.total.currency === i.amount.currency) {
                month.total.value += i.amount.value;
            } else {
                month.total.value = 0;
                month.total.currency = i.amount.currency;
            }
        });

    const months = Array.from(byMonth.values()).map((m) => ({
        label: m.label,
        total: m.__currencies.size > 1 ? { value: 0, currency: undefined } : m.total,
        days: m.days
            .map((d) => ({ ...d, items: d.items.sort((a, b) => b.date.getTime() - a.date.getTime()) }))
            .sort((a, b) => {
                const da = a.items[0]?.date?.getTime() ?? 0;
                const db = b.items[0]?.date?.getTime() ?? 0;
                return db - da;
            }),
    }));

    months.sort((a, b) => {
        const aTime = Math.max(...a.days.flatMap((d) => d.items.map((it) => it.date.getTime())));
        const bTime = Math.max(...b.days.flatMap((d) => d.items.map((it) => it.date.getTime())));
        return bTime - aTime;
    });

    return { today: todayDay, months };
}
