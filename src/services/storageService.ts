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

class StorageService {
  private listeners: (() => void)[] = [];
  private syncTimer: any = null;

  constructor() {
    this.init();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notify() {
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

    // Load defaults if missing
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    }
    const storedPm = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    if (!storedPm || storedPm.includes('easypaisa') || storedPm.includes('bank') || storedPm.includes('usdt')) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPOSITS)) {
      localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
    }

    // Purge any legacy demo user from session
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === 'user-demo-1' || currentId === 'user-ref-1' || currentId === 'user-ref-2') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }

    // Immediate server sync
    this.syncFromServer();

    // Start background sync every 5 seconds so multi-mobile changes reflect in real-time
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.syncFromServer();
      }, 5000);
    }
  }

  // --- SERVER SYNC ---
  public async syncFromServer(): Promise<void> {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        if (data.plans) localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
        if (data.paymentMethods) localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(data.paymentMethods));
        if (data.quizzes) localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(data.quizzes));
        if (data.deposits) localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(data.deposits));
        if (data.withdrawals) localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(data.withdrawals));
        if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
        if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));

        const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (currentId) {
          const userRes = await fetch(`/api/auth/me/${currentId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.user) {
              const users = this.getUsers().filter(u => u.id !== userData.user.id);
              users.push(userData.user);
              localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            }
          }
        }
        this.notify();
      }
    } catch (e) {
      // offline or server restarting
    }
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_SETTINGS;
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, adminPassword: settings.adminSecretPassword })
      });
    } catch {}
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
    return [];
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

  // Centralized Server Auth Login (works across all mobiles)
  public async login(
    phoneOrEmail: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.setCurrentUserId(data.user.id);
        const users = this.getUsers().filter(u => u.id !== data.user.id);
        users.push(data.user);
        this.saveUsers(users);
        await this.syncFromServer();
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      // Offline fallback
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
  }

  // Centralized Server Auth Register (stored on server for all mobiles)
  public async register(data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    referralCode?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        this.setCurrentUserId(resData.user.id);
        const users = this.getUsers().filter(u => u.id !== resData.user.id);
        users.push(resData.user);
        this.saveUsers(users);
        await this.syncFromServer();
        return { success: true, message: resData.message, user: resData.user };
      }
      return { success: false, message: resData.message || 'Registration failed.' };
    } catch (err) {
      // Offline fallback
      const cleanPhone = data.phone.trim();
      const users = this.getUsers();
      if (users.some(u => u.phone === cleanPhone)) {
        return { success: false, message: 'An account with this mobile already exists.' };
      }
      const generatedCode = 'ARM' + Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().split('T')[0];
      const newUser: User = {
        id: 'user-' + Date.now(),
        fullName: data.fullName.trim() || 'Investor',
        phone: cleanPhone,
        password: data.password || 'password123',
        referralCode: generatedCode,
        referredBy: data.referralCode?.trim().toUpperCase(),
        balance: 10,
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
      return { success: true, message: 'Account registered with Rs. 10 bonus!', user: newUser };
    }
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
    return [];
  }

  public saveDeposits(deposits: Deposit[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
    this.notify();
  }

  public async createDeposit(depositData: Omit<Deposit, 'id' | 'status' | 'createdAt'>): Promise<Deposit> {
    const tempId = 'dep-' + Date.now();
    const newDeposit: Deposit = {
      ...depositData,
      id: tempId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const deposits = this.getDeposits();
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

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositData)
      });
      if (res.ok) {
        await this.syncFromServer();
      }
    } catch {}

    return newDeposit;
  }

  public async approveDeposit(depositId: string): Promise<void> {
    try {
      const res = await fetch(`/api/deposits/${depositId}/approve`, { method: 'POST' });
      if (res.ok) {
        await this.syncFromServer();
        return;
      }
    } catch {}

    // Local fallback
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;
    deposit.status = 'approved';
    deposit.reviewedAt = new Date().toISOString();
    this.saveDeposits(deposits);

    const users = this.getUsers();
    const user = users.find(u => u.id === deposit.userId);
    if (user) {
      user.balance += deposit.amount;
      user.totalDeposited += deposit.amount;
      this.updateUser(user);
      if (deposit.planId) {
        this.activatePlan(user.id, deposit.planId, true);
      }
    }
    this.notify();
  }

  public async rejectDeposit(depositId: string, reason?: string): Promise<void> {
    try {
      const res = await fetch(`/api/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        await this.syncFromServer();
        return;
      }
    } catch {}

    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;
    deposit.status = 'rejected';
    deposit.reviewedAt = new Date().toISOString();
    deposit.notes = reason || 'Payment could not be verified.';
    this.saveDeposits(deposits);
    this.notify();
  }

  // --- WITHDRAWALS ---
  public getWithdrawals(): Withdrawal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  public saveWithdrawals(withdrawals: Withdrawal[]): void {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
    this.notify();
  }

  public async createWithdrawal(data: {
    userId: string;
    userName: string;
    userPhone: string;
    amount: number;
    paymentMethodType: PaymentMethod['type'];
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }): Promise<{ success: boolean; message: string; withdrawal?: Withdrawal }> {
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        await this.syncFromServer();
        return resData;
      }
      return { success: false, message: resData.message || 'Withdrawal failed' };
    } catch (e) {
      // Local fallback
      const settings = this.getSettings();
      if (data.amount < settings.minWithdrawal) {
        return { success: false, message: `Minimum cashout is Rs. ${settings.minWithdrawal}` };
      }
      const users = this.getUsers();
      const user = users.find(u => u.id === data.userId);
      if (!user || user.balance < data.amount) {
        return { success: false, message: 'Insufficient balance' };
      }
      user.balance -= data.amount;
      this.updateUser(user);
      const newWithdrawal: Withdrawal = {
        ...data,
        id: 'wd-' + Date.now(),
        status: 'pending',
        fee: 0,
        netAmount: data.amount,
        createdAt: new Date().toISOString()
      };
      const withdrawals = this.getWithdrawals();
      withdrawals.unshift(newWithdrawal);
      this.saveWithdrawals(withdrawals);
      return { success: true, message: 'Withdrawal submitted!', withdrawal: newWithdrawal };
    }
  }

  public async approveWithdrawal(withdrawalId: string, remarks?: string): Promise<void> {
    try {
      const res = await fetch(`/api/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
      if (res.ok) {
        await this.syncFromServer();
        return;
      }
    } catch {}

    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;
    wd.status = 'approved';
    wd.reviewedAt = new Date().toISOString();
    this.saveWithdrawals(withdrawals);
    this.notify();
  }

  public async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<void> {
    try {
      const res = await fetch(`/api/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        await this.syncFromServer();
        return;
      }
    } catch {}

    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;
    wd.status = 'rejected';
    this.saveWithdrawals(withdrawals);
    const users = this.getUsers();
    const user = users.find(u => u.id === wd.userId);
    if (user) {
      user.balance += wd.amount;
      this.updateUser(user);
    }
    this.notify();
  }

  // --- PLAN ACTIVATION ---
  public async activatePlan(
    userId: string,
    planId: string,
    payFromBalance = true
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/plans/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId, payFromBalance })
      });
      const data = await res.json();
      if (data.success) {
        await this.syncFromServer();
        return data;
      }
      return { success: false, message: data.message || 'Plan activation failed' };
    } catch (e) {
      const plans = this.getPlans();
      const plan = plans.find(p => p.id === planId);
      if (!plan) return { success: false, message: 'Plan not found.' };

      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      if (!user) return { success: false, message: 'User not found.' };

      if (payFromBalance) {
        if (user.balance < plan.price) {
          return { success: false, message: `Insufficient balance for ${plan.name}` };
        }
        user.balance -= plan.price;
      }

      user.activePlanId = plan.id;
      user.activePlanName = plan.name;
      user.planActivatedAt = new Date().toISOString();
      user.dailyTasksCompletedToday = 0;
      this.updateUser(user);
      return { success: true, message: `${plan.name} is now active!` };
    }
  }

  // --- TASK QUIZ EARNINGS ---
  public async submitTaskQuiz(
    userId: string,
    taskQuizId: string,
    selectedOptionIndex: number
  ): Promise<{
    success: boolean;
    isCorrect: boolean;
    reward: number;
    explanation: string;
    message: string;
  }> {
    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, taskQuizId, selectedOptionIndex })
      });
      const data = await res.json();
      if (data.success) {
        await this.syncFromServer();
        return data;
      }
      return {
        success: false,
        isCorrect: false,
        reward: 0,
        explanation: '',
        message: data.message || 'Task submission failed'
      };
    } catch (e) {
      return {
        success: false,
        isCorrect: false,
        reward: 0,
        explanation: '',
        message: 'Network error. Please try again.'
      };
    }
  }

  // --- ADJUST USER BALANCE (ADMIN) ---
  public async adjustUserBalance(userId: string, amount: number): Promise<void> {
    const settings = this.getSettings();
    try {
      await fetch('/api/users/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, adminPassword: settings.adminSecretPassword })
      });
      await this.syncFromServer();
    } catch {}
  }

  // --- TRANSACTIONS ---
  public getTransactions(userId?: string): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const list: Transaction[] = data ? JSON.parse(data) : [];
      if (userId) {
        return list.filter(t => t.userId === userId);
      }
      return list;
    } catch {}
    return [];
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

    const level1 = users.filter(u => u.referredBy === userReferralCode);
    const level1Codes = new Set(level1.map(u => u.referralCode));

    const level2 = users.filter(u => u.referredBy && level1Codes.has(u.referredBy));
    const level2Codes = new Set(level2.map(u => u.referralCode));

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
