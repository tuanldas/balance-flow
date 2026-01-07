import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
    selectedCount: number;
    onDelete: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
    show?: boolean;
}

export function BulkActionBar({ selectedCount, onDelete, onCancel, isDeleting, show = true }: BulkActionBarProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center p-4',
                'transition-transform duration-300 ease-in-out',
                show ? 'translate-y-0' : 'translate-y-full',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-full',
                    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl border border-white/10',
                    'backdrop-blur-sm',
                )}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                >
                    <X className="h-4 w-4" />
                </Button>

                <p className="font-medium text-sm">
                    {selectedCount} {t('accounts.bulkActions.selected')}
                </p>

                <div className="h-4 w-px bg-white/30" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={isDeleting || selectedCount === 0}
                    className="gap-2 text-white hover:bg-red-500 hover:text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('accounts.bulkActions.delete')}</span>
                </Button>
            </div>
        </div>
    );
}
