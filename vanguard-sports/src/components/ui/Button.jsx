import React from 'react';

/**
 * Button Component
 * Reusable button with multiple variant styles
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - Button style variant (primary|secondary|outline|ghost|danger)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button|submit|reset)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  fullWidth = false
}) => {
  const base = "px-6 py-3 rounded-lg font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-700",
    outline: "bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50",
    ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
