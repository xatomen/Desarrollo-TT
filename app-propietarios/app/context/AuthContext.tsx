import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userInfo: any;
  login: (token: string, userInfo: any, expiresIn: number) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  userInfo: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  checkTokenValidity: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔄 AuthProvider renderizado - loading:', loading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect ejecutándose...');
    checkAuthStatus();
  }, []);

  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      console.log('🔍 Iniciando checkTokenValidity...');
      
      const storedToken = await AsyncStorage.getItem('access_token');
      const tokenExpiry = await AsyncStorage.getItem('token_expiry');

      console.log('Token existe:', !!storedToken);
      console.log('Expiry existe:', !!tokenExpiry);

      if (!storedToken || !tokenExpiry) {
        console.log('❌ No hay token o expiry - retornando false');
        return false;
      }

      const now = Date.now();
      const expiryTime = parseInt(tokenExpiry);

      console.log('Tiempo actual:', new Date(now).toLocaleString());
      console.log('Token expira:', new Date(expiryTime).toLocaleString());
      console.log('Token válido:', now < expiryTime);

      if (now >= expiryTime) {
        console.log('❌ Token expirado, limpiando...');
        await logout();
        return false;
      }

      console.log('✅ Token válido - retornando true');
      return true;
    } catch (error) {
      console.error('💥 Error in checkTokenValidity:', error);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    console.log('🚀 Iniciando checkAuthStatus...');
    
    try {
      const isValid = await checkTokenValidity();
      console.log('📊 checkTokenValidity result:', isValid);
      
      if (isValid) {
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedUserInfo = await AsyncStorage.getItem('user_info');
        
        setToken(storedToken);
        setUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : null);
        setIsAuthenticated(true);
        console.log('✅ Usuario autenticado');
      } else {
        console.log('❌ Usuario NO autenticado');
        setIsAuthenticated(false);
        setToken(null);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('💥 Error in checkAuthStatus:', error);
      setIsAuthenticated(false);
      setToken(null);
      setUserInfo(null);
    } finally {
      console.log('🏁 checkAuthStatus terminado - estableciendo loading = false');
      setLoading(false);
    }
  };

  const login = async (accessToken: string, userData: any, expiresIn: number) => {
    try {
      console.log('🔐 Iniciando login...');
      const expiryTime = Date.now() + (expiresIn * 1000);

      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('user_info', JSON.stringify(userData));
      await AsyncStorage.setItem('token_expiry', expiryTime.toString());

      setToken(accessToken);
      setUserInfo(userData);
      setIsAuthenticated(true);
      console.log('✅ Login exitoso');
    } catch (error) {
      console.error('💥 Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      await AsyncStorage.multiRemove(['access_token', 'user_info', 'token_expiry']);
      setToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('💥 Error en logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      token,
      userInfo,
      login,
      logout,
      loading,
      checkTokenValidity,
    }}>
      {children}
    </AuthContext.Provider>
  );
};