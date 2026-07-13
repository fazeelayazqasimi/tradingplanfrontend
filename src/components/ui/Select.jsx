import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-[13px] font-semibold text-ink mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={`w-full rounded-[11px] border bg-dark-50 px-4 py-3 text-[14.5px] text-ink outline-none transition-colors duration-200 ${error ? 'border-red-400 focus:border-red-500' : 'border-dark-200 focus:border-primary-500 focus:bg-white'} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
