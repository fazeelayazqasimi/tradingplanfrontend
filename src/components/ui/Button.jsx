import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary-500 text-black hover:bg-primary-600 focus:ring-primary-500 shadow-neon hover:shadow-neon-lg',
  secondary: 'bg-ink text-white hover:bg-dark-800 focus:ring-ink shadow-sm',
  outline: 'bg-transparent text-ink border border-dark-200 hover:border-ink focus:ring-dark-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
  success: 'bg-emerald-500 text-black hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm',
  ghost: 'text-dark-500 hover:bg-dark-50 focus:ring-dark-300',
  white: 'bg-white text-primary-700 hover:bg-white/90 focus:ring-white shadow-lg',
  'outline-white': 'bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white focus:ring-white',
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-[15.5px] rounded-2xl',
};

export default function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
      {children}
    </motion.button>
  );
}
