import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated, loading } = useAuth();

  console.log('🏠 Index - loading:', loading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        console.log('🏠 Index - Redirigiendo a vehicle-list');
        router.replace('/vehicle-list');
      } else {
        console.log('🏠 Index - Redirigiendo a login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0051A8" />
      <Text style={{ marginTop: 16 }}>Cargando aplicación...</Text>
    </View>
  );
}
