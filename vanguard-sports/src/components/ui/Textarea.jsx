import React from 'react';

/**
 * Textarea Component
 * Multi-line text input with consistent styling
 *
 * @param {object} props
 * @param {string} props.label - Textarea label text
 * @param {string} props.value - Textarea value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.rows - Number of rows
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.maxLength - Maximum character length
 */
const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className = "",
  maxLength
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 focus:placeholder:text-transparent resize-vertical"
    />
    {maxLength && (
      <div className="text-xs text-slate-400 mt-1 text-right">
        {value.length}/{maxLength}
      </div>
    )}
  </div>
);

export default Textarea;
