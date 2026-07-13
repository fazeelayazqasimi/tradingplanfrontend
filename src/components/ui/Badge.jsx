const colors = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-primary-600',
  neutral: 'bg-dark-100 text-dark-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
