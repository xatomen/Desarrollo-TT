import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useAuth } from './context/AuthContext';

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import API_CONFIG from '@/config/api';

export default function HomeScreen() {
  const [ppu, setPpu] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showWelcomeHelp, setShowWelcomeHelp] = useState(false); // Inicializar como false
  const { checkTokenValidity } = useAuth();

  // useEffect para verificar si mostrar la ayuda de bienvenida
  useEffect(() => {
    const checkWelcomeHelp = () => {
      try {
        // Verificar si ya se mostró la ayuda en esta sesión
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeHelp');
        
        if (!hasSeenWelcome) {
          // Si no se ha visto, mostrar después de 500ms
          const timer = setTimeout(() => {
            setShowWelcomeHelp(true);
          }, 500);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        // En caso de que sessionStorage no esté disponible (ej: React Native)
        console.log('SessionStorage no disponible, mostrando ayuda por defecto');
        const timer = setTimeout(() => {
          setShowWelcomeHelp(true);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };

    checkWelcomeHelp();
  }, []);

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
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
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

  // Función para manejar cuando el usuario presiona "Comenzar"
  const handleWelcomeComplete = () => {
    try {
      // Guardar en sessionStorage que ya vio la ayuda
      sessionStorage.setItem('hasSeenWelcomeHelp', 'true');
    } catch (error) {
      console.log('No se pudo guardar en sessionStorage');
    }
    
    // Cerrar el modal
    setShowWelcomeHelp(false);
  };

  // Función para resetear la ayuda (útil para testing o si quieres agregar un botón de reset)
  const resetWelcomeHelp = () => {
    try {
      sessionStorage.removeItem('hasSeenWelcomeHelp');
      setShowWelcomeHelp(true);
    } catch (error) {
      console.log('No se pudo resetear sessionStorage');
      setShowWelcomeHelp(true);
    }
  };

  const renderHelpModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showHelpModal}
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="help-circle" size={24} color="#006FB3" />
            <Text style={styles.modalTitle}>Ayuda - Consultar PPU</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>
            <Text style={styles.boldText}>¿Qué puedes hacer aquí?</Text>{'\n\n'}
            • Ingresa la Placa Patente Única (PPU) del vehículo{'\n'}
            • Consulta el estado de todos los documentos vehiculares{'\n'}
            • Verifica: Permiso de Circulación, SOAP, Revisión Técnica y Encargo por Robo{'\n\n'}
            <Text style={styles.boldText}>Formato de PPU:</Text>{'\n'}
            • 6 caracteres (ej: ABC123 o ABCD12){'\n'}
            • Solo letras y números
          </Text>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowHelpModal(false)}
          >
            <Text style={styles.modalButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderWelcomeHelp = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showWelcomeHelp}
      onRequestClose={() => setShowWelcomeHelp(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.welcomeModal]}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="information-circle" size={32} color="#006FB3" />
            <Text style={styles.welcomeTitle}>¡Bienvenido, Fiscalizador!</Text>
          </View>
          <Text style={styles.welcomeText}>
            Aquí puedes ingresar la placa patente única del vehículo para revisar el estado de todos sus documentos de manera rápida y eficiente.
          </Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="document-text" size={20} color="#006FB3" />
              <Text style={styles.featureText}>Permiso de Circulación</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#006FB3" />
              <Text style={styles.featureText}>SOAP (Seguro Obligatorio)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="car" size={20} color="#006FB3" />
              <Text style={styles.featureText}>Revisión Técnica</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="warning" size={20} color="#006FB3" />
              <Text style={styles.featureText}>Encargo por robo</Text>
            </View>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.welcomeButtonsContainer}>
            <TouchableOpacity 
              style={styles.welcomeButton}
              onPress={handleWelcomeComplete}
            >
              <Text style={styles.welcomeButtonText}>¡Comenzar!</Text>
            </TouchableOpacity>
            
            {/* Botón opcional para resetear (puedes comentarlo en producción) */}
            {/* <TouchableOpacity 
              style={[styles.welcomeButton, styles.resetButton]}
              onPress={resetWelcomeHelp}
            >
              <Text style={styles.welcomeButtonText}>Mostrar siempre</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Modal>
  );

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
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Consultar Placa Patente Única</Text>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => setShowHelpModal(true)}
            >
              <Ionicons name="help-circle-outline" size={24} color="#006FB3" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Ingrese la Placa Patente Única a consultar
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Placa Patente Única (ej: ABC123)"
              value={ppu}
              onChangeText={setPpu}
              autoCapitalize="characters"
              maxLength={6}
            />
            <View style={styles.inputIcon}>
              <Text style={styles.iconText}>PPU</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.consultarButton}
            onPress={handleConsultar}
          >
            <Text style={styles.consultarButtonText}>Consultar Vehículo</Text>
          </TouchableOpacity>

          {/* Botón de ayuda adicional (opcional) */}
          <TouchableOpacity
            style={styles.showHelpAgainButton}
            onPress={() => setShowWelcomeHelp(true)}
          >
            {/* <Text style={styles.showHelpAgainText}>¿Necesitas ayuda? 📖</Text> */}
          </TouchableOpacity>
        </View>

        {/* Modals */}
        {renderHelpModal()}
        {renderWelcomeHelp()}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: 'Roboto',
    flex: 1,
  },
  helpButton: {
    padding: 8,
    marginLeft: 8,
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
    maxWidth: '100%',
    width: 'auto',
  },
  consultarButtonText: {
    color: 'white',
    fontSize: 16,
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
  
  // Botón para mostrar ayuda nuevamente
  showHelpAgainButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 8,
  },
  showHelpAgainText: {
    color: '#006FB3',
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  
  // Estilos para modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Roboto',
  },
  modalText: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  
  // Estilos para modal de bienvenida
  welcomeModal: {
    maxWidth: '95%',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 12,
    fontFamily: 'Roboto',
  },
  welcomeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  welcomeButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});
