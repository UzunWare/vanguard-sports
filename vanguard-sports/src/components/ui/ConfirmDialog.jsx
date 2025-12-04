import React from 'react';
import Button from './Button';
import Card from './Card';

/**
 * ConfirmDialog Component
 * Professional confirmation modal to replace window.confirm()
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {function} props.onClose - Function to call when canceling
 * @param {function} props.onConfirm - Function to call when confirming
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message/description
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.variant - Button variant for confirm action (primary|danger) (default: "danger")
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmDialog;
