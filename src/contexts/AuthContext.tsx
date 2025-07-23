import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

function decodeJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Remove inactivityTimer, warningTimer, showSessionWarning, and related logic
  const { toast } = useToast();

  // Helper: decode JWT and check expiry
  function isTokenExpired(token: string): boolean {
    try {
      const decoded: any = decodeJwt(token);
      if (!decoded.exp) return true;
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  // Remove auto-logout on inactivity logic

  // Ensure isLoading is set to false on mount if not already set
  useEffect(() => {
    if (isLoading) setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const decoded: any = decodeJwt(token);
      console.log('[AuthContext] Decoded JWT:', decoded);
      if (isTokenExpired(token)) {
        console.warn('[AuthContext] Token expired');
        logout();
        return;
      }
      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('[AuthContext] /auth/me response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] /auth/me data:', data);
        if (data.status === 'success' && data.data?.user) {
          setUser(data.data.user);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data');
        }
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string) => {
    console.log('[AuthContext] login() called with token:', token);
    localStorage.setItem('token', token);
    fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    // No inactivity timer to clear
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType & { isTokenExpired: (token: string) => boolean } = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isTokenExpired,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading authentication...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 