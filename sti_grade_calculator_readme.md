# 🎓 STI Grade Calculator

A web-based grade calculator designed for **STI College students** to compute their grades quickly, accurately, and clearly. The application allows users to input grades for each grading period and instantly see computed results based on the STI grading system.

---

## 🚀 Features

- 📊 **Grade Computation** for:
  - Prelims
  - Midterm
  - Pre-Finals
  - Finals
- ⚖️ **Weighted Calculation** following STI grading rules
- 🧮 **Automatic GWA Conversion** based on grade ranges
- 🏷️ **Remarks Display** (Excellent, Very Good, Satisfactory, Fair, Failed)
- 🔄 **Reset Functionality** to clear inputs instantly
- 🌙 **Modern Dark UI** for better readability
- 📱 **Responsive Design** (Desktop & Mobile friendly)

---

## 🛠️ Tech Stack

- **React** – UI development
- **TypeScript** – Type safety and better developer experience
- **Tailwind CSS** – Utility-first styling
- **DaisyUI** – Prebuilt Tailwind components for clean UI

---

## 📂 Project Structure (Simplified)

```bash
src/
├── components/        # Reusable UI components
├── hooks/             # Custom React hooks
├── pages/             # Main pages
├── utils/             # Helper functions (grade logic)
├── App.tsx
└── main.tsx
```

---

## 🧑‍💻 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/sti-grade-calculator.git
cd sti-grade-calculator
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📘 How It Works

1. Enter grades (0–100) for each grading period
2. Click **Calculate**
3. The app:
   - Computes the final grade
   - Converts it to **GWA**
   - Displays the corresponding **remarks**
4. Use **Reset** to start over

---

## 📊 Grading System Reference

The calculator follows the official STI grading scale, mapping numerical grades to:
- **GWA values**
- **Performance remarks**

This ensures results are accurate and aligned with academic standards.

---

## 🌟 Future Enhancements (Planned)

- 📜 Grade history & export (PDF/CSV)
- 🎯 Subject-based calculations
- 🧠 GPA tracker per semester
- ☁️ Cloud save using Supabase/Firebase
- 📈 Analytics & performance insights

---

## 📄 License

This project is for **educational purposes** and personal use.

---

## 🙌 Acknowledgments

- STI College grading guidelines
- Tailwind CSS & DaisyUI community

---

> Built with ❤️ using React, TypeScript, Tailwind CSS, and DaisyUI

