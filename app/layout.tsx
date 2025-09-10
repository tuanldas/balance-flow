import { ReactNode, Suspense } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { QueryProvider } from '@/providers/query-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipsProvider } from '@/providers/tooltips-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/css/styles.css';
import '@/components/keenicons/assets/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        template: '%s | Metronic',
        default: 'Metronic', // a default is required when creating a template
    },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html className="h-full" suppressHydrationWarning>
            <body className={cn('antialiased flex h-full text-base text-foreground bg-background', inter.className)}>
                <QueryProvider>
                    <AuthProvider>
                        <SettingsProvider>
                            <ThemeProvider>
                                <I18nProvider>
                                    <TooltipsProvider>
                                        <Suspense>{children}</Suspense>
                                        <Toaster />
                                    </TooltipsProvider>
                                </I18nProvider>
                            </ThemeProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
