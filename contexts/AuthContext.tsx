
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/firebase';
import { UserProfileService } from '../services/userProfile';

interface AuthContextType {
  currentUser: any | null;
  loading: boolean;
  // FIX: Update parameter names from 'pass' to 'password' to match the implementation signature.
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  // FIX: Add a null check to ensure the hook is used within the provider context.
  // This provides a clearer error message and improves type safety for components using this hook.
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX: Add explicit types to function parameters to avoid implicit 'any' errors.
  function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  // FIX: Add explicit types to function parameters to avoid implicit 'any' errors.
  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function deleteAccount() {
    const user = auth.currentUser;
    if (user) {
      return user.delete();
    }
    return Promise.reject(new Error("No user is logged in."));
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // 사용자 프로필 생성/업데이트
        try {
          await UserProfileService.createOrUpdateProfile(user.uid, user.email || '');
        } catch (error) {
          console.error('프로필 생성/업데이트 실패:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}