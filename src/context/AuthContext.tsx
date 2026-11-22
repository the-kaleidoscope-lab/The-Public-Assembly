import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('prospera_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('prospera_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              idToken,
              email: firebaseUser.email, 
              fullName: firebaseUser.displayName || 'Anonymous' 
            })
          });
          if (res.ok) {
            const data = await res.json();
            const userData = { ...data.user, id: data.user.id || data.user._id };
            setUser(userData);
            localStorage.setItem('prospera_user', JSON.stringify(userData));
            if (data.token) {
              localStorage.setItem('prospera_token', data.token);
            }
          }
        } catch (e) {
          console.error('Auth sync error:', e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      const userData = { ...data.user, id: data.user.id || data.user._id };
      setUser(userData);
      localStorage.setItem('prospera_user', JSON.stringify(userData));
      localStorage.setItem('prospera_token', data.token);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
  };

  const register = async (formData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const data = await res.json();
      const userData = { ...data.user, id: data.user.id || data.user._id };
      setUser(userData);
      localStorage.setItem('prospera_user', JSON.stringify(userData));
      localStorage.setItem('prospera_token', data.token);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('prospera_user');
      localStorage.removeItem('prospera_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, register, logout, loading }}>
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
