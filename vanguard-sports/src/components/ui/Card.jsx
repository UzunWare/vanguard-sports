import React from 'react';

/**
 * Card Component
 * Reusable card container with consistent styling
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Optional click handler
 */
const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default Card;
