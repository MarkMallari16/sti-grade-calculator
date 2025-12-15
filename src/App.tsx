import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import CalculatorPage from './pages/CalculatorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import GWACalculatorPage from './pages/GWACalculatorPage';
import type { HistoryItem, Grades, GWASubject } from './types';

function App() {
  // Theme state management
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "my-dark");

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("grade_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Load subjects from localStorage for analytics
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

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("grade_history", JSON.stringify(history));
  }, [history]);

  // Listen for changes to subjects in localStorage (from GWACalculatorPage)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('gwaSubjects');
      if (saved) {
        try {
          setSubjects(JSON.parse(saved));
        } catch {
          setSubjects([]);
        }
      }
    };

    // Check for updates periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    // Listen for storage events (for cross-tab updates)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setTheme("my-light");
    } else {
      setTheme("my-dark");
    }
  };

  const saveHistory = (grades: Grades, finalGrade: string, title?: string, id?: number) => {
    if (id) {
      // Update existing item
      setHistory(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...grades,
            finalGrade,
            timestamp: new Date().toLocaleString(),
            title: title || item.title
          };
        }
        return item;
      }));
    } else {
      // Create new item
      const newItem: HistoryItem = {
        ...grades,
        id: Date.now(),
        finalGrade,
        timestamp: new Date().toLocaleString(),
        title: title || "Untitled"
      };
      setHistory(prev => [newItem, ...prev]);
    }
  };

  const deleteHistoryItem = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <Routes>
      <Route path="/" element={<Layout theme={theme} handleThemeChange={handleThemeChange} />}>
        <Route index element={<CalculatorPage saveHistory={saveHistory} />} />
        <Route path="history" element={<HistoryPage history={history} deleteHistoryItem={deleteHistoryItem} clearHistory={clearHistory} />} />
        <Route path="analytics" element={<AnalyticsPage history={history} subjects={subjects} />} />
        <Route path="gwa-calculator" element={<GWACalculatorPage history={history} />} />
      </Route>
    </Routes>
  );
}

export default App

