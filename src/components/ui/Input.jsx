import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-[13px] font-semibold text-ink mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400"><Icon size={18} /></div>}
        <input
          ref={ref}
          className={`w-full rounded-[11px] border bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors duration-200 ${error ? 'border-red-400 focus:border-red-500' : 'border-dark-200 focus:border-primary-500 focus:bg-white'} ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
