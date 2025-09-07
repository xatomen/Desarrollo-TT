'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API_CONFIG from '../config/api';

interface LoginRequest {
  rut: string;
  password: string;
}

interface UserInfo {
  [key: string]: any;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: UserInfo;
  expires_in: number;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
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

// Funciones para manejar cookies
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado en cookies al inicializar
    const savedToken = getCookie('access_token');
    const savedUser = getCookie('user_info');
    const tokenExpiry = getCookie('token_expiry');

    if (savedToken && savedUser && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setToken(savedToken);
        setUser(JSON.parse(decodeURIComponent(savedUser)));
      } else {
        // Token expirado, limpiar cookies
        deleteCookie('access_token');
        deleteCookie('user_info');
        deleteCookie('token_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BACKEND}login_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Calcular tiempo de expiración (en días para las cookies)
      const expiryTime = Date.now() + (data.expires_in * 1000);
      const expiryDays = data.expires_in / (24 * 60 * 60); // convertir segundos a días
      
      // Guardar en cookies
      setCookie('access_token', data.access_token, expiryDays);
      setCookie('user_info', encodeURIComponent(JSON.stringify(data.user_info)), expiryDays);
      setCookie('token_expiry', expiryTime.toString(), expiryDays);

      // Actualizar estado
      setToken(data.access_token);
      setUser(data.user_info);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Limpiar cookies
    deleteCookie('access_token');
    deleteCookie('user_info');
    deleteCookie('token_expiry');
    
    // Limpiar estado
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;