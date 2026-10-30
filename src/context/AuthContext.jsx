import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Roles: 'guest', 'donor', 'charity', 'admin'
  const [role, setRole] = useState(() => localStorage.getItem('lc_user_role') || 'donor');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lc_user_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name !== 'Priya Patel') {
          return parsed;
        }
      } catch {}
    }
    return {
      name: '',
      email: '',
      phone: '',
    };
  });

  // Current selected charity for charity view
  const [charityProfile, setCharityProfile] = useState(() => {
    const saved = localStorage.getItem('lc_charity_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 1,
      organizationName: 'LedgerCare Demo Charity',
      registrationNumber: 'LC-DEMO-001',
      email: 'demo@ledgercare.org',
      verified: true,
      verificationStatus: 'VERIFIED',
      campaignEligibility: 'ALLOWED',
      hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    };
  });

  useEffect(() => {
    localStorage.setItem('lc_user_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('lc_user_data', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lc_charity_profile', JSON.stringify(charityProfile));
  }, [charityProfile]);

  // Try to load verified charity from backend on mount if none saved yet
  useEffect(() => {
    async function loadCharity() {
      try {
        const saved = localStorage.getItem('lc_charity_profile');
        if (saved) return;

        const res = await api.getCharities();
        if (res.success && res.charities && res.charities.length > 0) {
          const first = res.charities[0];
          setCharityProfile({
            id: first.charityId || 1,
            organizationName: first.organizationName || 'LedgerCare Demo Charity',
            registrationNumber: first.registrationNumber || 'LC-DEMO-001',
            email: first.email || 'demo@ledgercare.org',
            verified: Boolean(first.verified),
            verificationStatus: first.verified ? 'VERIFIED' : 'PENDING_VERIFICATION',
            campaignEligibility: first.verified ? 'ALLOWED' : 'BLOCKED',
            hash: first.credHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          });
        }
      } catch (err) {
        console.warn('Could not fetch backend charity on startup:', err);
      }
    }
    loadCharity();
  }, []);

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const loginAs = (selectedRole, customUser = null) => {
    setRole(selectedRole);
    if (customUser) {
      setUser(customUser);
      try {
        localStorage.setItem('lc_user_data', JSON.stringify(customUser));
      } catch (_) {}
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      try {
        localStorage.setItem('lc_user_data', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const logout = () => {
    setRole('donor');
  };

  const updateCharityStatus = (status, eligibility) => {
    setCharityProfile((prev) => ({
      ...prev,
      verified: status === 'VERIFIED',
      verificationStatus: status,
      campaignEligibility: eligibility,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        charityProfile,
        isDonor: role === 'donor',
        isCharity: role === 'charity',
        isAdmin: role === 'admin',
        switchRole,
        loginAs,
        logout,
        setUser,
        updateUser,
        setCharityProfile,
        updateCharityStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
