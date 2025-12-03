import React, { useState, useEffect, useRef } from 'react';
// SAFEST POSSIBLE IMPORTS - Strict subset of universally available icons
import {
  MapPin, Calendar, CreditCard, User, Check, X, ChevronRight,
  Menu, Mail, Clock, Users, Info, ArrowRight, LogOut,
  Loader, Star, ChevronDown, ChevronUp, Lock, CheckCircle, Award,
  AlertTriangle, Zap, FileText, HeartPulse, Trophy, RefreshCw
} from 'lucide-react';

// API Services
import authService from './services/authService';
import sessionService from './services/sessionService';
import athleteService from './services/athleteService';
import enrollmentService from './services/enrollmentService';
import evaluationService from './services/evaluationService';

// NEW PARENT VIEWS
import { ParentDashboard as EnhancedParentDashboard, AccountSettings, FamilyManagement, BillingPortal } from './views/parent';

// NEW COACH TABS
import { AthletesTab, EvaluationsTab } from './views/coach/tabs';

// ADMIN DASHBOARD
import { AdminDashboard } from './views/admin';

// --- DATA CONSTANTS ---

const PRACTICE_PLANS = {
  'Basketball': [
    { time: '10 min', activity: 'Dynamic Warm-up', notes: 'Focus on high knees and lunges' },
    { time: '15 min', activity: 'Ball Handling', notes: '2-ball dribbling drills' },
    { time: '20 min', activity: 'Shooting Form', notes: 'Beeft method, close range' },
    { time: '15 min', activity: 'Defense Footwork', notes: 'Lane slides and close-outs' },
    { time: '15 min', activity: 'Scrimmage', notes: '3v3 half court' }
  ],
  'Volleyball': [
    { time: '10 min', activity: 'Warm-up & Stretching', notes: 'Shoulder mobility focus' },
    { time: '15 min', activity: 'Passing Lines', notes: 'Platform discipline' },
    { time: '20 min', activity: 'Serving Drills', notes: 'Target zones 1 and 5' },
    { time: '15 min', activity: 'Setting Basics', notes: 'Hand positioning' },
    { time: '15 min', activity: 'King/Queen of Court', notes: 'Competitive play' }
  ]
};

const SKILL_CRITERIA = {
  'Basketball': ['Shooting', 'Dribbling', 'Defense', 'Passing', 'IQ'],
  'Volleyball': ['Serving', 'Passing', 'Setting', 'Spiking', 'Court Sense']
};

const SESSIONS_DATA = [
  { 
    id: 'bb-jr', sport: 'Basketball', level: 'Junior Boys', grades: 'Grades 4-6', gender: 'Male',
    minAge: 9, maxAge: 12, date: 'Every Saturday', time: '4:15 PM - 5:15 PM', duration: '60 min',
    location: 'Vanguard Main Gym', registeredCount: 12, capacity: 20, status: 'Open',
    price: 90, regFee: 30,
    headCoach: 'Ugur Yildiz',
    description: 'Fundamental training: ball-handling, shooting form, footwork, and game IQ.',
    features: ['Ball handling mastery', 'Shooting mechanics', 'Defensive footwork', '3v3 Concepts']
  },
  { 
    id: 'bb-sr', sport: 'Basketball', level: 'Senior Boys', grades: 'Grades 7-12', gender: 'Male',
    minAge: 12, maxAge: 18, date: 'Every Saturday', time: '5:15 PM - 6:30 PM', duration: '75 min',
    location: 'Vanguard Main Gym', registeredCount: 18, capacity: 20, status: 'Limited',
    price: 90, regFee: 30,
    headCoach: 'Ugur Yildiz',
    description: 'Elite training: competitive play, complex strategy, conditioning, and leadership.',
    features: ['Advanced scoring moves', 'Defensive schemes', 'Conditioning', 'College prep']
  },
  { 
    id: 'vb-jr', sport: 'Volleyball', level: 'Junior Girls', grades: 'Grades 3-6', gender: 'Female',
    minAge: 8, maxAge: 12, date: 'Every Saturday', time: '10:30 AM - 11:30 AM', duration: '60 min',
    location: 'Court B', registeredCount: 8, capacity: 20, status: 'Open',
    price: 90, regFee: 30,
    headCoach: 'Tuba Yildiz',
    assistantCoach: 'Neda Oguz',
    description: 'Introductory training: serving, passing, rotation, and team communication.',
    features: ['Overhand serving', 'Passing platform', 'Court positions', 'Game rules']
  },
  { 
    id: 'vb-sr', sport: 'Volleyball', level: 'Senior Girls', grades: 'Grades 7-12', gender: 'Female',
    minAge: 12, maxAge: 18, date: 'Every Saturday', time: '9:15 AM - 10:30 AM', duration: '75 min',
    location: 'Court B', registeredCount: 19, capacity: 20, status: 'Waitlist Soon',
    price: 90, regFee: 30,
    headCoach: 'Tuba Yildiz',
    assistantCoach: 'Neda Oguz',
    description: 'High-performance training: advanced serving, spiking, blocking, and systems.',
    features: ['Jump serving', 'Offensive systems', 'Blocking timing', 'Tournament play']
  }
];

const INITIAL_ROSTERS = {
  'bb-jr': [
    { id: 's1', name: 'Jordan Smith', age: 11, jersey: 'YM', parent: 'Sarah Smith', phone: '(210) 555-0101', medical: 'Asthma (Inhaler)', attendance: 'present', ratings: { Shooting: 4, Dribbling: 3 } },
    { id: 's2', name: 'Caleb Johnson', age: 10, jersey: 'YL', parent: 'Mike Johnson', phone: '(210) 555-0102', medical: 'None', attendance: 'absent', ratings: {} },
  ],
  'bb-sr': [
    { id: 's5', name: 'Ethan Wilson', age: 14, jersey: 'AM', parent: 'David Wilson', phone: '(210) 555-0105', medical: 'None', attendance: 'present', ratings: {} },
  ],
  'vb-jr': [
    { id: 's3', name: 'Mia Davis', age: 11, jersey: 'YM', parent: 'Jessica Davis', phone: '(210) 555-0103', medical: 'None', attendance: 'present', ratings: {} },
  ],
  'vb-sr': [
    { id: 's9', name: 'Sophia Chen', age: 16, jersey: 'AS', parent: 'Li Chen', phone: '(210) 555-0199', medical: 'None', attendance: 'present', ratings: { Serving: 5, Passing: 4 } },
  ]
};

