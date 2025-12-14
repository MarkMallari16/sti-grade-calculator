import { useRef, useState, useEffect } from 'react'
import { getRemark, getRemarkColor, gradeRanges } from '../types';
import type { Grades } from '../types';
import { useLocation, useNavigate } from 'react-router';

interface CalculatorPageProps {
    saveHistory: (grades: Grades, finalGrade: string, title?: string, id?: number) => void;
}

export default function CalculatorPage({ saveHistory }: CalculatorPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const editItem = location.state?.editItem;

    const modalRef = useRef<HTMLDialogElement>(null);

    const [grades, setGrades] = useState<Grades>({
        prelims: "",
        midterm: "",
        prefinals: "",
        finals: ""
    });

    const [errors, setErrors] = useState<Partial<Grades>>({});
    const [finalGrade, setFinalGrade] = useState<string>();
    const [historyTitle, setHistoryTitle] = useState("");

    // Populate fields if editing
    useEffect(() => {
        if (editItem) {
            setGrades({
                prelims: editItem.prelims,
                midterm: editItem.midterm,
                prefinals: editItem.prefinals,
                finals: editItem.finals
            });
            setHistoryTitle(editItem.title);
        }
    }, [editItem]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error = "";

        if (value) {
            const numValue = Number(value);
            if (numValue < 0 || numValue > 100) {
                error = "Grade must be between 0 and 100";
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error
        }));

        setGrades((prevGrades) => ({
            ...prevGrades,
            [name]: value
        }));
    }

    const handleCalculate = () => {
        const prelims = Number(grades.prelims)
        const midterm = Number(grades.midterm)
        const prefinals = Number(grades.prefinals)
        const finals = Number(grades.finals)

        // Check for existing errors
        const hasErrors = Object.values(errors).some(error => error);
        if (hasErrors) {
            return;
        }
        const weight = 20
        const finalWeight = 40;

        const finalGrade = ((prelims * weight + midterm * weight +
            prefinals * weight + finals * finalWeight) / 100).toFixed(2);

        setFinalGrade(finalGrade);
        // Clear errors after successful calculation
        setErrors({});

        if (modalRef.current) {
            modalRef.current?.showModal();
        }
    }

    const resetFields = () => {
        setGrades({
            prelims: "",
            midterm: "",
            prefinals: "",
            finals: ""
        });
        setErrors({});
        setFinalGrade(undefined);
        setHistoryTitle("");

        // Clear location state if we were editing
        if (editItem) {
            navigate('.', { replace: true, state: {} });
        }

        if (modalRef.current) {
            modalRef.current?.close()
        }
    }

    const onSave = () => {
        if (finalGrade) {
            saveHistory(grades, finalGrade, historyTitle, editItem?.id);
            modalRef.current?.close();
            resetFields();
            navigate('/history');
        }
    };

    return (
        <>
            <dialog ref={modalRef} className="modal">
                <div className="modal-box text-center">
                    <h3 className="font-bold text-lg uppercase tracking-wider opacity-70">Final Grade Calculation</h3>

                    <div className="py-8">
                        <div className="text-7xl font-extrabold tracking-tighter my-2">
                            {finalGrade}
                        </div>

                        {finalGrade && (
                            <div className={`badge badge-lg gap-2 p-4 font-bold ${getRemarkColor(getRemark(Number(finalGrade)))} bg-opacity-15 border-current`}>
                                {getRemark(Number(finalGrade))}
                            </div>
                        )}
                        <p className="text-sm opacity-60 mt-4 max-w-xs mx-auto">
                            Based on the weighted average of your prelims, midterm, pre-finals, and finals.
                        </p>
                    </div>

                    <div className="form-control w-full max-w-xs mx-auto">
                        <label className="label">
                            <span className="label-text">Save Results As (Optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 1st Year - 1st Sem"
                            className="input input-bordered w-full"
                            value={historyTitle}
                            onChange={(e) => setHistoryTitle(e.target.value)}
                        />
                    </div>
                    <div className="modal-action justify-center mt-8">
                        <button className="btn btn-ghost" onClick={() => modalRef.current?.close()}>Dismiss</button>
                        <button className="btn btn-border" onClick={resetFields}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            New Input
                        </button>
                        <button className="btn btn-primary" onClick={onSave}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                            {editItem ? "Update History" : "Save to History"}
                        </button>
                    </div>
                </div>
            </dialog>

            {/**Content */}
            <div className='ring ring-inset ring-base-300 rounded-md p-10 h-fit'>
                <div className='mb-4 flex items-center gap-4'>
                    <img src="./src/assets/sti-logo.png" alt="STI Logo" className='w-18 h-18 lg:w-20 lg:h-20 object-cover rounded-md' />
                    <div>
                        <h1 className='text-lg lg:text-2xl font-bold'>STI College Grades Calculator</h1>
                        <p className='text-sm lg:text-sm font-normal'>
                            A web-based grade calculator designed for STI students to compute grades quickly and accurately.
                        </p>
                    </div>
                </div>
                <div className='mb-2'>
                    <label htmlFor="prelims">Enter Grade for Prelims</label>
                    <input type="number" className={`input inline-block w-full ${errors.prelims ? 'input-error' : ''}`} placeholder='eg: 75' name='prelims' value={grades.prelims} onChange={handleInputChange} id='prelims' />
                    {errors.prelims && <span className="text-error text-sm">{errors.prelims}</span>}
                </div>
                <div className='mb-2'>
                    <label htmlFor="midterm">Enter Grade for Midterm</label>
                    <input type="number" className={`input inline-block w-full ${errors.midterm ? 'input-error' : ''}`} placeholder='eg: 75' name='midterm' value={grades.midterm} onChange={handleInputChange} id='midterm' />
                    {errors.midterm && <span className="text-error text-sm">{errors.midterm}</span>}
                </div>
                <div className='mb-2'>
                    <label htmlFor="prefinals">Enter Grade for Pre-Finals</label>
                    <input type="number" className={`input inline-block w-full ${errors.prefinals ? 'input-error' : ''}`} placeholder='eg: 75' name='prefinals' value={grades.prefinals} onChange={handleInputChange} id='prefinals' />
                    {errors.prefinals && <span className="text-error text-sm">{errors.prefinals}</span>}
                </div>
                <div >
                    <label htmlFor="finals">Enter Grade for Finals</label>
                    <input type="number" className={`input inline-block w-full ${errors.finals ? 'input-error' : ''}`} placeholder='eg: 75' name='finals' value={grades.finals} onChange={handleInputChange} id='finals' />
                    {errors.finals && <span className="text-error text-sm">{errors.finals}</span>}
                </div>
                <button className='mt-3 btn btn-primary w-full' onClick={handleCalculate}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                    Calculate
                </button>
            </div>
            <div className='ring ring-inset ring-base-300 rounded-md p-10 '>
                <div className='mb-4'>
                    <h1 className='text-2xl font-bold'>Grades Table</h1>
                    <p>Displays the entered grades for each grading period along with their corresponding weights and computed results, providing a clear breakdown of how the final grade is calculated.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Grade Range</th>
                                <th>GWA</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradeRanges.map((range, index) => {
                                const isHighlighted = finalGrade
                                    ? Number(finalGrade) >= range.min && Number(finalGrade) <= range.max
                                    : false;

                                return (
                                    <tr key={index} className={isHighlighted ? "bg-base-200 font-bold border-l-4 border-l-primary" : ""}>
                                        <td>{range.label}</td>
                                        <td>{range.gwa}</td>
                                        <td className={`${getRemarkColor(range.remark)} font-bold`}>{range.remark}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
