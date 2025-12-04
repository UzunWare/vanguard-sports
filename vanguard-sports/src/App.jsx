import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
// SAFEST POSSIBLE IMPORTS - Strict subset of universally available icons
import {
  MapPin, Calendar, CreditCard, User, Check, X, ChevronRight,
  Menu, Mail, Clock, Users, Info, ArrowRight, LogOut,
  Loader, Star, ChevronDown, ChevronUp, Lock, CheckCircle, Award,
  AlertTriangle, Zap, FileText, HeartPulse, Trophy, RefreshCw, Settings
} from 'lucide-react';

// API Services
import authService from './services/authService';
import sessionService from './services/sessionService';
import athleteService from './services/athleteService';
import enrollmentService from './services/enrollmentService';
import evaluationService from './services/evaluationService';
import contactService from './services/contactService';

// UI COMPONENTS
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Input from './components/ui/Input';
import Select from './components/ui/Select';
import ConfirmDialog from './components/ui/ConfirmDialog';
import LoadingFallback from './components/LoadingFallback';
import Footer from './components/Footer';
import TransitionScreen from './components/TransitionScreen';

// CONSTANTS
import { PRACTICE_PLANS } from './constants/practiceData';
import { SKILL_CRITERIA } from './constants/skillCriteria';
import { SESSIONS_DATA } from './constants/sessionsData';
import { COACHES } from './constants/coachesData';

// LEGAL PAGES
import RefundPolicyPage from './pages/legal/RefundPolicyPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import WaiverPage from './pages/legal/WaiverPage';

// MODALS
import PaymentModal from './components/modals/PaymentModal';
import AssessmentModal from './components/modals/AssessmentModal';

// VIEWS
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import RegistrationFlow from './views/RegistrationFlow';
import CoachDashboard from './views/coach/CoachDashboard';
import ChangePasswordRequired from './views/ChangePasswordRequired';
import CalendarView from './views/CalendarView';

// LAZY LOADED VIEWS - Code Splitting for Better Performance
const EnhancedParentDashboard = lazy(() => import('./views/parent').then(module => ({ default: module.ParentDashboard })));
const AccountSettings = lazy(() => import('./views/parent').then(module => ({ default: module.AccountSettings })));
const FamilyManagement = lazy(() => import('./views/parent').then(module => ({ default: module.FamilyManagement })));
const BillingPortal = lazy(() => import('./views/parent').then(module => ({ default: module.BillingPortal })));

const AthletesTab = lazy(() => import('./views/coach/tabs').then(module => ({ default: module.AthletesTab })));
const EvaluationsTab = lazy(() => import('./views/coach/tabs').then(module => ({ default: module.EvaluationsTab })));

const AdminDashboard = lazy(() => import('./views/admin').then(module => ({ default: module.AdminDashboard })));

// --- PARENT DASHBOARD ---

