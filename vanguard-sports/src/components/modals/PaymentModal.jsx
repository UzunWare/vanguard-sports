import React, { useState } from 'react';
import { X, CreditCard, Lock, Loader } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * PaymentModal Component
 * Modal for updating payment information
 *
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal
 * @param {function} props.onUpdate - Function called after successful update
 */
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

export default PaymentModal;
