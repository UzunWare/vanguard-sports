import React, { useState } from 'react';
import { User, ChevronRight, ChevronDown, ChevronUp, HeartPulse, Phone, AlertTriangle, Check, Loader, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import { formatPhone } from '../../utils/formatters';
import { isValidPhone } from '../../utils/validators';

/**
 * FamilyManagement Component
 * Manage athlete information, medical details, and emergency contacts
 */
const FamilyManagement = ({ user, onUpdate, onBack }) => {
  const [athletes, setAthletes] = useState(user.students || []);
  const [expandedAthleteId, setExpandedAthleteId] = useState(athletes[0]?.id || null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const showNotificationMessage = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle athlete card expansion
  const toggleAthlete = (athleteId) => {
    setExpandedAthleteId(expandedAthleteId === athleteId ? null : athleteId);
  };

  // Update athlete basic info
  const updateAthleteInfo = (athleteId, field, value) => {
    setAthletes(prev => prev.map(a =>
      a.id === athleteId ? { ...a, [field]: value } : a
    ));
  };

  // Update athlete medical info
  const updateMedicalInfo = (athleteId, field, value) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        return {
          ...a,
          medicalInfo: {
            ...a.medicalInfo,
            [field]: value
          }
        };
      }
      return a;
    }));
  };

  // Add emergency contact
  const addEmergencyContact = (athleteId) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        const contacts = a.emergencyContacts || [];
        return {
          ...a,
          emergencyContacts: [
            ...contacts,
            {
              id: `ec_${Date.now()}`,
              name: '',
              phone: '',
              relationship: '',
              isPrimary: contacts.length === 0
            }
          ]
        };
      }
      return a;
    }));
  };

  // Update emergency contact
  const updateEmergencyContact = (athleteId, contactId, field, value) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        return {
          ...a,
          emergencyContacts: a.emergencyContacts.map(c =>
            c.id === contactId ? { ...c, [field]: value } : c
          )
        };
      }
      return a;
    }));
  };

  // Remove emergency contact
  const removeEmergencyContact = (athleteId, contactId) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        return {
          ...a,
          emergencyContacts: a.emergencyContacts.filter(c => c.id !== contactId)
        };
      }
      return a;
    }));
  };

  // Save all changes
  const handleSaveChanges = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedUser = { ...user, students: athletes };
      onUpdate(updatedUser);
      localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
      setLoading(false);
      showNotificationMessage('Family information updated successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
            <Check className="text-green-400" size={20} /> {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Family Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage athlete information, medical details, and emergency contacts
            </p>
          </div>
        </div>

        {/* HIPAA Notice */}
        <Card className="p-4 mb-6 border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Privacy & Security Notice</p>
              <p>
                All medical and personal information is stored securely and handled in accordance with HIPAA guidelines.
                This information is only shared with authorized coaching staff for safety purposes.
              </p>
            </div>
          </div>
        </Card>

        {/* Athletes List */}
        <div className="space-y-4">
          {athletes.map((athlete) => {
            const isExpanded = expandedAthleteId === athlete.id;
            const medicalInfo = athlete.medicalInfo || {};
            const emergencyContacts = athlete.emergencyContacts || [];

            return (
              <Card key={athlete.id} className="overflow-hidden">
                {/* Athlete Header */}
                <button
                  onClick={() => toggleAthlete(athlete.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {athlete.name ? athlete.name.charAt(0) : 'A'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900">{athlete.name || 'Unnamed Athlete'}</h3>
                      <p className="text-sm text-slate-500">Jersey: {athlete.jerseySize || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={medicalInfo.allergies || medicalInfo.conditions ? 'red' : 'green'}>
                      {medicalInfo.allergies || medicalInfo.conditions ? 'Medical Info' : 'No Concerns'}
                    </Badge>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-6 space-y-6 bg-slate-50">
                    {/* Basic Information */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-orange-600" />
                        Basic Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded-lg">
                        <Input
                          label="Full Name"
                          value={athlete.name || ''}
                          onChange={(e) => updateAthleteInfo(athlete.id, 'name', e.target.value)}
                          placeholder="Athlete name"
                          required
                        />
                        <Input
                          label="Date of Birth"
                          type="date"
                          value={athlete.dob || ''}
                          onChange={(e) => updateAthleteInfo(athlete.id, 'dob', e.target.value)}
                          required
                        />
                        <Select
                          label="Gender"
                          value={athlete.gender || 'Male'}
                          onChange={(e) => updateAthleteInfo(athlete.id, 'gender', e.target.value)}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' }
                          ]}
                        />
                        <Select
                          label="Jersey Size"
                          value={athlete.jerseySize || 'YM'}
                          onChange={(e) => updateAthleteInfo(athlete.id, 'jerseySize', e.target.value)}
                          options={[
                            { value: 'YS', label: 'Youth Small' },
                            { value: 'YM', label: 'Youth Medium' },
                            { value: 'YL', label: 'Youth Large' },
                            { value: 'AS', label: 'Adult Small' },
                            { value: 'AM', label: 'Adult Medium' },
                            { value: 'AL', label: 'Adult Large' }
                          ]}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-1">
                        ⚠️ Changing session enrollment requires contacting administration
                      </p>
                    </div>

                    {/* Medical Information */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <HeartPulse size={18} className="text-red-600" />
                        Medical Information
                      </h4>
                      <div className="space-y-4 bg-white p-4 rounded-lg">
                        <Input
                          label="Allergies"
                          value={medicalInfo.allergies || ''}
                          onChange={(e) => updateMedicalInfo(athlete.id, 'allergies', e.target.value)}
                          placeholder="e.g., Peanuts, Bee stings (leave blank if none)"
                        />
                        <Input
                          label="Medical Conditions"
                          value={medicalInfo.conditions || ''}
                          onChange={(e) => updateMedicalInfo(athlete.id, 'conditions', e.target.value)}
                          placeholder="e.g., Asthma, Diabetes (leave blank if none)"
                        />
                        <Input
                          label="Medications"
                          value={medicalInfo.medications || ''}
                          onChange={(e) => updateMedicalInfo(athlete.id, 'medications', e.target.value)}
                          placeholder="e.g., Inhaler, EpiPen (leave blank if none)"
                        />
                        <Textarea
                          label="Additional Medical Notes"
                          value={medicalInfo.notes || ''}
                          onChange={(e) => updateMedicalInfo(athlete.id, 'notes', e.target.value)}
                          placeholder="Any other important medical information coaches should know..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <Phone size={18} className="text-blue-600" />
                          Emergency Contacts
                        </h4>
                        <Button
                          variant="outline"
                          onClick={() => addEmergencyContact(athlete.id)}
                          className="text-sm h-9 px-4"
                        >
                          <Plus size={16} /> Add Contact
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {emergencyContacts.length === 0 ? (
                          <div className="bg-white p-6 rounded-lg text-center text-slate-400">
                            <Phone size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No emergency contacts added yet</p>
                            <Button
                              variant="outline"
                              onClick={() => addEmergencyContact(athlete.id)}
                              className="mt-3"
                            >
                              Add First Contact
                            </Button>
                          </div>
                        ) : (
                          emergencyContacts.map((contact, index) => (
                            <div key={contact.id} className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <Badge color={contact.isPrimary ? 'green' : 'gray'}>
                                  {contact.isPrimary ? 'Primary' : 'Secondary'} Contact {index + 1}
                                </Badge>
                                {emergencyContacts.length > 1 && (
                                  <button
                                    onClick={() => removeEmergencyContact(athlete.id, contact.id)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-3 gap-4">
                                <Input
                                  label="Name"
                                  value={contact.name}
                                  onChange={(e) => updateEmergencyContact(athlete.id, contact.id, 'name', e.target.value)}
                                  placeholder="Contact name"
                                  required
                                />
                                <Input
                                  label="Phone"
                                  value={contact.phone}
                                  onChange={(e) => updateEmergencyContact(athlete.id, contact.id, 'phone', formatPhone(e.target.value))}
                                  placeholder="(555) 123-4567"
                                  maxLength={14}
                                  required
                                />
                                <Input
                                  label="Relationship"
                                  value={contact.relationship}
                                  onChange={(e) => updateEmergencyContact(athlete.id, contact.id, 'relationship', e.target.value)}
                                  placeholder="e.g., Parent, Guardian"
                                  required
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <Button onClick={handleSaveChanges} disabled={loading} fullWidth>
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Saving Changes...
              </>
            ) : (
              <>
                <Check size={18} />
                Save All Changes
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-32">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FamilyManagement;