const Dashboard = ({ user, logoutUser }) => {
  if (!user || user.role === 'coach') return null;
  const [subStatus, setSubStatus] = useState(user.subscription.status || 'Active');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setSubStatus('Canceled');
  };

  const handleResume = () => setSubStatus('Active');

  const handlePaymentUpdate = () => {
     showNotification("Payment method updated successfully.");
  };

  return (
     <div className="min-h-screen bg-slate-50 py-12 px-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
           {notification && (
              <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
                 {notification.type === 'error' ? (
                   <AlertTriangle className="text-red-400" size={20} />
                 ) : notification.type === 'warning' ? (
                   <Info className="text-yellow-400" size={20} />
                 ) : (
                   <Check className="text-green-400" size={20} />
                 )}
                 {notification.message || notification}
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
                    <button onClick={handleCancelClick} className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"><X size={14} /> Cancel Subscription</button>
                 ) : (
                    <button onClick={handleResume} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"><RefreshCw size={14} /> Resume Subscription</button>
                 )}
                 <button onClick={() => setShowPaymentModal(true)} className="text-sm font-medium text-slate-500 hover:text-orange-600 flex items-center gap-1 ml-auto"><CreditCard size={14} /> Update Payment Method</button>
              </div>
           </Card>
        </div>
        {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} onUpdate={handlePaymentUpdate} />}

        {/* Cancel Subscription Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelConfirm}
          title="Cancel Subscription"
          message="Are you sure you want to cancel your membership? This action will end your subscription at the end of the current billing period."
          confirmText="Yes, Cancel"
          cancelText="No, Keep It"
          variant="danger"
        />
     </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState(SESSIONS_DATA);
  const [rosters, setRosters] = useState({});
  const [selectedProgram, setSelectedProgram] = useState('Basketball');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
            // Clear invalid tokens
            authService.logout();
            localStorage.removeItem('vanguard_user');
          }
        }
      } catch (error) {
        // Silent fail - app will show login view
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

  // Transition-enabled view change
  const navigateWithTransition = (targetView) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setMobileMenuOpen(false);

    setTimeout(() => {
      setView(targetView);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 500);
  };

  const loginUser = (u) => {
    setUser(u);
    localStorage.setItem('vanguard_user', JSON.stringify(u));

    // Check if password change is required (for accounts created with temp passwords)
    if (u.requirePasswordChange) {
      navigateWithTransition('changePassword');
      return;
    }

    const targetView = u.role === 'coach' ? 'coachDashboard' : u.role === 'admin' ? 'adminDashboard' : 'dashboard';
    navigateWithTransition(targetView);
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Silent fail - proceed with local logout
    }
    setUser(null);
    localStorage.removeItem('vanguard_user');
    navigateWithTransition('home');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const scrollToSection = (ref) => {
     if (view !== 'home') {
       navigateWithTransition('home');
       setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 1000);
     } else {
       ref.current?.scrollIntoView({ behavior: 'smooth' });
       setMobileMenuOpen(false);
     }
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
      {/* Transition Screen */}
      <TransitionScreen isVisible={isTransitioning} />

      {/* Navbar */}
      {view !== 'coachDashboard' && view !== 'adminDashboard' && (
         <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
               <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigateWithTransition('home')}>
                  <img src="/logo.png" alt="Vanguard Logo" className="h-48 w-auto" onError={(e) => {
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
                  <button onClick={() => navigateWithTransition('calendar')} className="hover:text-orange-600 transition-colors flex items-center gap-1">
                     <Calendar size={16} />
                     Calendar
                  </button>
                  {user ? (
                     <Button onClick={() => {
                        const targetView = user.role === 'coach' ? 'coachDashboard' : user.role === 'admin' ? 'adminDashboard' : 'dashboard';
                        navigateWithTransition(targetView);
                     }} className="px-5 py-2">Dashboard</Button>
                  ) : (
                     <div className="flex items-center gap-4">
                        <button onClick={() => navigateWithTransition('login')} className="hover:text-orange-600 transition-colors">Sign In</button>
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
           <button onClick={() => { scrollToSection(refs.sessions); setMobileMenuOpen(false); }} className="block w-full text-left py-4 border-b text-lg font-bold">Programs</button>
           <button onClick={() => { scrollToSection(refs.location); setMobileMenuOpen(false); }} className="block w-full text-left py-4 border-b text-lg font-bold">Location</button>
           <button onClick={() => { navigateWithTransition('calendar'); setMobileMenuOpen(false); }} className="block w-full text-left py-4 border-b text-lg font-bold flex items-center gap-2">
              <Calendar size={20} />
              Calendar
           </button>
           {user ? (
              <button onClick={() => {
                 const targetView = user.role === 'coach' ? 'coachDashboard' : user.role === 'admin' ? 'adminDashboard' : 'dashboard';
                 navigateWithTransition(targetView);
              }} className="block w-full text-left py-4 border-b text-lg font-bold">Dashboard</button>
           ) : (
              <button onClick={() => navigateWithTransition('login')} className="block w-full text-left py-4 border-b text-lg font-bold">Sign In</button>
           )}
        </div>
      )}

      <main>
         {notification && (
            <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
               {notification.type === 'error' ? (
                  <AlertTriangle className="text-red-400" size={20} />
               ) : notification.type === 'warning' ? (
                  <Info className="text-yellow-400" size={20} />
               ) : (
                  <Check className="text-green-400" size={20} />
               )}
               {notification.message || notification}
            </div>
         )}

         {view === 'home' && <HomeView setView={navigateWithTransition} scrollToSection={scrollToSection} refs={refs} sessions={sessions} setSelectedProgram={setSelectedProgram} heroImages={heroImages} currentSlide={currentSlide} />}
         {view === 'login' && <LoginView setView={navigateWithTransition} loginUser={loginUser} scrollToSection={scrollToSection} sessionsRef={refs.sessions} showNotification={showNotification} />}
         {view === 'register' && <RegistrationFlow setView={navigateWithTransition} loginUser={loginUser} sessions={sessions} showNotification={showNotification} />}
         {view === 'changePassword' && (
           <ChangePasswordRequired
             user={user}
             onPasswordChanged={() => {
               // Clear the requirePasswordChange flag and redirect to dashboard
               const updatedUser = { ...user, requirePasswordChange: false };
               setUser(updatedUser);
               localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
               const targetView = user.role === 'coach' ? 'coachDashboard' : user.role === 'admin' ? 'adminDashboard' : 'dashboard';
               navigateWithTransition(targetView);
             }}
             showNotification={showNotification}
           />
         )}
         {view === 'dashboard' && (
           <Suspense fallback={<LoadingFallback />}>
             <EnhancedParentDashboard user={user} logoutUser={logoutUser} onNavigate={navigateWithTransition} />
           </Suspense>
         )}
         {view === 'accountSettings' && (
           <Suspense fallback={<LoadingFallback />}>
             <AccountSettings user={user} onUpdate={updateUser} onBack={() => navigateWithTransition('dashboard')} />
           </Suspense>
         )}
         {view === 'familyManagement' && (
           <Suspense fallback={<LoadingFallback />}>
             <FamilyManagement user={user} onUpdate={updateUser} onBack={() => navigateWithTransition('dashboard')} />
           </Suspense>
         )}
         {view === 'billingPortal' && (
           <Suspense fallback={<LoadingFallback />}>
             <BillingPortal user={user} onBack={() => navigateWithTransition('dashboard')} />
           </Suspense>
         )}
         {view === 'calendar' && (
           <CalendarView
             user={user}
             onBack={() => navigateWithTransition(
               user
                 ? (user.role === 'coach' ? 'coachDashboard' : user.role === 'admin' ? 'adminDashboard' : 'dashboard')
                 : 'home'
             )}
           />
         )}
         {view === 'coachDashboard' && <CoachDashboard user={user} logoutUser={logoutUser} sessions={sessions} rosters={rosters} setRosters={setRosters} onNavigate={navigateWithTransition} />}
         {view === 'adminDashboard' && (
           <Suspense fallback={<LoadingFallback />}>
             <AdminDashboard user={user} logoutUser={logoutUser} sessions={sessions} onUpdateSessions={setSessions} onNavigate={navigateWithTransition} />
           </Suspense>
         )}

         {/* Legal Pages */}
         {view === 'refund-policy' && <RefundPolicyPage setView={navigateWithTransition} />}
         {view === 'privacy-policy' && <PrivacyPolicyPage setView={navigateWithTransition} />}
         {view === 'terms' && <TermsPage setView={navigateWithTransition} />}
         {view === 'waiver' && <WaiverPage setView={navigateWithTransition} />}
      </main>

      {!['coachDashboard', 'adminDashboard', 'accountSettings', 'familyManagement', 'billingPortal'].includes(view) && <Footer refs={refs} scrollToSection={scrollToSection} setView={navigateWithTransition} />}
    </div>
  );
}