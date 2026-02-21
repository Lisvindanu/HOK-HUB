import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  contributorId: string | null;
  login: (token: string, contributorId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [contributorId, setContributorId] = useState<string | null>(() => localStorage.getItem('contributorId'));

  const login = (newToken: string, newContributorId: string) => {
    setToken(newToken);
    setContributorId(newContributorId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('contributorId', newContributorId);
  };

  const logout = () => {
    setToken(null);
    setContributorId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('contributorId');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, contributorId, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