const COACHES = [
  { 
    name: 'Ugur Yildiz', 
    role: 'Head Basketball Coach', 
    exp: '25 Years Involved', 
    img: 'https://images.unsplash.com/photo-1574607383476-f517b260d35b?auto=format&fit=crop&q=80',
    highlights: [
      '12 years coaching at professional level',
      '7 years professional playing experience',
      'College Division I National Champion (1st)',
      '3-time State High School Champion',
      'Expertise in professional conditioning'
    ]
  },
  { 
    name: 'Tuba Yildiz', 
    role: 'Head Volleyball Coach', 
    exp: '12 Years Exp.', 
    img: 'https://images.unsplash.com/photo-1615119069519-7e44a7f5370d?auto=format&fit=crop&q=80',
    highlights: [
      '8 years as a professional player',
      '6 years coaching at professional level',
      'U18 National Champion',
      'Expertise in reformer pilates & fitness',
      'Multiple Beach Volleyball Semi-Finals'
    ]
  },
  { 
    name: 'Neda Oguz', 
    role: 'Volleyball Assistant Coach', 
    exp: '4 Years Comp.', 
    img: 'https://images.unsplash.com/photo-1628891467478-43d96924401c?auto=format&fit=crop&q=80',
    highlights: [
      '4 years competitive experience',
      'Multiple playoff tournament appearances',
      'Expertise in player development',
      'Focus on team strategy & growth'
    ]
  },
];

