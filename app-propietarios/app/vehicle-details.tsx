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

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  const { token, userInfo } = useAuth();

  // Estados para manejar los datos del vehículo
  const [ppu, setPpu] = useState('');
  
  // Padrón
  const [fechaInscripcion, setFechaInscripcion] = useState('');
  const [padron_data, setPadronData] = useState<any>(null);

  // Permiso de circulación
  const [permiso_data, setPermisoData] = useState<any>(null);
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

  // Revisión Técnica
  const [revision_data, setRevisionData] = useState<any>(null);
	const [revisionTecnica, setRevisionTecnica] = useState('');
  const [numCertificadoRevision, setNumCertificadoRevision] = useState('');
  const [fechaEmisionRevision, setFechaEmisionRevision] = useState('');
  const [fechaExpiracionRevision, setFechaExpiracionRevision] = useState('');
  const [plantaPrt, setPlantaPrt] = useState('');

  // SOAP
  const [soap_data, setSoapData] = useState<any>(null);
	const [soap, setSoap] = useState('');
  const [fechaEmisionSoap, setFechaEmisionSoap] = useState('');
  const [fechaExpiracionSoap, setFechaExpiracionSoap] = useState('');
  const [numPoliza, setNumPoliza] = useState('');

  // Encargo por Robo
  const [encargo_data, setEncargoData] = useState<any>(null);
	const [encargoRobo, setEncargoRobo] = useState('');

  // Estado vehículo
	const [estadoVehiculo, setEstadoVehiculo] = useState('');

	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
  const [showPermisoModal, setShowPermisoModal] = useState(false);

  // Estados para controlar los logs
  const [datosCompletos, setDatosCompletos] = useState(false);
  const [logEnviado, setLogEnviado] = useState(false);

  // useEffect para setear el estado del vehículo cuando cambien los valores
  useEffect(() => {
    if (vigenciaPermiso && revisionTecnica && soap) {
      if (vigenciaPermiso === 'Vencido' || revisionTecnica === 'Vencido' || soap === 'Vencido') {
        setEstadoVehiculo('Documentos Vencidos');
      } else {
        setEstadoVehiculo('Vehículo al Día');
      }
      setDatosCompletos(true);
    }
  }, [encargoRobo, vigenciaPermiso, revisionTecnica, soap]);

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
    setLoading(true);
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
			setTipoSello(permiso_data.tipo_sello);
			if (permiso_data.vigencia === true) {
				setVigenciaPermiso("Vigente");
			}
			else {
				setVigenciaPermiso('Vencido');
			}
      setFechaEmisionPermiso(permiso_data.fecha_emision);
      setFechaExpiracionPermiso(permiso_data.fecha_expiracion);
      setNumMotor(permiso_data.motor);
      setNumChasis(permiso_data.chasis);
      setTipoVehiculo(permiso_data.tipo_vehiculo);
      setColor(permiso_data.color);
      setMarca(permiso_data.marca);
      setModelo(permiso_data.modelo);
      setAnio(permiso_data.anio);
      setCarga(permiso_data.carga);
      setCombustible(permiso_data.combustible);
      setCilindrada(permiso_data.cilindrada);
      setTransmision(permiso_data.transmision);
      setPts(permiso_data.pts);

      // Obtener Revisión Técnica
			const revision_response = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${params.ppu}`);
			const revision_data = await revision_response.json();
      setRevisionData(revision_data);
			setRevisionTecnica(revision_data.vigencia);
      if (revision_response.status !== 200) {
        setRevisionTecnica('Vencido');
      }
      setFechaEmisionRevision(revision_data.fecha);
      setFechaExpiracionRevision(revision_data.fecha_vencimiento);
      setPlantaPrt(revision_data.planta);
      setNumCertificadoRevision(revision_data.nom_certificado);


      // Obtener SOAP
			const soap_response = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${params.ppu}`);
			const soap_data = await soap_response.json();
      setSoapData(soap_data);
			setSoap(soap_data.vigencia);
			if (soap_response.status !== 200) {
				setSoap('Vencido');
			}
      setFechaEmisionSoap(soap_data.rige_desde);
      setFechaExpiracionSoap(soap_data.rige_hasta);

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
      <View style={styles.card}>
        <Text style={styles.cardText}>Placa Patente Única</Text>
        <Text style={styles.patente}>{ppu || params.ppu}</Text>
      </View>
      <ScrollView style={styles.content}>
				<View style={styles.infoCard}>

          {/* Accordion */}
          <Collapsible title="Padrón">
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Patente</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{ppu}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>RUT propietario</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.rut}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Nombre propietario</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.nombre}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Tipo de vehículo</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.tipo_vehiculo}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Marca</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.marca}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Modelo</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.modelo}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Año</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.anio}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>Color</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.color}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>N° Motor</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.num_motor}</Text>
              </View>
            </View>
            <View style={styles.tableRowModal}>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableLabel}>N° Chasis</Text>
              </View>
              <View style={styles.tableCellModal}>
                <Text style={styles.tableValue}>{padron_data?.num_chasis}</Text>
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
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#0051A8',
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  // borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  // Aquí puedes abrir el documento, mostrar modal, o navegar a otra pantalla
                  // Por ejemplo: router.push('/ruta-del-documento');
                  // O mostrar un modal con el PDF, etc.
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Ver documento</Text>
              </TouchableOpacity>
            </View>
          </Collapsible>

          <Collapsible title="Permiso de Circulación">
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Patente</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.ppu}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>RUT propietario</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.rut}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Nombre propietario</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.nombre}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Fecha de emisión</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.fecha_emision}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Fecha de expiración</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.fecha_expiracion}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Valor permiso</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>
        {permiso_data?.valor_permiso ? `$${permiso_data.valor_permiso.toLocaleString('es-CL')}` : ''}
      </Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Motor</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.motor}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Chasis</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.chasis}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Tipo de vehículo</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.tipo_vehiculo}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Color</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.color}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Marca</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.marca}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Modelo</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.modelo}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Año</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.anio}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Capacidad de carga</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.carga}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Tipo de sello</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.tipo_sello}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Combustible</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.combustible}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Cilindrada</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.cilindrada}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Transmisión</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.transmision}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>PTS</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.pts}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>AST</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.ast}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Equipamiento</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.equipamiento}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Código SII</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{permiso_data?.codigo_sii}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Tasación</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>
        {permiso_data?.tasacion ? `$${permiso_data.tasacion.toLocaleString('es-CL')}` : ''}
      </Text>
    </View>
  </View>
  <View style={{ alignItems: 'center', marginTop: 8 }}>
    <TouchableOpacity
      style={{
        backgroundColor: '#0051A8',
        paddingVertical: 10,
        paddingHorizontal: 18,
        // borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={() => setShowPermisoModal(true)}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Ver documento</Text>
    </TouchableOpacity>
  </View>
</Collapsible>

          <Collapsible title="SOAP">
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>N° Póliza</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.num_poliza}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Patente</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.ppu}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Compañía</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.compania}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Rige desde</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.rige_desde}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Rige hasta</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.rige_hasta}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Prima</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>
        {soap_data?.prima ? `$${soap_data.prima.toLocaleString('es-CL')}` : ''}
      </Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Vigencia</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{soap_data?.vigencia}</Text>
    </View>
  </View>
  <View style={{ alignItems: 'center', marginTop: 8 }}>
    <TouchableOpacity
      style={{
        backgroundColor: '#0051A8',
        paddingVertical: 10,
        paddingHorizontal: 18,
        // borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={() => {
        // Aquí puedes abrir el documento, mostrar modal, o navegar a otra pantalla
        // Por ejemplo: router.push('/ruta-del-documento');
        // O mostrar un modal con el PDF, etc.
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Ver documento</Text>
    </TouchableOpacity>
  </View>
</Collapsible>

          <Collapsible title="Revisión Técnica">
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Patente</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.ppu}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Fecha de revisión</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.fecha}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Código planta</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.codigo_planta}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Planta</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.planta}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>N° Certificado</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.nom_certificado}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Fecha de vencimiento</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.fecha_vencimiento}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Estado</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.estado}</Text>
    </View>
  </View>
  <View style={styles.tableRowModal}>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableLabel}>Vigencia</Text>
    </View>
    <View style={styles.tableCellModal}>
      <Text style={styles.tableValue}>{revision_data?.vigencia}</Text>
    </View>
  </View>
  <View style={{ alignItems: 'center', marginTop: 8 }}>
    <TouchableOpacity
      style={{
        backgroundColor: '#0051A8',
        paddingVertical: 10,
        paddingHorizontal: 18,
        // borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={() => {
        // Aquí puedes abrir el documento, mostrar modal, o navegar a otra pantalla
        // Por ejemplo: router.push('/ruta-del-documento');
        // O mostrar un modal con el PDF, etc.
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Ver documento</Text>
    </TouchableOpacity>
  </View>
</Collapsible>


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
    </ProtectedRoute>
	);
}

const styles = StyleSheet.create({
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
    // marginHorizontal: 150,
    maxWidth: '50%',
    width: 'auto',
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
  collapsibleHeader: {
    backgroundColor: '#0051A8',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
