import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, DollarSign, MapPin } from 'lucide-react';
import { Card, Button, Input, Select, Textarea } from '../../../components/ui';

/**
 * SessionModal - Create/Edit Training Sessions
 * Clean, simple implementation with no layout shifts
 */
const SessionModal = ({ session, onSave, onClose, coaches = [] }) => {
  const isEditMode = !!session;

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    id: session?.id || '',
    sport: session?.sport || 'Basketball',
    level: session?.level || '',
    grades: session?.grades || '',
    gender: session?.gender || 'Male',
    minAge: session?.minAge || 6,
    maxAge: session?.maxAge || 18,
    date: session?.date || 'Every Saturday',
    time: session?.time || '',
    duration: session?.duration || '60 min',
    location: session?.location || 'Vanguard Main Gym',
    capacity: session?.capacity || 20,
    registeredCount: session?.registeredCount || 0,
    price: session?.price || 90,
    regFee: session?.regFee || 30,
    headCoach: session?.headCoach || '',
    assistantCoach: session?.assistantCoach || '',
    description: session?.description || '',
    status: session?.status || 'Open',
    features: session?.features || []
  });

  const [errors, setErrors] = useState({});
  const [featureInput, setFeatureInput] = useState('');

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.level.trim()) newErrors.level = 'Session name is required';
    if (!formData.grades.trim()) newErrors.grades = 'Grade level is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (formData.minAge > formData.maxAge) newErrors.maxAge = 'Max age must be >= min age';
    if (formData.capacity < formData.registeredCount) newErrors.capacity = 'Capacity cannot be less than enrollment';
    if (formData.price < 50 || formData.price > 500) newErrors.price = 'Price must be between $50-$500';
    if (!formData.headCoach.trim()) newErrors.headCoach = 'Head coach is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle feature addition
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  // Handle feature removal
  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const sessionData = isEditMode
      ? formData
      : { ...formData, id: `${formData.sport.toLowerCase().slice(0, 2)}-${Date.now()}` };

    onSave(sessionData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 pb-8 px-6 overflow-y-auto">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[calc(100vh-8rem)] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER - Fixed */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isEditMode ? 'Edit Session' : 'Create New Session'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {isEditMode ? 'Update session details' : 'Add a new training session'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* BODY - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="session-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    label="Sport *"
                    value={formData.sport}
                    onChange={(e) => handleChange('sport', e.target.value)}
                    options={[
                      { value: 'Basketball', label: 'Basketball' },
                      { value: 'Volleyball', label: 'Volleyball' }
                    ]}
                    required
                  />
                  <Input
                    label="Session Name *"
                    placeholder="e.g., Junior Boys"
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    error={errors.level}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    label="Gender *"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    options={[
                      { value: 'Male', label: 'Boys' },
                      { value: 'Female', label: 'Girls' },
                      { value: 'Coed', label: 'Coed' }
                    ]}
                    required
                  />
                  <Input
                    label="Grade Level *"
                    placeholder="e.g., Grades 6-8"
                    value={formData.grades}
                    onChange={(e) => handleChange('grades', e.target.value)}
                    error={errors.grades}
                    required
                  />
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe what athletes will learn..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Section 2: Schedule */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                Schedule
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Select
                    label="Day *"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    options={[
                      { value: 'Every Monday', label: 'Monday' },
                      { value: 'Every Tuesday', label: 'Tuesday' },
                      { value: 'Every Wednesday', label: 'Wednesday' },
                      { value: 'Every Thursday', label: 'Thursday' },
                      { value: 'Every Friday', label: 'Friday' },
                      { value: 'Every Saturday', label: 'Saturday' },
                      { value: 'Every Sunday', label: 'Sunday' }
                    ]}
                    required
                  />
                  <Input
                    label="Time *"
                    type="time"
                    value={formData.time.split(' - ')[0]?.replace(/(\\d{1,2}):(\\d{2})\\s(AM|PM)/, (_, h, m, ap) => {
                      let hour = parseInt(h);
                      if (ap === 'PM' && hour !== 12) hour += 12;
                      if (ap === 'AM' && hour === 12) hour = 0;
                      return `${hour.toString().padStart(2, '0')}:${m}`;
                    })}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      let h = parseInt(hours);
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      h = h % 12 || 12;
                      const endTime = new Date(0, 0, 0, parseInt(hours), parseInt(minutes) + parseInt(formData.duration));
                      let endH = endTime.getHours();
                      const endAmpm = endH >= 12 ? 'PM' : 'AM';
                      endH = endH % 12 || 12;
                      handleChange('time', `${h}:${minutes} ${ampm} - ${endH}:${endTime.getMinutes().toString().padStart(2, '0')} ${endAmpm}`);
                    }}
                    error={errors.time}
                    required
                  />
                  <Select
                    label="Duration *"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    options={[
                      { value: '60 min', label: '60 minutes' },
                      { value: '75 min', label: '75 minutes' },
                      { value: '90 min', label: '90 minutes' },
                      { value: '120 min', label: '120 minutes' }
                    ]}
                    required
                  />
                </div>

                <Input
                  label="Location"
                  placeholder="e.g., Vanguard Main Gym"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  icon={MapPin}
                />
              </div>
            </div>

            {/* Section 3: Eligibility & Capacity */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-600" />
                Eligibility & Capacity
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Age *"
                    type="number"
                    min="6"
                    max="18"
                    value={formData.minAge}
                    onChange={(e) => handleChange('minAge', parseInt(e.target.value))}
                    required
                  />
                  <Input
                    label="Maximum Age *"
                    type="number"
                    min="6"
                    max="18"
                    value={formData.maxAge}
                    onChange={(e) => handleChange('maxAge', parseInt(e.target.value))}
                    error={errors.maxAge}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Max Capacity *"
                    type="number"
                    min="8"
                    max="30"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                    error={errors.capacity}
                    required
                  />
                  {isEditMode && (
                    <Input
                      label="Current Enrollment"
                      type="number"
                      value={formData.registeredCount}
                      disabled
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Pricing */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                Pricing
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Monthly Price *"
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  error={errors.price}
                  required
                />
                <Input
                  label="Registration Fee"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.regFee}
                  onChange={(e) => handleChange('regFee', parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Section 5: Coach Assignment */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Coach Assignment</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Head Coach *"
                  placeholder="Enter coach name"
                  value={formData.headCoach}
                  onChange={(e) => handleChange('headCoach', e.target.value)}
                  error={errors.headCoach}
                  required
                />
                <Input
                  label="Assistant Coach (Optional)"
                  placeholder="Enter assistant coach name"
                  value={formData.assistantCoach}
                  onChange={(e) => handleChange('assistantCoach', e.target.value)}
                />
              </div>
            </div>

            {/* Section 6: Features */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Features</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Ball handling mastery"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature} variant="secondary">
                    Add
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="hover:text-orange-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 7: Status */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Status</h3>
              <Select
                label="Status *"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'Open', label: 'Open (Accepting Enrollments)' },
                  { value: 'Limited', label: 'Limited (Few Spots Left)' },
                  { value: 'Full', label: 'Full (At Capacity)' },
                  { value: 'Waitlist Soon', label: 'Waitlist Soon (Almost Full)' },
                  { value: 'Archived', label: 'Archived (Hidden from Public)' }
                ]}
                required
              />
            </div>
          </form>
        </div>

        {/* FOOTER - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" form="session-form" fullWidth>
              {isEditMode ? 'Save Changes' : 'Create Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
