// src/config/languages.ts
export interface Language {
    code: string;
    name: string;
    shortName: string;
    direction: 'ltr' | 'rtl';
    flag: string;
}

export const I18N_LANGUAGES: Language[] = [
    {
        code: 'vi',
        name: 'Tiếng Việt',
        shortName: 'VI',
        direction: 'ltr',
        flag: '/media/flags/vietnam.svg',
    },
    {
        code: 'en',
        name: 'English',
        shortName: 'EN',
        direction: 'ltr',
        flag: '/media/flags/united-states.svg',
    },
];
