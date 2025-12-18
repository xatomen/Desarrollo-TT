import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Navbar from '@/components/Navbar';
import { Modal } from 'react-native';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import API_CONFIG from '@/config/api';

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  const { token, userInfo } = useAuth();

  // Estados para manejar los datos del vehículo
  const [ppu, setPpu] = useState('');
  
  // Padrón
	const [fechaInscripcion, setFechaInscripcion] = useState('');

  // Permiso de circulación
	const [tipoSello, setTipoSello] = useState('');
	const [vigenciaPermiso, setVigenciaPermiso] = useState('');
  const [fechaEmisionPermiso, setFechaEmisionPermiso] = useState('');
  const [fechaExpiracionPermiso, setFechaExpiracionPermiso] = useState('');
  const [numMotor, setNumMotor] = useState('');
  const [numChasis, setNumChasis] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [color, setColor] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [carga, setCarga] = useState('');
  const [combustible, setCombustible] = useState('');
  const [cilindrada, setCilindrada] = useState('');
  const [transmision, setTransmision] = useState('');
  const [pts, setPts] = useState('');
  const [rutPropietario, setRutPropietario] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');

  // Revisión Técnica
	const [revisionTecnica, setRevisionTecnica] = useState('');
  const [fechaExpiracionRevision, setFechaExpiracionRevision] = useState('');

  // SOAP
	const [soap, setSoap] = useState('');
  const [fechaExpiracionSoap, setFechaExpiracionSoap] = useState('');

  // Encargo por Robo
	const [encargoRobo, setEncargoRobo] = useState('');
  const [encargoPatenteDelantera, setEncargoPatenteDelantera] = useState('');
  const [encargoPatenteTrasera, setEncargoPatenteTrasera] = useState('');
  const [encargoVin, setEncargoVin] = useState('');
  const [encargoMotor, setEncargoMotor] = useState('');

  // Multas de tránsito
  const [multasTransito, setMultasTransito] = useState('');
  const [totalMultas, setTotalMultas] = useState(0);

  // Estado vehículo
	const [estadoVehiculo, setEstadoVehiculo] = useState('');

	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);

  // Estados para controlar los logs
  const [datosCompletos, setDatosCompletos] = useState(false);
  const [logEnviado, setLogEnviado] = useState(false);

  // useEffect para setear el estado del vehículo cuando cambien los valores
  useEffect(() => {
    // Solo proceder si todos los valores necesarios están definidos y no están vacíos
    if (encargoRobo && vigenciaPermiso && revisionTecnica && soap && multasTransito &&
        encargoRobo !== '' && vigenciaPermiso !== '' && revisionTecnica !== '' && soap !== '' && multasTransito !== '') {
      console.log('###### Calculando estado del vehículo con:', { encargoRobo, vigenciaPermiso, revisionTecnica, soap, multasTransito });
      if (encargoRobo === 'Sí') {
        setEstadoVehiculo('Posee Encargo por Robo');
      } else if (multasTransito === 'Sí') {
        setEstadoVehiculo('Posee Multas de Tránsito');
      } else if (vigenciaPermiso.toLowerCase() === 'vencido' || revisionTecnica.toLowerCase() === 'no vigente' || soap.toLowerCase() === 'no vigente') {
        setEstadoVehiculo('Documentos Vencidos');
      } else {
        setEstadoVehiculo('Vehículo al Día');
      }
      
      // Solo marcar como completo cuando todos los datos estén realmente cargados
      setDatosCompletos(true);
    }
  }, [encargoRobo, vigenciaPermiso, revisionTecnica, soap, multasTransito]);

  // Enviar log
  const enviarLogFiscalizacion = async () => {
    if (logEnviado || !datosCompletos) return; // Evitar envíos duplicados

    try {
      // Verificación adicional antes de enviar
      if (!vigenciaPermiso || !revisionTecnica || !soap || !encargoRobo) {
        console.log('Datos incompletos, no se enviará el log');
        return;
      }

      // Recuperar rut desde user_info del local storage
      const rutFiscalizador = userInfo.rut;
      
      // Convertir valores de texto a números (1 = vigente, 0 = vencido/sí)
      const vigenciaPermisoNum = vigenciaPermiso === 'Vigente' ? 1 : 0;
      const vigenciaRevisionNum = revisionTecnica === 'Vigente' ? 1 : 0;
      const vigenciaSoapNum = soap === 'Vigente' ? 1 : 0;
      const encargoRoboNum = encargoRobo === 'No' ? 0 : 1; // Corregido: No = 0, Sí = 1

      console.log('Vigencia Permiso:', vigenciaPermiso, '->', vigenciaPermisoNum);
      console.log('Vigencia Revisión:', revisionTecnica, '->', vigenciaRevisionNum);
      console.log('Vigencia SOAP:', soap, '->', vigenciaSoapNum);
      console.log('Encargo por Robo:', encargoRobo, '->', encargoRoboNum);

      const logData = {
        ppu: ppu || params.ppu,
        rut_fiscalizador: rutFiscalizador,
        fecha: new Date().toISOString(),
        vigencia_permiso: vigenciaPermisoNum,
        vigencia_revision: vigenciaRevisionNum,
        vigencia_soap: vigenciaSoapNum,
        encargo_robo: encargoRoboNum
      };

      console.log('Enviando log de auditoría:', logData);

      const response = await fetch(`${API_CONFIG.BACKEND}logs_fiscalizacion/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        console.log('Log de auditoría enviado exitosamente');
        console.log(logData);
        setLogEnviado(true);
      } else {
        const errorData = await response.text();
        console.error('Error al enviar log de auditoría:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error de conexión al enviar log de auditoría:', error);
    }
  };

  useEffect(() => {
    if (datosCompletos && !logEnviado) {
      enviarLogFiscalizacion();
    }
  }, [datosCompletos, logEnviado]);

  const getInfoVehicle = async () => {
    setLoading(true);
    try {
      // Obtener Padrón
      const padron_response = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${params.ppu}`);
      const padron_data = await padron_response.json();
      
      setPpu(padron_data.ppu);
			// Transformar fecha. Ejemplo: 01 de Marzo de 1992
      const fecha = new Date(padron_data.fecha_inscripcion);
      const opciones = { day: '2-digit' as const, month: 'long' as const, year: 'numeric' as const };
      setFechaInscripcion(fecha.toLocaleDateString('es-ES', opciones));
      setNumMotor(padron_data.num_motor);
      setNumChasis(padron_data.num_chasis);
      setTipoVehiculo(padron_data.tipo_vehiculo);
      setColor(padron_data.color);
      setMarca(padron_data.marca);
      setModelo(padron_data.modelo);
      setAnio(padron_data.anio);
      setRutPropietario(padron_data.rut);
      setNombrePropietario(padron_data.nombre);

      // Obtener Permiso de Circulación
			try {
        const permiso_response = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${params.ppu}`);
        if (permiso_response.status !== 200) {
          setVigenciaPermiso('Vencido');
          console.log('Permiso de Circulación no encontrado o error en la consulta');
          // Obtener tipo de sello desde API_CONFIG.SII
          const sello_response = await fetch(`${API_CONFIG.SII}factura_venta_num_chasis/?num_chasis=${padron_data.num_chasis}`);
          const sello_data = await sello_response.json();
          setTipoSello(sello_data.tipo_sello);
          setPts(sello_data.puertas);
          setTransmision(sello_data.transmision);
          setCilindrada(sello_data.cilindrada);
          setCombustible(sello_data.combustible);
          setCarga(sello_data.carga);
        }
        else {
          const permiso_data = await permiso_response.json();
          console.log(permiso_data)
          setTipoSello(permiso_data.tipo_sello);
          if (permiso_data.vigencia === true) {
            setVigenciaPermiso("Vigente");
          }
          else {
            setVigenciaPermiso('Vencido');
          }
          setFechaEmisionPermiso(permiso_data.fecha_emision);
          setFechaExpiracionPermiso(permiso_data.fecha_expiracion);
          // setNumMotor(permiso_data.motor);
          // setNumChasis(permiso_data.chasis);
          // setTipoVehiculo(permiso_data.tipo_vehiculo);
          // setColor(permiso_data.color);
          // setMarca(permiso_data.marca);
          // setModelo(permiso_data.modelo);
          // setAnio(permiso_data.anio);
          setCarga(permiso_data.carga);
          setCombustible(permiso_data.combustible);
          setCilindrada(permiso_data.cilindrada);
          setTransmision(permiso_data.transmision);
          setPts(permiso_data.pts);
        }
      } catch (error) {
        console.error('Error al obtener Permiso de Circulación:', error);
        setVigenciaPermiso('Vencido');
      }
			

      // Obtener Revisión Técnica
			const revision_response = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${params.ppu}`);
			const revision_data = await revision_response.json();
			setRevisionTecnica(revision_data.vigencia);
      if (revision_response.status !== 200) {
        setRevisionTecnica('Vencido');
      }
      setFechaExpiracionRevision(revision_data.fecha_vencimiento);

      // Obtener SOAP
			const soap_response = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${params.ppu}`);
			const soap_data = await soap_response.json();
			setSoap(soap_data.vigencia);
			if (soap_response.status !== 200) {
				setSoap('Vencido');
			}
      setFechaExpiracionSoap(soap_data.rige_hasta);

      // Obtener Encargo por Robo
			const robo_response = await fetch(`${API_CONFIG.BACKEND}consultar_encargo/${params.ppu}`);
			const robo_data = await robo_response.json();
      console.log(robo_data);
			if (robo_data.encargo === true) {
				setEncargoRobo('Sí');
			} else {
				setEncargoRobo('No');
			}
      setEncargoPatenteDelantera(robo_data.patente_delantera);
      setEncargoPatenteTrasera(robo_data.patente_trasera);
      setEncargoVin(robo_data.vin);
      setEncargoMotor(robo_data.motor);

      
      // Obtener Multas de tránsito
      const multas_response = await fetch(`${API_CONFIG.BACKEND}consultar_multas/${params.ppu}`);
      const multas_data = await multas_response.json();
      setTotalMultas(multas_data.total_multas || 0);
      setMultasTransito(multas_data.total_multas > 0 ? 'Sí' : 'No');
      
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
    <ProtectedRoute>
    <ScrollView style={styles.container}>
      <Navbar />
      {/* Si posee encargo por robo, mostramos una alerta */}
      {encargoRobo === 'Sí' ? (
        <View style={[styles.alertBox]}>
          <Text style={[styles.alertText]}>¡Atención! Este vehículo tiene un encargo por robo.</Text>
          <Text style={[styles.alertSubText, { color: '#222', fontWeight: 'bold', marginBottom: 6 }]}>Detalles del encargo:</Text>
          {/* Tabla simple sin colores */}
          <View style={{ borderWidth: 1, borderColor: '#fc9797ff', borderRadius: 6, marginTop: 6, marginBottom: 8, width: '80%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#fc9797ff' }}>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Ítem</Text>
              </View>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>¿Posee encargo?</Text>
              </View>
            </View>
            {/* Filas */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#fc9797ff' }}>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>Patente delantera</Text>
              </View>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>{encargoPatenteDelantera ? 'Sí' : 'No'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#fc9797ff' }}>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>Patente trasera</Text>
              </View>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>{encargoPatenteTrasera ? 'Sí' : 'No'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#fc9797ff' }}>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>VIN</Text>
              </View>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>{encargoVin ? 'Sí' : 'No'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>Motor</Text>
              </View>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontSize: 13, textAlign: 'center' }}>{encargoMotor ? 'Sí' : 'No'}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.card}>
        <Text style={styles.cardText}>Patente consultada</Text>
        <Text style={styles.patente}>{ppu || params.ppu}</Text>
        <Text style={styles.cardText}>{rutPropietario
          ? rutPropietario.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          : ''}</Text>
        <Text style={styles.date}>{nombrePropietario}</Text>
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

            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
								<Text style={styles.tableLabel}>Multas de tránsito</Text>
							</View>
							<View style={styles.tableCell}>
								<Text style={multasTransito === 'No' ? styles.chipPrimaryGreen : styles.chipPrimaryRed}>{multasTransito}</Text>
							</View>
            </View>

					</View>
				</View>

				{/* Botón para abrir modal Mostrar Información */}
				<TouchableOpacity style={styles.showInfoButton} onPress={() => setShowModal(true)}>
					<Text style={styles.showInfoButtonText}>Mostrar Información</Text>
				</TouchableOpacity>

        {/* Modal Mostrar Información */}
        <Modal visible={showModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Información Vehículo</Text>
              <ScrollView style={styles.modalContent}>
                
                {/* Tabla: Item | Valor */}
                <View style={styles.table}>
                  
                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Fecha de expiración SOAP</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{fechaExpiracionSoap}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Fecha de expiración revisión</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{fechaExpiracionRevision}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Fecha de inscripción</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{fechaInscripcion}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Fecha de emisión permiso</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{fechaEmisionPermiso}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Fecha de expiración permiso</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{fechaExpiracionPermiso}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>N° Motor</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{numMotor}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>N° Chasis</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{numChasis}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Tipo de vehículo</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{tipoVehiculo}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Color de la carrocería</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{color}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Marca del vehículo</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{marca}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Modelo</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{modelo}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Año</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{anio}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Capacidad de carga</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{carga}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Tipo de sello</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{tipoSello}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Tipo de combustible</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{combustible}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Cilindrada del motor</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{cilindrada}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>Transmisión</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{transmision}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowModal}>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableLabel}>PTS</Text>
                    </View>
                    <View style={styles.tableCellModal}>
                      <Text style={styles.tableValue}>{pts}</Text>
                    </View>
                  </View>

                </View>
              </ScrollView>
              <TouchableOpacity style={styles.backButton} onPress={() => setShowModal(false)}>
                <Text style={styles.backButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

				{/* Botón para Volver Atras */}
				<TouchableOpacity style={styles.backButton} onPress={() => router.push('/insert-ppu')}>
					<Text style={styles.backButtonText}>Volver Atrás</Text>
				</TouchableOpacity>

			</ScrollView>
		</ScrollView>
    </ProtectedRoute>
	);
}

const styles = StyleSheet.create({
  alertBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderColor: '#D32F2F',
    borderWidth: 2,
    alignItems: 'center',
  },
  alertText: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    fontFamily: 'Roboto',
  },
  alertSubText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 4,
    fontFamily: 'Roboto',
    backgroundColor: 'transparent',
    marginHorizontal: 24,
  },
  alertDetails: {
    // backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 24,
    // marginTop: 8,
    marginBottom: 8,
  },
  alertDetailText: {
    color: '#000000ff',
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: '600',
    marginVertical: 2,
    textAlign: 'left',
  },
  tableValue: {
    paddingHorizontal: 16,
    borderBottomColor: '#e5e7eb',
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
    padding: 12,
    backgroundColor: '#0051A8',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
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
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 0,
    // marginHorizontal: 150,
    width: '50%',
    maxWidth: '90%',
    alignSelf: 'center',
  },
  showInfoButtonText: {
    color: 'white',
    fontSize: 16,
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
    // marginHorizontal: 150,
    width: '50%',
    maxWidth: '90%',
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
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
});
