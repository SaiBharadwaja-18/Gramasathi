import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useApi from './useApi';

interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  role: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const api = useApi();

  const isAuthenticated = !!user && !!token;

  // Load user data on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const response = await api.request('/auth/me');

          if (response.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user)); // ✅ store user
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // ✅ store user
        setToken(newToken);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: userData,
      });

      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser)); // ✅ store user
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated)); // ✅ update stored user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
