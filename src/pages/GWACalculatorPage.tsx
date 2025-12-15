import { useRef, useState, useEffect } from 'react';
import {
    getGWARemark,
    getGWAGradeColor,
    getAcademicStatus,
    getStatusColor,
    percentageToGWA,
    isDeanLister,
    isPresidentsLister,
} from '../types';
import type { GWASubject, HistoryItem } from '../types';

interface GWACalculatorPageProps {
    history: HistoryItem[];
}

export default function GWACalculatorPage({ history }: GWACalculatorPageProps) {
    // Load subjects from localStorage on mount
    const [subjects, setSubjects] = useState<GWASubject[]>(() => {
        const saved = localStorage.getItem('gwaSubjects');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [editingSubject, setEditingSubject] = useState<GWASubject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GWASubject | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [gradeError, setGradeError] = useState('');

    // Form state for add/edit modal
    const [formName, setFormName] = useState('');
    const [formUnits, setFormUnits] = useState('');
    const [formGrade, setFormGrade] = useState('1.00');

    // Save subjects to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('gwaSubjects', JSON.stringify(subjects));
    }, [subjects]);

    const addModalRef = useRef<HTMLDialogElement>(null);
    const importModalRef = useRef<HTMLDialogElement>(null);
    const deleteModalRef = useRef<HTMLDialogElement>(null);

    // Calculate GWA
    const calculateGWA = (): number | null => {
        if (subjects.length === 0) return null;
        const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
        if (totalUnits === 0) return null;
        const weightedSum = subjects.reduce((sum, s) => sum + (s.grade * s.units), 0);
        return weightedSum / totalUnits;
    };

    const gwa = calculateGWA();
    const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
    const academicStatus = gwa !== null ? getAcademicStatus(gwa, subjects) : null;

    // Check honor list eligibility
    const deansListerEligible = gwa !== null ? isDeanLister(gwa, subjects) : false;
    const presidentsListerEligible = gwa !== null ? isPresidentsLister(gwa, subjects) : false;

    // Toast notification helper
    const showNotification = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingSubject(null);
        setFormName('');
        setFormUnits('');
        setFormGrade('1.00');
        addModalRef.current?.showModal();
    };

    // Open edit modal
    const openEditModal = (subject: GWASubject) => {
        setEditingSubject(subject);
        setFormName(subject.name);
        setFormUnits(subject.units.toString());
        setFormGrade(subject.grade.toFixed(2));
        addModalRef.current?.showModal();
    };

    // Close add/edit modal
    const closeAddModal = () => {
        addModalRef.current?.close();
    };

    // Handle form submit
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim() || !formUnits || !formGrade) return;

        const units = Number(formUnits);
        const grade = Number(formGrade);

        if (units <= 0 || units > 6) {
            showNotification('Units must be between 1 and 6');
            return;
        }

        // Validate grade is within GWA scale
        if (grade < 1.00 || grade > 5.00) {
            setGradeError('Grade must be between 1.00 and 5.00');
            return;
        }
        setGradeError('');

        if (editingSubject) {
            // Update existing subject
            setSubjects(prev => prev.map(s =>
                s.id === editingSubject.id
                    ? { ...s, name: formName.trim(), units, grade }
                    : s
            ));
            showNotification('Subject updated successfully!');
        } else {
            // Add new subject
            const newSubject: GWASubject = {
                id: Date.now(),
                name: formName.trim(),
                units,
                grade,
            };
            setSubjects(prev => [...prev, newSubject]);
            showNotification('Subject added successfully!');
        }

        closeAddModal();
    };

    // Open delete confirmation
    const openDeleteConfirm = (subject: GWASubject) => {
        setDeleteTarget(subject);
        deleteModalRef.current?.showModal();
    };

    // Confirm delete
    const confirmDelete = () => {
        if (deleteTarget) {
            setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
            showNotification('Subject deleted successfully!');
        }
        setDeleteTarget(null);
        deleteModalRef.current?.close();
    };

    // Clear all subjects
    const clearAll = () => {
        setSubjects([]);
        showNotification('All subjects cleared!');
    };

    // Import from history
    const openImportModal = () => {
        importModalRef.current?.showModal();
    };

    const closeImportModal = () => {
        importModalRef.current?.close();
    };

    const importFromHistory = (item: HistoryItem) => {
        // Convert percentage grades to GWA grades
        const importedSubject: GWASubject = {
            id: Date.now(),
            name: item.title || 'Imported Subject',
            units: 3, // Default units
            grade: percentageToGWA(Number(item.finalGrade)),
        };
        setSubjects(prev => [...prev, importedSubject]);
        closeImportModal();
        showNotification('Subject imported from history!');
    };

    return (
        <>
            {/* Add/Edit Subject Modal */}
            <dialog ref={addModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">
                        {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                    </h3>
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Subject Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Computer Programming 1"
                                className="input input-bordered w-full"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Units</span>
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 3"
                                className="input input-bordered w-full"
                                value={formUnits}
                                onChange={(e) => setFormUnits(e.target.value)}
                                min="1"
                                max="6"
                                required
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/60">Enter units (1-6)</span>
                            </label>
                        </div>
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text">Grade (GWA Scale)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 1.25"
                                className={`input input-bordered w-full ${gradeError ? 'input-error' : ''}`}
                                value={formGrade}
                                onChange={(e) => {
                                    setFormGrade(e.target.value);
                                    setGradeError('');
                                }}
                                min="1.00"
                                max="5.00"
                                step="0.01"
                                required
                            />
                            <label className="label">
                                <span className={`label-text-alt ${gradeError ? 'text-error' : 'text-base-content/60'}`}>
                                    {gradeError || '1.00 = Excellent, 5.00 = Failed (Valid: 1.00 - 5.00)'}
                                </span>
                            </label>
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={closeAddModal}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingSubject ? 'Update' : 'Add Subject'}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeAddModal}>close</button>
                </form>
            </dialog>

            {/* Import from History Modal */}
            <dialog ref={importModalRef} className="modal">
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">Import from Grade History</h3>
                    <p className="text-sm opacity-60 mb-4">
                        Select a saved grade to import as a subject. The percentage grade will be converted to GWA.
                    </p>
                    {history.length === 0 ? (
                        <div className="text-center py-8 opacity-60">
                            <p>No grade history available.</p>
                            <p className="text-sm mt-2">Save some grades from the calculator first!</p>
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Final Grade</th>
                                        <th>GWA Equivalent</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(item => (
                                        <tr key={item.id} className="hover">
                                            <td className="font-medium">{item.title}</td>
                                            <td>{item.finalGrade}%</td>
                                            <td className={getGWAGradeColor(percentageToGWA(Number(item.finalGrade)))}>
                                                {percentageToGWA(Number(item.finalGrade)).toFixed(2)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => importFromHistory(item)}
                                                >
                                                    Import
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={closeImportModal}>Close</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeImportModal}>close</button>
                </form>
            </dialog>

            {/* Delete Confirmation Modal */}
            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Delete Subject?</h3>
                    <p className="py-4">
                        Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => deleteModalRef.current?.close()}>
                            Cancel
                        </button>
                        <button className="btn btn-error" onClick={confirmDelete}>
                            Yes, Delete
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-2 space-y-4">
                {/* Header Card */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">GWA Subject Calculator</h1>
                            <p className="text-sm opacity-70 mt-1">
                                Calculate your General Weighted Average based on individual subjects
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Subject
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={openImportModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                                Import from History
                            </button>
                            {subjects.length > 0 && (
                                <button className="btn btn-error btn-outline btn-sm" onClick={clearAll}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* GWA Summary Card - Sticky */}
                <div className="sticky top-4 z-10 ring ring-inset ring-primary/30 bg-base-200 rounded-md p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-sm uppercase tracking-wider opacity-60 mb-1">Total Units</div>
                            <div className="text-3xl font-bold">{totalUnits}</div>
                        </div>
                        <div>
                            <div className="text-sm uppercase tracking-wider opacity-60 mb-1">Computed GWA</div>
                            <div className={`text-4xl font-extrabold ${gwa !== null ? getGWAGradeColor(gwa) : ''}`}>
                                {gwa !== null ? gwa.toFixed(2) : '—'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm uppercase tracking-wider opacity-60 mb-1">Academic Status</div>
                            <div className={`text-xl font-bold ${academicStatus ? getStatusColor(academicStatus) : ''}`}>
                                {academicStatus || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Honor List Badges */}
                    {(deansListerEligible || presidentsListerEligible) && (
                        <div className="mt-6 pt-6 border-t border-base-300">
                            <div className="text-sm uppercase tracking-wider opacity-60 mb-3 text-center">Academic Honors</div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {deansListerEligible && (
                                    <div className="badge badge-lg badge-success gap-2 p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                        </svg>
                                        <span className="font-bold">Dean's Lister</span>
                                    </div>
                                )}
                                {presidentsListerEligible && (
                                    <div className="badge badge-lg badge-warning gap-2 p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                        </svg>
                                        <span className="font-bold">President's Lister</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs opacity-50 text-center mt-3 max-w-md mx-auto">
                                {deansListerEligible && presidentsListerEligible
                                    ? "You qualify for both honors! Dean's List is term-based, President's List requires cumulative GWA."
                                    : deansListerEligible
                                        ? "Dean's Honor List: GWA ≤ 1.50 with no grades lower than 2.00 in the term."
                                        : "President's Honors List: Cumulative GWA ≤ 1.50 with no grades lower than 2.00."
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Subjects Table */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <h2 className="text-lg font-bold mb-4">Subjects</h2>

                    {subjects.length === 0 ? (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-16 mx-auto opacity-30 mb-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                            <h3 className="text-lg font-semibold opacity-60">No Subjects Added Yet</h3>
                            <p className="text-sm opacity-50 mt-2 max-w-sm mx-auto">
                                Start by adding your subjects with their units and grades to calculate your GWA.
                            </p>
                            <button className="btn btn-primary mt-6" onClick={openAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Your First Subject
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Subject Name</th>
                                        <th>Units</th>
                                        <th>Grade</th>
                                        <th>Remark</th>
                                        <th>Weighted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject, index) => (
                                        <tr key={subject.id} className="hover">
                                            <td className="opacity-60">{index + 1}</td>
                                            <td className="font-medium">{subject.name}</td>
                                            <td>{subject.units}</td>
                                            <td className={`font-bold ${getGWAGradeColor(subject.grade)}`}>
                                                {subject.grade.toFixed(2)}
                                            </td>
                                            <td className={getGWAGradeColor(subject.grade)}>
                                                {getGWARemark(subject.grade)}
                                            </td>
                                            <td className="opacity-70">
                                                {(subject.grade * subject.units).toFixed(2)}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button
                                                        className="btn btn-square btn-sm btn-ghost"
                                                        onClick={() => openEditModal(subject)}
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="btn btn-square btn-sm btn-ghost text-error"
                                                        onClick={() => openDeleteConfirm(subject)}
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-base-200 font-bold">
                                        <td colSpan={2}>Total</td>
                                        <td>{totalUnits}</td>
                                        <td colSpan={2}></td>
                                        <td>{subjects.reduce((sum, s) => sum + (s.grade * s.units), 0).toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                {/* GWA Scale Reference */}
                <div className="ring ring-inset ring-base-300 rounded-md p-6 lg:p-10">
                    <h2 className="text-lg font-bold mb-4">GWA Grading Scale Reference</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>GWA</th>
                                    <th>Remark</th>
                                    <th>Percentage Equivalent</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="text-success font-bold">1.00</td><td className="text-success">Excellent</td><td>97.5 - 100</td></tr>
                                <tr><td className="text-success font-bold">1.25</td><td className="text-success">Very Good</td><td>94.50 - 97.49</td></tr>
                                <tr><td className="text-success font-bold">1.50</td><td className="text-success">Very Good</td><td>91.50 - 94.49</td></tr>
                                <tr><td className="text-success font-bold">1.75</td><td className="text-success">Very Good</td><td>86.50 - 91.49</td></tr>
                                <tr><td className="text-warning font-bold">2.00</td><td className="text-warning">Satisfactory</td><td>81.50 - 86.49</td></tr>
                                <tr><td className="text-warning font-bold">2.25</td><td className="text-warning">Satisfactory</td><td>76.00 - 81.49</td></tr>
                                <tr><td className="text-warning font-bold">2.50</td><td className="text-warning">Satisfactory</td><td>70.50 - 75.99</td></tr>
                                <tr><td className="text-info font-bold">2.75</td><td className="text-info">Fair</td><td>65.00 - 70.49</td></tr>
                                <tr><td className="text-info font-bold">3.00</td><td className="text-info">Fair</td><td>59.50 - 64.99</td></tr>
                                <tr><td className="text-error font-bold">5.00</td><td className="text-error">Failed</td><td>0.00 - 59.49</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="toast toast-top toast-end z-50">
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}
        </>
    );
}
