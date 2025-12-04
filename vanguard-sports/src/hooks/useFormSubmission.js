import { useState, useCallback } from 'react';

/**
 * Custom hook to handle form submissions with duplicate prevention
 *
 * This hook provides a reliable way to prevent duplicate form submissions
 * by managing a submission state and ensuring only one submission is
 * processed at a time.
 *
 * @param {Function} submitHandler - Async function to execute on submit
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback to run on successful submission
 * @param {Function} options.onError - Callback to run on submission error
 * @param {boolean} options.resetOnSuccess - Whether to reset state on success (default: true)
 * @returns {Object} - { isSubmitting, handleSubmit, reset }
 *
 * @example
 * const { isSubmitting, handleSubmit } = useFormSubmission(
 *   async (formData) => {
 *     return await api.submitForm(formData);
 *   },
 *   {
 *     onSuccess: (result) => showNotification('Form submitted successfully!'),
 *     onError: (error) => showNotification(error.message)
 *   }
 * );
 *
 * // In your component:
 * <button onClick={() => handleSubmit(formData)} disabled={isSubmitting}>
 *   {isSubmitting ? 'Submitting...' : 'Submit'}
 * </button>
 */
export const useFormSubmission = (submitHandler, options = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onSuccess, onError, resetOnSuccess = true } = options;

  const handleSubmit = useCallback(async (...args) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitHandler(...args);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    } finally {
      if (resetOnSuccess) {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, submitHandler, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  return { isSubmitting, handleSubmit, reset };
};

export default useFormSubmission;
