const colors = {
  success: 'bg-primary-50 text-primary-700',
  warning: 'bg-dark-100 text-dark-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-dark-100 text-dark-600',
  neutral: 'bg-dark-100 text-dark-600',
  purple: 'bg-dark-100 text-dark-600',
};

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
