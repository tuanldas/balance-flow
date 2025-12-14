export interface Language {
    code: string;
    locale: string;
    name: string;
    shortName: string;
    direction: 'ltr' | 'rtl';
    flag: string;
}

export const I18N_LANGUAGES: Language[] = [
    {
        code: 'vi',
        locale: 'vi-VN',
        name: 'Tiếng Việt',
        shortName: 'VI',
        direction: 'ltr',
        flag: '/media/flags/vietnam.svg',
    },
    {
        code: 'en',
        locale: 'en-US',
        name: 'English',
        shortName: 'EN',
        direction: 'ltr',
        flag: '/media/flags/united-states.svg',
    },
];

export const getIntlLocale = (languageCode: string): string => {
    const language = I18N_LANGUAGES.find((lang) => lang.code === languageCode);
    return language?.locale || 'en-US';
};
