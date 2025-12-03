/**
 * Mock Data Generators
 * Functions to generate realistic mock data for testing and development
 */

/**
 * Generate mock invoice data
 * @param {number} count - Number of invoices to generate
 * @returns {Array} Array of invoice objects
 */
export const generateMockInvoices = (count = 20) => {
  const statuses = ['Paid', 'Failed', 'Pending'];
  const programs = [
    'Basketball Junior Boys - Monthly',
    'Basketball Senior Boys - Monthly',
    'Volleyball Junior Girls - Monthly',
    'Volleyball Senior Girls - Monthly'
  ];

  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: `INV-2024-${String(i + 1).padStart(3, '0')}`,
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      description: programs[Math.floor(Math.random() * programs.length)],
      amount: [90.00, 120.00, 180.00, 210.00][Math.floor(Math.random() * 4)],
      status: i < 3 ? statuses[Math.floor(Math.random() * statuses.length)] : 'Paid', // Recent ones might be pending/failed
      downloadUrl: '#'
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
};

/**
 * Generate mock payment methods
 * @returns {Array} Array of payment method objects
 */
export const generateMockPaymentMethods = () => [
  {
    id: 'pm_1',
    type: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'Mastercard',
    last4: '8888',
    expiryMonth: 6,
    expiryYear: 2025,
    isDefault: false
  }
];

/**
 * Generate mock revenue data for charts
 * @param {number} months - Number of months of data
 * @returns {Array} Array of revenue objects by month
 */
export const generateMockRevenue = (months = 12) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return Array.from({ length: months }, (_, i) => {
    const monthIndex = (currentMonth - months + 1 + i + 12) % 12;
    return {
      month: monthNames[monthIndex],
      amount: Math.floor(Math.random() * 5000) + 3000,
      basketball: Math.floor(Math.random() * 2500) + 1500,
      volleyball: Math.floor(Math.random() * 2500) + 1500
    };
  });
};

/**
 * Generate mock users for admin user management
 * @param {number} count - Number of users to generate
 * @returns {Array} Array of user objects
 */
