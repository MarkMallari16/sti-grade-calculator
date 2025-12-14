import { useRef } from 'react';
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

            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Grade History</h1>
                    <p>Your saved grade calculations.</p>
                </div>
                {history.length > 0 && (
                    <button className="btn btn-error btn-sm" onClick={handleClearClick}>
                        Clear All History
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <p>No history available yet.</p>
                    <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/')}>
                        Go to Calculator
                    </button>
                </div>
            ) : (
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
                                    <td className="text-xs">{item.timestamp}</td>
                                    <td className="font-semibold">{item.title}</td>
                                    <td>{item.prelims}</td>
                                    <td>{item.midterm}</td>
                                    <td>{item.prefinals}</td>
                                    <td>{item.finals}</td>
                                    <td className="font-bold">{item.finalGrade}</td>
                                    <td className={getRemarkColor(getRemark(Number(item.finalGrade)))}>
                                        {getRemark(Number(item.finalGrade))}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-square btn-xs btn-info btn-outline mr-2"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn btn-square btn-xs btn-error btn-outline"
                                            onClick={() => deleteHistoryItem(item.id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