// --- UTILITY COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, fullWidth = false }) => {
  const base = "px-6 py-3 rounded-lg font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-700",
    outline: "bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50",
    ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };
  return (
    <button 
      type={type} onClick={onClick} disabled={disabled} 
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className} ${!noPadding ? '' : ''}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "orange", className="" }) => {
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

const Input = ({ label, type = "text", value, onChange, onBlur, placeholder, required = false, className = "", icon: Icon, maxLength, error }) => (
  <div className={`mb-4 ${className}`}>
    <div className="flex justify-between items-baseline">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      {error && (
        <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
          <Info size={10} /> {error}
        </span>
      )}
    </div>
    <div className="relative">
      {Icon && <Icon className={`absolute left-3 top-3 transition-colors ${error ? 'text-red-400' : 'text-slate-400'}`} size={18} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-slate-50 border rounded-lg p-2.5 ${Icon ? 'pl-10' : ''}
          outline-none transition-all placeholder:text-slate-400 focus:placeholder:text-transparent
          ${error
            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50'
            : 'border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
          }`}
      />
    </div>
  </div>
);

const Select = ({ label, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
      {label} {required && <span className="text-orange-600">*</span>}
    </label>
    <div className="relative">
      <select 
        value={value} onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

// --- MODALS ---

const PaymentModal = ({ onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ card: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({ card: '', expiry: '', cvc: '' });
  const [touched, setTouched] = useState({ card: false, expiry: false, cvc: false });

  const formatCard = (v) => v.replace(/\s+/g, '').replace(/[^0-9]/gi, '').replace(/(.{4})/g, '$1 ').trim();

  const validateCard = (card) => {
    const cleanCard = card.replace(/\s/g, '');
    if (!cleanCard) return 'Card number is required';
    if (cleanCard.length < 16) return 'Card number must be 16 digits';
    return '';
  };

  const validateExpiry = (expiry) => {
    if (!expiry) return 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Format must be MM/YY';
    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return 'Invalid month';
    return '';
  };

  const validateCVC = (cvc) => {
    if (!cvc) return 'CVC is required';
    if (cvc.length < 3) return 'CVC must be 3 digits';
    return '';
  };

  const handleCardChange = (e) => {
    const value = formatCard(e.target.value);
    setFormData({ ...formData, card: value });
    if (touched.card) {
      setErrors(prev => ({ ...prev, card: validateCard(value) }));
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
    if (field === 'card') {
      setErrors(prev => ({ ...prev, card: validateCard(formData.card) }));
    } else if (field === 'expiry') {
      setErrors(prev => ({ ...prev, expiry: validateExpiry(formData.expiry) }));
    } else if (field === 'cvc') {
      setErrors(prev => ({ ...prev, cvc: validateCVC(formData.cvc) }));
    }
  };

  const handleSave = () => {
    // Mark all fields as touched
    setTouched({ card: true, expiry: true, cvc: true });

    // Validate all fields
    const cardError = validateCard(formData.card);
    const expiryError = validateExpiry(formData.expiry);
    const cvcError = validateCVC(formData.cvc);

    setErrors({ card: cardError, expiry: expiryError, cvc: cvcError });

    // If there are errors, don't submit
    if (cardError || expiryError || cvcError) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onUpdate();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-orange-500"/> Update Payment
        </h2>
        <div className="space-y-4">
          <Input
            label="New Card Number"
            placeholder="0000 0000 0000 0000"
            value={formData.card}
            onChange={handleCardChange}
            onBlur={() => handleBlur('card')}
            maxLength={19}
            icon={Lock}
            error={touched.card ? errors.card : ''}
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
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader className="animate-spin" size={18}/> : 'Save New Card'}
          </Button>
        </div>
      </div>
    </div>
  );
};

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

// --- COACH DASHBOARD ---

const CoachDashboard = ({ user, logoutUser, sessions, rosters, setRosters }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, schedule, athletes
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showAssessment, setShowAssessment] = useState(null); // student ID or null
  const [notes, setNotes] = useState({});
  
  useEffect(() => {
     if (!selectedSessionId) {
        const first = sessions.find(s => s.sport === user.sport);
        if (first) setSelectedSessionId(first.id);
     }
  }, [sessions, user.sport]);

  const activeSession = sessions.find(s => s.id === selectedSessionId);
  const mySessions = sessions.filter(s => s.sport === user.sport);
  const totalStudents = mySessions.reduce((acc, s) => acc + (rosters[s.id]?.length || 0), 0);

  const handleSaveAssessment = (sid, newRatings) => {
     setRosters(prev => ({
        ...prev,
        [selectedSessionId]: prev[selectedSessionId].map(s => 
           s.id === sid ? {...s, ratings: newRatings} : s
        )
     }));
     setShowAssessment(null);
  };

  const toggleAtt = (sid) => {
    setRosters(prev => ({
       ...prev,
       [selectedSessionId]: prev[selectedSessionId].map(s => s.id === sid ? {...s, attendance: s.attendance === 'present' ? 'absent' : 'present'} : s)
    }));
  };

  // --- Sub-Views ---

  const OverviewTab = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-white/20 rounded-lg"><Users size={24}/></div>
                 <span className="text-orange-100 text-xs font-bold uppercase tracking-wider">Total Athletes</span>
              </div>
              <div className="text-4xl font-bold mb-1">{totalStudents}</div>
              <div className="text-orange-100 text-sm">Across {mySessions.length} active sessions</div>
           </Card>
           <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar size={24}/></div>
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Next Session</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">{activeSession?.level || 'No Session'}</div>
              <div className="text-slate-500 text-sm">{activeSession?.time} • {activeSession?.location}</div>
           </Card>
           <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-green-50 rounded-lg text-green-600"><Zap size={24}/></div>
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Attendance</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">94%</div>
              <div className="text-green-600 text-sm font-medium">↑ 2% from last month</div>
           </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Info size={18} className="text-orange-500"/> Action Required
              </h3>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="font-medium text-red-900">3 Evaluations Pending</span>
                    <button onClick={() => setActiveTab('schedule')} className="ml-auto text-xs font-bold text-red-600 hover:underline">View</button>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-orange-900">Confirm Saturday's Roster</span>
                    <button className="ml-auto text-xs font-bold text-orange-600 hover:underline">Check</button>
                 </div>
              </div>
           </Card>
           <Card className="p-6 bg-slate-900 text-white border-none relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2">Coach's Tip</h3>
                 <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    "Focus on defensive footwork this week. The U14 group needs work on transition defense."
                 </p>
                 <div className="flex gap-2">
                    <Badge color="gray" className="bg-white/10 text-white border-white/20">Defense</Badge>
                    <Badge color="gray" className="bg-white/10 text-white border-white/20">U14</Badge>
                 </div>
              </div>
              <Zap className="absolute -bottom-4 -right-4 text-white/5" size={120} />
           </Card>
        </div>
     </div>
  );

  const ScheduleTab = () => (
     <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">
        {/* Session Selector */}
        <div className="lg:col-span-4 space-y-4">
           {mySessions.map(session => (
              <div 
                 key={session.id} 
                 onClick={() => setSelectedSessionId(session.id)}
                 className={`p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden ${selectedSessionId === session.id ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-white border-slate-200 hover:border-orange-300'}`}
              >
                 <div className="flex justify-between mb-2 relative z-10">
                    <span className={`font-bold ${selectedSessionId === session.id ? 'text-white' : 'text-slate-900'}`}>{session.level}</span>
                    <Badge color={session.status === 'Open' ? 'green' : 'yellow'} className={selectedSessionId === session.id ? 'bg-white/20 text-white border-transparent' : ''}>{session.status}</Badge>
                 </div>
                 <div className={`text-xs flex items-center gap-2 mb-3 relative z-10 ${selectedSessionId === session.id ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={14}/> {session.time}
                 </div>
                 {/* Progress Bar */}
                 <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10">
                    <div className={`h-full ${selectedSessionId === session.id ? 'bg-orange-500' : 'bg-slate-300'}`} style={{ width: `${(session.registeredCount/session.capacity)*100}%`}}></div>
                 </div>
              </div>
           ))}
        </div>

        {/* Active Session View */}
        <div className="lg:col-span-8 space-y-6">
           {/* Practice Plan Card */}
           <Card className="p-0 overflow-hidden">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                 <h3 className="font-bold text-orange-900 flex items-center gap-2"><Menu size={18}/> Digital Clipboard</h3>
                 <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Today's Plan</span>
              </div>
              <div className="divide-y divide-orange-100 bg-orange-50/30">
                 {activeSession && PRACTICE_PLANS[activeSession.sport]?.map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 hover:bg-orange-100/50 transition-colors">
                       <span className="w-16 font-mono text-xs font-bold text-slate-500">{item.time}</span>
                       <div className="flex-1">
                          <div className="font-bold text-slate-800 text-sm">{item.activity}</div>
                          <div className="text-xs text-slate-500">{item.notes}</div>
                       </div>
                       <input type="checkbox" className="w-5 h-5 accent-orange-600 rounded cursor-pointer" />
                    </div>
                 ))}
                 {!activeSession && <div className="p-6 text-center text-slate-500">Select a session to view the plan.</div>}
              </div>
           </Card>

           {/* Roster & Attendance */}
           {activeSession ? (
             <div className="space-y-6">
               <Card className="flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900">Athlete Roster</h2>
                        <p className="text-xs text-slate-500">{rosters[selectedSessionId]?.length || 0} Registered</p>
                     </div>
                     <Button className="text-xs h-8 px-3">Email All Parents</Button>
                  </div>
                  
                  <div className="overflow-auto p-0">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                           <tr>
                              <th className="p-4 pl-6">Athlete</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Health</th>
                              <th className="p-4 text-center">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {rosters[selectedSessionId]?.map(student => (
                              <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="p-4 pl-6">
                                    <div className="font-bold text-slate-900">{student.name}</div>
                                    <div className="text-xs text-slate-500">Jersey: {student.jersey}</div>
                                 </td>
                                 <td className="p-4">
                                    <button onClick={() => toggleAtt(student.id)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${student.attendance === 'present' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                       {student.attendance === 'present' ? 'Present' : 'Absent'}
                                    </button>
                                 </td>
                                 <td className="p-4">
                                    {student.medical !== 'None' ? (
                                       <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold border border-red-100 w-fit">
                                          <HeartPulse size={12}/> {student.medical}
                                       </div>
                                    ) : <span className="text-slate-400">-</span>}
                                 </td>
                                 <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => setShowAssessment(student)} className="p-2 rounded-full hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors" title="Evaluate Skills">
                                       <Star size={18}/>
                                    </button>
                                    <button className="p-2 rounded-full hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors" title="Contact Parent">
                                       <Mail size={18}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                           {(!rosters[selectedSessionId] || rosters[selectedSessionId].length === 0) && (
                              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No students enrolled yet.</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </Card>

               <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <FileText size={18} className="text-orange-600"/> Session Notes
                  </h3>
                  <textarea 
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                     rows={4}
                     placeholder="Log drills, injuries, or improvements..."
                     value={notes[selectedSessionId] || ''}
                     onChange={(e) => setNotes({...notes, [selectedSessionId]: e.target.value})}
                  />
                  <div className="mt-2 text-right">
                     <Button className="text-xs h-8 px-3">Save Note</Button>
                  </div>
               </Card>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-12">
                <Menu size={48} className="mb-4 opacity-50"/>
                <p>Select a session to manage roster</p>
             </div>
           )}
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      {/* Assessment Modal Triggered from Roster */}
      {showAssessment && (
         <AssessmentModal 
            student={showAssessment} 
            sport={user.sport} 
            onClose={() => setShowAssessment(null)} 
            onSave={handleSaveAssessment} 
         />
      )}

      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 transition-all duration-300">
         <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold flex-shrink-0">V</div>
            <span className="ml-3 font-bold text-white hidden lg:block">COACH PORTAL</span>
         </div>
         
         <nav className="flex-1 py-6 space-y-2 px-3">
            {[
               { id: 'overview', icon: Zap, label: 'Overview' },
               { id: 'schedule', icon: Calendar, label: 'Schedule & Roster' },
               { id: 'athletes', icon: Users, label: 'My Athletes' },
               { id: 'evaluations', icon: Star, label: 'Evaluations' },
            ].map(item => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
               >
                  <item.icon size={20} />
                  <span className="font-medium hidden lg:block">{item.label}</span>
               </button>
            ))}
         </nav>

         <div className="p-4 border-t border-slate-800">
            <button onClick={logoutUser} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-slate-400">
               <LogOut size={20} />
               <span className="font-medium hidden lg:block">Log Out</span>
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
         {/* Top Header */}
         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.sport} Department</div>
               </div>
               <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  {user.name.charAt(0)}
               </div>
            </div>
         </header>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-auto p-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'athletes' && <AthletesTab sessions={sessions} rosters={rosters} user={user} onNavigateToEvaluations={(athleteId) => {
              setActiveTab('evaluations');
              // Store athlete ID for pre-selection
              window.selectedAthleteForEval = athleteId;
            }} />}
            {activeTab === 'evaluations' && <EvaluationsTab sessions={sessions} rosters={rosters} setRosters={setRosters} user={user} />}
         </div>
      </div>
    </div>
  );
};

// --- VIEW COMPONENTS ---

const HomeView = ({ setView, scrollToSection, refs, sessions, setSelectedProgram, heroImages, currentSlide }) => {
  const [activeTab, setActiveTab] = useState('All');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    firstName: '', lastName: '', email: '', message: ''
  });
  const [contactErrors, setContactErrors] = useState({
    firstName: '', lastName: '', email: '', message: ''
  });
  const [contactTouched, setContactTouched] = useState({
    firstName: false, lastName: false, email: false, message: false
  });

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterTouched, setNewsletterTouched] = useState(false);

  const filteredSessions = activeTab === 'All' ? sessions : sessions.filter(s => s.sport === activeTab);

  // Contact form validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'This field is required';
    if (name.trim().length < 2) return 'Must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    return '';
  };

  // Contact form handlers
  const handleContactChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    if (contactTouched[field]) {
      let error = '';
      if (field === 'firstName' || field === 'lastName') {
        error = validateName(value);
      } else if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'message') {
        error = validateMessage(value);
      }
      setContactErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleContactBlur = (field) => {
    setContactTouched(prev => ({ ...prev, [field]: true }));
    let error = '';
    if (field === 'firstName' || field === 'lastName') {
      error = validateName(contactForm[field]);
    } else if (field === 'email') {
      error = validateEmail(contactForm[field]);
    } else if (field === 'message') {
      error = validateMessage(contactForm[field]);
    }
    setContactErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    setContactTouched({ firstName: true, lastName: true, email: true, message: true });

    // Validate all fields
    const errors = {
      firstName: validateName(contactForm.firstName),
      lastName: validateName(contactForm.lastName),
      email: validateEmail(contactForm.email),
      message: validateMessage(contactForm.message)
    };

    setContactErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err !== '')) {
      return;
    }

    // Form is valid, proceed with submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ firstName: '', lastName: '', email: '', message: '' });
    setContactTouched({ firstName: false, lastName: false, email: false, message: false });
  };

  // Newsletter handlers
  const handleNewsletterChange = (value) => {
    setNewsletterEmail(value);
    if (newsletterTouched) {
      setNewsletterError(validateEmail(value));
    }
  };

  const handleNewsletterBlur = () => {
    setNewsletterTouched(true);
    setNewsletterError(validateEmail(newsletterEmail));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterTouched(true);
    const error = validateEmail(newsletterEmail);
    setNewsletterError(error);

    if (!error) {
      console.log('Newsletter signup:', newsletterEmail);
      setNewsletterEmail('');
      setNewsletterTouched(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative bg-slate-900 text-white min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hero ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-30' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Trophy size={16} className="text-orange-500" />
              <span className="text-orange-100 font-semibold text-sm tracking-wide">San Antonio's Premier Academy</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
              Forge Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Greatness</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
              Professional-grade Basketball and Volleyball training for youth athletes. 
              Develop elite skills, game IQ, and character in a world-class facility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => scrollToSection(refs.sessions)} className="text-lg px-8 py-4">
                Start Training <ArrowRight size={20} />
              </Button>
              <Button variant="outline" onClick={() => scrollToSection(refs.location)} className="text-lg px-8 py-4 !bg-transparent border-slate-700 !text-white hover:!bg-white/10 hover:!border-white">
                Visit Facility
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-8 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Certified Coaches</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Regulation Courts</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Ages 4-18</div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div ref={refs.sessions} className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Training Programs</h2>
            <div className="flex justify-center gap-2">
              {['All', 'Basketball', 'Volleyball'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === tab ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-t-4 border-t-orange-500">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge color={session.sport === 'Basketball' ? 'orange' : 'blue'} className="mb-2">{session.sport}</Badge>
                      <h3 className="text-2xl font-bold text-slate-900">{session.level}</h3>
                      <p className="text-slate-500 font-medium">{session.grades} • {session.gender}</p>
                    </div>
                    {session.status !== 'Open' ? <Badge color="yellow">{session.status}</Badge> : <Badge color="green">Open</Badge>}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-orange-600"/> {session.date}</div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-orange-600"/> {session.time}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-orange-600"/> {session.location}</div>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">{session.description}</p>
                  
                  {/* Coach Info Section */}
                  <div className="mb-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                       <span className="font-bold text-blue-800">Head Coach:</span> {session.headCoach}
                    </div>
                    {session.assistantCoach && (
                       <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="font-bold text-blue-600">Assistant:</span> {session.assistantCoach}
                       </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Key Focus Areas:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {session.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={14} className="text-green-500 mt-1 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">${session.price}</span>
                        <span className="text-sm text-slate-500 font-medium">/mo</span>
                      </div>
                      <span className="text-xs text-slate-400">+$30 Reg Fee (One-time)</span>
                    </div>
                    <Button onClick={() => { setSelectedProgram(session.sport); setView('register'); }}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="py-16 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">What's Included</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-green-50 border border-green-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">~4 Sessions/Month</h3>
              <p className="text-slate-600 text-sm">Every Saturday (may vary with holidays)</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Professional Jersey</h3>
              <p className="text-slate-600 text-sm">Included with registration fee</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Small Group Training</h3>
              <p className="text-slate-600 text-sm">Max 20 students per session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coaches Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Directors</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our academy is led by champions. Decades of professional experience, dedicated to your child's growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {COACHES.map((coach, idx) => (
              <div key={idx} className="flex flex-col h-full p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <img src={coach.img} alt={coach.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{coach.name}</h3>
                    <p className="text-orange-600 text-sm font-semibold">{coach.role}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                     <Award size={14} className="text-orange-500"/> Highlights
                   </div>
                   <ul className="space-y-2">
                     {coach.highlights.map((highlight, i) => (
                       <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                         <div className="min-w-[4px] h-[4px] rounded-full bg-slate-300 mt-2"></div>
                         {highlight}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                   <span>{coach.exp}</span>
                   <div className="flex gap-1">
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location */}
      <div ref={refs.location} className="py-24 bg-slate-900 text-white px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[128px] opacity-20"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-block p-3 bg-orange-600/20 rounded-xl mb-6">
              <MapPin size={32} className="text-orange-500" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Home Court Advantage</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Located centrally in San Antonio, our facility features 4 regulation basketball courts, 
              6 volleyball courts, and a dedicated strength & conditioning area.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-1 bg-orange-500 h-full min-h-[40px] rounded-full"></div>
                <div>
                  <h4 className="font-bold text-white">Vanguard Sports Academy</h4>
                  <p className="text-slate-400">1450 NE Interstate 410 Loop<br/>San Antonio, TX 78209</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-80 bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 group">
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 group-hover:bg-slate-800/30 transition-colors">
                <MapPin size={48} className="text-orange-500 mb-4 animate-bounce" />
                {/* Fix: Added !bg-white/10 !text-white to ensure transparency and white text */}
                <Button variant="outline" className="!bg-white/10 border-white/20 !text-white hover:bg-white hover:!text-slate-900 backdrop-blur-md">
                  Get Directions
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Training Gallery</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Get a glimpse of our training sessions, facility, and the incredible energy our athletes bring every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80"
                alt="Basketball Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Basketball Drills</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80"
                alt="Volleyball Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Volleyball Practice</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80"
                alt="Team Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Team Drills</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&q=80"
                alt="Skills Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Skills Development</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80"
                alt="Court Facility"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Our Facility</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1552084162-ec07b3f162dc?auto=format&fit=crop&q=80"
                alt="Group Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Group Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academy Rules & FAQs Section */}
      <div className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Academy Rules */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Academy Rules</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">1</div>
                <p className="text-slate-700 pt-1">Punctuality is key. Arrive 10 minutes before sessions start.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">2</div>
                <p className="text-slate-700 pt-1">Appropriate athletic shoes and sportswear are required.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">3</div>
                <p className="text-slate-700 pt-1">Respect towards coaches, staff, and peers is non-negotiable.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">4</div>
                <p className="text-slate-700 pt-1">No foul language or bullying will be tolerated.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">5</div>
                <p className="text-slate-700 pt-1">Listen to safety instructions at all times.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">6</div>
                <p className="text-slate-700 pt-1">Parents should trust coaches to coach and refrain from sideline instruction.</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What is the age range for your training sessions?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  We offer programs for athletes aged 4-18, divided into age-appropriate groups to ensure optimal skill development and safety.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What should my child bring to training sessions?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Athletes should bring appropriate athletic shoes, comfortable sportswear, a water bottle, and their provided academy jersey. We recommend bringing a towel as well.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  How do I communicate with coaches?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Parents can reach coaches via email or through the parent portal. We also hold periodic parent meetings to discuss athlete progress and answer questions.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What is your cancellation policy?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  We require 30 days notice for cancellations to receive a full refund. Please review our complete cancellation policy in the enrollment agreement.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  Is the environment safe?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Absolutely. All our coaches are certified and background-checked. We maintain strict safety protocols, and our facility is equipped with first aid supplies and AEDs.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Get In Touch Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get In Touch</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Have questions about registration or our programs? Send us a message.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <a href="mailto:vanguardsportsacademytx@gmail.com" className="text-blue-600 hover:underline">
                    vanguardsportsacademytx@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                  <p className="text-slate-600">
                    1450 NE Interstate 410 Loop<br />
                    San Antonio, TX 78209
                  </p>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                <p className="text-blue-100 mb-6 text-sm">Get the latest news on classes and events.</p>
                <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                  <div>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => handleNewsletterChange(e.target.value)}
                      onBlur={handleNewsletterBlur}
                      placeholder="Your email address"
                      className={`w-full px-4 py-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        newsletterTouched && newsletterError
                          ? 'ring-2 ring-red-300 border-red-400'
                          : 'focus:ring-white'
                      }`}
                    />
                    {newsletterTouched && newsletterError && (
                      <p className="text-xs font-bold text-red-200 mt-2 flex items-center gap-1">
                        <Info size={10} /> {newsletterError}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-blue-100">
                    <input type="checkbox" className="rounded" />
                    Subscribe to newsletter
                  </label>
                  <Button type="submit" className="w-full !bg-white !text-blue-600 hover:!bg-blue-50">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Form */}
            <form className="bg-slate-50 rounded-2xl p-8 border border-slate-200 space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={contactForm.firstName}
                  onChange={(e) => handleContactChange('firstName', e.target.value)}
                  onBlur={() => handleContactBlur('firstName')}
                  placeholder="John"
                  error={contactTouched.firstName ? contactErrors.firstName : ''}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={contactForm.lastName}
                  onChange={(e) => handleContactChange('lastName', e.target.value)}
                  onBlur={() => handleContactBlur('lastName')}
                  placeholder="Smith"
                  error={contactTouched.lastName ? contactErrors.lastName : ''}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={contactForm.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                onBlur={() => handleContactBlur('email')}
                placeholder="john@example.com"
                error={contactTouched.email ? contactErrors.email : ''}
                required
              />

              <div className="mb-4">
                <div className="flex justify-between items-baseline">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Message <span className="text-orange-600">*</span>
                  </label>
                  {contactTouched.message && contactErrors.message && (
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                      <Info size={10} /> {contactErrors.message}
                    </span>
                  )}
                </div>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleContactChange('message', e.target.value)}
                  onBlur={() => handleContactBlur('message')}
                  rows="5"
                  placeholder="Your message here..."
                  className={`w-full bg-slate-50 border rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-400 focus:placeholder:text-transparent resize-none ${
                    contactTouched.message && contactErrors.message
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50'
                      : 'border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                  }`}
                />
              </div>

              <Button type="submit" className="w-full text-lg py-4">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LEGAL & INFO PAGES ---

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

const RefundPolicyPage = ({ setView }) => (
  <LegalPage
    title="Refund & Cancellation Policy"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>At Vanguard Sports Academy, we strive to provide the best training experience for all our athletes. Please review our refund and cancellation policy carefully before enrollment.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Cancellation Policy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>30-Day Notice Required:</strong> To receive a full refund of your monthly subscription, you must provide written notice at least 30 days before your next billing date.</li>
          <li><strong>Registration Fees:</strong> The one-time registration fee ($30) is non-refundable once the athlete has participated in their first session.</li>
          <li><strong>Prorated Refunds:</strong> If you cancel mid-month with less than 30 days notice, no prorated refunds will be issued.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Refund Process</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Refunds will be processed within 7-10 business days after approval.</li>
          <li>Refunds will be issued to the original payment method.</li>
          <li>To request a cancellation, please email us at vanguardsportsacademytx@gmail.com with your account details.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Special Circumstances</h2>
        <p>We understand that unexpected situations arise. In cases of injury, relocation, or other extenuating circumstances, please contact us directly. We will review your situation on a case-by-case basis.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Session Cancellations by Academy</h2>
        <p>If Vanguard Sports Academy cancels a session due to weather, facility issues, or other unforeseen circumstances, we will provide make-up sessions or credit toward future sessions.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

const PrivacyPolicyPage = ({ setView }) => (
  <LegalPage
    title="Privacy Policy"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>Vanguard Sports Academy ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Information:</strong> Name, email address, phone number, billing address, and emergency contact information.</li>
          <li><strong>Athlete Information:</strong> Date of birth, gender, medical information (allergies, conditions), and athletic performance data.</li>
          <li><strong>Payment Information:</strong> Credit card details (processed securely through our payment processor).</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and manage training services</li>
          <li>To process payments and send billing statements</li>
          <li>To communicate important updates about sessions, schedules, and events</li>
          <li>To ensure athlete safety and provide appropriate coaching</li>
          <li>To improve our services and training programs</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Coaches and staff for training purposes</li>
          <li>Payment processors for billing</li>
          <li>Emergency services if required for athlete safety</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Data Security</h2>
        <p>We implement industry-standard security measures to protect your information. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information. Contact us at vanguardsportsacademytx@gmail.com to exercise these rights.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

const TermsPage = ({ setView }) => (
  <LegalPage
    title="Terms & Conditions"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>By enrolling in Vanguard Sports Academy programs, you agree to the following terms and conditions:</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Enrollment & Payment</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All enrollments require payment of a monthly subscription fee and a one-time registration fee.</li>
          <li>Monthly fees are billed automatically on the enrollment date each month.</li>
          <li>Failure to pay may result in suspension of training privileges.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Attendance & Participation</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Athletes are expected to attend all scheduled sessions.</li>
          <li>Missed sessions cannot be refunded or made up unless the academy cancels the session.</li>
          <li>Athletes must arrive 10 minutes before session start time.</li>
          <li>Appropriate athletic attire and footwear are required.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Code of Conduct</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Athletes must treat coaches, staff, and peers with respect.</li>
          <li>Bullying, foul language, or disruptive behavior will not be tolerated.</li>
          <li>Violation of conduct rules may result in removal from the program without refund.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Liability</h2>
        <p>Participation in athletic activities carries inherent risks. By enrolling, you acknowledge these risks and agree to the terms outlined in our liability waiver.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Media Release</h2>
        <p>We may photograph or video athletes during training for promotional purposes. If you do not consent, please notify us in writing.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

const WaiverPage = ({ setView }) => (
  <LegalPage
    title="Liability Waiver"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p className="font-bold text-lg">PLEASE READ CAREFULLY BEFORE SIGNING</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Assumption of Risk</h2>
        <p>I acknowledge that participation in basketball and volleyball training involves physical activity and carries inherent risks, including but not limited to: sprains, fractures, concussions, and other injuries. I voluntarily assume all risks associated with my child's participation.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Release of Liability</h2>
        <p>I hereby release, waive, and discharge Vanguard Sports Academy, its owners, directors, coaches, employees, and volunteers from any and all liability, claims, demands, or causes of action arising from my child's participation in training programs, including those caused by negligence.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Medical Authorization</h2>
        <p>I authorize Vanguard Sports Academy staff to seek emergency medical treatment for my child if necessary. I understand that I will be responsible for all medical expenses incurred.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Medical Information</h2>
        <p>I certify that my child is in good physical condition and has no medical conditions that would prevent safe participation, except as disclosed in writing to the academy.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Photo/Video Release</h2>
        <p>I grant permission for Vanguard Sports Academy to use photographs or videos of my child for promotional purposes, including website, social media, and marketing materials.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Agreement</h2>
        <p>I have read this waiver carefully and understand its contents. I sign this voluntarily and with full knowledge of its significance.</p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
          <p className="text-sm font-bold text-orange-900">This waiver must be signed during the enrollment process. Contact us at vanguardsportsacademytx@gmail.com for enrollment information.</p>
        </div>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

const LoginView = ({ setView, loginUser, scrollToSection, sessionsRef, showNotification }) => {
  const [role, setRole] = useState('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    // If there are errors, don't submit
    if (emailError || passwordError) {
      showNotification('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.user) {
        // Map backend user format to frontend format
        const user = {
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`,
          email: response.user.email,
          role: response.user.role,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
        };

        showNotification('Login successful! Welcome back.');
        loginUser(user);
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">V</div>
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="text-slate-500 mt-2">Access your dashboard</p>
        </div>
        <Card className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button onClick={() => setRole('parent')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'parent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Parent / Student</button>
            <button onClick={() => setRole('coach')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'coach' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Coach / Staff</button>
            <button onClick={() => setRole('admin')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>Admin</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              placeholder="name@example.com"
              error={touched.email ? errors.email : ''}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              error={touched.password ? errors.password : ''}
              required
            />
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? <><Loader className="animate-spin" size={16} /> Authenticating...</> : (role === 'coach' ? 'Enter Coach Portal' : role === 'admin' ? 'Enter Admin Portal' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm border-t border-slate-100 pt-6">
            <span className="text-slate-500">Don't have an account? </span>
            {role === 'parent' ? (
              <button onClick={() => { setView('home'); setTimeout(() => scrollToSection(sessionsRef), 100); }} className="font-bold text-orange-600 hover:underline inline-flex items-center gap-1">Enroll in a Session <ArrowRight size={12}/></button>
            ) : (
              <button onClick={() => showNotification("Please contact the Athletic Director.")} className="font-bold text-orange-600 hover:underline">Contact Administration</button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const RegistrationFlow = ({ setView, loginUser, sessions }) => {
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

  const handleRegister = () => {
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
    setTimeout(() => {
      const programNames = formData.athletes.map(a => {
         const s = sessions.find(sess => sess.id === a.selectedSessionId);
         return s ? `${s.sport} ${s.level}` : 'Program';
      }).join(', ');

      loginUser({
        name: formData.parentName, email: formData.email, role: 'parent', 
        students: formData.athletes.map(a => ({...a, id: Math.random().toString(36)})),
        subscription: { program: programNames, status: 'Active', nextPayment: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(), amount: monthlyTotal.toFixed(2) }
      });
      setIsProcessing(false);
    }, 2000);
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Parent Info</h2>
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

// --- COACH & PARENT DASHBOARDS ---

const Dashboard = ({ user, logoutUser }) => {
  if (!user || user.role === 'coach') return null;
  const [subStatus, setSubStatus] = useState(user.subscription.status || 'Active');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleCancel = () => {
     if (window.confirm("Are you sure you want to cancel your membership?")) {
        setSubStatus('Canceled');
     }
  };

  const handleResume = () => setSubStatus('Active');

  const handlePaymentUpdate = () => {
     setNotification("Payment method updated successfully.");
     setTimeout(() => setNotification(null), 3000);
  };

  return (
     <div className="min-h-screen bg-slate-50 py-12 px-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
           {notification && (
              <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
                 <Check className="text-green-400" size={20} /> {notification}
              </div>
           )}

           <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Parent Dashboard</h1>
              <Button variant="ghost" onClick={logoutUser}>Sign Out</Button>
           </div>
           
           <Card className={`p-6 border-l-4 mb-8 ${subStatus === 'Active' ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <Badge color={subStatus === 'Active' ? 'green' : 'red'} className="mb-2">{subStatus} Subscription</Badge>
                    <p className="text-slate-500 text-sm">Next billing: {subStatus === 'Active' ? user.subscription.nextPayment : 'N/A'}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">${user.subscription.amount}</span>
                    <span className="text-xs text-slate-500 block">/mo</span>
                 </div>
              </div>
              
              <div className="space-y-3">
                 <h3 className="font-bold text-slate-700 text-sm">Your Athletes</h3>
                 {user.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                             {s.name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{s.name}</p>
                             <p className="text-xs text-slate-500">{user.subscription.program.split(', ')[i] || user.subscription.program} • {s.jerseySize}</p>
                          </div>
                       </div>
                       <Badge color={subStatus === 'Active' ? 'green' : 'gray'}>{subStatus === 'Active' ? 'Active' : 'Paused'}</Badge>
                    </div>
                 ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4">
                 {subStatus === 'Active' ? (
                    <button onClick={handleCancel} className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"><X size={14} /> Cancel Subscription</button>
                 ) : (
                    <button onClick={handleResume} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"><RefreshCw size={14} /> Resume Subscription</button>
                 )}
                 <button onClick={() => setShowPaymentModal(true)} className="text-sm font-medium text-slate-500 hover:text-orange-600 flex items-center gap-1 ml-auto"><CreditCard size={14} /> Update Payment Method</button>
              </div>
           </Card>
        </div>
        {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} onUpdate={handlePaymentUpdate} />}
     </div>
  );
};

// --- FOOTER COMPONENT ---

const Footer = ({ refs, scrollToSection, setView }) => (
  <footer className="bg-slate-900 text-slate-400 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-5 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Vanguard Logo" className="h-24 w-auto" onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} />
            <div className="w-14 h-14 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-2xl" style={{display: 'none'}}>V</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-none">VANGUARD</span>
              <span className="text-sm font-bold text-orange-500 leading-none">SPORTS ACADEMY</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            San Antonio's premier youth sports academy. Building champions on and off the court.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setView('about')} className="hover:text-orange-500 transition-colors">About Us</button></li>
            <li><button onClick={() => scrollToSection(refs.sessions)} className="hover:text-orange-500 transition-colors">Training Sessions</button></li>
            <li><button onClick={() => setView('staff')} className="hover:text-orange-500 transition-colors">Our Staff</button></li>
            <li><button onClick={() => setView('contact')} className="hover:text-orange-500 transition-colors">Contact</button></li>
            <li><button onClick={() => setView('login')} className="hover:text-orange-500 transition-colors">Email Us</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setView('refund-policy')} className="hover:text-orange-500 transition-colors">Refund & Cancellation Policy</button></li>
            <li><button onClick={() => setView('privacy-policy')} className="hover:text-orange-500 transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => setView('terms')} className="hover:text-orange-500 transition-colors">Terms & Conditions</button></li>
            <li><button onClick={() => setView('waiver')} className="hover:text-orange-500 transition-colors">Waiver</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5" />
              <span>vanguardsportsacademytx@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5" />
              <span>1450 NE Interstate 410 Loop<br/>San Antonio, TX 78209</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6 text-center text-sm">
        <p>&copy; 2024 Vanguard Sports Academy. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState(SESSIONS_DATA);
  const [rosters, setRosters] = useState(INITIAL_ROSTERS);
  const [selectedProgram, setSelectedProgram] = useState('Basketball');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const refs = {
    sessions: useRef(null),
    location: useRef(null),
  };

  // Hero slideshow images
  const heroImages = [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load sessions from backend
        const sessionsResponse = await sessionService.getAllSessions();
        if (sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }

        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          try {
            const response = await authService.getCurrentUser();
            if (response.user) {
              const u = {
                id: response.user.id,
                name: `${response.user.first_name} ${response.user.last_name}`,
                email: response.user.email,
                role: response.user.role,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                phone: response.user.phone,
              };
              setUser(u);
              localStorage.setItem('vanguard_user', JSON.stringify(u));

              // Set view based on user role
              if (u.role === 'coach') {
                setView('coachDashboard');
              } else if (u.role === 'admin') {
                setView('adminDashboard');
              } else {
                setView('dashboard');
              }
            }
          } catch (error) {
            console.error('Failed to load user:', error);
            // Clear invalid tokens
            authService.logout();
            localStorage.removeItem('vanguard_user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Hero slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const loginUser = (u) => {
    setUser(u);
    localStorage.setItem('vanguard_user', JSON.stringify(u));
    if (u.role === 'coach') {
      setView('coachDashboard');
    } else if (u.role === 'admin') {
      setView('adminDashboard');
    } else {
      setView('dashboard');
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('vanguard_user');
    setView('home');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const scrollToSection = (ref) => {
     if (view !== 'home') setView('home');
     setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
     setMobileMenuOpen(false);
  };

  if (initialLoading) {
     return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
           <div className="flex flex-col items-center gap-4">
              <Loader size={48} className="animate-spin text-orange-500" />
              <p className="font-bold tracking-widest text-sm uppercase">Loading Vanguard Sports...</p>
           </div>
        </div>
     );
  }

  return (
    <div className="font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Navbar */}
      {view !== 'coachDashboard' && view !== 'adminDashboard' && (
         <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
               <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
                  <img src="/logo.png" alt="Vanguard Logo" className="h-24 w-auto" onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} />
                  <div className="w-14 h-14 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-600/20" style={{display: 'none'}}>V</div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">VANGUARD</span>
                    <span className="text-sm font-bold text-orange-600 tracking-wide leading-none">SPORTS ACADEMY</span>
                  </div>
               </div>
               <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
                  <button onClick={() => scrollToSection(refs.sessions)} className="hover:text-orange-600 transition-colors">Programs</button>
                  <button onClick={() => scrollToSection(refs.location)} className="hover:text-orange-600 transition-colors">Location</button>
                  {user ? (
                     <Button onClick={() => {
                        if (user.role === 'coach') {
                           setView('coachDashboard');
                        } else if (user.role === 'admin') {
                           setView('adminDashboard');
                        } else {
                           setView('dashboard');
                        }
                     }} className="px-5 py-2">Dashboard</Button>
                  ) : (
                     <div className="flex items-center gap-4">
                        <button onClick={() => setView('login')} className="hover:text-orange-600 transition-colors">Sign In</button>
                        <Button onClick={() => scrollToSection(refs.sessions)} className="px-5 py-2">Enroll Now</Button>
                     </div>
                  )}
               </div>
               <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X /> : <Menu />}
               </button>
            </div>
         </nav>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && view !== 'coachDashboard' && view !== 'adminDashboard' && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 space-y-4 animate-fade-in">
           <button onClick={() => scrollToSection(refs.sessions)} className="block w-full text-left py-4 border-b text-lg font-bold">Programs</button>
           <button onClick={() => scrollToSection(refs.location)} className="block w-full text-left py-4 border-b text-lg font-bold">Location</button>
           {user ? (
              <button onClick={() => {
                 if (user.role === 'coach') {
                    setView('coachDashboard');
                 } else if (user.role === 'admin') {
                    setView('adminDashboard');
                 } else {
                    setView('dashboard');
                 }
                 setMobileMenuOpen(false);
              }} className="block w-full text-left py-4 border-b text-lg font-bold">Dashboard</button>
           ) : (
              <button onClick={() => { setView('login'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 border-b text-lg font-bold">Sign In</button>
           )}
        </div>
      )}

      <main>
         {notification && (
            <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
               <Check className="text-green-400" size={20} /> {notification}
            </div>
         )}

         {view === 'home' && <HomeView setView={setView} scrollToSection={scrollToSection} refs={refs} sessions={sessions} setSelectedProgram={setSelectedProgram} heroImages={heroImages} currentSlide={currentSlide} />}
         {view === 'login' && <LoginView setView={setView} loginUser={loginUser} scrollToSection={scrollToSection} sessionsRef={refs.sessions} showNotification={showNotification} />}
         {view === 'register' && <RegistrationFlow setView={setView} loginUser={loginUser} sessions={sessions} />}
         {view === 'dashboard' && <EnhancedParentDashboard user={user} logoutUser={logoutUser} onNavigate={setView} />}
         {view === 'accountSettings' && <AccountSettings user={user} onUpdate={updateUser} onBack={() => setView('dashboard')} />}
         {view === 'familyManagement' && <FamilyManagement user={user} onUpdate={updateUser} onBack={() => setView('dashboard')} />}
         {view === 'billingPortal' && <BillingPortal user={user} onBack={() => setView('dashboard')} />}
         {view === 'coachDashboard' && <CoachDashboard user={user} logoutUser={logoutUser} sessions={sessions} rosters={rosters} setRosters={setRosters} />}
         {view === 'adminDashboard' && <AdminDashboard user={user} logoutUser={logoutUser} sessions={sessions} onUpdateSessions={setSessions} />}

         {/* Legal Pages */}
         {view === 'refund-policy' && <RefundPolicyPage setView={setView} />}
         {view === 'privacy-policy' && <PrivacyPolicyPage setView={setView} />}
         {view === 'terms' && <TermsPage setView={setView} />}
         {view === 'waiver' && <WaiverPage setView={setView} />}
      </main>

      {!['coachDashboard', 'adminDashboard', 'accountSettings', 'familyManagement', 'billingPortal'].includes(view) && <Footer refs={refs} scrollToSection={scrollToSection} setView={setView} />}
    </div>
  );
}