import React from 'react';

/**
 * LoadingSkeleton Component
 * Premium loading skeletons for various content types
 *
 * @param {object} props
 * @param {string} props.variant - Skeleton type (table|card|stats|list|form)
 * @param {number} props.rows - Number of rows for table variant
 * @param {number} props.count - Number of items for card/stats/list variants
 */
const LoadingSkeleton = ({ variant = 'card', rows = 3, count = 1 }) => {
  const shimmer = "animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]";

  if (variant === 'table') {
    return (
      <div className="w-full">
        {/* Table Header */}
        <div className="flex gap-4 p-4 bg-slate-50 border-b border-slate-200">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-4 rounded ${shimmer} flex-1`}></div>
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex gap-4 p-4 border-b border-slate-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-4 rounded ${shimmer} flex-1`}></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className={`h-6 w-3/4 rounded ${shimmer} mb-4`}></div>
            <div className={`h-4 w-full rounded ${shimmer} mb-2`}></div>
            <div className={`h-4 w-5/6 rounded ${shimmer} mb-2`}></div>
            <div className={`h-4 w-4/6 rounded ${shimmer}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-lg ${shimmer}`}></div>
              <div className={`h-3 w-20 rounded ${shimmer}`}></div>
            </div>
            <div className={`h-8 w-24 rounded ${shimmer} mb-2`}></div>
            <div className={`h-4 w-32 rounded ${shimmer}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <div className={`w-12 h-12 rounded-full ${shimmer}`}></div>
            <div className="flex-1">
              <div className={`h-4 w-1/3 rounded ${shimmer} mb-2`}></div>
              <div className={`h-3 w-1/2 rounded ${shimmer}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx}>
            <div className={`h-4 w-24 rounded ${shimmer} mb-2`}></div>
            <div className={`h-10 w-full rounded-lg ${shimmer}`}></div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={`h-32 rounded-xl ${shimmer}`}></div>
  );
};

export default LoadingSkeleton;
