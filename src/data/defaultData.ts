import { InvestmentPlan, PaymentMethod, TaskQuiz, AppSettings, User } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'Invest in Arm',
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',
  minDeposit: 300,
  minWithdrawal: 300,
  level1CommissionPercent: 10,
  level2CommissionPercent: 5,
  level3CommissionPercent: 2,
  adminEmail: 'support@investinarm.com',
  adminSecretPassword: 'Mahar11223344',
  announcementText: '🚀 Welcome to Invest in Arm! Activate a verified micro-investment plan to unlock high-yield daily tasks with guaranteed cash profits. Instant 24/7 withdrawals!',
  enableQuizzes: true,
  supportPhone: '+92 345 9876543',
  supportTelegram: 'https://t.me/InvestInArmOfficial',
  supportWhatsApp: '+92 345 9876543',
};

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan-starter-500',
    name: 'Bronze Starter Plan',
    tagline: 'Entry tier for daily task earners (Must be activated to unlock math tasks)',
    badge: 'Starter Choice',
    price: 500,
    dailyMinEarn: 46,
    dailyMaxEarn: 46,
    dailyTaskCount: 3,
    validityDays: 30,
    totalEstimatedReturn: 1380,
    colorTheme: 'bronze',
    features: [
      '3 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 46 Guaranteed',
      '30-Day Contract (Profit: Rs. 880)',
      'Total Return: Rs. 1,380 (500 + 880)',
      'Level 1 (10%) Team Commission',
      'Instant 24/7 Gateway Cashout'
    ],
    isPopular: false,
    status: 'active'
  },
  {
    id: 'plan-silver-1500',
    name: 'Silver Standard Plan',
    tagline: 'Steady daily earnings with 5 quick daily math quizzes',
    badge: 'Most Popular',
    price: 1500,
    dailyMinEarn: 146,
    dailyMaxEarn: 146,
    dailyTaskCount: 5,
    validityDays: 30,
    totalEstimatedReturn: 4380,
    colorTheme: 'amber',
    features: [
      '5 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 146 Guaranteed',
      '30-Day Contract (Profit: Rs. 2,880)',
      'Total Return: Rs. 4,380 (1,500 + 2,880)',
      'Full 3-Tier Referral Matrix (10%, 5%, 2%)',
      'Priority Admin Approval Queue'
    ],
    isPopular: true,
    status: 'active'
  },
  {
    id: 'plan-gold-3000',
    name: 'Gold Executive Plan',
    tagline: 'High volume task package with rapid daily returns',
    badge: 'Best Value',
    price: 3000,
    dailyMinEarn: 270,
    dailyMaxEarn: 270,
    dailyTaskCount: 6,
    validityDays: 30,
    totalEstimatedReturn: 8100,
    colorTheme: 'gold',
    features: [
      '6 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 270 Flat',
      '30-Day Contract (Profit: Rs. 5,100)',
      'Total Return: Rs. 8,100 (3,000 + 5,100)',
      'Direct In-App Live Support Priority',
      'Zero Withdrawal Fees'
    ],
    isPopular: false,
    status: 'active'
  },
  {
    id: 'plan-diamond-5000',
    name: 'Diamond Master Plan',
    tagline: 'Rs. 5,000 investment yields Rs. 465 daily (Rs. 13,950 total return)',
    badge: 'Recommended',
    price: 5000,
    dailyMinEarn: 465,
    dailyMaxEarn: 465,
    dailyTaskCount: 8,
    validityDays: 30,
    totalEstimatedReturn: 13950,
    colorTheme: 'diamond',
    features: [
      '8 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 465 Guaranteed',
      '30-Day Contract (Profit: Rs. 8,950)',
      'Total Return: Rs. 13,950 (5,000 + 8,950)',
      'VIP Fast-Track Approval Lane',
      'Multi-Level Referral Multipliers'
    ],
    isPopular: false,
    status: 'active'
  },
  {
    id: 'plan-obsidian-10000',
    name: 'VIP Crown Obsidian',
    tagline: 'Premier tier portfolio with maximum daily math earning capacity',
    badge: 'VIP Elite',
    price: 10000,
    dailyMinEarn: 999,
    dailyMaxEarn: 999,
    dailyTaskCount: 10,
    validityDays: 30,
    totalEstimatedReturn: 29970,
    colorTheme: 'obsidian',
    features: [
      '10 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 999 Guaranteed',
      '30-Day Contract (Profit: Rs. 19,970)',
      'Total Return: Rs. 29,970 (10,000 + 19,970)',
      'Instant Auto-Approved Withdrawals',
      'Dedicated Account Concierge'
    ],
    isPopular: false,
    status: 'active'
  },
  {
    id: 'plan-royal-30000',
    name: 'Royal Apex Tier 30K',
    tagline: 'High-capital institutional investment yield for premier partners',
    badge: 'Royal Partner',
    price: 30000,
    dailyMinEarn: 2599,
    dailyMaxEarn: 2599,
    dailyTaskCount: 12,
    validityDays: 30,
    totalEstimatedReturn: 77970,
    colorTheme: 'royal',
    features: [
      '12 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 2,599 Guaranteed',
      '30-Day Contract (Profit: Rs. 47,970)',
      'Total Return: Rs. 77,970 (30,000 + 47,970)',
      'Direct Instant Payout Window',
      'Full Multi-Level VIP Commission Booster'
    ],
    isPopular: false,
    status: 'active'
  },
  {
    id: 'plan-sovereign-50000',
    name: 'Sovereign Imperial Titan 50K',
    tagline: 'Maximum platform investment capacity with maximum daily yield',
    badge: 'Imperial Titan',
    price: 50000,
    dailyMinEarn: 4999,
    dailyMaxEarn: 4999,
    dailyTaskCount: 15,
    validityDays: 30,
    totalEstimatedReturn: 149970,
    colorTheme: 'sovereign',
    features: [
      '15 Daily Math Quiz Tasks',
      'Daily Earnings: Rs. 4,999 Flat',
      '30-Day Contract (Profit: Rs. 99,970)',
      'Total Return: Rs. 149,970 (50,000 + 99,970)',
      'Direct Zero-Wait Instant Bank & TRC20 Dispatches',
      'Exclusive 15% Maximum Level-1 Override'
    ],
    isPopular: false,
    status: 'active'
  }
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-jazzcash-official',
    name: 'JazzCash Fast Transfer',
    type: 'jazzcash',
    accountTitle: 'Tasleem bibi',
    accountNumber: '03087348367',
    instructions: 'Send exact amount via JazzCash App or *786# to 03087348367 (Tasleem bibi). Save transaction receipt and input the 11 or 12-digit TID / TRX ID below for instant verification.',
    minDeposit: 300,
    maxDeposit: 100000,
    isActive: true
  }
];

