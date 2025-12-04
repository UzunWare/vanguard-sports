import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import Button from '../ui/Button';
import { SKILL_CRITERIA } from '../../constants/skillCriteria';

/**
 * AssessmentModal Component
 * Modal for evaluating athlete skills
 *
 * @param {object} props
 * @param {object} props.student - Student object with id, name, and ratings
 * @param {string} props.sport - Sport type (Basketball/Volleyball)
 * @param {function} props.onClose - Function to close the modal
 * @param {function} props.onSave - Function called with (studentId, ratings) after save
 */
const AssessmentModal = ({ student, sport, onClose, onSave }) => {
  const criteria = SKILL_CRITERIA[sport] || [];
  const [ratings, setRatings] = useState(student.ratings || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
        <div className="mb-6">
           <h2 className="text-xl font-bold text-slate-900">Evaluation: {student.name}</h2>
           <p className="text-sm text-slate-500">{sport} Skills Assessment</p>
        </div>

        <div className="space-y-4 mb-8">
           {criteria.map(skill => (
              <div key={skill} className="flex items-center justify-between">
                 <span className="font-medium text-slate-700">{skill}</span>
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                       <button
                          key={star}
                          onClick={() => setRatings({...ratings, [skill]: star})}
                          className={`p-1 rounded-full hover:bg-slate-100 transition-all ${ratings[skill] >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                       >
                          <Star fill="currentColor" size={24} />
                       </button>
                    ))}
                 </div>
              </div>
           ))}
        </div>

        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button onClick={() => onSave(student.id, ratings)}>Save Evaluation</Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
