import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cv_theme') as Theme | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme };
};

export const applyTheme = (theme: Theme) => {
  const htmlElement = document.documentElement;
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
  localStorage.setItem('cv_theme', theme);
};

// Initialize theme synchronously on page load (before React renders)
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('cv_theme') as Theme | null;
  const theme = savedTheme || 'light';
  applyTheme(theme);
};