export const DEFAULT_QUIZZES: TaskQuiz[] = [
  {
    id: 'task-math-1',
    title: 'Speed Mental Arithmetic',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Solve this fast mental arithmetic problem to verify daily task completion.',
    quizData: {
      question: 'Calculate: (15 × 8) + 30 = ?',
      options: ['140', '150', '160', '170'],
      correctIndex: 1,
      explanation: '15 × 8 = 120; 120 + 30 = 150.'
    }
  },
  {
    id: 'task-math-2',
    title: 'Investment Profit Calculation',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Calculate the accurate 30-day profit on the Diamond 5,000 plan.',
    quizData: {
      question: 'On Diamond Rs. 5,000 plan (Rs. 465/day for 30 days = Rs. 13,950 return), what is your net profit?',
      options: ['Rs. 7,950', 'Rs. 8,950', 'Rs. 9,950', 'Rs. 10,950'],
      correctIndex: 1,
      explanation: 'Total return Rs. 13,950 minus deposit Rs. 5,000 = Rs. 8,950 net profit.'
    }
  },
  {
    id: 'task-math-3',
    title: 'BODMAS Order of Operations',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Apply basic algebraic order of operations to find the result.',
    quizData: {
      question: 'Solve: 120 ÷ 4 + (25 × 2) = ?',
      options: ['75', '80', '85', '90'],
      correctIndex: 1,
      explanation: '120 ÷ 4 = 30; 25 × 2 = 50; 30 + 50 = 80.'
    }
  },
  {
    id: 'task-math-4',
    title: 'Daily Task Earnings Calculation',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Compute accumulated daily earnings over a 30-day cycle.',
    quizData: {
      question: 'If the Silver plan yields Rs. 146 daily for 30 days, what is the 30-day total return?',
      options: ['Rs. 4,180', 'Rs. 4,380', 'Rs. 4,580', 'Rs. 4,780'],
      correctIndex: 1,
      explanation: '146 × 30 = Rs. 4,380 total return.'
    }
  },
  {
    id: 'task-math-5',
    title: 'Fast Percentage Calculation',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Solve the quick percentage formula.',
    quizData: {
      question: 'What is 20% of Rs. 1,500?',
      options: ['Rs. 250', 'Rs. 300', 'Rs. 350', 'Rs. 400'],
      correctIndex: 1,
      explanation: '1,500 × 0.20 = Rs. 300.'
    }
  },
  {
    id: 'task-math-6',
    title: 'Algebraic Puzzle Challenge',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Solve for the correct value using basic arithmetic bracket rules.',
    quizData: {
      question: 'Solve: (45 + 55) × 3 - 50 = ?',
      options: ['220', '250', '270', '300'],
      correctIndex: 1,
      explanation: '(45 + 55) = 100; 100 × 3 = 300; 300 - 50 = 250.'
    }
  },
  {
    id: 'task-math-7',
    title: 'Square Roots & Sums',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Identify the square root sum correctly.',
    quizData: {
      question: 'What is √144 + 18 = ?',
      options: ['28', '30', '32', '34'],
      correctIndex: 1,
      explanation: '√144 = 12; 12 + 18 = 30.'
    }
  },
  {
    id: 'task-math-8',
    title: 'Referral Commission Math',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Calculate 10% Level-1 direct referral bonus.',
    quizData: {
      question: 'Your referral activates a Rs. 3,000 plan. At 10% commission, how much do you earn?',
      options: ['Rs. 200', 'Rs. 250', 'Rs. 300', 'Rs. 350'],
      correctIndex: 2,
      explanation: '10% of Rs. 3,000 = Rs. 300 instant commission.'
    }
  },
  {
    id: 'task-math-9',
    title: 'Double Digit Multiplication',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Quick mental multiplication check.',
    quizData: {
      question: 'Calculate: 18 × 15 = ?',
      options: ['250', '270', '280', '290'],
      correctIndex: 1,
      explanation: '18 × 10 = 180; 18 × 5 = 90; 180 + 90 = 270.'
    }
  },
  {
    id: 'task-math-10',
    title: 'Division & Simplification',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Solve simple integer division.',
    quizData: {
      question: 'Divide: 1,440 ÷ 12 = ?',
      options: ['110', '120', '130', '140'],
      correctIndex: 1,
      explanation: '1,440 ÷ 12 = 120.'
    }
  },
  {
    id: 'task-math-11',
    title: 'Currency Equivalence',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Calculate USDT to local fiat equivalence.',
    quizData: {
      question: 'If 1 USDT = Rs. 280, what is the value of 5 USDT?',
      options: ['Rs. 1,350', 'Rs. 1,400', 'Rs. 1,450', 'Rs. 1,500'],
      correctIndex: 1,
      explanation: '5 × 280 = Rs. 1,400.'
    }
  },
  {
    id: 'task-math-12',
    title: 'Combined Operations Challenge',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Fast addition, multiplication, and subtraction test.',
    quizData: {
      question: 'Solve: 750 - (60 × 5) + 50 = ?',
      options: ['480', '500', '520', '550'],
      correctIndex: 1,
      explanation: '60 × 5 = 300; 750 - 300 = 450; 450 + 50 = 500.'
    }
  },
  {
    id: 'task-math-13',
    title: 'Daily Return on Diamond Plan',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Calculate the daily return on Diamond Rs. 5,000 plan.',
    quizData: {
      question: 'On Diamond Rs. 5,000 plan earning Rs. 465 daily for 30 days, what is your total return?',
      options: ['Rs. 12,950', 'Rs. 13,950', 'Rs. 14,950', 'Rs. 15,950'],
      correctIndex: 1,
      explanation: '465 × 30 = Rs. 13,950 total return (Rs. 8,950 net profit).'
    }
  },
  {
    id: 'task-math-14',
    title: 'Fraction and Percentage',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Convert simple fraction to percentage.',
    quizData: {
      question: 'What is 3/4 converted to a percentage?',
      options: ['65%', '70%', '75%', '80%'],
      correctIndex: 2,
      explanation: '3 ÷ 4 = 0.75 = 75%.'
    }
  },
  {
    id: 'task-math-15',
    title: 'Rapid Arithmetic Sum',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Easy',
    description: 'Solve the quick arithmetic sequence.',
    quizData: {
      question: 'Calculate: 320 + 480 - 150 = ?',
      options: ['620', '650', '680', '700'],
      correctIndex: 1,
      explanation: '320 + 480 = 800; 800 - 150 = 650.'
    }
  },
  {
    id: 'task-math-16',
    title: 'Multi-Tier Commission Matrix',
    type: 'quiz',
    category: 'Math Quiz Challenge',
    reward: 27,
    difficulty: 'Medium',
    description: 'Calculate 5% Level-2 referral commission.',
    quizData: {
      question: 'A Level-2 team member activates a Rs. 10,000 plan. At 5%, what is your bonus?',
      options: ['Rs. 400', 'Rs. 500', 'Rs. 600', 'Rs. 700'],
      correctIndex: 1,
      explanation: '5% of Rs. 10,000 = Rs. 500 passive commission.'
    }
  }
];

