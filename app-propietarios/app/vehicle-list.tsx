import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
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

type Vehicle = {
  ppu: string;
  marca: string;
  modelo: string;
  estado?: string;
};

export default function VehicleListScreen() {
  const [ppu, setPpu] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showWelcomeHelp, setShowWelcomeHelp] = useState(false); // Nuevo estado para el modal de bienvenida
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Obtener la información del usuario autenticado
  const { userInfo, token, checkTokenValidity } = useAuth();
  
  // Extraer el RUT del usuario
  const userRut = userInfo?.rut;

  useEffect(() => {
    if (userRut) {
      console.log('👤 RUT del usuario autenticado:', userRut);
      getVehicles();
    }
  }, [userRut]);

  // useEffect para mostrar la ayuda de bienvenida
  useEffect(() => {
    const checkWelcomeHelp = () => {
      try {
        // Verificar si ya se mostró la ayuda en esta sesión
        const hasSeenVehicleListWelcome = sessionStorage.getItem('hasSeenVehicleListWelcome');
        
        if (!hasSeenVehicleListWelcome) {
          // Si no se ha visto, mostrar después de 1 segundo (para dar tiempo a cargar los vehículos)
          const timer = setTimeout(() => {
            setShowWelcomeHelp(true);
          }, 1000);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        // En caso de que sessionStorage no esté disponible
        console.log('SessionStorage no disponible, mostrando ayuda por defecto');
        const timer = setTimeout(() => {
          setShowWelcomeHelp(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    };

    // Solo mostrar ayuda si ya tenemos el RUT del usuario
    if (userRut) {
      checkWelcomeHelp();
    }
  }, [userRut]);

  // Calcular elementos para mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  const getVehicles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}vehiculos_rut/${userRut}`);
      if (!response.ok) {
        throw new Error((await response.json()).detail);
      }
      const vehiclesData = await response.json();
      console.log('Datos de los vehículos:', vehiclesData);
      
      setVehicles(vehiclesData);
      setTotalItems(vehiclesData.length);
      setCurrentPage(1); // Resetear a la primera página
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al obtener vehículos del usuario');
    }
  };

  // Función para manejar cuando el usuario presiona "¡Comenzar!"
  const handleWelcomeComplete = () => {
    try {
      // Guardar en sessionStorage que ya vio la ayuda
      sessionStorage.setItem('hasSeenVehicleListWelcome', 'true');
    } catch (error) {
      console.log('No se pudo guardar en sessionStorage');
    }
    
    // Cerrar el modal
    setShowWelcomeHelp(false);
  };

  // Función para cambiar la página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Función para cambiar items por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // useEffect para hacer que el mensaje de error desaparezca después de 5 segundos
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleConsultar = async () => {
    setErrorMsg('');

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
      
      router.push({
        pathname: '/vehicle-details',
        params: { vehicle: JSON.stringify(data), ppu: ppu }
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al consultar PPU');
    }
  };

  // Modal de bienvenida
  const renderWelcomeModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showWelcomeHelp}
      onRequestClose={() => setShowWelcomeHelp(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.welcomeModal]}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="car-sport" size={36} color="#0051A8" />
            <Text style={styles.welcomeTitle}>¡Bienvenido a tu Portal de Vehículos!</Text>
          </View>
          <Text style={styles.welcomeText}>
            Aquí podrás ver <Text style={styles.boldText}>todos tus vehículos</Text> asociados a tu RUT y acceder fácilmente a sus documentos más importantes.
          </Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>¿Cómo funciona?</Text>

            <View style={styles.instructionItem}>
              <View style={styles.instructionIcon}>
                <Ionicons name="eye" size={20} color="white" />
              </View>
              <Text style={styles.instructionText}>
                Presiona el <Text style={styles.boldText}>botón azul con el ícono de ojo</Text> para ver los documentos de cada vehículo.
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <Ionicons name="document-text-outline" size={20} color="#0051A8" style={{ marginRight: 12 }} />
              <Text style={styles.instructionText}>
                Accede a tu <Text style={styles.boldText}>Permiso de Circulación</Text>, <Text style={styles.boldText}>SOAP</Text>, <Text style={styles.boldText}>Revisión Técnica</Text> y <Text style={styles.boldText}>Padrón</Text> en un solo lugar.
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <Ionicons name="card-outline" size={20} color="#0051A8" style={{ marginRight: 12 }} />
              <Text style={styles.instructionText}>
                Si necesitas pagar algún documento, te guiaremos para hacerlo de forma segura en <Text style={styles.boldText}>tupermiso.cl</Text>.
              </Text>
            </View>
          </View>

          <Text style={[styles.welcomeText, { marginBottom: 12, marginTop: 8 }]}>
            <Ionicons name="information-circle-outline" size={16} color="#0051A8" /> Si tienes dudas, puedes volver a ver esta ayuda tocando el ícono <Ionicons name="help-circle-outline" size={16} color="#0051A8" /> en la parte superior.
          </Text>

          <TouchableOpacity 
            style={styles.welcomeButton}
            onPress={handleWelcomeComplete}
          >
            <Text style={styles.welcomeButtonText}>¡Comenzar!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
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
            <Text style={styles.title}>Vehículos Disponibles</Text>
            <TouchableOpacity 
              style={styles.helpIcon}
              onPress={() => setShowWelcomeHelp(true)}
            >
              <Ionicons name="help-circle-outline" size={24} color="#0051A8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userInfo}>RUT: {userRut}</Text>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Placa Patente Única</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Marca</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Modelo</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Acción</Text>
              </View>
            </View>
            
            {/* Mapear solo los vehículos de la página actual */}
            {currentVehicles.length > 0 ? (
              currentVehicles.map((vehicle, index) => (
                <TouchableOpacity 
                  key={vehicle.ppu || index} 
                  style={styles.tableRow}
                  onPress={() => {
                    router.push({
                      pathname: '/vehicle-details',
                      params: { ppu: vehicle.ppu }
                    });
                  }}
                >
                  <View style={styles.tableCell}>
                    <Text style={styles.tablePPUText}>{vehicle.ppu}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableLabel}>{vehicle.marca}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableLabel}>{vehicle.modelo}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <TouchableOpacity style={styles.mostrarButton} onPress={() => {
                      router.push({
                        pathname: '/vehicle-details',
                        params: { ppu: vehicle.ppu }
                      });
                    }}>
                      <Ionicons name="eye-outline" size={24} color="white" style={{ marginLeft: 0 }} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>
                  {userRut ? 'No se encontraron vehículos para este RUT' : 'Cargando vehículos...'}
                </Text>
              </View>
            )}
          </View>

          {/* Paginación */}
          {vehicles.length > 0 && (
            <View style={styles.paginationContainer}>
              {/* Selector de items por página */}
              <View style={styles.itemsPerPageContainer}>
                <Text style={styles.paginationText}>Mostrar</Text>
                <View style={styles.selectContainer}>
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => {
                      // Aquí podrías implementar un modal para seleccionar
                      // Por ahora, alternar entre 5, 10, 20
                      const options = [5, 10, 20];
                      const currentIndex = options.indexOf(itemsPerPage);
                      const nextIndex = (currentIndex + 1) % options.length;
                      handleItemsPerPageChange(options[nextIndex]);
                    }}
                  >
                    <Text style={styles.selectText}>{itemsPerPage}</Text>
                    <Ionicons name="chevron-down" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.paginationText}>
                  Mostrando {startIndex + 1} - {Math.min(endIndex, vehicles.length)} de {vehicles.length}
                </Text>
              </View>

              {/* Controles de paginación */}
              <View style={styles.paginationControls}>
                {/* Botón anterior */}
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#9CA3AF" : "#374151"} />
                </TouchableOpacity>

                {/* Números de página */}
                {getPageNumbers().map((pageNumber) => (
                  <TouchableOpacity
                    key={pageNumber}
                    style={[
                      styles.pageButton,
                      currentPage === pageNumber && styles.pageButtonActive
                    ]}
                    onPress={() => goToPage(pageNumber)}
                  >
                    <Text style={[
                      styles.pageButtonText,
                      currentPage === pageNumber && styles.pageButtonTextActive
                    ]}>
                      {pageNumber}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Botón siguiente */}
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? "#9CA3AF" : "#374151"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Modal de bienvenida */}
        {renderWelcomeModal()}
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
	mostrarButton: {
		backgroundColor: '#006FB3',
		paddingVertical: 4,
		paddingHorizontal: 24,
		borderRadius: 0,
		alignSelf: 'center',
	},
	mostrarButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
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
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: 'Roboto',
    flex: 1,
  },
  helpIcon: {
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
	table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 0,
    overflow: 'hidden',
		marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0051A8',
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
	tablePPUText: {
		fontSize: 24,
		color: '#000000',
		fontWeight: 'bold',
		fontFamily: 'Roboto',
		textAlign: 'center',
	},
	tablePPUCell: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
  tableHeaderText: {
    color: 'white',
    fontSize: 14,
    // fontWeight: 'bold',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  tableLabel: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#0051A8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },

  // Estilos de paginación
  paginationContainer: {
    // backgroundColor: '#f8f9fa',
    // padding: 16,
    // borderRadius: 8,
    // marginTop: 8,
		// shadowColor: '#000',
		// shadowOffset: {
			// width: 0,
			// height: 2,
		// },
		// shadowOpacity: 0.2,
		// shadowRadius: 4,
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  paginationText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Roboto',
    marginRight: 8,
  },
  selectContainer: {
    marginHorizontal: 8,
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  selectText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Roboto',
    marginRight: 4,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pageButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#0051A8',
    borderColor: '#0051A8',
  },
  pageButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Roboto',
  },
  pageButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Estilos para el modal de bienvenida
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
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  instructionIcon: {
    backgroundColor: '#006FB3',
    borderRadius: 12,
    padding: 4,
    marginRight: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#4A4A4A',
    flex: 1,
    fontFamily: 'Roboto',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  welcomeButton: {
    backgroundColor: '#0051A8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  showLaterButton: {
    alignSelf: 'center',
    padding: 8,
  },
  showLaterText: {
    color: '#0051A8',
    fontSize: 12,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
});
