import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ink dark:bg-white text-white dark:text-ink shadow-card-md hover:shadow-card-lg transition-all duration-300 hover:scale-105"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {dark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
    </button>
  );
}
