'use client';

import { memo, useMemo } from 'react';

interface PaymentTimelineProps {
    payments: {
        date: string;
        amount: number;
    }[];
    currency: string;
}

function PaymentTimelineComponent({ payments }: PaymentTimelineProps) {
    const chartData = useMemo(() => {
        if (payments.length === 0) return { points: [], labels: [], minYear: 0, maxYear: 0 };

        const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const years = sorted.map((p) => new Date(p.date).getFullYear());
        const amounts = sorted.map((p) => p.amount);

        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);
        const amountRange = maxAmount - minAmount || 1;
        const yearRange = maxYear - minYear || 1;

        // Calculate SVG points
        const points = sorted.map((p) => {
            const year = new Date(p.date).getFullYear();
            const x = ((year - minYear) / yearRange) * 100;
            const y = 100 - ((p.amount - minAmount) / amountRange) * 80 - 10; // Leave margins
            return { x, y, year, amount: p.amount };
        });

        // Generate year labels (show every 1-2 years depending on range)
        const labelInterval = yearRange > 8 ? 2 : 1;
        const labels = [];
        for (let y = minYear; y <= maxYear; y += labelInterval) {
            const x = ((y - minYear) / yearRange) * 100;
            labels.push({ x, year: y });
        }

        return { points, labels, minYear, maxYear };
    }, [payments]);

    if (payments.length === 0) return null;

    // Create polyline points string
    const polylinePoints = chartData.points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
        <div className="w-full">
            <div className="relative h-32">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Connection line */}
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-border"
                        points={polylinePoints}
                    />

                    {/* Data points */}
                    {chartData.points.map((point, index) => (
                        <g key={index}>
                            {/* Point circle */}
                            <circle cx={point.x} cy={point.y} r="1.5" fill="currentColor" className="text-foreground" />
                            {/* Outer ring for current year */}
                            {index === chartData.points.length - 1 && (
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-muted-foreground"
                                />
                            )}
                        </g>
                    ))}

                    {/* Projection line (dashed) for future */}
                    {chartData.points.length > 0 && (
                        <line
                            x1={chartData.points[chartData.points.length - 1].x}
                            y1={chartData.points[chartData.points.length - 1].y}
                            x2="105"
                            y2={chartData.points[chartData.points.length - 1].y - 5}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                            className="text-muted-foreground/50"
                        />
                    )}
                </svg>
            </div>

            {/* Year labels */}
            <div className="relative h-6 mt-1">
                <div className="absolute inset-x-0 flex justify-between text-[10px] text-muted-foreground">
                    {chartData.labels.map((label) => (
                        <span
                            key={label.year}
                            className="absolute transform -translate-x-1/2"
                            style={{ left: `${label.x}%` }}
                        >
                            {`JAN '${String(label.year).slice(-2)}`}
                        </span>
                    ))}
                    {/* Future year */}
                    <span className="absolute right-0 transform translate-x-1/2">
                        {`JAN '${String(chartData.maxYear + 1).slice(-2)}`}
                    </span>
                </div>
            </div>
        </div>
    );
}

export const PaymentTimeline = memo(PaymentTimelineComponent);
