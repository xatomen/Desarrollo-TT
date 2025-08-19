import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [ppu, setPpu] = useState('');

  const handleConsultar = () => {
    // Aquí conectarás con tu API
    console.log('Consultando PPU:', ppu);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-circle-outline" size={24} color="white" />
          <Text style={styles.headerTitle}>APP Fiscalizadores</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

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
});
