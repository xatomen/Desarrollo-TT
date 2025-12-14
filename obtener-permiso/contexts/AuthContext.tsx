'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import API_CONFIG from '@/config/api';

interface UserData {
  rut: string;
  nombre?: string;
  email?: string;
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

// Función para decodificar JWT
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

// Funciones para manejar datos del usuario en cookies
function saveUserToCookies(userData: UserData) {
  try {
    Cookies.set('user_data', JSON.stringify(userData), {
      expires: 1, // 1 día
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  } catch (error) {
    console.error('Error guardando datos del usuario en cookies:', error);
  }
}

function getUserFromCookies(): UserData | null {
  try {
    const userData = Cookies.get('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error obteniendo datos del usuario desde cookies:', error);
    return null;
  }
}

function clearUserCookies() {
  Cookies.remove('auth_token');
  Cookies.remove('user_data');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Helper para rutas que funcione con basePath
  const getRoute = (path: string) => {
    // router.push() de Next.js maneja automáticamente el basePath
    // pero normalizamos para asegurar que funcione
    return path.startsWith('/') ? path : '/' + path;
  };

  const publicRoutes = ['/login', '/', '/preguntas-frecuentes'];

  // Función mejorada para inicializar autenticación
  const initializeAuth = () => {
    try {
      console.log('Inicializando autenticación...');
      
      const savedToken = Cookies.get('auth_token');
      const savedUserData = getUserFromCookies();
      
      console.log('Token encontrado:', !!savedToken);
      console.log('Datos de usuario encontrados:', !!savedUserData);
      
      if (savedToken && !isTokenExpired(savedToken) && savedUserData) {
        // Usar datos guardados en cookies
        setToken(savedToken);
        setUser(savedUserData);
        setIsAuthenticated(true);
        console.log('Usuario restaurado desde cookies:', savedUserData);
      } else if (savedToken && !isTokenExpired(savedToken)) {
        // Fallback: obtener datos del token si no hay datos en cookies
        const userData = decodeJWT(savedToken);
        if (userData && userData.rut) {
          const userInfo = {
            rut: userData.rut,
            nombre: userData.nombre,
            email: userData.email,
          };
          
          setToken(savedToken);
          setUser(userInfo);
          setIsAuthenticated(true);
          
          // Guardar en cookies para la próxima vez
          saveUserToCookies(userInfo);
          console.log('Usuario restaurado desde token y guardado en cookies:', userInfo);
        } else {
          console.log('Token no contiene datos válidos del usuario');
          clearUserCookies();
        }
      } else {
        console.log('Token no encontrado, expirado o datos incompletos');
        clearUserCookies();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      clearUserCookies();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de login actualizada
  const login = async (rut: string, claveUnica: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_CONFIG.SGD}validar_clave_unica`, {
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
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Guardar token
        Cookies.set('auth_token', data.access_token, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        });

        // Preparar y guardar datos del usuario
        const userData = decodeJWT(data.access_token);
        const userInfo = {
          rut: data.user_info?.rut || userData?.rut || rut,
          nombre: data.user_info?.nombre || userData?.nombre,
          email: data.user_info?.email || userData?.email,
        };
        
        // Guardar en estado y cookies
        setToken(data.access_token);
        setUser(userInfo);
        setIsAuthenticated(true);
        saveUserToCookies(userInfo);
        
        console.log('Login exitoso. Usuario guardado:', userInfo);
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

  // Función de logout actualizada
  const logout = () => {
    clearUserCookies();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push(getRoute('/login'));
  };

  // useEffect para actualizar cookies cuando cambie el usuario
  useEffect(() => {
    if (user && isAuthenticated) {
      saveUserToCookies(user);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push(getRoute('/login'));
      } else if (isAuthenticated && pathname === '/login') {
        router.push(getRoute('/home'));
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        if (isTokenExpired(token)) {
          logout();
        }
      }, 60000);

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

export function useRut(): string | null {
  return useAuth().user?.rut || null;
}

// ✅ Hooks adicionales para acceso directo desde cookies
export function getUserDataFromCookies(): UserData | null {
  return getUserFromCookies();
}

export function getRutFromCookies(): string | null {
  const userData = getUserFromCookies();
  return userData?.rut || null;
}