import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Navbar() {
  const handleLogout = () => {
    	router.replace('/login');
  };

	return(
		<View style={styles.header}>
			<View style={styles.headerLeft}>
				<Ionicons name="person-circle-outline" size={24} color="white" />
				<Text style={styles.headerTitle}>APP Fiscalizadores</Text>
			</View>
			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Text style={styles.logoutText}>Cerrar Sesión</Text>
				<Ionicons name="log-out-outline" size={20} color="white" />
			</TouchableOpacity>
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
