'use client';

import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    onCreateClick?: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">{t('recurring.empty.title')}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
                {t('recurring.empty.description')}
            </p>
            {onCreateClick && (
                <Button onClick={onCreateClick} className="gap-2">
                    {t('recurring.empty.createFirst')}
                </Button>
            )}
        </div>
    );
}
