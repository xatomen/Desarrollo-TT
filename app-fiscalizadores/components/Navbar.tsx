import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="person-circle-outline" size={24} color="white" />
        <Text style={styles.headerTitle}>APP Fiscalizadores</Text>
      </View>
      
      {/* Solo mostrar el botón de logout si el usuario está autenticado */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0A132D',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  logoutButton: {
    backgroundColor: '#0051A8',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: 'Roboto',
  },
});
