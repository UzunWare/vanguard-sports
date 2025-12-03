/**
 * Calculation Utility Functions
 * Functions for pricing, discounts, and other business logic calculations
 */

import { PRICING } from './constants';

/**
 * Calculate sibling discount
 * @param {number} athleteCount - Number of athletes
 * @param {number} subtotal - Subtotal before discount
 * @returns {number} Discount amount
 */
export const calculateSiblingDiscount = (athleteCount, subtotal) => {
  return athleteCount > 1 ? subtotal * PRICING.SIBLING_DISCOUNT_RATE : 0;
};

/**
 * Calculate total registration fees
 * @param {number} athleteCount - Number of athletes
 * @param {number} regFeePerAthlete - Registration fee per athlete
 * @returns {number} Total registration fees
 */
export const calculateRegistrationFees = (athleteCount, regFeePerAthlete = PRICING.DEFAULT_REGISTRATION_FEE) => {
  return athleteCount * regFeePerAthlete;
};

/**
 * Calculate monthly subscription total
 * @param {Array} athletes - Array of athlete objects with selectedSessionId
 * @param {Array} sessions - Array of session objects with prices
 * @returns {object} { subtotal, discount, total }
 */
export const calculateMonthlyTotal = (athletes, sessions) => {
  const subtotal = athletes.reduce((sum, athlete) => {
    const session = sessions.find(s => s.id === athlete.selectedSessionId);
    return sum + (session ? session.price : 0);
  }, 0);

  const discount = calculateSiblingDiscount(athletes.length, subtotal);
  const total = subtotal - discount;

  return { subtotal, discount, total };
};

/**
 * Calculate attendance percentage
 * @param {number} presentCount - Number of times present
 * @param {number} totalSessions - Total number of sessions
 * @returns {number} Percentage (0-100)
 */
export const calculateAttendancePercentage = (presentCount, totalSessions) => {
  if (totalSessions === 0) return 0;
  return Math.round((presentCount / totalSessions) * 100);
};

/**
 * Calculate average rating from skill ratings
 * @param {object} ratings - Object with skill: rating pairs
 * @returns {number} Average rating (0-5)
 */
export const calculateAverageRating = (ratings) => {
  const values = Object.values(ratings).filter(v => typeof v === 'number');
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate session capacity percentage
 * @param {number} registered - Number of registered athletes
 * @param {number} capacity - Total capacity
 * @returns {number} Percentage (0-100)
 */
export const calculateCapacityPercentage = (registered, capacity) => {
  if (capacity === 0) return 0;
  return Math.round((registered / capacity) * 100);
};

/**
 * Get age from date of birth
 * @param {string|Date} dob - Date of birth
 * @returns {number} Age in years
 */
export const getAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Filter eligible sessions based on age and gender
 * @param {Array} sessions - Array of session objects
 * @param {string} dob - Date of birth
 * @param {string} gender - Gender ('Male' or 'Female')
 * @returns {Array} Filtered sessions
 */
export const getEligibleSessions = (sessions, dob, gender) => {
  if (!dob || !gender) return [];
  const age = getAge(dob);
  return sessions.filter(s =>
    s.gender === gender && age >= s.minAge && age <= s.maxAge
  );
};

/**
 * Calculate percentage growth
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage growth
 */
export const calculateGrowth = (current, previous) => {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
};

/**
 * Calculate churn rate
 * @param {number} cancelled - Number cancelled
 * @param {number} total - Total subscriptions
 * @returns {number} Churn rate percentage
 */
export const calculateChurnRate = (cancelled, total) => {
  if (total === 0) return 0;
  return parseFloat(((cancelled / total) * 100).toFixed(1));
};

/**
 * Calculate average revenue per user (ARPU)
 * @param {number} totalRevenue - Total revenue
 * @param {number} totalUsers - Total users
 * @returns {number} ARPU
 */
export const calculateARPU = (totalRevenue, totalUsers) => {
  if (totalUsers === 0) return 0;
  return parseFloat((totalRevenue / totalUsers).toFixed(2));
};

/**
 * Calculate lifetime value (LTV)
 * @param {number} avgMonthlyRevenue - Average monthly revenue per user
 * @param {number} avgLifetimeMonths - Average lifetime in months
 * @returns {number} LTV
 */
export const calculateLTV = (avgMonthlyRevenue, avgLifetimeMonths) => {
  return parseInt((avgMonthlyRevenue * avgLifetimeMonths).toFixed(0));
};
