import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    
    // Validaciones básicas
    if (!usuario.trim() || !password.trim()) {
      setErrorMsg('Por favor, complete todos los campos');
      return;
    }

    try {
    //   // Aquí puedes agregar la lógica de autenticación con tu API
    //   const response = await fetch('http://localhost:8000/auth/login', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       username: usuario,
    //       password: password,
    //     }),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Credenciales incorrectas');
    //   }

    //   const data = await response.json();
    //   console.log('Login exitoso:', data);
      
      // Redirigir a la pantalla principal
      router.replace('/insert-ppu');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={32} color="white" />
          <Text style={styles.headerTitle}>APP Fiscalizadores</Text>
        </View>
      </View>

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
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <Text style={styles.subtitle}>
          Ingrese sus credenciales para acceder
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Usuario</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIconLeft} />
            <TextInput
              style={styles.textInput}
              placeholder="Ingrese su usuario"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIconLeft} />
            <TextInput
              style={styles.textInput}
              placeholder="Ingrese su contraseña"
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
                color="#6b7280" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'white',
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
});
