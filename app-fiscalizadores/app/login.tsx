import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '@/components/Navbar';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isAuthenticated, loading } = useAuth();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('👤 Usuario ya autenticado, redirigiendo a insert-ppu');
      router.replace('/insert-ppu');
    }
  }, [isAuthenticated, loading]);

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
      const response = await fetch('http://localhost:5007/validar_credenciales/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        <Text style={styles.title}>Portal Fiscalizadores</Text>
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
          <Text style={styles.inputLabel}>Ingrese su Credencial</Text>
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
          <Text style={styles.backButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto',
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
    backgroundColor: '#0051A8',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 150,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});
