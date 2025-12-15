export type Grades = {
    prelims: string;
    midterm: string;
    prefinals: string;
    finals: string;
}

export type HistoryItem = Grades & {
    id: number;
    finalGrade: string;
    timestamp: string;
    title: string;
}

export const gradeRanges = [
    { min: 97.5, max: 100, gwa: "1.00", remark: "Excellent", label: "97.5 - 100" },
    { min: 94.5, max: 97.49, gwa: "1.25", remark: "Very Good", label: "94.50 - 97.49" },
    { min: 91.5, max: 94.49, gwa: "1.50", remark: "Very Good", label: "91.50 - 94.49" },
    { min: 86.5, max: 91.49, gwa: "1.75", remark: "Very Good", label: "86.50 - 91.49" },
    { min: 81.5, max: 86.49, gwa: "2.00", remark: "Satisfactory", label: "81.50 - 86.49" },
    { min: 76.0, max: 81.49, gwa: "2.25", remark: "Satisfactory", label: "76.00 - 81.49" },
    { min: 70.5, max: 75.99, gwa: "2.50", remark: "Satisfactory", label: "70.50 - 75.99" },
    { min: 65.0, max: 70.49, gwa: "2.75", remark: "Fair", label: "65.00 - 70.49" },
    { min: 59.5, max: 64.99, gwa: "3.00", remark: "Fair", label: "59.50 - 64.99" },
    { min: 0, max: 59.49, gwa: "5.00", remark: "Failed", label: "0.00 - 59.49" },
];

export const getRemark = (grade: number): string => {
    if (grade >= 97.5) return "Excellent";
    if (grade >= 94.5) return "Very Good";
    if (grade >= 91.5) return "Very Good";
    if (grade >= 86.5) return "Very Good";
    if (grade >= 81.5) return "Satisfactory";
    if (grade >= 76) return "Satisfactory";
    if (grade >= 70.5) return "Satisfactory";
    if (grade >= 65) return "Fair";
    if (grade >= 59.5) return "Fair";
    return "Failed";
};

export const getRemarkColor = (remark: string): string => {
    switch (remark) {
        case "Excellent":
        case "Very Good":
            return "text-success"; // green
        case "Satisfactory":
            return "text-warning"; // orange/yellow
        case "Fair":
            return "text-info"; // blue
        case "Failed":
            return "text-error"; // red
        default:
            return "";
    }
};

// ==================== GWA Calculator Types ====================

// Valid GWA grades (STI grading system)
export const validGWAGrades = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 5.00];

// Subject entry for GWA calculation
export type GWASubject = {
    id: number;
    name: string;
    units: number;
    grade: number; // Uses GWA scale: 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 5.00
};

// Grade validation helper
export const isValidGWAGrade = (grade: number): boolean => {
    return validGWAGrades.includes(grade);
};

// Get remark for GWA grade
export const getGWARemark = (grade: number): string => {
    if (grade === 1.00) return "Excellent";
    if (grade <= 1.75) return "Very Good";
    if (grade <= 2.50) return "Satisfactory";
    if (grade <= 3.00) return "Fair";
    return "Failed";
};

// Get color for GWA grade
export const getGWAGradeColor = (grade: number): string => {
    if (grade <= 1.75) return "text-success";
    if (grade <= 2.50) return "text-warning";
    if (grade <= 3.00) return "text-info";
    return "text-error";
};

// Check Dean's Lister eligibility (Term-based)
// Requirements:
// - GWA of 1.50 or higher in the term being evaluated
// - No grades lower than 2.00 in all courses taken in the term
export const isDeanLister = (gwa: number, subjects: GWASubject[]): boolean => {
    if (subjects.length === 0) return false;
    const hasFailedGrade = subjects.some(s => s.grade === 5.00);
    const hasGradeLowerThan2 = subjects.some(s => s.grade > 2.00);

    return gwa <= 1.50 && !hasFailedGrade && !hasGradeLowerThan2;
};

// Check President's Lister eligibility (Cumulative)
// Requirements:
// - Cumulative GWA of 1.50 or higher since initial enrollment
// - No grades lower than 2.00 in all courses
// - No failed subjects (5.00)
// - No DRP or INC grades (not tracked in this calculator)
export const isPresidentsLister = (gwa: number, subjects: GWASubject[]): boolean => {
    if (subjects.length === 0) return false;
    const hasFailedGrade = subjects.some(s => s.grade === 5.00);
    const hasGradeLowerThan2 = subjects.some(s => s.grade > 2.00);

    return gwa <= 1.50 && !hasFailedGrade && !hasGradeLowerThan2;
};

// Get academic status based on computed GWA and individual grades
export const getAcademicStatus = (gwa: number, subjects: GWASubject[]): string => {
    const hasFailedGrade = subjects.some(s => s.grade === 5.00);

    if (hasFailedGrade) return "Failed";
    if (gwa > 3.00) return "Failed";
    if (gwa <= 1.75) return "Honor Student";
    if (gwa <= 3.00) return "Passed";
    return "Needs Improvement";
};

// Color for GWA-based academic status
export const getStatusColor = (status: string): string => {
    switch (status) {
        case "Dean's Lister":
        case "President's Lister":
        case "Honor Student":
            return "text-success";
        case "Passed":
            return "text-warning";
        case "Failed":
        case "Needs Improvement":
            return "text-error";
        default:
            return "";
    }
};

// Convert percentage grade to GWA grade
export const percentageToGWA = (percentage: number): number => {
    if (percentage >= 97.5) return 1.00;
    if (percentage >= 94.5) return 1.25;
    if (percentage >= 91.5) return 1.50;
    if (percentage >= 86.5) return 1.75;
    if (percentage >= 81.5) return 2.00;
    if (percentage >= 76.0) return 2.25;
    if (percentage >= 70.5) return 2.50;
    if (percentage >= 65.0) return 2.75;
    if (percentage >= 59.5) return 3.00;
    return 5.00;
};
