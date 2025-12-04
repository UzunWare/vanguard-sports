import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import authService from '../services/authService';

/**
 * ChangePasswordRequired Component
 * Forced password change screen for users with temporary passwords
 *
 * @param {object} props
 * @param {object} props.user - Current user object
 * @param {function} props.onPasswordChanged - Callback when password is successfully changed
 * @param {function} props.showNotification - Function to display notifications
 */
const ChangePasswordRequired = ({ user, onPasswordChanged, showNotification }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'red', value: strength };
    if (strength <= 3) return { label: 'Fair', color: 'orange', value: strength };
    if (strength <= 4) return { label: 'Good', color: 'yellow', value: strength };
    return { label: 'Strong', color: 'green', value: strength };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      showNotification('Password changed successfully!');
      onPasswordChanged();
    } catch (error) {
      console.error('Password change error:', error);
      showNotification(error.message || 'Failed to change password');

      if (error.message && error.message.includes('current password')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 animate-fade-in">
      <Card className="max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-orange-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Change Password Required</h1>
          <p className="text-slate-600">
            For security, you must change your temporary password before continuing.
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-yellow-900 text-sm mb-1">Temporary Password Detected</h3>
              <p className="text-yellow-800 text-sm">
                Your account was created with a temporary password. Please choose a strong, unique password that you don't use elsewhere.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Current Password (Temporary)
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter temporary password from email"
                error={errors.currentPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Create a strong password"
                error={errors.newPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                      style={{ width: `${(passwordStrength.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold text-${passwordStrength.color}-600`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-1">
                    {formData.newPassword.length >= 8 ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <span className="w-3 h-3 border border-slate-300 rounded-full" />
                    )}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    {/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <span className="w-3 h-3 border border-slate-300 rounded-full" />
                    )}
                    Uppercase and lowercase letters
                  </li>
                  <li className="flex items-center gap-1">
                    {/\d/.test(formData.newPassword) ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <span className="w-3 h-3 border border-slate-300 rounded-full" />
                    )}
                    At least one number
                  </li>
                  <li className="flex items-center gap-1">
                    {/[^a-zA-Z0-9]/.test(formData.newPassword) ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <span className="w-3 h-3 border border-slate-300 rounded-full" />
                    )}
                    At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your new password"
                error={errors.confirmPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          >
            {loading ? 'Changing Password...' : 'Change Password & Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordRequired;
