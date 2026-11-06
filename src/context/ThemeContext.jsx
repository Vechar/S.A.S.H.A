import { useLayoutEffect } from 'react';
import themes, { DEFAULT_THEME } from '../styles/themes';

function applyThemeToCSS(id, theme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    if (key === 'name' || key === 'emoji') return;
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });
  root.dataset.theme = id;
}

export function ThemeProvider({ children }) {
  useLayoutEffect(() => {
    applyThemeToCSS(DEFAULT_THEME, themes[DEFAULT_THEME]);
  }, []);

  return children;
}
