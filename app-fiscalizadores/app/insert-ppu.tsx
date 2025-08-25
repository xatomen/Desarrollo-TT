import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useAuth } from './context/AuthContext';

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomeScreen() {
  const [ppu, setPpu] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { checkTokenValidity } = useAuth();

  // useEffect para hacer que el mensaje de error desaparezca después de 5 segundos
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000); // 5 segundos

      // Limpiar el timer si el componente se desmonta o errorMsg cambia
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleConsultar = async () => {
    setErrorMsg(''); // Limpiar mensaje previo

    const isTokenValid = await checkTokenValidity();
    if (!isTokenValid) {
      setErrorMsg('Su sesión ha expirado. Redirigiendo al login...');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/consultar_patente/${ppu}`);
      if (!response.ok) {
        throw new Error((await response.json()).detail);
      }
      const data = await response.json();
      console.log('Datos del vehículo:', data);
      // Enviar a la siguiente pantalla con los datos del vehículo
      router.push({
        pathname: '/vehicle-details',
        params: { vehicle: JSON.stringify(data), ppu: ppu }
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al consultar PPU');
    }
  };

  return (
    <ProtectedRoute>
    <SafeAreaView style={styles.container}>

      {/* Navbar */}
      <Navbar />

      {/* Alert bar */}
      {errorMsg !== '' && (
        <View style={styles.warningAlert}>
          <Text style={styles.warningAlertText}>
            {errorMsg}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Consultar Placa Patente Única</Text>
        
        <Text style={styles.subtitle}>
          Ingrese la Placa Patente Única a consultar
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Placa Patente Única"
            value={ppu}
            onChangeText={setPpu}
            autoCapitalize="characters"
            maxLength={6}
          />
          <View style={styles.inputIcon}>
            <Text style={styles.iconText}>ABC</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.consultarButton}
          onPress={handleConsultar}
        >
          <Text style={styles.consultarButtonText}>Consultar Vehículo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1e3a5f',
    padding: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Roboto',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },
  logoutButton: {
    backgroundColor: '#006FB3',
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 60,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  textInput: {
    height: 56,
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 0,
    paddingHorizontal: 16,
    fontSize: 24,
    backgroundColor: 'white',
    fontFamily: 'Roboto',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  consultarButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignSelf: 'center',
  },
  consultarButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  warningAlert: {
    color: 'red',
    textAlign: 'center',
    backgroundColor: '#ffe6e6',
    padding: 16,
    margin: 16,
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    top: 150,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  warningAlertText: {
    color: 'red',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
});
