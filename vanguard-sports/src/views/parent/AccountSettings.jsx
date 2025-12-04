import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Check, Loader, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { isValidEmail, validatePasswordStrength } from '../../utils/validators';
import { formatPhone } from '../../utils/formatters';
import authService from '../../services/authService';
import userService from '../../services/userService';

/**
 * AccountSettings Component
 * Parent account management page with profile editing and security settings
 */
const AccountSettings = ({ user, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile'); // profile | security
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityErrors, setSecurityErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  const showNotificationMessage = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate profile form
  const validateProfile = () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!isValidEmail(profileData.email)) errors.email = 'Invalid email';
    if (profileData.phone && profileData.phone.length < 14) errors.phone = 'Invalid phone';

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate security form
  const validateSecurity = () => {
    const errors = {};
    if (!securityData.currentPassword) errors.currentPassword = 'Current password required';
    if (!securityData.newPassword) errors.newPassword = 'New password required';
    if (securityData.newPassword !== securityData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    const strength = validatePasswordStrength(securityData.newPassword);
    if (strength.strength === 'weak') {
      errors.newPassword = strength.message;
    }

    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile save
  const handleProfileSave = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      // Split name into first and last name
      const [firstName, ...lastNameParts] = profileData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName; // If no last name, use first name

      const response = await userService.updateProfile({
        firstName,
        lastName,
        phone: profileData.phone
      });

      // Update user object with new data
      const updatedUser = {
        ...user,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        name: `${response.user.firstName} ${response.user.lastName}`,
        phone: response.user.phone
      };

      onUpdate(updatedUser);
      localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
      showNotificationMessage('Profile updated successfully!');
    } catch (error) {
      showNotificationMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!validateSecurity()) return;

    setLoading(true);
    try {
      await authService.changePassword(
        securityData.currentPassword,
        securityData.newPassword
      );
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength(null);
      showNotificationMessage('Password changed successfully!');
    } catch (error) {
      showNotificationMessage(error.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password strength check
  const handlePasswordInput = (value) => {
    setSecurityData({ ...securityData, newPassword: value });
    setPasswordStrength(validatePasswordStrength(value));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
            {typeof notification === 'object' && notification.type === 'error' ? (
              <AlertTriangle className="text-red-400" size={20} />
            ) : typeof notification === 'object' && notification.type === 'warning' ? (
              <Info className="text-yellow-400" size={20} />
            ) : (
              <Check className="text-green-400" size={20} />
            )}
            {typeof notification === 'object' ? notification.message : notification}
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
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'security'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lock size={16} className="inline mr-2" />
            Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="John Doe"
                icon={User}
                error={profileErrors.name}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="john@example.com"
                icon={Mail}
                error={profileErrors.email}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: formatPhone(e.target.value) })}
                placeholder="(555) 123-4567"
                icon={Phone}
                error={profileErrors.phone}
                maxLength={14}
              />
            </div>

            <div className="mt-8 flex gap-4">
              <Button onClick={handleProfileSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Change Password</h2>
            <p className="text-slate-500 text-sm mb-6">
              Update your password to keep your account secure
            </p>

            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                icon={Lock}
                error={securityErrors.currentPassword}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={securityData.newPassword}
                onChange={(e) => handlePasswordInput(e.target.value)}
                placeholder="Enter new password"
                icon={Lock}
                error={securityErrors.newPassword}
                required
              />

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Password Strength:</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.strength === 'strong' ? 'text-green-600' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 'strong' ? 'bg-green-500 w-full' :
                        passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        'bg-red-500 w-1/3'
                      }`}
                    ></div>
                  </div>
                </div>
              )}

              <Input
                label="Confirm New Password"
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                icon={Lock}
                error={securityErrors.confirmPassword}
                required
              />
            </div>

            <div className="mt-8 flex gap-4">
              <Button onClick={handlePasswordChange} disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Change Password
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