export const generateMockUsers = (count = 30) => {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley', 'Robert', 'Amanda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const roles = ['parent', 'parent', 'parent', 'parent', 'coach']; // 80% parents, 20% coaches

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const isActive = Math.random() > 0.1; // 90% active

    return {
      id: `user_${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      role: role,
      status: isActive ? 'Active' : 'Inactive',
      athleteCount: role === 'parent' ? Math.floor(Math.random() * 3) + 1 : 0,
      sport: role === 'coach' ? (Math.random() > 0.5 ? 'Basketball' : 'Volleyball') : null,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
  });
};

/**
 * Generate mock athlete evaluation history
 * @param {string} athleteId - Athlete ID
 * @param {string} sport - Sport type
 * @param {number} count - Number of evaluations
 * @returns {Array} Array of evaluation objects
 */
export const generateMockEvaluations = (athleteId, sport, count = 5) => {
  const skillCriteria = {
    Basketball: ['Shooting', 'Dribbling', 'Defense', 'Passing', 'IQ'],
    Volleyball: ['Serving', 'Passing', 'Setting', 'Spiking', 'Court Sense']
  };

  const criteria = skillCriteria[sport] || [];

  return Array.from({ length: count }, (_, i) => {
    const daysAgo = i * 14; // Evaluations every 2 weeks
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const ratings = {};
    criteria.forEach(skill => {
      ratings[skill] = Math.floor(Math.random() * 2) + 3; // Random rating between 3-5
    });

    return {
      id: `eval_${athleteId}_${i}`,
      athleteId,
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      ratings,
      notes: i === 0 ? 'Great improvement in recent sessions!' : '',
      coachName: sport === 'Basketball' ? 'Ugur Yildiz' : 'Tuba Yildiz'
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Generate mock financial metrics
 * @returns {object} Financial metrics object
 */
export const generateMockFinancialMetrics = () => ({
  totalRevenue: 156780,
  monthlyRevenue: 12360,
  yearlyRevenue: 148320,
  averageRevenuePerAthlete: 90,
  monthlyRecurringRevenue: 12360,
  activeSubscriptions: 45,
  cancelledSubscriptions: 8,
  churnRate: 15.1,
  retentionRate: 84.9,
  averageSubscriptionDuration: 8.5, // months
  successfulPayments: { count: 142, amount: 12780 },
  failedPayments: { count: 5, amount: 450 },
  pendingPayments: { count: 2, amount: 180 },
  paymentSuccessRate: 96.6,
  totalAthletes: 52,
  revenuePerAthlete: 3015,
  acquisitionCost: 45, // mock AAC
  lifetimeValue: 720, // mock LTV
  ltvAacRatio: 16
});

/**
 * Generate mock session capacity data
 * @returns {Array} Array of session capacity objects
 */
export const generateMockSessionCapacity = () => [
  { session: 'BB Junior Boys', registered: 12, capacity: 20 },
  { session: 'BB Senior Boys', registered: 18, capacity: 20 },
  { session: 'VB Junior Girls', registered: 8, capacity: 20 },
  { session: 'VB Senior Girls', registered: 19, capacity: 20 }
];

/**
 * Generate mock athlete profile data
 * @param {object} basicInfo - Basic athlete info (name, age, etc.)
 * @returns {object} Complete athlete profile
 */
export const generateMockAthleteProfile = (basicInfo) => ({
  ...basicInfo,
  attendanceHistory: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: Math.random() > 0.2 ? 'present' : 'absent'
  })).reverse(),
  attendanceRate: Math.floor(Math.random() * 20) + 80, // 80-100%
  evaluationCount: Math.floor(Math.random() * 8) + 2,
  lastEvaluation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  emergencyContacts: [
    {
      id: 'ec1',
      name: basicInfo.parent,
      phone: basicInfo.phone,
      relationship: 'Parent',
      isPrimary: true
    }
  ],
  medicalHistory: [
    {
      date: '2024-01-15',
      note: basicInfo.medical !== 'None' ? basicInfo.medical : 'No medical concerns',
      type: basicInfo.medical !== 'None' ? 'condition' : 'note'
    }
  ]
});

/**
 * Generate admin metrics data
 */
export const generateAdminMetrics = () => ({
  totalRevenue: 145670,
  revenueGrowth: 12.5,
  activeSubscriptions: 124,
  newSubscriptionsThisWeek: 8,
  totalAthletes: 187,
  totalSessions: 12,
  churnRate: 3.2,
  churnChange: -1.1
});

/**
 * Generate monthly revenue data for the past 12 months
 */
export const generateMonthlyRevenue = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseRevenue = 8000;
  const maxRevenue = 18000;

  return months.map((month, index) => {
    const amount = baseRevenue + Math.floor(Math.random() * 6000) + (index * 300);
    return {
      month,
      amount,
      percentage: Math.round((amount / maxRevenue) * 100)
    };
  });
};

/**
 * Generate random name for mock users
 */
const generateRandomName = () => {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Jennifer', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

/**
 * Get activity message based on type
 */
const getActivityMessage = (type, name = generateRandomName()) => {
  const messages = {
    registration: `${name} registered as a parent`,
    payment: `Payment received from ${name} ($${[90, 120, 135, 180][Math.floor(Math.random() * 4)]}.00)`,
    cancellation: `Subscription cancelled by ${name}`,
    session: `New session "${['Junior Boys Basketball', 'Senior Girls Volleyball', 'Intermediate Boys Basketball'][Math.floor(Math.random() * 3)]}" created`
  };
  return messages[type] || `Activity by ${name}`;
};

/**
 * Generate recent activity feed
 */
export const generateRecentActivity = (count = 20) => {
  const activities = [
    { type: 'registration', icon: 'UserPlus', color: 'blue' },
    { type: 'payment', icon: 'CreditCard', color: 'green' },
    { type: 'cancellation', icon: 'XCircle', color: 'red' },
    { type: 'session', icon: 'Calendar', color: 'purple' }
  ];

  return Array.from({ length: count }, (_, i) => {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const minutesAgo = i * 5 + Math.floor(Math.random() * 5);
    const name = generateRandomName();

    return {
      id: `activity-${i}`,
      type: activity.type,
      icon: activity.icon,
      color: activity.color,
      message: getActivityMessage(activity.type, name),
      timestamp: new Date(Date.now() - minutesAgo * 60000)
    };
  });
};

/**
 * Generate user list for admin
 */
export const generateUsersList = (count = 50) => {
  const roles = ['Parent', 'Coach', 'Admin'];
  const statuses = ['Active', 'Suspended', 'Inactive'];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: generateRandomName(),
    email: `user${i + 1}@example.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    role: roles[i < 40 ? 0 : i < 48 ? 1 : 2], // Mostly parents
    status: statuses[i < 45 ? 0 : i < 48 ? 2 : 1],
    registered: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    subscriptions: i < 40 ? Math.floor(Math.random() * 3) + 1 : 0,
    loginCount: Math.floor(Math.random() * 200) + 10
  })).sort((a, b) => b.registered - a.registered);
};

/**
 * Generate transaction history
 */
export const generateTransactions = (count = 100) => {
  const statuses = ['Paid', 'Failed', 'Refunded'];
  const programs = [
    'Basketball - Junior Boys',
    'Basketball - Senior Boys',
    'Volleyball - Junior Girls',
    'Volleyball - Senior Girls'
  ];

  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: `TXN-2024-${String(i + 1).padStart(5, '0')}`,
      date,
      userName: generateRandomName(),
      description: programs[Math.floor(Math.random() * programs.length)],
      amount: [90, 120, 135, 180][Math.floor(Math.random() * 4)],
      status: i < 95 ? 'Paid' : statuses[Math.floor(Math.random() * 3)],
      paymentMethod: `•••• ${Math.floor(Math.random() * 9000) + 1000}`
    };
  }).sort((a, b) => b.date - a.date);
};
