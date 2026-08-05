import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

import { apiRequest } from './utils/api';
import Toast from './components/common/Toast';
import Loader from './components/common/Loader';
import Navbar from './components/common/Navbar';
import AuthForm from './components/auth/AuthForm';
import MemberDashboard from './components/member/MemberDashboard';
import TrainerDashboard from './components/trainer/TrainerDashboard';
import BookingsList from './components/shared/BookingsList';
import MockInbox from './components/shared/MockInbox';

export default function App() {
  // Session & User State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wellfit_token'));
  const [loading, setLoading] = useState(true);

  // Core App Lists State
  const [availableSlots, setAvailableSlots] = useState([]);
  const [trainerSlots, setTrainerSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Dashboard Interactions State
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

  const handleAuthSubmit = async ({ isLogin, payload }) => {
    setActionLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('wellfit_token', data.token);
      setToken(data.token);
      setUser(data);
      showToast(`Welcome back, ${data.name}!`, 'success');
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
  const handleTopUp = async (amount, onSuccess) => {
    setActionLoading(true);
    try {
      const data = await apiRequest('/api/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      setUser({ ...user, walletBalance: data.walletBalance });
      showToast(`Successfully added ₹${amount}!`, 'success');
      if (onSuccess) onSuccess();
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
  const handleCreateSlot = async (slotPayload, onSuccess) => {
    setActionLoading(true);
    try {
      await apiRequest('/api/slots', {
        method: 'POST',
        body: JSON.stringify(slotPayload),
      });
      showToast('Availability slot published successfully', 'success');
      if (onSuccess) onSuccess();
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Dynamic Floating Toast Alerts */}
      <Toast toast={toast} />

      {/* Navigation Header */}
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        notificationsCount={notifications.length} 
        handleLogout={handleLogout} 
      />

      {/* Main Layout Containers */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        {!user ? (
          /* Authentication Screen */
          <AuthForm onSubmit={handleAuthSubmit} actionLoading={actionLoading} />
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
                  <MemberDashboard 
                    user={user}
                    actionLoading={actionLoading}
                    handleTopUp={handleTopUp}
                    availableSlots={availableSlots}
                    handleBookSession={handleBookSession}
                  />
                ) : (
                  /* TRAINER DASHBOARD VIEW */
                  <TrainerDashboard 
                    actionLoading={actionLoading}
                    handleCreateSlot={handleCreateSlot}
                    trainerSlots={trainerSlots}
                  />
                )}
              </div>
            )}

            {/* 2. TAB: Bookings Log (Both Roles) */}
            {activeTab === 'bookings' && (
              <BookingsList bookings={bookings} user={user} />
            )}

            {/* 3. TAB: Mock Email Inbox (Members Only) */}
            {activeTab === 'notifications' && user.role === 'member' && (
              <MockInbox notifications={notifications} />
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
