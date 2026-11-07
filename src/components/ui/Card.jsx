import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  // If className provides a bg-*, skip default bg-white — Tailwind CSS order
  // puts .bg-white last, so it would silently override custom backgrounds.
  const hasBg = /(^|\s)bg-/.test(className);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${hasBg ? '' : 'bg-white'} border border-dark-100 rounded-[18px] p-[22px] shadow-card ${hover ? 'hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 transition-all duration-300 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
