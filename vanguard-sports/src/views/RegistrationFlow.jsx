import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, User, Info, AlertTriangle, ChevronUp, Lock, CreditCard, Loader, Check, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import apiClient from '../services/api';

/**
 * RegistrationFlow Component
 * Multi-step enrollment form for new athletes
 * Steps: 1) Athlete Info, 2) Parent Info, 3) Waiver, 4) Payment, 5) Receipt
 *
 * @param {object} props
 * @param {function} props.setView - Function to change the current view
 * @param {function} props.loginUser - Function to log in the user after registration
 * @param {array} props.sessions - Available training sessions
 * @param {function} props.showNotification - Function to display notifications
 */
const RegistrationFlow = ({ setView, loginUser, sessions, showNotification }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    athletes: [{ name: '', dob: '', jerseySize: 'M', gender: 'Male', selectedSessionId: '' }],
    parentName: '', email: '', phone: '', waiverAgreed: false, waiverSignature: '',
    cardNumber: '', expiry: '', cvc: ''
  });

  const [expandedAthleteIndex, setExpandedAthleteIndex] = useState(0);
  const scrollRef = useRef(null);

  // Validation state
  const [errors, setErrors] = useState({
    parentName: '', email: '', phone: '', waiverSignature: '',
    cardNumber: '', expiry: '', cvc: ''
  });
  const [touched, setTouched] = useState({
    parentName: false, email: false, phone: false, waiverSignature: false,
    cardNumber: false, expiry: false, cvc: false
  });
  const [athleteErrors, setAthleteErrors] = useState({});

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  // Pricing Logic
  const REGISTRATION_FEE = 30;
  const monthlySubtotal = formData.athletes.reduce((sum, athlete) => {
    const session = sessions.find(s => s.id === athlete.selectedSessionId);
    return sum + (session ? session.price : 0);
  }, 0);
  const discount = formData.athletes.length > 1 ? monthlySubtotal * 0.10 : 0;
  const monthlyTotal = monthlySubtotal - discount;
  const regFees = formData.athletes.length * REGISTRATION_FEE;
  const totalDue = monthlyTotal + regFees;

  const getEligibleSessions = (dob, gender) => {
    if (!dob) return [];
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return sessions.filter(s => s.gender === gender && age >= s.minAge && age <= s.maxAge);
  };

  const updateAthlete = (idx, field, val) => {
    const updated = [...formData.athletes];
    updated[idx][field] = val;
    if (field === 'dob' || field === 'gender') updated[idx].selectedSessionId = '';
    setFormData({...formData, athletes: updated});
  };

  const addNewSibling = () => {
     setFormData({
        ...formData,
        athletes: [...formData.athletes, { name: '', dob: '', jerseySize: 'M', gender: 'Male', selectedSessionId: '' }]
     });
     setExpandedAthleteIndex(formData.athletes.length);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const formatCard = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) parts.push(v.substring(i, i + 4));
    return parts.length > 1 ? parts.join(' ') : value;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isSignatureValid = () => formData.waiverSignature.toLowerCase() === formData.parentName.toLowerCase();

  // Validation functions
  const validateAthleteName = (name) => {
    if (!name.trim()) return 'Athlete name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateDOB = (dob) => {
    if (!dob) return 'Date of birth is required';
    const birthDate = new Date(dob);
    const today = new Date();
    if (birthDate > today) return 'Date of birth cannot be in the future';
    return '';
  };

  const validateParentName = (name) => {
    if (!name.trim()) return 'Parent name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (phone.length < 14) return 'Please enter a complete phone number';
    return '';
  };

  const validateCardNumber = (card) => {
    const cleanCard = card.replace(/\s/g, '');
    if (!cleanCard) return 'Card number is required';
    if (cleanCard.length < 16) return 'Card number must be 16 digits';
    return '';
  };

  const validateExpiry = (expiry) => {
    if (!expiry) return 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Format must be MM/YY';
    const [month] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return 'Invalid month';
    return '';
  };

  const validateCVC = (cvc) => {
    if (!cvc) return 'CVC is required';
    if (cvc.length < 3) return 'CVC must be 3 digits';
    return '';
  };

  // Field change handlers with validation
  const handleParentNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, parentName: value });
    if (touched.parentName) {
      setErrors(prev => ({ ...prev, parentName: validateParentName(value) }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = formatPhone(e.target.value);
    setFormData({ ...formData, phone: value });
    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    }
  };

  const handleCardNumberChange = (e) => {
    const value = formatCard(e.target.value);
    setFormData({ ...formData, cardNumber: value });
    if (touched.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: validateCardNumber(value) }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiry: value });
    if (touched.expiry) {
      setErrors(prev => ({ ...prev, expiry: validateExpiry(value) }));
    }
  };

  const handleCVCChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, cvc: value });
    if (touched.cvc) {
      setErrors(prev => ({ ...prev, cvc: validateCVC(value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'parentName') {
      setErrors(prev => ({ ...prev, parentName: validateParentName(formData.parentName) }));
    } else if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(formData.email) }));
    } else if (field === 'phone') {
      setErrors(prev => ({ ...prev, phone: validatePhone(formData.phone) }));
    } else if (field === 'cardNumber') {
      setErrors(prev => ({ ...prev, cardNumber: validateCardNumber(formData.cardNumber) }));
    } else if (field === 'expiry') {
      setErrors(prev => ({ ...prev, expiry: validateExpiry(formData.expiry) }));
    } else if (field === 'cvc') {
      setErrors(prev => ({ ...prev, cvc: validateCVC(formData.cvc) }));
    }
  };

  const handleAthleteNameChange = (idx, value) => {
    updateAthlete(idx, 'name', value);
    if (athleteErrors[`${idx}-name`] !== undefined) {
      setAthleteErrors(prev => ({ ...prev, [`${idx}-name`]: validateAthleteName(value) }));
    }
  };

  const handleAthleteDOBChange = (idx, value) => {
    updateAthlete(idx, 'dob', value);
    if (athleteErrors[`${idx}-dob`] !== undefined) {
      setAthleteErrors(prev => ({ ...prev, [`${idx}-dob`]: validateDOB(value) }));
    }
  };

  const handleAthleteBlur = (idx, field) => {
    if (field === 'name') {
      setAthleteErrors(prev => ({ ...prev, [`${idx}-name`]: validateAthleteName(formData.athletes[idx].name) }));
    } else if (field === 'dob') {
      setAthleteErrors(prev => ({ ...prev, [`${idx}-dob`]: validateDOB(formData.athletes[idx].dob) }));
    }
  };

  const handleRegister = async () => {
    // PREVENT DUPLICATE SUBMISSIONS
    if (isProcessing) {
      return;
    }

    // Validate payment fields before submitting
    setTouched({
      ...touched,
      cardNumber: true,
      expiry: true,
      cvc: true
    });

    const cardError = validateCardNumber(formData.cardNumber);
    const expiryError = validateExpiry(formData.expiry);
    const cvcError = validateCVC(formData.cvc);

    setErrors(prev => ({
      ...prev,
      cardNumber: cardError,
      expiry: expiryError,
      cvc: cvcError
    }));

    if (cardError || expiryError || cvcError) {
      return;
    }

    setIsProcessing(true);
    try {
      // Parse parent name into first and last
      const nameParts = formData.parentName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Format athlete data for API
      const athletesData = formData.athletes.map(athlete => {
        const nameParts = athlete.name.trim().split(' ');
        return {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || nameParts[0],
          dateOfBirth: athlete.dob,
          gender: athlete.gender,
          jerseySize: athlete.jerseySize,
          sessionId: athlete.selectedSessionId,
        };
      });

      // Call public enrollment endpoint
      const response = await apiClient.post('/public/enroll', {
        parentInfo: {
          email: formData.email,
          firstName: firstName,
          lastName: lastName,
          phone: formData.phone,
        },
        athletes: athletesData,
        paymentInfo: {
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          cvc: formData.cvc,
        },
      }, { skipAuth: true });

      // Show success notification
      if (response.isNewAccount) {
        showNotification('Enrollment successful! Check your email for login credentials.');
      } else {
        showNotification('Enrollment successful! Added to your existing account.');
      }

      // Move to receipt screen
      setStep(5);
    } catch (error) {
      console.error('Enrollment error:', error);
      showNotification(error.message || 'Enrollment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Step 5: Receipt View ---
  if (step === 5) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 animate-fade-in">
        <Card className="max-w-xl w-full p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Confirmed!</h2>
           <p className="text-slate-500 mb-8">Welcome to the Vanguard family. A confirmation email has been sent to <strong>{formData.email}</strong>.</p>

           <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                 <span className="text-slate-500">Amount Paid</span>
                 <span className="text-xl font-bold text-slate-900">${totalDue.toFixed(2)}</span>
              </div>
              <div className="space-y-3">
                 {formData.athletes.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                       <User size={16} className="text-orange-500"/>
                       <span className="font-semibold text-slate-700">{a.name}</span>
                       <span className="text-slate-400">—</span>
                       <span className="text-slate-600">{sessions.find(s=>s.id===a.selectedSessionId)?.level}</span>
                    </div>
                 ))}
              </div>
           </div>

           <Button
             className="w-full"
             onClick={() => {
                const programNames = formData.athletes.map(a => {
                   const s = sessions.find(sess => sess.id === a.selectedSessionId);
                   return s ? `${s.sport} ${s.level}` : 'Program';
                }).join(', ');

                loginUser({
                  name: formData.parentName, email: formData.email, role: 'parent',
                  students: formData.athletes.map(a => ({...a, id: Math.random().toString(36)})),
                  subscription: { program: programNames, status: 'Active', nextPayment: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(), amount: monthlyTotal.toFixed(2) }
                });
             }}
           >
             Go to Dashboard
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 animate-fade-in" ref={scrollRef}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
             <button onClick={() => setView('home')} className="text-slate-500 font-bold hover:text-orange-600 flex items-center gap-1 text-sm">
                <ArrowRight size={16} className="rotate-180"/> Back
             </button>
             <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {step} of 4</div>
          </div>

          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 transition-all duration-500 ease-out" style={{width: `${step * 25}%`}}></div>
          </div>

          <Card className="p-8 min-h-[400px]">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Athlete Registration</h2>
                <p className="text-slate-500 mb-8 text-sm">Enter athlete details to view eligible programs.</p>

                {formData.athletes.map((athlete, idx) => {
                  const eligibleOptions = getEligibleSessions(athlete.dob, athlete.gender);
                  const isExpanded = expandedAthleteIndex === idx;
                  const selectedSessionName = sessions.find(s => s.id === athlete.selectedSessionId)?.level;

                  return (
                    <div key={idx} className={`bg-white rounded-xl border-2 transition-all mb-4 ${isExpanded ? 'border-orange-500 shadow-md p-6' : 'border-slate-200 p-4 hover:border-orange-300'}`}>
                      <div className="flex justify-between items-center" onClick={() => !isExpanded && setExpandedAthleteIndex(idx)}>
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isExpanded ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {idx + 1}
                           </div>
                           <div>
                              <h3 className={`font-bold ${isExpanded ? 'text-lg text-slate-900' : 'text-slate-600'}`}>
                                 {athlete.name || `Athlete ${idx + 1}`}
                              </h3>
                              {!isExpanded && selectedSessionName && (
                                 <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    <CheckCircle size={10}/> Enrolled in {selectedSessionName}
                                 </span>
                              )}
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {isExpanded ? (
                              <>
                                 {idx > 0 && <button onClick={() => {
                                    const updated = formData.athletes.filter((_, i) => i !== idx);
                                    setFormData({...formData, athletes: updated});
                                    setExpandedAthleteIndex(Math.max(0, idx - 1));
                                 }} className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded transition-colors mr-2">REMOVE</button>}
                                 <ChevronUp className="text-slate-400"/>
                              </>
                           ) : (
                              <button onClick={() => setExpandedAthleteIndex(idx)} className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                 Edit
                              </button>
                           )}
                        </div>
                      </div>

                      {isExpanded && (
                         <div className="mt-6 border-t border-slate-100 pt-6 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-5 mb-6">
                              <Input
                                label="Full Name"
                                value={athlete.name}
                                onChange={e => handleAthleteNameChange(idx, e.target.value)}
                                onBlur={() => handleAthleteBlur(idx, 'name')}
                                placeholder="e.g. Jordan Smith"
                                error={athleteErrors[`${idx}-name`] || ''}
                              />
                              <Input
                                label="Date of Birth"
                                type="date"
                                value={athlete.dob}
                                onChange={e => handleAthleteDOBChange(idx, e.target.value)}
                                onBlur={() => handleAthleteBlur(idx, 'dob')}
                                error={athleteErrors[`${idx}-dob`] || ''}
                              />
                              <Select label="Gender" value={athlete.gender} options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'}]} onChange={e => updateAthlete(idx, 'gender', e.target.value)} />
                              <Select label="Jersey Size" value={athlete.jerseySize} options={['XS','S','M','L','XL'].map(s => ({label: s, value: s}))} onChange={e => updateAthlete(idx, 'jerseySize', e.target.value)} />
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                               <label className="block text-sm font-bold text-slate-700 mb-3">Select Eligible Program:</label>
                               {!athlete.dob ? (
                                  <div className="text-sm text-slate-400 italic flex items-center gap-2"><Info size={16}/> Please enter Date of Birth to see available classes.</div>
                               ) : eligibleOptions.length > 0 ? (
                                  <div className="space-y-3">
                                     {eligibleOptions.map(option => (
                                        <label key={option.id} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${athlete.selectedSessionId === option.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                           <input type="radio" name={`session-${idx}`} className="mt-1 mr-3 w-4 h-4 accent-green-600" checked={athlete.selectedSessionId === option.id} onChange={() => updateAthlete(idx, 'selectedSessionId', option.id)}/>
                                           <div className="flex-1">
                                              <div className="flex justify-between items-start"><span className="font-bold text-slate-900">{option.sport} - {option.level}</span><span className="text-sm font-bold text-green-700">${option.price}/mo</span></div>
                                              <div className="text-xs text-slate-500 mt-1">{option.grades} • {option.time} • {option.location}</div>
                                           </div>
                                        </label>
                                     ))}
                                  </div>
                               ) : (
                                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2"><AlertTriangle size={16}/> No programs found for this age/gender combination.</div>
                               )}
                            </div>
                         </div>
                      )}
                    </div>
                  );
                })}
                <Button variant="outline" onClick={addNewSibling} className="w-full mb-8 border-dashed border-2 py-4">+ Register Another Sibling</Button>
                <div className="flex justify-end pt-4 border-t border-slate-100"><Button onClick={() => setStep(2)} disabled={!formData.athletes.every(a => a.name && a.dob && a.selectedSessionId)}>Next: Parent Info</Button></div>
              </div>
            )}

            {step === 2 && (
               <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Parent Info</h2>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
                     <div className="flex items-start gap-3">
                        <Info className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                           <h3 className="font-bold text-green-900 text-sm mb-1">Account Auto-Creation</h3>
                           <p className="text-green-800 text-sm">
                              We'll automatically create a parent dashboard account for you using this email.
                              Check your inbox after enrollment for login credentials.
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <Input
                       label="Parent Full Name"
                       value={formData.parentName}
                       onChange={handleParentNameChange}
                       onBlur={() => handleBlur('parentName')}
                       placeholder="Full legal name"
                       error={touched.parentName ? errors.parentName : ''}
                     />
                     <Input
                       label="Email Address"
                       type="email"
                       value={formData.email}
                       onChange={handleEmailChange}
                       onBlur={() => handleBlur('email')}
                       placeholder="email@example.com"
                       error={touched.email ? errors.email : ''}
                     />
                     <Input
                       label="Phone Number"
                       type="tel"
                       value={formData.phone}
                       onChange={handlePhoneChange}
                       onBlur={() => handleBlur('phone')}
                       placeholder="(555) 123-4567"
                       maxLength={14}
                       error={touched.phone ? errors.phone : ''}
                     />
                  </div>
                  <div className="flex justify-between mt-8">
                     <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                     <Button onClick={() => setStep(3)} disabled={!formData.email || !isValidEmail(formData.email) || !formData.parentName || formData.phone.length < 14}>Next Step</Button>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Waiver</h2>
                  <div className="h-64 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 mb-6">
                     <p className="mb-4 font-bold">VANGUARD SPORTS ACADEMY LIABILITY RELEASE</p>
                     <p className="mb-2">1. I hereby release Vanguard Sports Academy from any liability regarding injuries sustained during training.</p>
                     <p className="mb-2">2. I understand that sports involve inherent risks.</p>
                     <p className="mb-2"><strong>REFUND POLICY:</strong> Registration fees are non-refundable. Cancellations require 3-day written notice.</p>
                  </div>
                  <div className="space-y-6">
                     <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-all ${!formData.waiverAgreed ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-white'}`}>
                        <input type="checkbox" className="mt-1 w-5 h-5 accent-orange-600" checked={formData.waiverAgreed} onChange={e => setFormData({...formData, waiverAgreed: e.target.checked})}/>
                        <div className="flex-1">
                           <span className="text-sm font-semibold text-slate-700">I have read and agree to the waiver and refund policy.</span>
                           {!formData.waiverAgreed && <span className="block text-xs text-orange-700 font-bold mt-1">Required to proceed</span>}
                        </div>
                     </label>
                     <div>
                        <Input
                           label="Digital Signature"
                           placeholder="Type your full name"
                           value={formData.waiverSignature}
                           onChange={e => setFormData({...formData, waiverSignature: e.target.value})}
                           error={formData.waiverSignature && !isSignatureValid() ? 'Signature mismatch' : null}
                        />
                        <div className="flex justify-between items-center mt-1 px-1">
                           <span className="text-xs text-slate-500">
                              Please type: <strong className="text-slate-800">{formData.parentName}</strong>
                           </span>
                           {formData.waiverSignature && (
                              isSignatureValid()
                                ? <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={12}/> Matches</span>
                                : <span className="text-xs text-red-500 font-bold flex items-center gap-1"><X size={12}/> Must match exactly</span>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-between mt-8">
                     <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                     <Button onClick={() => setStep(4)} disabled={!formData.waiverAgreed || !isSignatureValid()}>Next Step</Button>
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment</h2>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                     <div className="flex items-center gap-3 mb-4">
                        <Lock className="text-green-600" size={20} />
                        <span className="font-bold text-slate-700">Secure Credit Card Payment</span>
                     </div>
                     <div className="space-y-4">
                        <Input
                           label="Card Number"
                           placeholder="0000 0000 0000 0000"
                           value={formData.cardNumber}
                           onChange={handleCardNumberChange}
                           onBlur={() => handleBlur('cardNumber')}
                           maxLength={19}
                           icon={CreditCard}
                           error={touched.cardNumber ? errors.cardNumber : ''}
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <Input
                             label="Expiry"
                             placeholder="MM/YY"
                             value={formData.expiry}
                             onChange={handleExpiryChange}
                             onBlur={() => handleBlur('expiry')}
                             maxLength={5}
                             error={touched.expiry ? errors.expiry : ''}
                           />
                           <Input
                             label="CVC"
                             placeholder="123"
                             value={formData.cvc}
                             onChange={handleCVCChange}
                             onBlur={() => handleBlur('cvc')}
                             maxLength={3}
                             error={touched.cvc ? errors.cvc : ''}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-between mt-8">
                     <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                     <Button onClick={handleRegister} disabled={isProcessing || formData.cardNumber.length < 19} className="min-w-[200px]">
                        {isProcessing ? <><Loader className="animate-spin" size={20}/> Processing...</> : `Pay $${totalDue.toFixed(2)}`}
                     </Button>
                  </div>
               </div>
            )}
          </Card>
        </div>

        {/* Right Column: Order Summary Sticky */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
             <Card className="p-6 bg-slate-900 text-white border-slate-800">
                <h3 className="font-bold text-lg mb-4 border-b border-slate-700 pb-4 flex justify-between items-center">
                   Order Summary <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">Monthly</span>
                </h3>
                <div className="space-y-4 text-sm mb-6">
                   {formData.athletes.map((a, i) => {
                      const session = sessions.find(s => s.id === a.selectedSessionId);
                      return (
                         <div key={i} className="flex justify-between items-start pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                            <div className="flex flex-col">
                               <span className="font-bold text-white">{a.name || `Athlete ${i+1}`}</span>
                               <span className="text-xs text-slate-400">{session ? session.level : 'Selection Pending'}</span>
                            </div>
                            <span className="font-mono">{session ? `$${session.price}` : '$0.00'}</span>
                         </div>
                      );
                   })}

                   <div className="pt-4 border-t border-slate-700 space-y-2">
                      <div className="flex justify-between text-slate-400">
                         <span>Subtotal</span>
                         <span>${monthlySubtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                         <div className="flex justify-between text-green-400">
                            <span>Sibling Discount (10%)</span>
                            <span>-${discount.toFixed(2)}</span>
                         </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                         <span>One-time Registration Fees</span>
                         <span>${regFees.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
                <div className="border-t border-slate-700 pt-4 flex justify-between items-end">
                   <div>
                      <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Total Due Today</span>
                      <span className="text-3xl font-bold text-orange-500">${totalDue.toFixed(2)}</span>
                   </div>
                </div>
                <div className="mt-6 text-xs text-center text-slate-500 bg-slate-800/50 p-3 rounded border border-slate-800">
                   Your card will be billed <strong>${monthlyTotal.toFixed(2)}</strong> monthly thereafter.
                </div>
             </Card>

             {step === 1 && (
               <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 shadow-sm">
                  <strong>How it works:</strong> Enter your child's birthdate and gender above. We will automatically list the exact classes they qualify for based on age.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;
