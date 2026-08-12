import { useTheme } from '../../context/ThemeContext.jsx';
import './ThemeToggle.css';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`sp-theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="sp-theme-toggle-icon" aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span className="sp-theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
