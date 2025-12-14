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
