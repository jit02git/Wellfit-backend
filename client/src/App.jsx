import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  User, 
  Mail, 
  Plus, 
  Wallet, 
  LogOut, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Inbox, 
  ChevronRight, 
  DollarSign, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

// API Helper for clean fetch requests with Authorization headers
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('wellfit_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export default function App() {
  // Session & User State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wellfit_token'));
  const [loading, setLoading] = useState(true);

  // Auth Forms State
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'member' });

  // Core App Lists State
  const [availableSlots, setAvailableSlots] = useState([]);
  const [trainerSlots, setTrainerSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Dashboard Interactions State
  const [walletAmount, setWalletAmount] = useState('');
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actionLoading, setActionLoading] = useState(false);

  // Global custom toast popup state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load User details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await apiRequest('/api/auth/me');
        setUser(userData);
      } catch (err) {
        console.error('Session restoration failed:', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch contextual dashboard data when authenticated
  useEffect(() => {
    if (!user) return;
    refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      if (user.role === 'member') {
        const slots = await apiRequest('/api/slots/available');
        setAvailableSlots(slots);
        const booked = await apiRequest('/api/bookings/member');
        setBookings(booked);
        const inbox = await apiRequest('/api/notifications');
        setNotifications(inbox);
      } else if (user.role === 'trainer') {
        const slots = await apiRequest('/api/slots/trainer');
        setTrainerSlots(slots);
        const booked = await apiRequest('/api/bookings/trainer');
        setBookings(booked);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('wellfit_token', data.token);
      setToken(data.token);
      setUser(data);
      showToast(`Welcome back, ${data.name}!`, 'success');
      // Reset forms
      setAuthForm({ name: '', email: '', password: '', role: 'member' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wellfit_token');
    setToken(null);
    setUser(null);
    setAvailableSlots([]);
    setTrainerSlots([]);
    setBookings([]);
    setNotifications([]);
    setActiveTab('dashboard');
    showToast('Logged out successfully', 'success');
  };

  // Member Action: Top up wallet
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!walletAmount || parseFloat(walletAmount) <= 0) {
      showToast('Please enter a valid top up amount', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const data = await apiRequest('/api/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount: walletAmount }),
      });
      setUser({ ...user, walletBalance: data.walletBalance });
      showToast(`Successfully added ₹${walletAmount}!`, 'success');
      setWalletAmount('');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Member Action: Book a session slot
  const handleBookSession = async (slotId) => {
    setActionLoading(true);
    try {
      const data = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ slotId }),
      });
      // Deduct wallet local state
      setUser({ ...user, walletBalance: data.newWalletBalance });
      showToast('Session booked! Confirmation email has been sent.', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Trainer Action: Add a new slot
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.startTime || !newSlot.endTime) {
      showToast('Please select both start and end times', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await apiRequest('/api/slots', {
        method: 'POST',
        body: JSON.stringify(newSlot),
      });
      showToast('Availability slot published successfully', 'success');
      setNewSlot({ startTime: '', endTime: '' });
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Loading Wellfit session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Dynamic Floating Toast Alerts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 border glass-panel ${
          toast.type === 'success' 
            ? 'border-emerald-500/30 text-emerald-400' 
            : 'border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      {user && (
        <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">Wellfit</span>
                <span className="text-xs block text-slate-400 font-medium uppercase tracking-widest mt-[-2px]">{user.role} workspace</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dashboard
              </button>
              
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'bookings' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {user.role === 'member' ? 'My Bookings' : 'Attendees'}
              </button>

              {user.role === 'member' && (
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative ${
                    activeTab === 'notifications' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mock Inbox
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
                  )}
                </button>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-5">
              {user.role === 'member' && (
                <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide text-emerald-500">WALLET:</span>
                  <span className="text-sm font-bold tracking-tight text-emerald-300">₹{user.walletBalance.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Layout Containers */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        {!user ? (
          /* Authentication Screen */
          <div className="max-w-md w-full mx-auto my-12">
            <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
              
              {/* Auth Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-emerald-500/10">
                  <Activity className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {isLogin ? 'Welcome back to Wellfit' : 'Create an Account'}
                </h2>
                <p className="text-sm text-slate-400 mt-2 text-center">
                  {isLogin 
                    ? 'Log in to book wellness sessions and manage your schedule.' 
                    : 'Sign up today to start booking wellness sessions.'}
                </p>
              </div>

              {/* Form toggler */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    !isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <User className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={authForm.name}
                        onChange={handleAuthChange}
                        placeholder="John Doe"
                        className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={authForm.email}
                      onChange={handleAuthChange}
                      placeholder="you@example.com"
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Clock className="w-4.5 h-4.5 transform rotate-45" /> {/* simple key indicator */}
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      value={authForm.password}
                      onChange={handleAuthChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Are you a Member or Trainer?</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                        authForm.role === 'member'
                          ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="member"
                          checked={authForm.role === 'member'}
                          onChange={handleAuthChange}
                          className="hidden"
                        />
                        <span className="text-sm font-semibold">🏋️ Member</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                        authForm.role === 'trainer'
                          ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="trainer"
                          checked={authForm.role === 'trainer'}
                          onChange={handleAuthChange}
                          className="hidden"
                        />
                        <span className="text-sm font-semibold">💪 Trainer</span>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-sm font-bold tracking-tight rounded-xl py-3.5 transition-all shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard Core view */
          <div className="w-full max-w-7xl mx-auto py-4">
            
            {/* 1. MAIN TAB: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* User Greeting Block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Hello, {user.name} <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </h1>
                    <p className="text-slate-400 mt-1">Here is a summary of your activities on Wellfit today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { refreshData(); showToast('Data refreshed!', 'success'); }}
                      className="p-3 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all text-slate-300 hover:text-emerald-400"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {user.role === 'member' ? (
                  /* MEMBER DASHBOARD VIEW */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Wallet Section (Col 1) */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-emerald-500" /> Wallet Balance
                        </h3>
                        
                        <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center mb-6">
                          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">Available Funds</p>
                          <p className="text-4xl font-black text-emerald-400 tracking-tight">₹{user.walletBalance.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 mt-2">Each booking automatically deducts ₹200.00</p>
                        </div>

                        {/* Top-up Form */}
                        <form onSubmit={handleTopUp} className="space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Add Mock Balance</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold text-sm">₹</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="Enter amount (e.g., 500)"
                              value={walletAmount}
                              onChange={(e) => setWalletAmount(e.target.value)}
                              className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-7 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-slate-100 hover:bg-white text-slate-950 text-sm font-bold rounded-xl py-2.5 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Top Up Wallet</span>}
                          </button>
                        </form>
                      </div>

                      {/* Info Tips Panel */}
                      <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                        <h4 className="text-sm font-bold text-slate-300">💡 Wellness Tip</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Consistent practice builds enduring habits. Take 15 minutes to review slots, add mock funds to cover your sessions, and lock in your trainers early.
                        </p>
                      </div>
                    </div>

                    {/* Bookable Trainer Slots Catalog (Col 2 & 3) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-panel rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" /> Book a New Session
                        </h3>

                        {availableSlots.length === 0 ? (
                          <div className="bg-slate-950/40 border border-slate-850 p-10 rounded-xl text-center">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-semibold">No available slots published yet</p>
                            <p className="text-slate-500 text-xs mt-1">Check back later or ask trainers to add availability slots.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableSlots.map((slot) => {
                              const start = new Date(slot.startTime);
                              const end = new Date(slot.endTime);
                              
                              return (
                                <div 
                                  key={slot._id} 
                                  className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80 hover:border-slate-700/85 transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-3.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                                          TR
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Trainer</p>
                                          <p className="text-sm font-semibold text-slate-200">{slot.trainerId?.name || 'Unknown'}</p>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full tracking-wide">
                                        ₹200
                                      </span>
                                    </div>

                                    <div className="space-y-1.5 mb-5 text-slate-400 text-xs">
                                      <p className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="font-semibold text-slate-300">Date:</span> {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-500 opacity-0" />
                                        <span className="font-semibold text-slate-300">Time:</span> {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleBookSession(slot._id)}
                                    disabled={actionLoading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wide transition-all shadow hover:shadow-emerald-500/10"
                                  >
                                    Book Session
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TRAINER DASHBOARD VIEW */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Add Slots Form (Col 1) */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-emerald-500" /> Add Available Slot
                        </h3>

                        <form onSubmit={handleCreateSlot} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slot Start Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={newSlot.startTime}
                              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                              className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slot End Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={newSlot.endTime}
                              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                              className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-sm font-bold rounded-xl py-3 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4" /> Publish Slot
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* Instructor Instructions */}
                      <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                        <h4 className="text-sm font-bold text-slate-300">📆 Calendar Publishing Tip</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          To maximize booking conversions, space your hours evenly and avoid listing time segments in the past. Slots require a valid start time and end time.
                        </p>
                      </div>
                    </div>

                    {/* Trainer Slots Published (Col 2 & 3) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-panel rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" /> My Published Slots
                        </h3>

                        {trainerSlots.length === 0 ? (
                          <div className="bg-slate-950/40 border border-slate-850 p-10 rounded-xl text-center">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-semibold">You have not published any slots yet</p>
                            <p className="text-slate-500 text-xs mt-1">Use the panel on the left to add dates and times to your calendar.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-400 text-xs uppercase tracking-wider">
                                  <th className="py-3 px-4 font-semibold">Date</th>
                                  <th className="py-3 px-4 font-semibold">Time Window</th>
                                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 text-sm">
                                {trainerSlots.map((slot) => {
                                  const start = new Date(slot.startTime);
                                  const end = new Date(slot.endTime);

                                  return (
                                    <tr key={slot._id} className="hover:bg-slate-950/20 transition-colors">
                                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                      </td>
                                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="py-3.5 px-4 text-center">
                                        {slot.isBooked ? (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Booked
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Open
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. TAB: Bookings Log (Both Roles) */}
            {activeTab === 'bookings' && (
              <div className="glass-panel rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.role === 'member' ? 'My Booking History' : 'Client Sessions Roster'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {user.role === 'member' 
                    ? 'A list of your registered fitness and wellness coaching sessions.' 
                    : 'List of members who have locked in appointments on your calendar.'}
                </p>

                {bookings.length === 0 ? (
                  <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-xl text-center max-w-xl mx-auto my-6">
                    <Activity className="w-12 h-12 text-slate-650 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-semibold">No bookings found</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {user.role === 'member' 
                        ? 'Select available time slots to confirm appointment bookings.' 
                        : 'Your slots are currently open and waiting for members to book.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">Session Date</th>
                          <th className="py-3 px-4 font-semibold">Time Interval</th>
                          <th className="py-3 px-4 font-semibold">
                            {user.role === 'member' ? 'Trainer' : 'Member Details'}
                          </th>
                          <th className="py-3 px-4 font-semibold">Paid Amount</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm">
                        {bookings.map((booking) => {
                          const start = new Date(booking.slotId?.startTime);
                          const end = new Date(booking.slotId?.endTime);

                          return (
                            <tr key={booking._id} className="hover:bg-slate-950/20 transition-colors">
                              <td className="py-4 px-4 text-slate-200 font-semibold">
                                {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-4">
                                {user.role === 'member' ? (
                                  <div>
                                    <p className="text-slate-200 font-semibold">{booking.slotId?.trainerId?.name || 'Wellness Trainer'}</p>
                                    <p className="text-xs text-slate-500">{booking.slotId?.trainerId?.email || ''}</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-slate-200 font-semibold">{booking.memberId?.name || 'Member Client'}</p>
                                    <p className="text-xs text-slate-500">{booking.memberId?.email || ''}</p>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-300 font-mono text-xs">
                                ₹{booking.amountPaid?.toFixed(2) || '200.00'}
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. TAB: Mock Email Inbox (Members Only) */}
            {activeTab === 'notifications' && user.role === 'member' && (
              <div className="glass-panel rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Inbox className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">System Email Logs (Mock Inbox)</h2>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  This mock inbox acts as the recipient endpoint for automated notification emails dispatched to you upon successful slot confirmations.
                </p>

                {notifications.length === 0 ? (
                  <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-xl text-center max-w-xl mx-auto my-6">
                    <Mail className="w-12 h-12 text-slate-750 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-semibold">Your inbox is currently empty</p>
                    <p className="text-slate-500 text-xs mt-1">Book trainer slots to receive confirmation emails here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded tracking-wide mr-2.5">
                              Email Confirmation
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">To: {notif.recipientEmail}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mb-2">{notif.subject}</h4>
                        <pre className="text-xs text-slate-400 font-sans whitespace-pre-line leading-relaxed leading-5">
                          {notif.body}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-12 border-t border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500">
        <p>© 2026 Wellfit Systems Inc. All rights reserved. Dev Mode Enabled.</p>
      </footer>
    </div>
  );
}
