import { useMemo } from 'react';
import type { HistoryItem } from '../types';

interface AnalyticsPageProps {
    history: HistoryItem[];
}

export default function AnalyticsPage({ history }: AnalyticsPageProps) {
    const stats = useMemo(() => {
        if (history.length === 0) {
            return {
                highest: "N/A",
                lowest: "N/A",
                average: "N/A",
                passFailRatio: "N/A"
            };
        }

        const grades = history.map(item => Number(item.finalGrade));
        const highest = Math.max(...grades).toFixed(2);
        const lowest = Math.min(...grades).toFixed(2);
        const average = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2);

        // Calculate Pass/Fail
        // Passing is >= 59.5 (based on types.ts getRemark logic where 59.5 is start of "Fair" and anything below is "Failed")
        const passedCount = grades.filter(g => g >= 59.5).length;
        const failedCount = grades.length - passedCount;
        const passFailRatio = `${passedCount}:${failedCount}`;

        return {
            highest,
            lowest,
            average,
            passFailRatio,
            passedCount,
            failedCount,
            total: grades.length
        };
    }, [history]);

    return (
        <div className="space-y-6">
            <div className='flex items-center gap-4 p-6 lg:p-10 bg-base-100 rounded-md ring ring-inset ring-base-300'>
                <div>
                    <h1 className='text-2xl lg:text-3xl font-bold'>Performance Analytics</h1>
                    <p className='text-sm opacity-70 mt-1'>
                        Insights based on your calculated grade history.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highest Grade */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
                            </svg>
                        </div>
                        <div className="stat-title">Highest Grade</div>
                        <div className="stat-value text-success">{stats.highest}</div>
                        <div className="stat-desc">Best performance so far</div>
                    </div>
                </div>

                {/* Lowest Grade */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                            </svg>
                        </div>
                        <div className="stat-title">Lowest Grade</div>
                        <div className="stat-value text-error">{stats.lowest}</div>
                        <div className="stat-desc">Needs improvement</div>
                    </div>
                </div>

                {/* Average Grade */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                            </svg>

                        </div>
                        <div className="stat-title">Average Grade</div>
                        <div className="stat-value text-primary">{stats.average}</div>
                        <div className="stat-desc">Overall performance mean</div>
                    </div>
                </div>

                {/* Pass/Fail Ratio */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                            </svg>
                        </div>
                        <div className="stat-title">Pass / Fail Ratio</div>
                        <div className="stat-value">{stats.passFailRatio}</div>
                        <div className="stat-desc">{stats.total ? `${stats.passedCount} Passed, ${stats.failedCount} Failed` : 'No data'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
