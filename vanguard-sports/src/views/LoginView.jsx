import React, { useState } from 'react';
import { Loader, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/authService';

/**
 * LoginView Component
 * User authentication page with email/password validation
 *
 * @param {object} props
 * @param {function} props.setView - Function to change the current view
 * @param {function} props.loginUser - Function to log in the user
 * @param {function} props.scrollToSection - Function to scroll to a specific section
 * @param {object} props.sessionsRef - Reference to the sessions section
 * @param {function} props.showNotification - Function to display notifications
 */
const LoginView = ({ setView, loginUser, scrollToSection, sessionsRef, showNotification }) => {
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">V</div>
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="text-slate-500 mt-2">Access your dashboard</p>
        </div>
        <Card className="p-8">
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
              {loading ? <><Loader className="animate-spin" size={16} /> Authenticating...</> : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm border-t border-slate-100 pt-6">
            <span className="text-slate-500">Don't have an account? </span>
            <button onClick={() => { setView('home'); setTimeout(() => scrollToSection(sessionsRef), 100); }} className="font-bold text-orange-600 hover:underline inline-flex items-center gap-1">Enroll in a Session <ArrowRight size={12}/></button>
            <p className="text-slate-400 text-xs mt-2">Staff accounts: Contact the Athletic Director</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginView;
