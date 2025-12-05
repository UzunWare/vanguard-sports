import React, { useState } from 'react';
import { Loader, ArrowRight, Mail, Lock, Eye, EyeOff, User, Shield, Layers } from 'lucide-react';
import Button from '../components/ui/Button';
import authService from '../services/authService';

/**
 * LoginView Component
 * Modern split-screen authentication page with role selection
 *
 * @param {object} props
 * @param {function} props.setView - Function to change the current view
 * @param {function} props.loginUser - Function to log in the user
 * @param {function} props.scrollToSection - Function to scroll to a specific section
 * @param {object} props.sessionsRef - Reference to the sessions section
 * @param {function} props.showNotification - Function to display notifications
 */
const LoginView = ({ setView, loginUser, scrollToSection, sessionsRef, showNotification }) => {
  const [role, setRole] = useState('parent'); // 'parent', 'coach', or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      showNotification('Please fix the errors before submitting', 'error');
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
      showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Theme colors based on role
  const getRoleTheme = () => {
    switch (role) {
      case 'parent':
        return {
          gradient: 'from-orange-500 to-red-600',
          ring: 'focus:ring-orange-500',
          icon: 'text-orange-500',
          text: 'text-orange-600'
        };
      case 'coach':
        return {
          gradient: 'from-blue-600 to-indigo-700',
          ring: 'focus:ring-blue-500',
          icon: 'text-blue-600',
          text: 'text-blue-600'
        };
      case 'admin':
        return {
          gradient: 'from-red-600 to-pink-700',
          ring: 'focus:ring-red-500',
          icon: 'text-red-600',
          text: 'text-red-600'
        };
      default:
        return {
          gradient: 'from-orange-500 to-red-600',
          ring: 'focus:ring-orange-500',
          icon: 'text-orange-500',
          text: 'text-orange-600'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="flex w-full h-screen overflow-hidden">

      {/* LEFT SIDE: BRANDING PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white z-10">

        {/* Dynamic Background */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-50 blur-3xl animate-pulse"></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl ${theme.gradient} opacity-20 blur-[100px] transition-colors duration-700`}></div>

        {/* Decorative Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg transition-all duration-500`}>
              <Layers className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tight">VANGUARD</span>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
            FORGE YOUR <br/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} transition-all duration-500`}>LEGACY.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Join the premier academy for youth basketball and volleyball.
            Elevate your game with professional coaching and world-class facilities.
          </p>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
          <div className="h-px w-8 bg-slate-700"></div>
          <span>Excellence in motion.</span>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-white relative overflow-y-auto">

        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className={`w-8 h-8 rounded bg-gradient-to-br ${theme.gradient} flex items-center justify-center transition-colors duration-500`}>
            <span className="font-bold text-white text-xs">V</span>
          </div>
          <span className="font-bold text-slate-900">VANGUARD</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-8 relative">
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                role === 'parent' ? 'left-1' :
                role === 'coach' ? 'left-[calc(33.333%+1px)]' :
                'left-[calc(66.666%+2px)]'
              }`}
            ></div>

            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${
                role === 'parent' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className={`w-4 h-4 ${role === 'parent' ? 'text-orange-500' : 'text-slate-400'}`} />
              Parent
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${
                role === 'coach' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className={`w-4 h-4 ${role === 'coach' ? 'text-blue-600' : 'text-slate-400'}`} />
              Coach
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${
                role === 'admin' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield className={`w-4 h-4 ${role === 'admin' ? 'text-red-600' : 'text-slate-400'}`} />
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-slate-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  disabled={loading}
                  className={`w-full bg-white border text-slate-900 text-sm rounded-xl focus:ring-2 ${theme.ring} focus:border-transparent block w-full pl-10 p-3 transition-all outline-none shadow-sm ${
                    touched.email && errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder={
                    role === 'parent' ? 'parent@example.com' :
                    role === 'coach' ? 'coach@vanguardsports.com' :
                    'admin@vanguardsports.com'
                  }
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs font-bold text-red-500 ml-1 mt-1 animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-slate-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  disabled={loading}
                  className={`w-full bg-white border text-slate-900 text-sm rounded-xl focus:ring-2 ${theme.ring} focus:border-transparent block w-full pl-10 pr-10 p-3 transition-all outline-none shadow-sm ${
                    touched.password && errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-xs font-bold text-red-500 ml-1 mt-1 animate-fade-in">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                "Sign in to Dashboard"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">New to Vanguard?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setView('home'); setTimeout(() => scrollToSection(sessionsRef), 100); }}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Enroll in a Session <ArrowRight size={16} />
            </button>

          </form>
        </div>

        {/* Help Footer */}
        <div className="absolute bottom-8 text-center text-xs text-slate-400">
          Need help? Contact us at{' '}
          <a href="mailto:vanguardsportsacademytx@gmail.com" className="underline hover:text-slate-600">
            vanguardsportsacademytx@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
