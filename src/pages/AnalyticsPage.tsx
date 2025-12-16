import { useMemo, useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import confetti from 'canvas-confetti';
import type { HistoryItem, GWASubject, GWAGoal } from '../types';
import { getGWAGradeColor, percentageToGWA } from '../types';
import STILogo from "../../public/sti-logo.png";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

interface AnalyticsPageProps {
    history: HistoryItem[];
    subjects: GWASubject[];
}

export default function AnalyticsPage({ history, subjects }: AnalyticsPageProps) {
    // Goal tracking state with localStorage persistence
    const [goal, setGoal] = useState<GWAGoal | null>(() => {
        const saved = localStorage.getItem('gwaGoal');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    });
    const [goalInput, setGoalInput] = useState('');
    const [showGoalToast, setShowGoalToast] = useState(false);
    const hasTriggeredConfetti = useRef(false);

    // Save goal to localStorage
    useEffect(() => {
        if (goal) {
            localStorage.setItem('gwaGoal', JSON.stringify(goal));
        } else {
            localStorage.removeItem('gwaGoal');
        }
    }, [goal]);

    // Calculate current GWA from subjects
    const currentGWA = useMemo(() => {
        if (subjects.length === 0) return null;
        const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
        if (totalUnits === 0) return null;
        const weightedSum = subjects.reduce((sum, s) => sum + (s.grade * s.units), 0);
        return weightedSum / totalUnits;
    }, [subjects]);

    // Basic stats from GWA Calculator subjects
    const stats = useMemo(() => {
        if (subjects.length === 0) {
            return {
                highest: "N/A",
                lowest: "N/A",
                average: "N/A",
                passFailRatio: "N/A"
            };
        }

        const grades = subjects.map(s => s.grade);
        // For GWA: lower is better, so "highest" means best (lowest GWA), "lowest" means worst (highest GWA)
        const bestGrade = Math.min(...grades).toFixed(2);
        const worstGrade = Math.max(...grades).toFixed(2);
        const average = currentGWA?.toFixed(2) || "N/A";

        // Passing is GWA <= 3.00, Failed is 5.00
        const passedCount = grades.filter(g => g <= 3.00).length;
        const failedCount = grades.filter(g => g === 5.00).length;
        const passFailRatio = `${passedCount}:${failedCount}`;

        return {
            highest: bestGrade,  // Best GWA (lowest number)
            lowest: worstGrade,  // Worst GWA (highest number)
            average,
            passFailRatio,
            passedCount,
            failedCount,
            total: grades.length
        };
    }, [subjects, currentGWA]);

    // GWA Trend data - group grades by month/term
    const trendData = useMemo(() => {
        if (history.length === 0) return null;

        // Sort by timestamp (oldest first)
        const sortedHistory = [...history].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Group by month-year
        const grouped: Record<string, { grades: number[], label: string }> = {};

        sortedHistory.forEach(item => {
            const date = new Date(item.timestamp);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            if (!grouped[key]) {
                grouped[key] = { grades: [], label };
            }
            grouped[key].grades.push(percentageToGWA(Number(item.finalGrade)));
        });

        // Calculate average GWA per period
        const labels: string[] = [];
        const gwaValues: number[] = [];
        const changes: number[] = [];

        Object.keys(grouped).sort().forEach((key, index) => {
            const period = grouped[key];
            const avgGWA = period.grades.reduce((a, b) => a + b, 0) / period.grades.length;
            labels.push(period.label);
            gwaValues.push(Number(avgGWA.toFixed(2)));

            if (index > 0) {
                changes.push(Number((gwaValues[index - 1] - avgGWA).toFixed(2)));
            } else {
                changes.push(0);
            }
        });

        // Get latest change for tooltip message
        const latestChange = changes.length > 1 ? changes[changes.length - 1] : 0;

        return { labels, gwaValues, changes, latestChange };
    }, [history]);

    // Best & Weakest Subjects
    const subjectAnalysis = useMemo(() => {
        if (subjects.length === 0) return null;

        // Sort by grade (ascending = best first for GWA)
        const sorted = [...subjects].sort((a, b) => a.grade - b.grade);

        const best = sorted.slice(0, 3);
        const weakest = [...subjects].sort((a, b) => b.grade - a.grade).slice(0, 3);

        // Calculate impact (units-weighted)
        const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
        const impactCalc = (s: GWASubject) => ((s.grade * s.units) / totalUnits * 100).toFixed(1);

        return { best, weakest, impactCalc, totalUnits };
    }, [subjects]);

    // Grade Distribution calculation
    const gradeDistribution = useMemo(() => {
        if (subjects.length === 0) return null;

        // Categories: Excellent (1.00-1.25), Good (1.50-2.00), Fair (2.25-3.00), Failed (5.00)
        const excellent = subjects.filter(s => s.grade >= 1.00 && s.grade <= 1.25).length;
        const good = subjects.filter(s => s.grade >= 1.50 && s.grade <= 2.00).length;
        const fair = subjects.filter(s => s.grade >= 2.25 && s.grade <= 3.00).length;
        const failed = subjects.filter(s => s.grade === 5.00).length;

        return {
            excellent,
            good,
            fair,
            failed,
            total: subjects.length
        };
    }, [subjects]);

    // Goal progress calculation
    const goalProgress = useMemo(() => {
        if (!goal || currentGWA === null) return null;

        // For GWA: lower is better, so progress is inverted
        const maxGWA = 5.00;

        // Calculate how close we are to the goal
        // If current >= target (worse), progress towards target
        if (currentGWA <= goal.targetGWA) {
            return { percentage: 100, achieved: true, remaining: 0 };
        }

        const progressRange = maxGWA - goal.targetGWA;
        const currentProgress = maxGWA - currentGWA;
        const percentage = Math.min(100, Math.max(0, (currentProgress / progressRange) * 100));

        // Calculate remaining average needed
        const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
        const currentWeighted = subjects.reduce((sum, s) => sum + (s.grade * s.units), 0);

        // Assume 15 more units to achieve goal
        const assumedRemainingUnits = 15;
        const targetTotal = goal.targetGWA * (totalUnits + assumedRemainingUnits);
        const remainingNeeded = (targetTotal - currentWeighted) / assumedRemainingUnits;

        return {
            percentage: Number(percentage.toFixed(1)),
            achieved: false,
            remaining: Math.max(1.00, Math.min(5.00, remainingNeeded))
        };
    }, [goal, currentGWA, subjects]);

    // Trigger confetti when goal is achieved
    useEffect(() => {
        if (goalProgress?.achieved && !hasTriggeredConfetti.current) {
            hasTriggeredConfetti.current = true;
            // Fire confetti celebration
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22c55e', '#fbbf24', '#3b82f6']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#22c55e', '#fbbf24', '#3b82f6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        } else if (!goalProgress?.achieved) {
            hasTriggeredConfetti.current = false;
        }
    }, [goalProgress?.achieved]);

    // Handle goal setting
    const handleSetGoal = () => {
        const target = parseFloat(goalInput);
        if (target >= 1.00 && target <= 5.00) {
            setGoal({
                targetGWA: target,
                createdAt: new Date().toISOString()
            });
            setGoalInput('');
            setShowGoalToast(true);
            setTimeout(() => setShowGoalToast(false), 3000);
        }
    };

    const handleClearGoal = () => {
        setGoal(null);
    };

    // Chart.js configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.parsed.y;
                        const index = context.dataIndex;
                        if (trendData && index > 0) {
                            const change = trendData.changes[index];
                            if (change > 0) {
                                return `GWA: ${value} (improved by ${change})`;
                            } else if (change < 0) {
                                return `GWA: ${value} (declined by ${Math.abs(change)})`;
                            }
                        }
                        return `GWA: ${value}`;
                    }
                }
            }
        },
        scales: {
            y: {
                reverse: true, // Lower GWA is better
                min: 1.0,
                max: 5.0,
                ticks: {
                    stepSize: 0.5,
                }
            }
        }
    };

    const chartData = trendData ? {
        labels: trendData.labels,
        datasets: [
            {
                label: 'GWA',
                data: trendData.gwaValues,
                borderColor: 'oklch(var(--p))',
                backgroundColor: 'oklch(var(--p) / 0.2)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: trendData.changes.map((change, i) => {
                    if (i === 0) return 'oklch(var(--p))';
                    return change > 0 ? 'oklch(var(--su))' : change < 0 ? 'oklch(var(--er))' : 'oklch(var(--p))';
                }),
                pointBorderColor: trendData.changes.map((change, i) => {
                    if (i === 0) return 'oklch(var(--p))';
                    return change > 0 ? 'oklch(var(--su))' : change < 0 ? 'oklch(var(--er))' : 'oklch(var(--p))';
                }),
                pointRadius: 6,
                pointHoverRadius: 8,
            }
        ]
    } : null;

    return (
        <div className="col-span-1 md:col-span-2 space-y-6">
            {/* Header */}
            <div className='flex items-center gap-4 p-6 lg:p-10 bg-base-100 rounded-md ring ring-inset ring-base-300'>
                <img src={STILogo} alt="STI Logo" className='w-18 h-18 lg:w-20 lg:h-20 object-cover rounded-md' />
                <div>
                    <h1 className='text-2xl lg:text-3xl font-bold'>Performance Analytics</h1>
                    <p className='text-sm opacity-70 mt-1'>
                        Insights based on your calculated grade history and subjects.
                    </p>
                </div>
            </div>

            {/* Stats Grid - 4 columns on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Best GWA */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
                            </svg>
                        </div>
                        <div className="stat-title">Best GWA</div>
                        <div className="stat-value text-success">{stats.highest}</div>
                        <div className="stat-desc">Best subject performance</div>
                    </div>
                </div>

                {/* Worst GWA */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                            </svg>
                        </div>
                        <div className="stat-title">Worst GWA</div>
                        <div className="stat-value text-error">{stats.lowest}</div>
                        <div className="stat-desc">Needs improvement</div>
                    </div>
                </div>

                {/* Computed GWA */}
                <div className="stats shadow ring ring-inset ring-base-300">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                            </svg>
                        </div>
                        <div className="stat-title">Computed GWA</div>
                        <div className="stat-value text-primary">{stats.average}</div>
                        <div className="stat-desc">Weighted average</div>
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
                        <div className="stat-desc">{stats.total ? `${stats.passedCount} Passed, ${stats.failedCount} Failed` : 'No subjects added'}</div>
                    </div>
                </div>
            </div>

            {/* Goal Tracking & GWA Trend - Side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goal Tracking */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">🎯</div>
                        <div>
                            <h2 className="text-xl font-bold">Goal Tracking</h2>
                            <p className="text-sm opacity-70">Set your target GWA and track your progress</p>
                        </div>
                    </div>

                    {!goal ? (
                        <div className="bg-base-200 rounded-lg p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="form-control flex-1">
                                    <label className="label">
                                        <span className="label-text">Target GWA</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1.75"
                                        className="input input-bordered w-full"
                                        value={goalInput}
                                        onChange={(e) => setGoalInput(e.target.value)}
                                        min="1.00"
                                        max="5.00"
                                        step="0.25"
                                    />
                                    <label className="label">
                                        <span className="label-text-alt opacity-60">Enter a value between 1.00 - 5.00</span>
                                    </label>
                                </div>
                                <button className="btn btn-primary" onClick={handleSetGoal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                                    </svg>
                                    Set Goal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 text-primary rounded-full p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-60 uppercase tracking-wider">Target GWA</div>
                                        <div className="text-3xl font-bold text-primary">{goal.targetGWA.toFixed(2)}</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm text-error" onClick={handleClearGoal}>
                                    Clear Goal
                                </button>
                            </div>

                            {currentGWA !== null ? (
                                <div className="bg-base-200 rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm opacity-70">Current GWA</span>
                                        <span className={`text-2xl font-bold ${getGWAGradeColor(currentGWA)}`}>
                                            {currentGWA.toFixed(2)}
                                        </span>
                                    </div>

                                    {goalProgress && (
                                        <>
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="opacity-70">Progress to Goal</span>
                                                    <span className="font-bold">{goalProgress.percentage}%</span>
                                                </div>
                                                <progress
                                                    className={`progress w-full ${goalProgress.achieved ? 'progress-success' : 'progress-primary'}`}
                                                    value={goalProgress.percentage}
                                                    max="100"
                                                ></progress>
                                            </div>

                                            {goalProgress.achieved ? (
                                                <div className="alert alert-success">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    <span>🎉 Congratulations! You've achieved your target GWA!</span>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                                    </svg>
                                                    <span>
                                                        You need an average of <strong className="text-warning">{goalProgress.remaining.toFixed(2)}</strong> in
                                                        remaining subjects to reach your target GWA of {goal.targetGWA.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="alert">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Add subjects in the GWA Calculator to track your progress toward this goal.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Grade Distribution */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">📊</div>
                        <div>
                            <h2 className="text-xl font-bold">Grade Distribution</h2>
                            <p className="text-sm opacity-70">Visual breakdown of your performance</p>
                        </div>
                    </div>

                    {gradeDistribution && gradeDistribution.total > 0 ? (
                        <div className="space-y-4">
                            <div className="h-48 md:h-56 flex justify-center">
                                <Doughnut
                                    data={{
                                        labels: ['1.00–1.25 (Excellent)', '1.50–2.00 (Good)', '2.25–3.00 (Fair)', '5.00 (Failed)'],
                                        datasets: [{
                                            data: [
                                                gradeDistribution.excellent,
                                                gradeDistribution.good,
                                                gradeDistribution.fair,
                                                gradeDistribution.failed
                                            ],
                                            backgroundColor: [
                                                'oklch(0.75 0.18 142)',   // Success green
                                                'oklch(0.65 0.19 231)',   // Info blue
                                                'oklch(0.80 0.18 85)',    // Warning yellow
                                                'oklch(0.65 0.22 27)'     // Error red
                                            ],
                                            borderColor: 'oklch(var(--b1))',
                                            borderWidth: 3,
                                            hoverOffset: 8
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '60%',
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const value = context.parsed;
                                                        const total = gradeDistribution.total;
                                                        const percent = ((value / total) * 100).toFixed(1);
                                                        return `${context.label}: ${value} subjects (${percent}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 p-2 rounded bg-success/10">
                                    <div className="w-3 h-3 rounded-full bg-success"></div>
                                    <span>1.00–1.25</span>
                                    <span className="ml-auto font-bold">{gradeDistribution.excellent}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-info/10">
                                    <div className="w-3 h-3 rounded-full bg-info"></div>
                                    <span>1.50–2.00</span>
                                    <span className="ml-auto font-bold">{gradeDistribution.good}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-warning/10">
                                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                                    <span>2.25–3.00</span>
                                    <span className="ml-auto font-bold">{gradeDistribution.fair}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-error/10">
                                    <div className="w-3 h-3 rounded-full bg-error"></div>
                                    <span>5.00 (Failed)</span>
                                    <span className="ml-auto font-bold">{gradeDistribution.failed}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-60">
                            <p>No subjects available.</p>
                            <p className="text-sm mt-1">Add subjects in the GWA Calculator.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* GWA Trend Over Time - Separate section */}
            {chartData && trendData && trendData.labels.length > 1 && (
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">📈</div>
                        <div>
                            <h2 className="text-xl font-bold">GWA Trend Over Time</h2>
                            <p className="text-sm opacity-70">Track your academic performance across terms</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-64 md:h-80">
                            <Line options={chartOptions} data={chartData} />
                        </div>

                        {trendData.latestChange !== 0 && (
                            <div className={`alert ${trendData.latestChange > 0 ? 'alert-success' : 'alert-warning'}`}>
                                <span className="text-2xl">{trendData.latestChange > 0 ? '📈' : '📉'}</span>
                                <span>
                                    Your GWA <strong>{trendData.latestChange > 0 ? 'improved' : 'declined'}</strong> by{' '}
                                    <strong>{Math.abs(trendData.latestChange).toFixed(2)}</strong> this term!
                                    {trendData.latestChange > 0
                                        ? " Keep up the great work! 🌟"
                                        : " Don't worry, you can improve next term! 💪"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Best & Weakest Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Best Subjects */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">⭐</div>
                        <div>
                            <h2 className="text-xl font-bold">Best Subjects</h2>
                            <p className="text-sm opacity-70">Your top performing subjects</p>
                        </div>
                    </div>

                    {subjectAnalysis && subjectAnalysis.best.length > 0 ? (
                        <div className="space-y-3">
                            {subjectAnalysis.best.map((subject, index) => (
                                <div key={subject.id} className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                                    <div className="flex items-center gap-3">
                                        <div className="badge badge-success badge-lg font-bold">{index + 1}</div>
                                        <div>
                                            <div className="font-semibold">{subject.name}</div>
                                            <div className="text-xs opacity-60">{subject.units} units • {subjectAnalysis.impactCalc(subject)}% impact</div>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-bold ${getGWAGradeColor(subject.grade)}`}>
                                        {subject.grade.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-60">
                            <p>No subjects available.</p>
                            <p className="text-sm mt-1">Add subjects in the GWA Calculator.</p>
                        </div>
                    )}
                </div>

                {/* Weakest Subjects */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h2 className="text-xl font-bold">Needs Improvement</h2>
                            <p className="text-sm opacity-70">Focus on these subjects</p>
                        </div>
                    </div>

                    {subjectAnalysis && subjectAnalysis.weakest.length > 0 ? (
                        <div className="space-y-3">
                            {subjectAnalysis.weakest.map((subject, index) => (
                                <div key={subject.id} className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
                                    <div className="flex items-center gap-3">
                                        <div className="badge badge-warning badge-lg font-bold">{index + 1}</div>
                                        <div>
                                            <div className="font-semibold">{subject.name}</div>
                                            <div className="text-xs opacity-60">{subject.units} units • {subjectAnalysis.impactCalc(subject)}% impact</div>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-bold ${getGWAGradeColor(subject.grade)}`}>
                                        {subject.grade.toFixed(2)}
                                    </div>
                                </div>
                            ))}

                            <div className="alert alert-warning mt-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                </svg>
                                <span className="text-sm">
                                    Higher-unit subjects have more impact on your GWA. Focus on improving these!
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-60">
                            <p>No subjects available.</p>
                            <p className="text-sm mt-1">Add subjects in the GWA Calculator.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {showGoalToast && (
                <div className="toast toast-top toast-end z-50">
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Goal set successfully! 🎯</span>
                    </div>
                </div>
            )}
        </div>
    );
}
