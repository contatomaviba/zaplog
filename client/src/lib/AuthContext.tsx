import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter'; // <-- Adicione esta linha
import { authApi, isAuthenticated } from './auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation(); // <-- Adicione esta linha

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    setIsAuth(true);
  };

  const logout = () => {
    authApi.logout();
    setIsAuth(false);
    setLocation('/login'); // <-- Adicione esta linha para redirecionar
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuth, login, logout, isLoading }}>
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