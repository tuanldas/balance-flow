export type SearchParamPrimitive = string | number | boolean | null | undefined;

/**
 * Append only defined (non-undefined, non-null, non-empty string) params to URLSearchParams.
 * This avoids sending empty filters to the backend.
 */
export function appendDefinedParams(
    searchParams: URLSearchParams,
    params: Record<string, SearchParamPrimitive>,
): URLSearchParams {
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (typeof value === 'string' && value.length === 0) continue;
        searchParams.set(key, String(value));
    }
    return searchParams;
}
