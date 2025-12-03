import React from 'react';
import { Info } from 'lucide-react';

/**
 * Input Component
 * Enhanced text input with icon, label, and error states
 *
 * @param {object} props
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type (text|email|password|number|date)
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field indicator
 * @param {boolean} props.disabled - Disabled field indicator
 * @param {string} props.className - Additional CSS classes
 * @param {React.Component} props.icon - Icon component (Lucide React)
 * @param {number} props.maxLength - Maximum character length
 * @param {string} props.error - Error message to display
 */
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  icon: Icon,
  maxLength,
  error
}) => (
  <div className={`mb-4 ${className}`}>
    <div className="flex justify-between items-baseline">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      {error && (
        <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
          <Info size={10} /> {error}
        </span>
      )}
    </div>
    <div className="relative">
      {Icon && <Icon className={`absolute left-3 top-3 transition-colors ${error ? 'text-red-400' : disabled ? 'text-slate-300' : 'text-slate-400'}`} size={18} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full bg-slate-50 border rounded-lg p-2.5 ${Icon ? 'pl-10' : ''}
          outline-none transition-all placeholder:text-slate-400 focus:placeholder:text-transparent
          ${disabled
            ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
            : error
            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50'
            : 'border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
          }`}
      />
    </div>
  </div>
);

export default Input;
