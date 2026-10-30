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
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.organizationName && parsed.organizationName !== 'LedgerCare Demo Charity') {
          return parsed;
        }
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('lc_user_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('lc_user_data', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (charityProfile) {
      localStorage.setItem('lc_charity_profile', JSON.stringify(charityProfile));
    } else {
      localStorage.removeItem('lc_charity_profile');
    }
  }, [charityProfile]);

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
