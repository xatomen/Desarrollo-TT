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
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=lax`;
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

// Funciones para manejar localStorage
const setLocalStorage = (name: string, value: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
};

const getLocalStorage = (name: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(name);
    }
  } catch (error) {
    console.error('Error obteniendo de localStorage:', error);
  }
  return null;
};

const deleteLocalStorage = (name: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  } catch (error) {
    console.error('Error eliminando de localStorage:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado en cookies o localStorage al inicializar
    const savedTokenCookie = getCookie('access_token');
    const savedTokenStorage = getLocalStorage('access_token');
    const savedToken = savedTokenCookie || savedTokenStorage;
    
    const savedUserCookie = getCookie('user_info');
    const savedUserStorage = getLocalStorage('user_info');
    const savedUser = savedUserCookie || savedUserStorage;
    
    const tokenExpiryCookie = getCookie('token_expiry');
    const tokenExpiryStorage = getLocalStorage('token_expiry');
    const tokenExpiry = tokenExpiryCookie || tokenExpiryStorage;

    if (savedToken && savedUser && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setToken(savedToken);
        setUser(JSON.parse(decodeURIComponent(savedUser)));
        // Asegurar que esté en ambos lados
        setCookie('access_token', savedToken, 1);
        setCookie('user_info', savedUser, 1);
        setCookie('token_expiry', tokenExpiry, 1);
        setLocalStorage('access_token', savedToken);
        setLocalStorage('user_info', savedUser);
        setLocalStorage('token_expiry', tokenExpiry);
      } else {
        // Token expirado, limpiar cookies y localStorage
        deleteCookie('access_token');
        deleteCookie('user_info');
        deleteCookie('token_expiry');
        deleteLocalStorage('access_token');
        deleteLocalStorage('user_info');
        deleteLocalStorage('token_expiry');
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
      
      // Guardar en cookies y localStorage
      setCookie('access_token', data.access_token, expiryDays);
      setCookie('user_info', encodeURIComponent(JSON.stringify(data.user_info)), expiryDays);
      setCookie('token_expiry', expiryTime.toString(), expiryDays);
      
      setLocalStorage('access_token', data.access_token);
      setLocalStorage('user_info', encodeURIComponent(JSON.stringify(data.user_info)));
      setLocalStorage('token_expiry', expiryTime.toString());

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
    // Limpiar cookies y localStorage
    deleteCookie('access_token');
    deleteCookie('user_info');
    deleteCookie('token_expiry');
    deleteLocalStorage('access_token');
    deleteLocalStorage('user_info');
    deleteLocalStorage('token_expiry');
    
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