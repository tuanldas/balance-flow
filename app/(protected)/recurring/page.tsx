'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRecurringSummary, mockRecurrings } from '@/lib/mock/recurring-data';
import type { Recurring } from '@/lib/types/recurring';
import { useIsLargeScreen } from '@/hooks/use-large-screen';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from './empty-state';
import { RecurringDetail } from './recurring-detail';
import { RecurringRow } from './recurring-row';
import { RecurringSummaryCard } from './recurring-summary-card';

interface RecurringListProps {
    recurrings: Recurring[];
    selectedRecurringId?: string;
    onRecurringSelect: (recurring: Recurring) => void;
}

const RecurringList = memo(function RecurringList({
    recurrings,
    selectedRecurringId,
    onRecurringSelect,
}: RecurringListProps) {
    const { t } = useTranslation();

    // Group recurrings by status: this month vs overdue
    const groupedRecurrings = useMemo(() => {
        const thisMonth = recurrings.filter((r) => !r.isOverdue);
        const overdue = recurrings.filter((r) => r.isOverdue);
        return { thisMonth, overdue };
    }, [recurrings]);

    if (recurrings.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
                {/* This month section */}
                {groupedRecurrings.thisMonth.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className="text-[10px] text-muted-foreground">▼</span>
                            <h3 className="text-sm font-medium text-foreground">{t('recurring.groups.thisMonth')}</h3>
                        </div>
                        <div className="space-y-0.5">
                            {groupedRecurrings.thisMonth.map((recurring) => (
                                <RecurringRow
                                    key={recurring.id}
                                    recurring={recurring}
                                    isSelected={selectedRecurringId === recurring.id}
                                    onClick={() => onRecurringSelect(recurring)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Overdue section */}
                {groupedRecurrings.overdue.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className="text-[10px] text-muted-foreground">▼</span>
                            <h3 className="text-sm font-medium text-destructive">{t('recurring.groups.overdue')}</h3>
                        </div>
                        <div className="space-y-0.5">
                            {groupedRecurrings.overdue.map((recurring) => (
                                <RecurringRow
                                    key={recurring.id}
                                    recurring={recurring}
                                    isSelected={selectedRecurringId === recurring.id}
                                    onClick={() => onRecurringSelect(recurring)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default function RecurringPage() {
    const { t } = useTranslation();
    const isLargeScreen = useIsLargeScreen();

    const [selectedRecurring, setSelectedRecurring] = useState<Recurring | null>(mockRecurrings[0] || null);
    const [showDetail, setShowDetail] = useState(false);

    const summary = useMemo(() => getRecurringSummary(), []);

    const handleRecurringSelect = useCallback(
        (recurring: Recurring) => {
            setSelectedRecurring(recurring);
            if (!isLargeScreen) {
                setShowDetail(true);
            }
        },
        [isLargeScreen],
    );

    const handleBackToList = useCallback(() => {
        setShowDetail(false);
    }, []);

    const handleCreateClick = useCallback(() => {
        // TODO: Implement create recurring
        console.log('Create recurring clicked');
    }, []);

    // Mobile/Tablet view (<1280px): show list with Sheet for detail
    if (!isLargeScreen) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h1 className="text-lg font-semibold text-foreground">{t('recurring.title')}</h1>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCreateClick}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Summary Card */}
                <div className="p-4 pb-0">
                    <RecurringSummaryCard summary={summary} />
                </div>

                {/* Recurring List */}
                <RecurringList
                    recurrings={mockRecurrings}
                    selectedRecurringId={selectedRecurring?.id}
                    onRecurringSelect={handleRecurringSelect}
                />

                <Sheet
                    open={showDetail}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleBackToList();
                        }
                    }}
                >
                    <SheetContent side="right" className="w-full sm:max-w-lg p-0" close={false}>
                        <SheetTitle className="sr-only">{t('recurring.detail.title')}</SheetTitle>
                        <RecurringDetail recurring={selectedRecurring} onBack={handleBackToList} isMobile />
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    // Desktop view (≥1280px): split pane using CSS Grid
    return (
        <div className="h-[calc(100vh-64px)] grid grid-cols-2 bg-background">
            {/* Left Pane - Recurring List */}
            <div className="flex flex-col border-r border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h1 className="text-lg font-semibold text-foreground">{t('recurring.title')}</h1>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCreateClick}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Summary Card */}
                <div className="p-4 pb-0">
                    <RecurringSummaryCard summary={summary} />
                </div>

                {/* Recurring List */}
                <RecurringList
                    recurrings={mockRecurrings}
                    selectedRecurringId={selectedRecurring?.id}
                    onRecurringSelect={handleRecurringSelect}
                />
            </div>

            {/* Right Pane - Recurring Detail */}
            <div className="overflow-hidden">
                <RecurringDetail recurring={selectedRecurring} />
            </div>
        </div>
    );
}
