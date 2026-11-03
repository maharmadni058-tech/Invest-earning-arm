import {
  User,
  InvestmentPlan,
  PaymentMethod,
  Deposit,
  Withdrawal,
  TaskQuiz,
  Transaction,
  AppSettings
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_PLANS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_QUIZZES
} from '../data/defaultData';

const STORAGE_KEYS = {
  USERS: 'invest_in_arm_users_v1',
  CURRENT_USER_ID: 'invest_in_arm_current_user_id_v1',
  PLANS: 'invest_in_arm_plans_v1',
  PAYMENT_METHODS: 'invest_in_arm_payment_methods_v1',
  DEPOSITS: 'invest_in_arm_deposits_v1',
  WITHDRAWALS: 'invest_in_arm_withdrawals_v1',
  QUIZZES: 'invest_in_arm_quizzes_v1',
  TRANSACTIONS: 'invest_in_arm_transactions_v1',
  SETTINGS: 'invest_in_arm_settings_v1',
  ADMIN_LOGGED_IN: 'invest_in_arm_admin_session_v1',
};

// No demo users by default - real users will register
const SEED_USERS: User[] = [];

const SEED_TRANSACTIONS: Transaction[] = [];

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Storage notify error', err);
      }
    });
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
    }

    // Clean up any legacy demo users from localStorage so the user panel is clean
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === 'user-demo-1' || currentId === 'user-ref-1' || currentId === 'user-ref-2') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }

    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    } else {
      try {
        const usersList: User[] = JSON.parse(storedUsers);
        const filtered = usersList.filter(
          u => u.id !== 'user-demo-1' && u.id !== 'user-ref-1' && u.id !== 'user-ref-2'
        );
        if (filtered.length !== usersList.length) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
        }
      } catch {}
    }

    const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!storedTxs) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    } else {
      try {
        const txList: Transaction[] = JSON.parse(storedTxs);
        const filteredTx = txList.filter(t => t.userId !== 'user-demo-1');
        if (filteredTx.length !== txList.length) {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTx));
        }
      } catch {}
    }
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
  }

  // --- PLANS ---
  public getPlans(): InvestmentPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_PLANS;
  }

  public savePlans(plans: InvestmentPlan[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    this.notify();
  }

  public updatePlan(updated: InvestmentPlan): void {
    const plans = this.getPlans().map(p => (p.id === updated.id ? updated : p));
    this.savePlans(plans);
  }

  // --- PAYMENT METHODS ---
  public getPaymentMethods(): PaymentMethod[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_PAYMENT_METHODS;
  }

  public savePaymentMethods(methods: PaymentMethod[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
    this.notify();
  }

  public updatePaymentMethod(updated: PaymentMethod): void {
    const methods = this.getPaymentMethods().map(m => (m.id === updated.id ? updated : m));
    this.savePaymentMethods(methods);
  }

  // --- QUIZZES ---
  public getQuizzes(): TaskQuiz[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_QUIZZES;
  }

  // --- USERS ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch {}
    return SEED_USERS;
  }

  public saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  public getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = this.getUsers();
    const user = users.find(u => u.id === currentId);
    if (!user) return null;

    // Check daily task reset
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastTaskDate !== todayStr) {
      user.dailyTasksCompletedToday = 0;
      user.lastTaskDate = todayStr;
      this.updateUser(user);
    }

    return user;
  }

  public updateUser(updatedUser: User): void {
    const users = this.getUsers().map(u => (u.id === updatedUser.id ? updatedUser : u));
    this.saveUsers(users);
  }

  public setCurrentUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    this.notify();
  }

  public login(phoneOrEmail: string, password?: string): { success: boolean; message: string; user?: User } {
    const clean = phoneOrEmail.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(
      u => u.phone.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean)
    );

    if (!user) {
      return { success: false, message: 'Account not found. Please register a new account.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Invalid password. Please check and try again.' };
    }

    this.setCurrentUserId(user.id);
    return { success: true, message: 'Login successful!', user };
  }

  public register(data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    referralCode?: string;
  }): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanPhone = data.phone.trim();
    if (users.some(u => u.phone === cleanPhone)) {
      return { success: false, message: 'An account with this phone number already exists. Please login.' };
    }

    // Generate unique referral code
    const generatedCode = 'ARM' + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split('T')[0];

    // Find referred by user
    let referredByCode = data.referralCode?.trim().toUpperCase();
    if (referredByCode) {
      const refUser = users.find(u => u.referralCode === referredByCode);
      if (!refUser) {
        referredByCode = undefined; // Invalid code, ignored
      }
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      fullName: data.fullName.trim() || 'Investor',
      phone: cleanPhone,
      email: data.email?.trim() || '',
      password: data.password || 'password123',
      referralCode: generatedCode,
      referredBy: referredByCode,
      balance: 10, // Welcome signup bonus Rs. 10
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

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUserId(newUser.id);

    // Add welcome bonus transaction
    this.addTransaction({
      userId: newUser.id,
      type: 'admin_adjustment',
      amount: 10,
      title: 'Welcome Bonus Credited',
      description: 'Rs. 10 instant registration reward credited to balance',
      status: 'completed'
    });

    return { success: true, message: 'Account registered successfully with Rs. 10 welcome bonus!', user: newUser };
  }

  public logout(): void {
    this.setCurrentUserId(null);
  }

  // --- DEPOSITS ---
  public getDeposits(): Deposit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        id: 'dep-seed-1',
        userId: 'user-demo-1',
        userName: 'Ali Raza Khan',
        userPhone: '03001234567',
        planId: 'plan-diamond-5000',
        planName: 'Diamond Master Plan',
        amount: 5000,
        paymentMethodId: 'pm-easypaisa-official',
        paymentMethodName: 'Easypaisa Direct Account',
        paymentType: 'easypaisa',
        transactionId: 'EP-98442019',
        senderAccountNumber: '03001234567',
        status: 'approved',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        reviewedAt: new Date(Date.now() - 4 * 86400000 + 900000).toISOString()
      }
    ];
  }

  public saveDeposits(deposits: Deposit[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
    this.notify();
  }

  public createDeposit(depositData: Omit<Deposit, 'id' | 'status' | 'createdAt'>): Deposit {
    const deposits = this.getDeposits();
    const newDeposit: Deposit = {
      ...depositData,
      id: 'dep-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    deposits.unshift(newDeposit);
    this.saveDeposits(deposits);

    this.addTransaction({
      userId: depositData.userId,
      type: 'deposit',
      amount: depositData.amount,
      title: 'Deposit Request Submitted',
      description: `Waiting for admin approval (${depositData.paymentMethodName}, TRX: ${depositData.transactionId})`,
      status: 'pending'
    });

    return newDeposit;
  }

  public approveDeposit(depositId: string): void {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'approved';
    deposit.reviewedAt = new Date().toISOString();
    this.saveDeposits(deposits);

    // Credit user
    const users = this.getUsers();
    const user = users.find(u => u.id === deposit.userId);
    if (user) {
      user.balance += deposit.amount;
      user.totalDeposited += deposit.amount;
      this.updateUser(user);

      // Auto-activate plan if selected during deposit
      if (deposit.planId) {
        this.activatePlan(user.id, deposit.planId, true);
      }
    }

    // Update transaction status
    const txs = this.getTransactions();
    const tx = txs.find(t => t.userId === deposit.userId && t.type === 'deposit' && t.status === 'pending');
    if (tx) {
      tx.status = 'completed';
      tx.title = 'Deposit Approved & Added';
      tx.description = `Rs. ${deposit.amount.toLocaleString()} credited to wallet. TRX: ${deposit.transactionId}`;
      this.saveTransactions(txs);
    } else {
      this.addTransaction({
        userId: deposit.userId,
        type: 'deposit',
        amount: deposit.amount,
        title: 'Deposit Approved & Added',
        description: `Rs. ${deposit.amount.toLocaleString()} credited to wallet. TRX: ${deposit.transactionId}`,
        status: 'completed'
      });
    }

    this.notify();
  }

  public rejectDeposit(depositId: string, reason?: string): void {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'rejected';
    deposit.reviewedAt = new Date().toISOString();
    deposit.notes = reason || 'Payment could not be verified on financial statement.';
    this.saveDeposits(deposits);

    this.addTransaction({
      userId: deposit.userId,
      type: 'deposit',
      amount: deposit.amount,
      title: 'Deposit Rejected',
      description: reason || 'Transaction ID not found or mismatched.',
      status: 'rejected'
    });

    this.notify();
  }

  // --- WITHDRAWALS ---
  public getWithdrawals(): Withdrawal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        id: 'wd-seed-1',
        userId: 'user-demo-1',
        userName: 'Ali Raza Khan',
        userPhone: '03001234567',
        amount: 3500,
        paymentMethodType: 'easypaisa',
        accountTitle: 'Ali Raza Khan',
        accountNumber: '03001234567',
        status: 'approved',
        fee: 0,
        netAmount: 3500,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        reviewedAt: new Date(Date.now() - 2 * 86400000 + 1200000).toISOString()
      }
    ];
  }

  public saveWithdrawals(withdrawals: Withdrawal[]): void {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
    this.notify();
  }

  public createWithdrawal(data: {
    userId: string;
    userName: string;
    userPhone: string;
    amount: number;
    paymentMethodType: PaymentMethod['type'];
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }): { success: boolean; message: string; withdrawal?: Withdrawal } {
    const settings = this.getSettings();
    if (data.amount < settings.minWithdrawal) {
      return {
        success: false,
        message: `Minimum cashout amount is ${settings.currencySymbol} ${settings.minWithdrawal}.`
      };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found' };

    if (user.balance < data.amount) {
      return { success: false, message: 'Insufficient wallet balance.' };
    }

    // Deduct balance upfront
    user.balance -= data.amount;
    this.updateUser(user);

    const withdrawals = this.getWithdrawals();
    const newWithdrawal: Withdrawal = {
      ...data,
      id: 'wd-' + Date.now(),
      status: 'pending',
      fee: 0,
      netAmount: data.amount,
      createdAt: new Date().toISOString()
    };

    withdrawals.unshift(newWithdrawal);
    this.saveWithdrawals(withdrawals);

    this.addTransaction({
      userId: data.userId,
      type: 'withdrawal',
      amount: -data.amount,
      title: 'Withdrawal Processing',
      description: `Request for Rs. ${data.amount.toLocaleString()} sent to ${data.paymentMethodType.toUpperCase()} (${data.accountNumber}).`,
      status: 'pending'
    });

    return {
      success: true,
      message: 'Withdrawal request submitted! Payout will be sent within 15-30 minutes.',
      withdrawal: newWithdrawal
    };
  }

  public approveWithdrawal(withdrawalId: string, remarks?: string): void {
    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    wd.status = 'approved';
    wd.reviewedAt = new Date().toISOString();
    wd.remarks = remarks || 'Successfully transferred via Gateway';
    this.saveWithdrawals(withdrawals);

    const users = this.getUsers();
    const user = users.find(u => u.id === wd.userId);
    if (user) {
      user.totalWithdrawn += wd.amount;
      this.updateUser(user);
    }

    this.addTransaction({
      userId: wd.userId,
      type: 'withdrawal',
      amount: -wd.amount,
      title: 'Withdrawal Completed & Dispatched',
      description: `Transferred Rs. ${wd.amount.toLocaleString()} to ${wd.paymentMethodType.toUpperCase()} ${wd.accountNumber}.`,
      status: 'completed'
    });

    this.notify();
  }

  public rejectWithdrawal(withdrawalId: string, reason?: string): void {
    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    wd.status = 'rejected';
    wd.reviewedAt = new Date().toISOString();
    wd.remarks = reason || 'Incorrect account title / account number.';
    this.saveWithdrawals(withdrawals);

    // Refund user balance
    const users = this.getUsers();
    const user = users.find(u => u.id === wd.userId);
    if (user) {
      user.balance += wd.amount;
      this.updateUser(user);
    }

    this.addTransaction({
      userId: wd.userId,
      type: 'admin_adjustment',
      amount: wd.amount,
      title: 'Withdrawal Refunded',
      description: `Rs. ${wd.amount.toLocaleString()} returned to wallet. Reason: ${reason || 'Details mismatched'}.`,
      status: 'completed'
    });

    this.notify();
  }

  // --- PLAN ACTIVATION & MULTI-TIER COMMISSIONS ---
  public activatePlan(userId: string, planId: string, payFromBalance = true): { success: boolean; message: string } {
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, message: 'Plan not found.' };

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    if (payFromBalance) {
      if (user.balance < plan.price) {
        return {
          success: false,
          message: `Insufficient balance. Please deposit at least Rs. ${(plan.price - user.balance).toLocaleString()} to activate this plan.`
        };
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

    this.updateUser(user);

    this.addTransaction({
      userId: user.id,
      type: 'plan_activation',
      amount: -plan.price,
      title: `${plan.name} Activated`,
      description: `30-Day contract started. Daily yield: Rs. ${plan.dailyMinEarn} across ${plan.dailyTaskCount} math tasks.`,
      status: 'completed'
    });

    // DISTRIBUTE 3-TIER REFERRAL COMMISSIONS!
    this.distributeReferralCommissions(user, plan);

    this.notify();
    return { success: true, message: `Congratulations! ${plan.name} is now active. Daily tasks are unlocked!` };
  }

  private distributeReferralCommissions(investor: User, plan: InvestmentPlan): void {
    if (!investor.referredBy) return;

    const settings = this.getSettings();
    const users = this.getUsers();

    // Level 1 Referrer
    const level1User = users.find(u => u.referralCode === investor.referredBy);
    if (level1User) {
      const bonus1 = (plan.price * settings.level1CommissionPercent) / 100;
      level1User.balance += bonus1;
      level1User.referralEarnings += bonus1;
      this.updateUser(level1User);

      this.addTransaction({
        userId: level1User.id,
        type: 'referral_bonus',
        amount: bonus1,
        title: 'Level-1 Direct Referral Bonus',
        description: `${settings.level1CommissionPercent}% Commission on ${investor.fullName}'s ${plan.name} activation`,
        status: 'completed'
      });

      // Level 2 Referrer
      if (level1User.referredBy) {
        const level2User = users.find(u => u.referralCode === level1User.referredBy);
        if (level2User) {
          const bonus2 = (plan.price * settings.level2CommissionPercent) / 100;
          level2User.balance += bonus2;
          level2User.referralEarnings += bonus2;
          this.updateUser(level2User);

          this.addTransaction({
            userId: level2User.id,
            type: 'referral_bonus',
            amount: bonus2,
            title: 'Level-2 Team Member Bonus',
            description: `${settings.level2CommissionPercent}% Tier-2 Commission on ${investor.fullName}'s plan activation`,
            status: 'completed'
          });

          // Level 3 Referrer
          if (level2User.referredBy) {
            const level3User = users.find(u => u.referralCode === level2User.referredBy);
            if (level3User) {
              const bonus3 = (plan.price * settings.level3CommissionPercent) / 100;
              level3User.balance += bonus3;
              level3User.referralEarnings += bonus3;
              this.updateUser(level3User);

              this.addTransaction({
                userId: level3User.id,
                type: 'referral_bonus',
                amount: bonus3,
                title: 'Level-3 Team Member Bonus',
                description: `${settings.level3CommissionPercent}% Tier-3 Commission on ${investor.fullName}'s plan activation`,
                status: 'completed'
              });
            }
          }
        }
      }
    }
  }

  // --- TASK QUIZ EARNINGS ---
  public submitTaskQuiz(userId: string, taskQuizId: string, selectedOptionIndex: number): {
    success: boolean;
    isCorrect: boolean;
    reward: number;
    explanation: string;
    message: string;
  } {
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) {
      return { success: false, isCorrect: false, reward: 0, explanation: '', message: 'User not authenticated' };
    }

    if (!user.activePlanId) {
      return {
        success: false,
        isCorrect: false,
        reward: 0,
        explanation: '',
        message: 'No active plan! Please activate a plan from the Plans tab to earn daily task cash.'
      };
    }

    const plans = this.getPlans();
    const activePlan = plans.find(p => p.id === user.activePlanId);
    if (!activePlan) {
      return { success: false, isCorrect: false, reward: 0, explanation: '', message: 'Plan details expired.' };
    }

    if (user.dailyTasksCompletedToday >= activePlan.dailyTaskCount) {
      return {
        success: false,
        isCorrect: false,
        reward: 0,
        explanation: '',
        message: `Daily limit reached! You have finished all ${activePlan.dailyTaskCount} tasks for today. Reset at midnight.`
      };
    }

    const quizzes = this.getQuizzes();
    const quiz = quizzes.find(q => q.id === taskQuizId);
    if (!quiz) {
      return { success: false, isCorrect: false, reward: 0, explanation: '', message: 'Quiz not found' };
    }

    const isCorrect = selectedOptionIndex === quiz.quizData.correctIndex;
    const taskReward = Number((activePlan.dailyMinEarn / activePlan.dailyTaskCount).toFixed(2));

    if (!isCorrect) {
      return {
        success: true,
        isCorrect: false,
        reward: 0,
        explanation: quiz.quizData.explanation,
        message: 'Incorrect answer. Read the formula and try the next challenge!'
      };
    }

    // Award reward to user
    user.balance += taskReward;
    user.totalProfitEarned += taskReward;
    user.dailyTasksCompletedToday += 1;
    this.updateUser(user);

    this.addTransaction({
      userId: user.id,
      type: 'task_earning',
      amount: taskReward,
      title: 'Daily Math Task Reward',
      description: `Solved ${quiz.title} on ${activePlan.name} (${user.dailyTasksCompletedToday}/${activePlan.dailyTaskCount})`,
      status: 'completed'
    });

    this.notify();

    return {
      success: true,
      isCorrect: true,
      reward: taskReward,
      explanation: quiz.quizData.explanation,
      message: `Correct! Rs. ${taskReward.toFixed(2)} has been credited instantly to your wallet!`
    };
  }

  // --- TRANSACTIONS ---
  public getTransactions(userId?: string): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const list: Transaction[] = data ? JSON.parse(data) : SEED_TRANSACTIONS;
      if (userId) {
        return list.filter(t => t.userId === userId);
      }
      return list;
    } catch {}
    return SEED_TRANSACTIONS;
  }

  public saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    this.notify();
  }

  public addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const list = this.getTransactions();
    const newTx: Transaction = {
      ...data,
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    };
    list.unshift(newTx);
    this.saveTransactions(list);
    return newTx;
  }

  // --- ADMIN SESSION ---
  public isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';
  }

  public setAdminLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
    }
    this.notify();
  }

  // --- TEAM STATS FOR A USER ---
  public getTeamStats(userReferralCode: string): {
    level1: User[];
    level2: User[];
    level3: User[];
    totalEarnings: number;
    totalDeposits: number;
  } {
    const users = this.getUsers();

    // Level 1: direct
    const level1 = users.filter(u => u.referredBy === userReferralCode);
    const level1Codes = new Set(level1.map(u => u.referralCode));

    // Level 2: referred by level 1
    const level2 = users.filter(u => u.referredBy && level1Codes.has(u.referredBy));
    const level2Codes = new Set(level2.map(u => u.referralCode));

    // Level 3: referred by level 2
    const level3 = users.filter(u => u.referredBy && level2Codes.has(u.referredBy));

    const allTeam = [...level1, ...level2, ...level3];
    const totalDeposits = allTeam.reduce((acc, u) => acc + (u.totalDeposited || 0), 0);

    const currentUser = users.find(u => u.referralCode === userReferralCode);
    const totalEarnings = currentUser?.referralEarnings || 0;

    return {
      level1,
      level2,
      level3,
      totalEarnings,
      totalDeposits
    };
  }
}

export const storage = new StorageService();
