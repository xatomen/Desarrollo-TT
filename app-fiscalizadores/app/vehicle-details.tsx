import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Navbar from '@/components/Navbar';

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  
  // Estados para manejar los datos del vehículo
  const [ppu, setPpu] = useState('');
  
	const [fechaInscripcion, setFechaInscripcion] = useState('');

	const [tipoSello, setTipoSello] = useState('');
	const [vigenciaPermiso, setVigenciaPermiso] = useState('');

	const [revisionTecnica, setRevisionTecnica] = useState('');

	const [soap, setSoap] = useState('');

	const [encargoRobo, setEncargoRobo] = useState('');

	const [estadoVehiculo, setEstadoVehiculo] = useState('');

	const [loading, setLoading] = useState(false);


  // useEffect para setear el estado del vehículo cuando cambien los valores
  useEffect(() => {
    if (encargoRobo && vigenciaPermiso && revisionTecnica && soap) {
      if (encargoRobo === 'Sí') {
        setEstadoVehiculo('Posee Encargo por Robo');
      } else if (vigenciaPermiso === 'Vencido' || revisionTecnica === 'Vencido' || soap === 'Vencido') {
        setEstadoVehiculo('Documentos Vencidos');
      } else {
        setEstadoVehiculo('Vehículo al Día');
      }
    }
  }, [encargoRobo, vigenciaPermiso, revisionTecnica, soap]);

  const getInfoVehicle = async () => {
    setLoading(true);
    try {
      // Obtener Padrón
      const padron_response = await fetch(`http://localhost:8000/consultar_patente/${params.ppu}`);
      const padron_data = await padron_response.json();
      
      setPpu(padron_data.ppu);
			// Transformar fecha. Ejemplo: 01 de Marzo de 1992
      const fecha = new Date(padron_data.fecha_inscripcion);
      const opciones = { day: '2-digit', month: 'long', year: 'numeric' as const };
      setFechaInscripcion(fecha.toLocaleDateString('es-ES', opciones));

      // Obtener Permiso de Circulación
			const permiso_response = await fetch(`http://localhost:8000/consultar_permiso_circulacion/${params.ppu}`);
			const permiso_data = await permiso_response.json();
			console.log(permiso_data)
			setTipoSello(permiso_data.tipo_sello);
			if (permiso_data.vigencia === true) {
				setVigenciaPermiso("Vigente");
			}
			else {
				setVigenciaPermiso('Vencido');
			}

      // Obtener Revisión Técnica
			const revision_response = await fetch(`http://localhost:8000/consultar_revision_tecnica/${params.ppu}`);
			const revision_data = await revision_response.json();
			setRevisionTecnica(revision_data.vigencia);
      if (revision_response.status !== 200) {
        setRevisionTecnica('Vencido');
      }

      // Obtener SOAP
			const soap_response = await fetch(`http://localhost:8000/consultar_soap/${params.ppu}`);
			const soap_data = await soap_response.json();
			setSoap(soap_data.vigencia);
			if (soap_response.status !== 200) {
				setSoap('Vencido');
			}

      // Obtener Encargo por Robo
			const robo_response = await fetch(`http://localhost:8000/consultar_encargo/${params.ppu}`);
			const robo_data = await robo_response.json();
			if (robo_data.encargo === "true") {
				setEncargoRobo('Sí');
			} else {
				setEncargoRobo('No');
			}

    } catch (error) {
      console.error('Error al obtener información del vehículo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (params.ppu) {
      getInfoVehicle();
    }
  }, [params.ppu]);

  return (
    <ScrollView style={styles.container}>
      <Navbar />
      <View style={styles.card}>
        <Text style={styles.cardText}>Patente consultada</Text>
        <Text style={styles.patente}>{ppu || params.ppu}</Text>
        <Text style={styles.cardText}>Estado</Text>
        <Text style={estadoVehiculo === 'Vehículo al Día' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{estadoVehiculo}</Text>
        <Text style={styles.cardText}>Tipo de sello</Text>
        <Text style={tipoSello === 'Verde' ? styles.chipSecondGreen : tipoSello === 'Rojo' ? styles.chipSecondRed : styles.chipSecondYellow}>{tipoSello}</Text>
        <Text style={styles.cardText}>Fecha de inscripción</Text>
        <Text style={styles.date}>{fechaInscripcion}</Text>
      </View>
      <ScrollView style={styles.content}>
				<View style={styles.infoCard}>
					
					{/* Tabla completa */}
					<View style={styles.table}>
						{/* Header de la tabla */}
						<View style={styles.tableHeader}>
							<View style={styles.tableHeaderCell}>
								<Text style={styles.tableHeaderText}>Documento</Text>
							</View>
							<View style={styles.tableHeaderCell}>
								<Text style={styles.tableHeaderText}>Estado</Text>
							</View>
						</View>
						
						{/* Filas de la tabla */}
						<View style={styles.tableRow}>
							<View style={styles.tableCell}>
								<Text style={styles.tableLabel}>Permiso de Circulación</Text>
							</View>
							<View style={styles.tableCell}>
								<Text style={vigenciaPermiso === 'Vigente' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{vigenciaPermiso}</Text>
							</View>
						</View>
						
						<View style={styles.tableRow}>
							<View style={styles.tableCell}>
								<Text style={styles.tableLabel}>Revisión Técnica</Text>
							</View>
							<View style={styles.tableCell}>
								<Text style={revisionTecnica === 'Vigente' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{revisionTecnica}</Text>
							</View>
						</View>
						
						<View style={styles.tableRow}>
							<View style={styles.tableCell}>
								<Text style={styles.tableLabel}>SOAP</Text>
							</View>
							<View style={styles.tableCell}>
								<Text style={soap === 'Vigente' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{soap}</Text>
							</View>
						</View>
						
						<View style={styles.tableRow}>
							<View style={styles.tableCell}>
								<Text style={styles.tableLabel}>Encargo por Robo</Text>
							</View>
							<View style={styles.tableCell}>
								<Text style={encargoRobo === 'No' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{encargoRobo}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Botón para Mostrar Información */}
				<TouchableOpacity style={styles.showInfoButton} onPress={getInfoVehicle}>
					<Text style={styles.showInfoButtonText}>Mostrar Información</Text>
				</TouchableOpacity>

				{/* Botón para Volver Atras */}
				<TouchableOpacity style={styles.backButton} onPress={() => router.push('/insert-ppu')}>
					<Text style={styles.backButtonText}>Volver Atrás</Text>
				</TouchableOpacity>

			</ScrollView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
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
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 0,
    marginHorizontal: 150,
  },
  showInfoButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
