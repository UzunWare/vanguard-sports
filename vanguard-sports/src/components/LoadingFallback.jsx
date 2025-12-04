import React from 'react';
import { Loader } from 'lucide-react';

/**
 * LoadingFallback Component
 * Displays a loading spinner while lazy-loaded components are being fetched
 * Used with React.Suspense for code splitting
 */
const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader className="text-orange-600 animate-spin" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Loading...</h2>
        <p className="text-slate-600">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
