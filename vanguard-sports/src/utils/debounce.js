/**
 * Debounce utility function
 * Delays the execution of a function until after a specified wait time has elapsed
 * since the last time it was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay (default: 300ms)
 * @returns {Function} - The debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   performSearch(query);
 * }, 500);
 *
 * // Will only execute after user stops typing for 500ms
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle utility function
 * Ensures that a function is called at most once per specified time interval.
 * Unlike debounce, throttle will execute the function immediately and then
 * prevent subsequent calls until the interval has passed.
 *
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time interval in milliseconds (default: 300ms)
 * @returns {Function} - The throttled function
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 *
 * // Will execute at most once every 100ms
 * window.addEventListener('scroll', throttledScroll);
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default { debounce, throttle };
