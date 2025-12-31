import { Filter, Plus, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    hasFilters?: boolean;
    onCreateClick?: () => void;
    onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onCreateClick, onClearFilters }: EmptyStateProps) {
    const { t } = useTranslation();

    // No results from filters
    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('transactions.empty.noResults.title')}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    {t('transactions.empty.noResults.description')}
                </p>
                {onClearFilters && (
                    <Button variant="outline" onClick={onClearFilters}>
                        {t('transactions.empty.noResults.clearFilters')}
                    </Button>
                )}
            </div>
        );
    }

    // Truly empty - no transactions at all
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Receipt className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('transactions.empty.title')}</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">{t('transactions.empty.description')}</p>
            {onCreateClick && (
                <Button onClick={onCreateClick} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    {t('transactions.empty.createFirst')}
                </Button>
            )}
        </div>
    );
}
