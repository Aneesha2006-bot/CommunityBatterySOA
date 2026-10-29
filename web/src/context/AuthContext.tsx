import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { setAuthToken, setCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isCoordinator: boolean;
  isConsumer: boolean;
  switchDemoUser: (username: string) => void;
  purposeConsent: boolean;
  setPurposeConsent: (consent: boolean) => void;
}

const KNOWN_USERS: Record<string, User> = {
  'member-a': {
    username: 'member-a',
    fullName: 'Alice Sharma',
    subject: 'subj-member-a',
    email: 'alice.sharma@example.com',
    role: 'consumer',
    accountNumber: 'CB-CNS-4091',
    dailyCapKwh: 50.0,
    allocatedTodayKwh: 12.0,
    accessToken: 'demo-jwt-token-member-a',
  },
  'member-b': {
    username: 'member-b',
    fullName: 'Bob Patel',
    subject: 'subj-member-b',
    email: 'bob.patel@example.com',
    role: 'consumer',
    accountNumber: 'CB-CNS-4092',
    dailyCapKwh: 50.0,
    allocatedTodayKwh: 0.0,
    accessToken: 'demo-jwt-token-member-b',
  },
  'coordinator-1': {
    username: 'coordinator-1',
    fullName: 'Vikram Rao (Chief Energy Coordinator)',
    subject: 'subj-coord-1',
    email: 'coordinator@communitybattery.local',
    role: 'coordinator',
    accountNumber: 'CB-ADM-001',
    dailyCapKwh: 100.0,
    allocatedTodayKwh: 0.0,
    accessToken: 'demo-jwt-token-coordinator',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cb_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [purposeConsent, setPurposeConsent] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setAuthToken(user.accessToken);
      setCurrentUser(user);
      localStorage.setItem('cb_active_user', JSON.stringify(user));
    } else {
      setAuthToken(null);
      setCurrentUser(null);
      localStorage.removeItem('cb_active_user');
    }
  }, [user]);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check credentials matching backend seed values
    let authenticated = false;
    let target = KNOWN_USERS[cleanUser];

    if (role === 'coordinator') {
      if (cleanUser === 'coordinator-1' && cleanPass === 'coord-pass') {
        authenticated = true;
      }
    } else {
      if (cleanUser === 'member-a' && cleanPass === 'member-a-pass') {
        authenticated = true;
      } else if (cleanUser === 'member-b' && cleanPass === 'member-b-pass') {
        authenticated = true;
      }
    }

    if (!authenticated) {
      return false;
    }

    if (!target) {
      target = {
        username: cleanUser,
        fullName: cleanUser.toUpperCase(),
        subject: `subj-${cleanUser}`,
        email: `${cleanUser}@communitybattery.local`,
        role,
        accountNumber: `CB-${cleanUser.toUpperCase()}`,
        dailyCapKwh: 50.0,
        allocatedTodayKwh: 0.0,
        accessToken: `demo-token-${cleanUser}`,
      };
    }

    setUser(target);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchDemoUser = (username: string) => {
    const found = KNOWN_USERS[username];
    if (found) {
      setUser(found);
    }
  };

  const isCoordinator = user?.role === 'coordinator';
  const isConsumer = user?.role === 'consumer';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isCoordinator,
        isConsumer,
        switchDemoUser,
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
