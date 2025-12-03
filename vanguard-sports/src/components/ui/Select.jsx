import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * Styled dropdown/select with consistent design
 *
 * @param {object} props
 * @param {string} props.label - Select label text
 * @param {string} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {boolean} props.required - Required field indicator
 */
const Select = ({ label, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
      {label} {required && <span className="text-orange-600">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

export default Select;
