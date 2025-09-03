'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface UserData {
  rut: string;
  nombre?: string;
  email?: string;
  // Agregar más campos según tu token JWT
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (rut: string, claveUnica: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para decodificar JWT (básico, sin verificación de firma)
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
}

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/'];

  // Función para inicializar la autenticación desde cookies
  const initializeAuth = () => {
    try {
      const savedToken = Cookies.get('auth_token');
      
      if (savedToken && !isTokenExpired(savedToken)) {
        const userData = decodeJWT(savedToken);
        if (userData) {
          setToken(savedToken);
          setUser({
            rut: userData.rut,
            nombre: userData.nombre,
            email: userData.email,
          });
          setIsAuthenticated(true);
        }
      } else {
        // Token expirado o inválido, limpiar cookies
        Cookies.remove('auth_token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      Cookies.remove('auth_token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer login
  const login = async (rut: string, claveUnica: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5004/validar_clave_unica`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: rut,
          contrasena: claveUnica
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.access_token) {
        // Guardar token en cookies (expira en 24 horas)
        Cookies.set('auth_token', data.access_token, { 
          expires: 1, // 1 día
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Decodificar y guardar datos del usuario
        const userData = decodeJWT(data.access_token);
        console.log('User data from token:', userData);
        
        setToken(data.access_token);
        setUser({
          rut: data.user_info?.rut || rut, // ✅ Usar datos de user_info si están disponibles
          nombre: userData.nombre || data.user_info?.nombre,
          email: userData.email || data.user_info?.email,
          id: data.user_info?.id, // ✅ Agregar el ID si lo necesitas
        });
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer logout
  const logout = () => {
    Cookies.remove('auth_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Verificar autenticación al cargar y en cambios de ruta
  useEffect(() => {
    initializeAuth();
  }, []);

  // Redireccionar según estado de autenticación
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        // Usuario no autenticado intentando acceder a ruta protegida
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        // Usuario autenticado intentando acceder al login
        router.push('/home');
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Verificar token periódicamente
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        if (isTokenExpired(token)) {
          logout();
        }
      }, 60000); // Verificar cada minuto

      return () => clearInterval(interval);
    }
  }, [token]);

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}