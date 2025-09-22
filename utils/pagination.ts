import type { IPaginatedResponse } from '@/api/types/pagination';

export function coercePaginated<T>(data: unknown): IPaginatedResponse<T> | null {
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    const maybePayload = (('data' in obj ? (obj.data as unknown) : data) ?? null) as unknown;
    if (!maybePayload || typeof maybePayload !== 'object') return null;

    const payload = maybePayload as Record<string, unknown>;
    const items = payload.data as unknown as unknown[] | undefined;
    console.log(maybePayload);
    if (!Array.isArray(items)) return null;

    const typedItems = items as T[];

    return {
        current_page: Number(payload.current_page ?? 1),
        data: typedItems,
        first_page_url: String(payload.first_page_url ?? ''),
        from: Number(payload.from ?? 0),
        last_page: Number(payload.last_page ?? 1),
        last_page_url: String(payload.last_page_url ?? ''),
        next_page_url: (payload.next_page_url as string | null) ?? null,
        path: String(payload.path ?? ''),
        per_page: (payload.per_page as number | string) ?? 10,
        prev_page_url: (payload.prev_page_url as string | null) ?? null,
        to: Number(payload.to ?? typedItems.length),
        total: Number(payload.total ?? typedItems.length),
    };
}