export const MOCK_ACTIVITY_FEED = [
  { id: 'act-1', text: 'Member 0301***912 just withdrew Rs. 3,500 via Easypaisa', time: '1m ago', type: 'withdraw' },
  { id: 'act-2', text: 'Member 0345***443 activated Diamond Master Plan (Rs. 5,000)', time: '3m ago', type: 'plan' },
  { id: 'act-3', text: 'Member 0312***821 received Rs. 500 Level-1 Referral Bonus', time: '5m ago', type: 'bonus' },
  { id: 'act-4', text: 'Member 0333***719 just withdrew Rs. 10,000 via JazzCash', time: '7m ago', type: 'withdraw' },
  { id: 'act-5', text: 'Member 0321***650 activated VIP Crown Obsidian Plan', time: '11m ago', type: 'plan' },
  { id: 'act-6', text: 'Member 0308***332 completed 5/5 math tasks (Rs. 146 credited)', time: '14m ago', type: 'task' },
  { id: 'act-7', text: 'Member 0340***119 deposited Rs. 3,000 via Bank Transfer (Meezan)', time: '18m ago', type: 'deposit' },
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-mahar-owner',
    fullName: 'Mahar Madni',
    phone: '03087348367',
    email: '58@gmail.com',
    password: 'Mahar11223344',
    referralCode: 'ARM7788',
    balance: 500,
    totalDeposited: 1500,
    totalWithdrawn: 0,
    totalProfitEarned: 292,
    referralEarnings: 150,
    activePlanId: 'plan-silver-1500',
    activePlanName: 'Silver Standard Plan',
    planActivatedAt: '2026-11-01T00:00:00.000Z',
    planExpiresAt: '2026-12-01T00:00:00.000Z',
    dailyTasksCompletedToday: 0,
    lastTaskDate: new Date().toISOString().split('T')[0],
    role: 'user',
    createdAt: '2026-11-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'user-mahar-full-email',
    fullName: 'Mahar Madni',
    phone: '03087348367',
    email: 'maharmadni058@gmail.com',
    password: 'Mahar11223344',
    referralCode: 'ARM058',
    balance: 500,
    totalDeposited: 1500,
    totalWithdrawn: 0,
    totalProfitEarned: 292,
    referralEarnings: 150,
    activePlanId: 'plan-silver-1500',
    activePlanName: 'Silver Standard Plan',
    planActivatedAt: '2026-11-01T00:00:00.000Z',
    planExpiresAt: '2026-12-01T00:00:00.000Z',
    dailyTasksCompletedToday: 0,
    lastTaskDate: new Date().toISOString().split('T')[0],
    role: 'user',
    createdAt: '2026-11-01T00:00:00.000Z',
    status: 'active'
  }
];

