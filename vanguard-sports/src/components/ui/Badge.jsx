import React from 'react';

/**
 * Badge Component
 * Colored badge/label for status indicators
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.color - Badge color (orange|green|blue|red|gray|yellow)
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({ children, color = "orange", className = "" }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-slate-100 text-slate-800 border-slate-200",
    yellow: "bg-amber-100 text-amber-800 border-amber-200"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${colors[color] || colors.orange} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
