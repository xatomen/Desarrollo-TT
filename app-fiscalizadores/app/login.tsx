import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '@/components/Navbar';
import { useAuth } from './context/AuthContext';
import API_CONFIG from '../config/api';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCredentialHelp, setShowCredentialHelp] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // Nuevo estado para el modal de bienvenida
  const { login, isAuthenticated, loading } = useAuth();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('👤 Usuario ya autenticado, redirigiendo a insert-ppu');
      router.replace('/insert-ppu');
    }
  }, [isAuthenticated, loading]);

  // useEffect para mostrar el modal de bienvenida
  useEffect(() => {
    const checkWelcomeModal = () => {
      try {
        // Verificar si ya se mostró la bienvenida en esta sesión
        const hasSeenFiscalizadorWelcome = sessionStorage.getItem('hasSeenFiscalizadorWelcome');
        
        if (!hasSeenFiscalizadorWelcome && !loading && !isAuthenticated) {
          // Si no se ha visto y no está autenticado, mostrar después de 800ms
          const timer = setTimeout(() => {
            setShowWelcomeModal(true);
          }, 800);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        // En caso de que sessionStorage no esté disponible
        console.log('SessionStorage no disponible, mostrando bienvenida por defecto');
        if (!loading && !isAuthenticated) {
          const timer = setTimeout(() => {
            setShowWelcomeModal(true);
          }, 800);
          
          return () => clearTimeout(timer);
        }
      }
    };

    checkWelcomeModal();
  }, [loading, isAuthenticated]);

  // useEffect para hacer que el mensaje de error desaparezca después de 5 segundos
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Si está cargando la verificación de autenticación, mostrar loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0051A8" />
          <Text style={{ marginTop: 16, fontFamily: 'Roboto' }}>Verificando sesión...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si ya está autenticado, no mostrar nada (se está redirigiendo)
  if (isAuthenticated) {
    return null;
  }

  // Función para formatear el RUT
  const formatRUT = (value: string) => {
    // Remover todo lo que no sea número o K
    const cleanValue = value.replace(/[^0-9kK]/g, '');
    
    if (cleanValue.length === 0) return '';
    
    // Separar el cuerpo del dígito verificador
    const body = cleanValue.slice(0, -1);
    const dv = cleanValue.slice(-1).toUpperCase();
    
    if (body.length === 0) return dv;
    
    // Formatear el cuerpo con puntos
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Si hay dígito verificador, agregar guión
    if (cleanValue.length > 1) {
      return `${formattedBody}-${dv}`;
    }
    
    return formattedBody;
  };

  // Función para manejar el cambio de texto en el RUT
  const handleRUTChange = (text: string) => {
    // Limitar a 12 caracteres (incluyendo puntos y guión)
    if (text.length <= 12) {
      const formatted = formatRUT(text);
      setUsuario(formatted);
    }
  };

  // Función para manejar cuando el usuario completa la bienvenida
  const handleWelcomeComplete = () => {
    try {
      // Guardar en sessionStorage que ya vio la bienvenida
      sessionStorage.setItem('hasSeenFiscalizadorWelcome', 'true');
    } catch (error) {
      console.log('No se pudo guardar en sessionStorage');
    }
    
    // Cerrar el modal
    setShowWelcomeModal(false);
  };

  const handleLogin = async () => {
    setErrorMsg('');
    
    if (!usuario.trim() || !password.trim()) {
      setErrorMsg('Por favor, complete todos los campos');
      return;
    }

    try {
      const rutSinPuntos = usuario.replace(/\./g, '');
      
      // Simular login exitoso para testing (quitar esto cuando tengas la API real)
      // const mockData = {
      //   access_token: 'fake_token_123',
      //   user_info: { name: 'Usuario Test', rut: rutSinPuntos },
      //   expires_in: 7200
      // };
      
      // await login(mockData.access_token, mockData.user_info, mockData.expires_in);
      // router.replace('/insert-ppu');
      
      
      // Código real para cuando tengas la API
      const response = await fetch(`${API_CONFIG.TGR}validar_credenciales/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          rut: rutSinPuntos,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      await login(data.access_token, data.user_info, data.expires_in);
      router.replace('/insert-ppu');
      
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
    }
  };

  // Modal de bienvenida para fiscalizadores
  const renderWelcomeModal = () => (
    <Modal
      animationType="fade" // <-- Cambia aquí de "slide" a "fade"
      transparent={true}
      visible={showWelcomeModal}
      onRequestClose={() => setShowWelcomeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.welcomeModalLarge]}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="shield-checkmark" size={40} color="#006FB3" />
            <Text style={styles.welcomeTitle}>¡Bienvenido, Fiscalizador!</Text>
            <Text style={styles.welcomeSubtitle}>Sistema de Fiscalización Vehicular</Text>
          </View>
          
          <ScrollView style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Con esta aplicación podrás realizar fiscalizaciones de manera rápida y eficiente, 
              accediendo a toda la información vehicular en segundos.
            </Text>
            
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>¿Qué puedes hacer?</Text>
              
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={24} color="#006FB3" />
                <Text style={styles.featureText}>
                  <Text style={styles.boldText}>Fiscalizar en segundos:</Text> Consulta inmediata ingresando solo la PPU
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="speedometer" size={24} color="#006FB3" />
                <Text style={styles.featureText}>
                  <Text style={styles.boldText}>Estado rápido del vehículo:</Text> Información completa al instante
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="document-text" size={24} color="#006FB3" />
                <Text style={styles.featureText}>
                  <Text style={styles.boldText}>Vigencia de documentos:</Text> Permiso, SOAP, Revisión Técnica
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="car" size={24} color="#006FB3" />
                <Text style={styles.featureText}>
                  <Text style={styles.boldText}>Encargo por robo:</Text> Verificación automática de denuncias
                </Text>
              </View>
              
            </View>
            
            <View style={styles.loginInstructions}>
              <Text style={styles.instructionsTitle}>Para comenzar tu fiscalización:</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="person" size={20} color="#006FB3" />
                <Text style={styles.instructionText}>Ingresa tu RUT</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="key" size={20} color="#006FB3" />
                <Text style={styles.instructionText}>Usa tu credencial otorgada por la TGR</Text>
              </View>
            </View>
            
            <View style={styles.securityInfo}>
              <Ionicons name="shield-outline" size={24} color="#28a745" />
              <Text style={styles.securityText}>
                <Text style={styles.boldText}>Sistema seguro y confiable</Text> respaldado por la 
                Tesorería General de la República para garantizar la autenticidad de la información.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.welcomeButton}
            onPress={handleWelcomeComplete}
          >
            <Text style={styles.welcomeButtonText}>¡Comenzar Fiscalización!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Modal de ayuda para credenciales
  const renderCredentialHelpModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCredentialHelp}
      onRequestClose={() => setShowCredentialHelp(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="help-circle" size={24} color="#0051A8" />
            <Text style={styles.modalTitle}>¿Qué es la Credencial?</Text>
            <TouchableOpacity onPress={() => setShowCredentialHelp(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>
            <Text style={styles.boldText}>La credencial es una clave secreta</Text> otorgada por la 
            <Text style={styles.boldText}> Tesorería General de la República (TGR)</Text> que autoriza 
            el uso de esta aplicación a los fiscalizadores.{'\n\n'}
            
            <Text style={styles.boldText}>Características:</Text>{'\n'}
            • Es personal e intransferible{'\n'}
            • Permite acceder al sistema de fiscalización{'\n'}
            • Solo la TGR puede otorgarla o renovarla{'\n\n'}
            
            <Text style={styles.boldText}>¿No tienes credencial?</Text>{'\n'}
            Contacta a la Tesorería General de la República para obtenerla.
          </Text>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowCredentialHelp(false)}
          >
            <Text style={styles.modalButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          <Text style={styles.title}>Portal Fiscalizadores</Text>
          <TouchableOpacity 
            style={styles.helpIconTitle}
            onPress={() => setShowWelcomeModal(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#006FB3" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Ingrese su RUT</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#4A4A4A" style={styles.inputIconLeft} />
            <TextInput
              style={styles.textInput}
              placeholder="12.345.678-9"
              value={usuario}
              onChangeText={handleRUTChange}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={12}
            />
          </View>
          <Text style={styles.inputHelp}>RUT en el formato: 12.345.678-9</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputLabelContainer}>
            <Text style={styles.inputLabel}>Ingrese su Credencial</Text>
            <TouchableOpacity 
              style={styles.helpIcon}
              onPress={() => setShowCredentialHelp(true)}
            >
              <Ionicons name="help-circle-outline" size={20} color="#0051A8" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#4A4A4A" style={styles.inputIconLeft} />
            <TextInput
              style={styles.textInput}
              placeholder="Credencial"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#4A4A4A" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHelp}>Credencial otorgada por la Tesorería General de la República</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleLogin}
        >
          <Text style={styles.backButtonText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderWelcomeModal()}
      {renderCredentialHelpModal()}
    </SafeAreaView>
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
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto',
    flex: 1,
  },
  helpIconTitle: {
    padding: 8,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Roboto',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputHelp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginTop: 4,
    fontFamily: 'Roboto',
  },
  inputLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
    fontFamily: 'Roboto',
    flex: 1,
  },
  
  // Nuevo estilo para el contenedor del label con ícono de ayuda
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpIcon: {
    padding: 4,
    marginLeft: 8,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 0,
    backgroundColor: 'white',
    fontFamily: 'Roboto',
    fontSize: 24,
  },
  inputIconLeft: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#006FB3',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  warningAlert: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  warningAlertText: {
    color: '#dc2626',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  backButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'center',
    width: 'auto',
    maxWidth: '60%',
    borderBottomWidth: 3,
    borderBottomColor: '#004d99',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Estilos para el modal de ayuda
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: '#0051A8',
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

  // Estilos para el modal de bienvenida
  welcomeModalLarge: {
    maxWidth: '95%',
    maxHeight: '90%',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  welcomeContent: {
    flex: 1,
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
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginLeft: 12,
    fontFamily: 'Roboto',
    flex: 1,
    lineHeight: 20,
  },
  loginInstructions: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },
  securityInfo: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  securityText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Roboto',
    lineHeight: 22,
  },
  welcomeButton: {
    backgroundColor: '#006FB3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#004d99',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 10,
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
