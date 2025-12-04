import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';

/**
 * LegalPage Component
 * Wrapper component for legal and policy pages
 *
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.content - Page content
 * @param {function} props.setView - Function to change the current view
 */
const LegalPage = ({ title, content, setView }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-6">
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-8 font-semibold"
      >
        <ChevronRight size={20} className="rotate-180" /> Back to Home
      </button>
      <Card className="p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
        <div className="prose prose-slate max-w-none">
          {content}
        </div>
      </Card>
    </div>
  </div>
);

export default LegalPage;
