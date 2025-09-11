import Cookies from 'js-cookie';

export function getCookie(name: string): string | undefined {
    return Cookies.get(name);
}

export function setCookie(
    name: string,
    value: string | object,
    options?: Cookies.CookieAttributes,
): string | undefined {
    let valueToSet: string;

    if (typeof value === 'string') {
        valueToSet = value;
    } else {
        valueToSet = JSON.stringify(value);
    }
    return Cookies.set(name, valueToSet, options);
}

export function removeCookie(name: string, options?: Cookies.CookieAttributes): void {
    Cookies.remove(name, options);
}

export const isAuthenticated = (): boolean => {
    const accessToken: string | undefined = Cookies.get('access_token');
    return !!accessToken;
};

export function removeAllCookies(): void {
    const allCookies: { [key: string]: string } = Cookies.get();
    for (const cookieName in allCookies) {
        Cookies.remove(cookieName);
        Cookies.remove(cookieName, { path: '/' });
    }
}
