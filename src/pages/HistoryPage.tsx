import { useRef, useState, useEffect } from 'react';
import { getRemark, getRemarkColor } from '../types';
import type { HistoryItem } from '../types';
import { useNavigate } from 'react-router';

interface HistoryPageProps {
    history: HistoryItem[];
    deleteHistoryItem: (id: number) => void;
    clearHistory: () => void;
}

export default function HistoryPage({ history, deleteHistoryItem, clearHistory }: HistoryPageProps) {
    const navigate = useNavigate();
    const confirmModalRef = useRef<HTMLDialogElement>(null);

    // State for layout preference ('table' or 'grid')
    const [layout, setLayout] = useState<'table' | 'grid'>(() => {
        const saved = localStorage.getItem('historyLayout');
        return (saved === 'table' || saved === 'grid') ? saved : 'table';
    });

    // Save layout preference
    useEffect(() => {
        localStorage.setItem('historyLayout', layout);
    }, [layout]);

    const handleEdit = (item: HistoryItem) => {
        navigate('/', { state: { editItem: item } });
    };

    const handleClearClick = () => {
        confirmModalRef.current?.showModal();
    }

    const performClear = () => {
        clearHistory();
        confirmModalRef.current?.close();
    }

    return (
        <div className='col-span-1 md:col-span-2 ring ring-inset ring-base-300 rounded-md p-6 md:p-10'>
            <dialog ref={confirmModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Clear History?</h3>
                    <p className="py-4">Are you sure you want to delete all saved grades? This action cannot be undone.</p>
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => confirmModalRef.current?.close()}>Cancel</button>
                        <button className="btn btn-error" onClick={performClear}>Yes, Clear All</button>
                    </div>
                </div>
            </dialog>

            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-bold'>Grade History</h1>
                    <p>Your saved grade calculations.</p>
                </div>
                <div className="flex gap-2">
                    <div className="join">
                        <button
                            className={`join-item btn btn-sm ${layout === 'table' ? 'btn-active btn-primary' : ''}`}
                            onClick={() => setLayout('table')}
                            aria-label="List View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <button
                            className={`join-item btn btn-sm ${layout === 'grid' ? 'btn-active btn-primary' : ''}`}
                            onClick={() => setLayout('grid')}
                            aria-label="Grid View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                        </button>
                    </div>
                    {history.length > 0 && (
                        <button className="btn btn-error btn-sm" onClick={handleClearClick}>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <p>No history available yet.</p>
                    <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/')}>
                        Go to Calculator
                    </button>
                </div>
            ) : (
                <>
                    {layout === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Prelims</th>
                                        <th>Midterm</th>
                                        <th>Pre-Finals</th>
                                        <th>Finals</th>
                                        <th>Final Grade</th>
                                        <th>Remark</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover">
                                            <td className="text-xs text-nowrap">{item.timestamp}</td>
                                            <td className="font-semibold">{item.title}</td>
                                            <td>{item.prelims}</td>
                                            <td>{item.midterm}</td>
                                            <td>{item.prefinals}</td>
                                            <td>{item.finals}</td>
                                            <td className="font-bold">{item.finalGrade}</td>
                                            <td className={getRemarkColor(getRemark(Number(item.finalGrade)))}>
                                                {getRemark(Number(item.finalGrade))}
                                            </td>
                                            <td >
                                                <div className='flex items-center'>
                                                    <button
                                                        className="btn btn-square btn-md btn-info mr-2"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="btn btn-square btn-md btn-error "
                                                        onClick={() => deleteHistoryItem(item.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item) => (
                                <div key={item.id} className="card bg-base-200 shadow-sm border border-base-300">
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="card-title text-base">{item.title || "Untitled Grade"}</h3>
                                                <p className="text-xs opacity-60">{item.timestamp}</p>
                                            </div>
                                            <div className={`badge ${getRemarkColor(getRemark(Number(item.finalGrade)))} badge-outline font-bold`}>
                                                {getRemark(Number(item.finalGrade))}
                                            </div>
                                        </div>

                                        <div className="my-4 text-center p-4 bg-base-100 rounded-lg">
                                            <div className="text-4xl font-extrabold">{item.finalGrade}</div>
                                            <div className="text-xs opacity-70 uppercase tracking-widest mt-1">Final Grade</div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 text-center text-xs opacity-80 mb-4">
                                            <div className="flex flex-col p-1 bg-base-100 rounded">
                                                <span className="font-bold">{item.prelims}</span>
                                                <span className="opacity-60 text-[10px]">PRELM</span>
                                            </div>
                                            <div className="flex flex-col p-1 bg-base-100 rounded">
                                                <span className="font-bold">{item.midterm}</span>
                                                <span className="opacity-60 text-[10px]">MID</span>
                                            </div>
                                            <div className="flex flex-col p-1 bg-base-100 rounded">
                                                <span className="font-bold">{item.prefinals}</span>
                                                <span className="opacity-60 text-[10px]">PREFI</span>
                                            </div>
                                            <div className="flex flex-col p-1 bg-base-100 rounded">
                                                <span className="font-bold">{item.finals}</span>
                                                <span className="opacity-60 text-[10px]">FINAL</span>
                                            </div>
                                        </div>

                                        <div className="card-actions justify-end mt-auto">
                                            <button className="btn btn-sm btn-ghost btn-square" onClick={() => handleEdit(item)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>
                                            <button className="btn btn-sm btn-ghost btn-square text-error" onClick={() => deleteHistoryItem(item.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 border-t border-base-300 pt-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">Want to calculate another grade?</h3>
                        <p className="text-sm opacity-60 mb-6 max-w-md mx-auto">
                            Keep track of all your subjects. Calculate your grades easily and save them to your history.
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Calculate New Grade
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
