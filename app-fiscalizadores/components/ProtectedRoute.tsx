import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🚪 Redirigiendo a login...');
      router.replace('/login');
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    console.log('⏳ Mostrando loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0051A8" />
        <Text style={{ marginTop: 16 }}>Verificando sesión...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 No autenticado, mostrando null...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Redirigiendo al login...</Text>
      </View>
    );
  }

  console.log('✅ Mostrando contenido protegido');
  return <>{children}</>;
}