import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Navbar from '@/components/Navbar';
import { Modal } from 'react-native';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Collapsible } from '@/components/Collapsible';
import API_CONFIG from '@/config/api';

import PermisoCirculacionModal from '@/components/PermisoCirculacionModal';
import PadronModal from '@/components/PadronModal';
import RevisionModal from '@/components/RevisionModal';
import SoapModal from '@/components/SoapModal';

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  const { userInfo } = useAuth();

  // Estados para manejar los datos del vehículo
  const [ppu, setPpu] = useState('');
  
  // Padrón
  const [fechaInscripcion, setFechaInscripcion] = useState('');
  const [padron_data, setPadronData] = useState<any>(null);

  // Permiso de circulación
  const [permiso_data, setPermisoData] = useState<any>(null);
	const [vigenciaPermiso, setVigenciaPermiso] = useState('');

  // Revisión Técnica
  const [revision_data, setRevisionData] = useState<any>(null);
	const [revisionTecnica, setRevisionTecnica] = useState('');

  // SOAP
  const [soap_data, setSoapData] = useState<any>(null);
	const [soap, setSoap] = useState('');

  const [showPermisoModal, setShowPermisoModal] = useState(false);
  const [showPadronModal, setShowPadronModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSoapModal, setShowSoapModal] = useState(false);

  // Estados para controlar los logs
  const [datosCompletos, setDatosCompletos] = useState(false);
  const [logEnviado, setLogEnviado] = useState(false);

  // Enviar log
  const enviarLogConsultaPropietario = async () => {
    console.log('Preparando para enviar log de auditoría...');
    if (logEnviado || !datosCompletos) {
      console.log('Log ya enviado o datos incompletos, no se envía de nuevo');
      return; // Evitar envíos duplicados
    }

    try {
      // Recuperar rut desde userInfo
      const rut = userInfo.rut;

      const logData = {
        rut,
        ppu: ppu || params.ppu,
        fecha: new Date().toISOString(), // Formato YYYY-MM-DD
      };

      console.log('Enviando log de auditoría:', logData);

      const response = await fetch(`${API_CONFIG.BACKEND}logs_consulta_propietario/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        console.log('Log de auditoría enviado exitosamente');
        setLogEnviado(true);
      } else {
        const errorData = await response.text();
        console.error('Error al enviar log de auditoría:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error de conexión al enviar log de auditoría:', error);
    }
  };

  console.log('Datos completos:', datosCompletos, 'Log enviado:', logEnviado);
  
  useEffect(() => {
    if (datosCompletos && !logEnviado) {
      enviarLogConsultaPropietario();
    }
  }, [datosCompletos, logEnviado]);

  const getInfoVehicle = async () => {
    try {
      // Obtener Padrón
      const padron_response = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${params.ppu}`);
      const padron_data = await padron_response.json();
      setPadronData(padron_data);
      
      setPpu(padron_data.ppu);
			// Transformar fecha. Ejemplo: 01 de Marzo de 1992
      const fecha = new Date(padron_data.fecha_inscripcion);
      const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
      setFechaInscripcion(fecha.toLocaleDateString('es-ES', opciones));

      // Obtener Permiso de Circulación
			const permiso_response = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${params.ppu}`);
			const permiso_data = await permiso_response.json();
			console.log(permiso_data)
			setPermisoData(permiso_data);
			if (permiso_data.vigencia === true) {
				setVigenciaPermiso("Vigente");
			}
			else {
				setVigenciaPermiso('Vencido');
			}

      // Obtener Revisión Técnica
			const revision_response = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${params.ppu}`);
			const revision_data = await revision_response.json();
      setRevisionData(revision_data);
			setRevisionTecnica(revision_data.vigencia);
      if (revision_response.status !== 200) {
        setRevisionTecnica('Vencido');
      }


      // Obtener SOAP
			const soap_response = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${params.ppu}`);
			const soap_data = await soap_response.json();
      setSoapData(soap_data);
			setSoap(soap_data.vigencia);
			if (soap_response.status !== 200) {
				setSoap('Vencido');
			}

    } catch (error) {
      console.error('Error al obtener información del vehículo:', error);
    } finally {
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (params.ppu) {
      getInfoVehicle();
    }
  }, [params.ppu]);

  return (
    <ProtectedRoute>
    <ScrollView style={styles.container}>
      <Navbar />
      <View style={styles.card}>
        <Text style={styles.cardText}>Placa Patente Única</Text>
        <Text style={styles.patente}>{ppu || params.ppu}</Text>
        <Text style={styles.cardSubtext}>Marca</Text>
        <Text style={styles.cardText}>{padron_data?.marca}</Text>
        <Text style={styles.cardSubtext}>Modelo</Text>
        <Text style={styles.cardText}>{padron_data?.modelo}</Text>
        <Text style={styles.cardSubtext}>Año</Text>
        <Text style={styles.cardText}>{padron_data?.anio}</Text>
      </View>
      <ScrollView style={styles.content}>
				<View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Ver Documentos Vehículares:</Text>
          {/* Botón para Ver Padrón */}
          <TouchableOpacity style={styles.button} onPress={() => setShowPadronModal(true)}>
            <Text style={styles.buttonText}>Ver Padrón</Text>
          </TouchableOpacity>
          {/* Botón para Ver Permiso de Circulación */}
          <TouchableOpacity style={styles.button} onPress={() => setShowPermisoModal(true)}>
            <Text style={styles.buttonText}>Ver Permiso de Circulación</Text>
          </TouchableOpacity>
          {/* Botón para Ver Revisión Técnica */}
          <TouchableOpacity style={styles.button} onPress={() => setShowRevisionModal(true)}>
            <Text style={styles.buttonText}>Ver Revisión Técnica</Text>
          </TouchableOpacity>
          {/* Botón para Ver SOAP */}
          <TouchableOpacity style={styles.button} onPress={() => setShowSoapModal(true)}>
            <Text style={styles.buttonText}>Ver SOAP</Text>
          </TouchableOpacity>

				</View>

				{/* Botón para Volver Atras */}
				<TouchableOpacity style={styles.backButton} onPress={() => router.push('/vehicle-list')}>
					<Text style={styles.backButtonText}>Volver Atrás</Text>
				</TouchableOpacity>

			</ScrollView>
		</ScrollView>
    <PermisoCirculacionModal
      visible={showPermisoModal}
      onClose={() => setShowPermisoModal(false)}
      datos={permiso_data}
    />
    <PadronModal
      visible={showPadronModal}
      onClose={() => setShowPadronModal(false)}
      datos={padron_data}
    />
    <RevisionModal
      visible={showRevisionModal}
      onClose={() => setShowRevisionModal(false)}
      datos={{
        revision: revision_data,
        padron: padron_data,
        permiso: permiso_data
      }}
    />
    <SoapModal
      visible={showSoapModal}
      onClose={() => setShowSoapModal(false)}
      datos={{
        soap: soap_data,
        padron: padron_data,
      }}
    />
    </ProtectedRoute>
	);
}

const styles = StyleSheet.create({
  cardSubtext: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingVertical: 4,
  },
  infoCardTitle: {
    fontSize: 20,
    marginBottom: 12,
    fontFamily: 'Roboto',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#0051A8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 0, // Sin bordes redondeados
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
    marginHorizontal: 0,
    // Agregar sombra para dar profundidad
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    // Efecto de borde sutil
    borderBottomWidth: 3,
    borderBottomColor: '#003d82',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textTransform: 'uppercase', // Texto en mayúsculas para mayor impacto
    letterSpacing: 0.5,
  },
  tableValue: {
    paddingHorizontal: 16,
    borderBottomColor: '#e5e7eb',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    margin: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  closeButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#0051A8',
    borderRadius: 0, // Sin bordes redondeados
    borderBottomWidth: 3,
    borderBottomColor: '#003d82',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRowModal: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  tableCellModal: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlign: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingVertical: 8,
  },
  patente: {
    color: '#000000',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  chipPrimaryGreen: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#2E7D32',
    textAlign: 'center',
    width: 'auto',
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  chipSecondGreen: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#E8F5E9',
    textAlign: 'center',
    width: 'auto',
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  chipPrimaryRed: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#D32F2F',
    textAlign: 'center',
    width: 'auto',
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  chipSecondRed: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#FFCDD2',
    textAlign: 'center',
    width: 'auto',
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  chipSecondYellow: {
    color: '#FFBE5C',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#FEFACD',
    textAlign: 'center',
    width: 'auto',
    minWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  date: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
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
  tableHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#374151',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  statusTextWhite: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  showInfoButton: {
    backgroundColor: '#0051A8',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 0, // Sin bordes redondeados
    alignItems: 'center',
    marginTop: 0,
    marginHorizontal: 150,
    borderBottomWidth: 3,
    borderBottomColor: '#003d82',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  showInfoButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#6b7280', // Color gris para diferenciarlo del botón principal
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 0, // Sin bordes redondeados
    alignItems: 'center',
    marginTop: 20,
    maxWidth: '60%',
    width: 'auto',
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#4b5563',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 12,
    width: '90%',
    maxWidth: 600,
    shadowColor: '#000',
    maxHeight: '90%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContent: {
    maxHeight: '100%',
  },
  collapsibleHeader: {
    backgroundColor: '#0051A8',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
