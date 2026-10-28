import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { setAuthToken, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, role: string) => Promise<void>;
  logout: () => void;
  isCoordinator: boolean;
  purposeConsent: boolean;
  setPurposeConsent: (granted: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Default to synthetic member-a
    return {
      username: 'member-a',
      subject: 'subj-member-a',
      roles: ['ROLE_member'],
      accessToken: 'demo-token-member-a',
    };
  });

  const [purposeConsent, setPurposeConsentState] = useState<boolean>(false);

  useEffect(() => {
    if (user?.accessToken) {
      setAuthToken(user.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [user]);

  const login = async (username: string, role: string) => {
    try {
      // Attempt real token endpoint via Gateway
      const password = username === 'coordinator-1' ? 'coord-pass' : `${username}-pass`;
      const res = await fetch('/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          username,
          subject: data.subject || `subj-${username}`,
          roles: data.roles || [role === 'coordinator' ? 'ROLE_energyCoordinator' : 'ROLE_member'],
          accessToken: data.accessToken,
        });
        return;
      }
    } catch {
      // Standalone fallback
    }

    // Local synthetic state
    const roles = role === 'coordinator' ? ['ROLE_energyCoordinator'] : ['ROLE_member'];
    setUser({
      username,
      subject: `subj-${username}`,
      roles,
      accessToken: `demo-token-${username}`,
    });
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  const setPurposeConsent = (granted: boolean) => {
    setPurposeConsentState(granted);
    api.recordConsent('ENERGY_DISCHARGE_ALLOCATION', granted);
  };

  const isCoordinator = user?.roles.includes('ROLE_energyCoordinator') ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isCoordinator,
        purposeConsent,
        setPurposeConsent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
