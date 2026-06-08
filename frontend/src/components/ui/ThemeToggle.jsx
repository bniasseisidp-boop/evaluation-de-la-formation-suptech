import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useThemeStore();
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className={`relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 flex-shrink-0 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'} ${className}`}>
      {/* Track icons */}
      <Sun className="absolute left-1.5 w-3.5 h-3.5 text-amber-400 opacity-80" />
      <Moon className="absolute right-1.5 w-3.5 h-3.5 text-blue-400 opacity-80" />
      {/* Sliding knob */}
      <motion.div
        layout
        animate={{ x: isDark ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center z-10 flex-shrink-0 ${isDark ? 'bg-blue-500' : 'bg-white'}`}>
        {isDark
          ? <Moon className="w-2.5 h-2.5 text-white" />
          : <Sun className="w-2.5 h-2.5 text-amber-500" />
        }
      </motion.div>
    </motion.button>
  );
}
