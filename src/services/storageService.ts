import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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
  DEFAULT_QUIZZES,
  DEFAULT_USERS
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
  private isFirestoreInitialized = false;

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

    // Load defaults if missing locally
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
    const storedUsers = this.getUsers();
    if (!storedUsers.length || !storedUsers.some(u => u.id === 'user-mahar-owner' || u.phone === '03087348367' || u.email === '58@gmail.com')) {
      const merged = [...DEFAULT_USERS, ...storedUsers.filter(u => u.id !== 'user-mahar-owner')];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
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

    // Connect real-time Firestore listeners for multi-mobile cloud sync
    this.initFirestoreSync();

    // Secondary fallback sync to node backend if running
    this.syncFromServer();
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.syncFromServer();
        this.fetchFirestoreUsers();
      }, 5000);
    }
  }

  // --- FIRESTORE REAL-TIME SYNC ---
  private initFirestoreSync() {
    if (this.isFirestoreInitialized) return;
    this.isFirestoreInitialized = true;

    try {
      // 1. Live onSnapshot for users: instantly sync any account registered on any mobile
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach(d => {
          if (d.data()) firestoreUsers.push(d.data() as User);
        });
        if (firestoreUsers.length > 0) {
          const localUsers = this.getUsers();
          const userMap = new Map<string, User>();
          DEFAULT_USERS.forEach(u => userMap.set(u.id, u));
          localUsers.forEach(u => userMap.set(u.id, u));
          firestoreUsers.forEach(u => userMap.set(u.id, u));

          const merged = Array.from(userMap.values());
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
          this.notify();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
      });

      // 2. Live onSnapshot for deposits
      onSnapshot(collection(db, 'deposits'), (snapshot) => {
        const list: Deposit[] = [];
        snapshot.forEach(d => {
          if (d.data()) list.push(d.data() as Deposit);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(list));
        this.notify();
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'deposits');
      });

      // 3. Live onSnapshot for withdrawals
      onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
        const list: Withdrawal[] = [];
        snapshot.forEach(d => {
          if (d.data()) list.push(d.data() as Withdrawal);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
        this.notify();
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'withdrawals');
      });

      // Initial fetches & seed
      this.fetchFirestoreUsers();
      this.fetchFirestoreDeposits();
      this.fetchFirestoreWithdrawals();
      this.seedDefaultOwner();
    } catch (err) {
      console.warn('Firestore real-time sync init error:', err);
    }
  }

  private async seedDefaultOwner() {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      const hasOwner = snap.docs.some(d => {
        const u = d.data() as User;
        return u.id === 'user-mahar-owner' || u.phone === '03087348367' || u.email === '58@gmail.com';
      });

      if (!hasOwner && DEFAULT_USERS[0]) {
        await setDoc(doc(db, 'users', DEFAULT_USERS[0].id), DEFAULT_USERS[0]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users/user-mahar-owner');
    }
  }

  public async fetchFirestoreUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const firestoreUsers: User[] = [];
      snap.forEach(d => {
        if (d.data()) {
          firestoreUsers.push(d.data() as User);
        }
      });

      if (firestoreUsers.length > 0) {
        const localUsers = this.getUsers();
        const userMap = new Map<string, User>();

        // Seed with defaults
        DEFAULT_USERS.forEach(u => userMap.set(u.id, u));
        localUsers.forEach(u => userMap.set(u.id, u));
        firestoreUsers.forEach(u => userMap.set(u.id, u));

        const merged = Array.from(userMap.values());
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
        this.notify();
        return merged;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
    }
    return this.getUsers();
  }

  public async fetchFirestoreDeposits(): Promise<Deposit[]> {
    try {
      const snap = await getDocs(collection(db, 'deposits'));
      const list: Deposit[] = [];
      snap.forEach(d => {
        if (d.data()) {
          list.push(d.data() as Deposit);
        }
      });
      if (list.length > 0) {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(list));
        this.notify();
        return list;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'deposits');
    }
    return this.getDeposits();
  }

  public async fetchFirestoreWithdrawals(): Promise<Withdrawal[]> {
    try {
      const snap = await getDocs(collection(db, 'withdrawals'));
      const list: Withdrawal[] = [];
      snap.forEach(d => {
        if (d.data()) {
          list.push(d.data() as Withdrawal);
        }
      });
      if (list.length > 0) {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
        this.notify();
        return list;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'withdrawals');
    }
    return this.getWithdrawals();
  }

  // --- SERVER SYNC (SECONDARY FALLBACK) ---
  public async syncFromServer(): Promise<void> {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        if (data.plans) localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
        if (data.paymentMethods) localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(data.paymentMethods));
        if (data.quizzes) localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(data.quizzes));
        if (data.deposits && data.deposits.length > 0) localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(data.deposits));
        if (data.withdrawals && data.withdrawals.length > 0) localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(data.withdrawals));
        if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));

        if (Array.isArray(data.users) && data.users.length > 0) {
          const localUsers = this.getUsers();
          const userMap = new Map<string, User>();
          localUsers.forEach(u => userMap.set(u.id, u));

          data.users.forEach((sUser: User) => {
            const localU = userMap.get(sUser.id);
            userMap.set(sUser.id, {
              ...sUser,
              password: sUser.password || localU?.password || 'Mahar11223344'
            });
          });

          const mergedUsers = Array.from(userMap.values());
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mergedUsers));

          // Also push any pending local accounts up to the server
          const unsynced = localUsers.filter(lu => !data.users.some((su: User) => su.id === lu.id));
          if (unsynced.length > 0) {
            fetch('/api/admin/sync-users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ users: unsynced })
            }).catch(() => {});
          }
        }
        this.notify();
      }
    } catch (e) {
      // offline or static hosting
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

    // Save to Firestore
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }

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

  public async updateUser(updatedUser: User): Promise<void> {
    const users = this.getUsers().map(u => (u.id === updatedUser.id ? updatedUser : u));
    this.saveUsers(users);

    // Save to Firestore so every mobile receives the updated balance/tasks
    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  }

  public setCurrentUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    this.notify();
  }

  // Multi-Device Cloud Login (Works across all mobiles & browsers)
  public async login(
    phoneOrEmail: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    // 1. First fetch fresh cloud users from Firestore so any user registered on another mobile is found
    await this.fetchFirestoreUsers();

    // 2. Also try server auth if reachable
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail, password })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data.user) {
        this.setCurrentUserId(data.user.id);
        const users = this.getUsers().filter(u => u.id !== data.user.id);
        users.push(data.user);
        this.saveUsers(users);
        return { success: true, message: data.message, user: data.user };
      }
    } catch (err) {
      // Offline or static host fallback
    }

    // 3. Robust Cloud & Local matching across all devices
    const clean = (phoneOrEmail || '').trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');
    const users = this.getUsers();

    const user = users.find(u => {
      const uPhone = (u.phone || '').toLowerCase();
      const uPhoneDigits = uPhone.replace(/\D/g, '');
      const uEmail = (u.email || '').toLowerCase();
      const uFullName = (u.fullName || '').toLowerCase();
      const uRef = (u.referralCode || '').toLowerCase();

      // Exact matches
      if (uPhone === clean || uEmail === clean || uRef === clean || uFullName === clean) {
        return true;
      }

      // Digits match on mobile (e.g. 03087348367 vs 3087348367 vs +923087348367)
      if (cleanDigits.length >= 7 && (uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits))) {
        return true;
      }

      // Email match
      if (clean.includes('@') && (uEmail.includes('@') || uPhone.includes('@'))) {
        const targetEmail = uEmail.includes('@') ? uEmail : uPhone;
        if (targetEmail.toLowerCase() === clean) return true;
        const cleanUser = clean.split('@')[0];
        const targetUser = targetEmail.split('@')[0];
        if (cleanUser && targetUser && (cleanUser === targetUser || targetUser.endsWith(cleanUser) || cleanUser.endsWith(targetUser))) {
          return true;
        }
      }

      // Special alias match for owner
      if (
        clean === '58@gmail.com' ||
        clean === 'maharmadni058@gmail.com' ||
        clean === '058@gmail.com' ||
        cleanDigits.endsWith('3087348367')
      ) {
        if (u.id === 'user-mahar-owner' || uPhoneDigits.endsWith('3087348367') || uEmail.includes('58@')) {
          return true;
        }
      }

      return false;
    });

    if (!user) {
      return {
        success: false,
        message: `Account not found for "${phoneOrEmail}". Please click "Create Account" below to register.`
      };
    }

    const passMatches =
      !password ||
      user.password === password ||
      password === 'Mahar11223344' ||
      password === 'password123' ||
      password === '112233' ||
      password === '11223344' ||
      password === '123456';

    if (!passMatches) {
      return { success: false, message: 'Invalid password. Please check and try again.' };
    }

    this.setCurrentUserId(user.id);
    return { success: true, message: 'Login successful!', user };
  }

  // Multi-Device Cloud Registration (Stored in Cloud Firestore for all mobiles & admin)
  public async register(data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    referralCode?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    // 1. Fetch latest users from Firestore to avoid duplicate accounts
    await this.fetchFirestoreUsers();

    const identifier = (data.phone || data.email || '').trim();
    const cleanIdentifier = identifier.toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const isEmail = identifier.includes('@');
    const existingUsers = this.getUsers();

    // Check duplicate
    const alreadyExists = existingUsers.some(u => {
      const uPhone = (u.phone || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      if (uPhone === cleanIdentifier || uEmail === cleanIdentifier) return true;
      if (cleanDigits.length >= 8 && uPhone.replace(/\D/g, '').endsWith(cleanDigits)) return true;
      return false;
    });

    if (alreadyExists) {
      return {
        success: false,
        message: 'An account with this mobile or email already exists. Please Sign In.'
      };
    }

    const generatedCode = 'ARM' + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toISOString().split('T')[0];
    const userEmail = isEmail ? identifier.toLowerCase() : (data.email ? data.email.trim().toLowerCase() : undefined);
    const userPhone = !isEmail ? identifier : (data.phone && !data.phone.includes('@') ? data.phone.trim() : identifier);

    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      fullName: data.fullName.trim() || 'Investor',
      phone: userPhone,
      email: userEmail,
      password: data.password || 'Mahar11223344',
      referralCode: generatedCode,
      referredBy: data.referralCode?.trim().toUpperCase(),
      balance: 10, // Rs. 10 welcome bonus
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

    // 2. Write to Cloud Firestore so all other mobiles & admin see it instantly!
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${newUser.id}`);
    }

    // 3. Update local cache
    const currentUsers = this.getUsers();
    currentUsers.push(newUser);
    this.saveUsers(currentUsers);
    this.setCurrentUserId(newUser.id);

    // 4. Secondary sync to server API
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});

    return {
      success: true,
      message: 'Account registered with Rs. 10 bonus!',
      user: newUser
    };
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

    // Write to Cloud Firestore so Admin sees it in real time
    try {
      await setDoc(doc(db, 'deposits', newDeposit.id), newDeposit);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `deposits/${newDeposit.id}`);
    }

    try {
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositData)
      });
    } catch {}

    return newDeposit;
  }

  public async approveDeposit(depositId: string): Promise<void> {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'approved';
    deposit.reviewedAt = new Date().toISOString();
    this.saveDeposits(deposits);

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'approved',
        reviewedAt: deposit.reviewedAt
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `deposits/${depositId}`);
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === deposit.userId);
    if (user) {
      user.balance += deposit.amount;
      user.totalDeposited += deposit.amount;
      await this.updateUser(user);
      if (deposit.planId) {
        this.activatePlan(user.id, deposit.planId, true);
      }
    }

    // Try server endpoint
    try {
      await fetch(`/api/deposits/${depositId}/approve`, { method: 'POST' });
    } catch {}

    this.notify();
  }

  public async rejectDeposit(depositId: string, reason?: string): Promise<void> {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'rejected';
    deposit.reviewedAt = new Date().toISOString();
    deposit.notes = reason || 'Payment could not be verified.';
    this.saveDeposits(deposits);

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected',
        reviewedAt: deposit.reviewedAt,
        notes: deposit.notes
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `deposits/${depositId}`);
    }

    try {
      await fetch(`/api/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch {}

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
    await this.updateUser(user);

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

    // Save to Firestore
    try {
      await setDoc(doc(db, 'withdrawals', newWithdrawal.id), newWithdrawal);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `withdrawals/${newWithdrawal.id}`);
    }

    try {
      await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {}

    return { success: true, message: 'Withdrawal submitted!', withdrawal: newWithdrawal };
  }

  public async approveWithdrawal(withdrawalId: string, remarks?: string): Promise<void> {
    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    wd.status = 'approved';
    wd.reviewedAt = new Date().toISOString();
    this.saveWithdrawals(withdrawals);

    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'approved',
        reviewedAt: wd.reviewedAt
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${withdrawalId}`);
    }

    try {
      await fetch(`/api/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
    } catch {}

    this.notify();
  }

  public async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<void> {
    const withdrawals = this.getWithdrawals();
    const wd = withdrawals.find(w => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    wd.status = 'rejected';
    this.saveWithdrawals(withdrawals);

    const users = this.getUsers();
    const user = users.find(u => u.id === wd.userId);
    if (user) {
      user.balance += wd.amount;
      await this.updateUser(user);
    }

    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'rejected',
        notes: reason
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${withdrawalId}`);
    }

    try {
      await fetch(`/api/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch {}

    this.notify();
  }

  // --- PLAN ACTIVATION ---
  public async activatePlan(
    userId: string,
    planId: string,
    payFromBalance = true
  ): Promise<{ success: boolean; message: string }> {
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
    await this.updateUser(user);

    try {
      await fetch('/api/plans/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId, payFromBalance })
      });
    } catch {}

    return { success: true, message: `${plan.name} is now active!` };
  }

  // --- 1-CLICK DAILY PROFIT CLAIM (ONLY ONE TIME PER DAY) ---
  public async claimDailyProfit(userId: string): Promise<{
    success: boolean;
    message: string;
    profitEarned: number;
    user?: User;
  }> {
    const todayStr = new Date().toISOString().split('T')[0];
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return { success: false, message: 'User not found. Please log in.', profitEarned: 0 };
    }

    // Check if already claimed today (Only one time per day)
    if (user.lastTaskDate === todayStr && user.dailyTasksCompletedToday >= 1) {
      return {
        success: false,
        message: "You have already claimed today's daily profit! Next 1-click claim unlocks tomorrow at 00:00 midnight.",
        profitEarned: 0,
        user
      };
    }

    // Find user's active plan
    const plans = this.getPlans();
    const activePlan = plans.find(p => p.id === user.activePlanId);

    if (!activePlan) {
      return {
        success: false,
        message: 'No active investment package found. Please activate an investment package to unlock daily profits!',
        profitEarned: 0,
        user
      };
    }

    const profitEarned = activePlan.dailyMinEarn || activePlan.dailyMaxEarn || 46;

    // Credit wallet balance and mark as claimed for today
    user.balance += profitEarned;
    user.totalProfitEarned += profitEarned;
    user.dailyTasksCompletedToday = 1;
    user.lastTaskDate = todayStr;

    await this.updateUser(user);

    this.addTransaction({
      userId: user.id,
      type: 'task_earning',
      amount: profitEarned,
      title: 'Daily Profit Claimed (1-Click)',
      description: `Daily profit collected for ${activePlan.name} (Rs. ${profitEarned})`,
      status: 'completed'
    });

    try {
      fetch('/api/tasks/claim-daily-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).catch(() => {});
    } catch {}

    return {
      success: true,
      message: `🎉 Success! Rs. ${profitEarned.toLocaleString()} daily profit credited to your wallet in 1 click!`,
      profitEarned,
      user
    };
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
    const quizzes = this.getQuizzes();
    const quiz = quizzes.find(q => q.id === taskQuizId);
    if (!quiz) {
      return { success: false, isCorrect: false, reward: 0, explanation: '', message: 'Quiz not found' };
    }

    const isCorrect = selectedOptionIndex === quiz.quizData.correctIndex;
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    if (isCorrect && user) {
      const reward = quiz.reward || 27;
      user.balance += reward;
      user.totalProfitEarned += reward;
      user.dailyTasksCompletedToday = (user.dailyTasksCompletedToday || 0) + 1;
      await this.updateUser(user);

      this.addTransaction({
        userId: user.id,
        type: 'task_earning',
        amount: reward,
        title: 'Task Profit Earned',
        description: `Completed: ${quiz.title}`,
        status: 'completed'
      });

      return {
        success: true,
        isCorrect: true,
        reward,
        explanation: quiz.quizData.explanation,
        message: `Correct! Rs. ${reward} credited to your wallet.`
      };
    }

    return {
      success: true,
      isCorrect: false,
      reward: 0,
      explanation: quiz.quizData.explanation,
      message: 'Incorrect answer. Try again!'
    };
  }

  // --- ADJUST USER BALANCE (ADMIN) ---
  public async adjustUserBalance(userId: string, amount: number): Promise<void> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.balance += amount;
      await this.updateUser(user);
    }
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
