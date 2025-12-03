import React from 'react';

/**
 * Table Component
 * Responsive table with consistent styling
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, className?: string}>} props.columns - Table columns
 * @param {Array<object>} props.data - Table data
 * @param {function} props.renderRow - Function to render each row
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {string} props.className - Additional CSS classes
 */
const Table = ({
  columns,
  data,
  renderRow,
  emptyMessage = "No data available",
  className = ""
}) => {
  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
          <tr>
            {columns.map(col => (
              <th key={col.key} className={`p-4 ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data && data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
