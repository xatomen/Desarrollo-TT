import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

interface PermisoCirculacionModalProps {
  visible: boolean;
  onClose: () => void;
  datos: any;
}

export default function PermisoCirculacionModal({ visible, onClose, datos }: PermisoCirculacionModalProps) {
    const [fontsLoaded] = useFonts({
        'Dosis': require('../assets/fonts/Dosis-Regular.ttf'),
        'Dosis-Bold': require('../assets/fonts/Dosis-Bold.ttf'),
    });
    return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <LinearGradient
            colors={['#cfe8fd', '#e5d8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBg}
          >
            <ScrollView>
              {/* Logo superior */}
              <Image source={require('../assets/images/tupermiso/logo-texto-permiso.png')} style={styles.logo} resizeMode="contain" />
              {/* Marca de agua y contenido */}
              <View style={styles.watermarkContainer}>
                <Image source={require('../assets/images/tupermiso/marca-agua-simple.png')} style={styles.watermark} resizeMode="contain" />
                <View style={styles.translucentCard}>
                  {/* Información Contribuyente */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Información Contribuyente</Text>
                    <Text style={styles.info}><Text style={styles.label}>Nombre: </Text>{datos?.nombre}</Text>
                    <Text style={styles.info}><Text style={styles.label}>RUT: </Text>{datos?.rut}</Text>
                  </View>
                  {/* Información Vehículo */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Información Vehículo</Text>
                    <Text style={styles.info}><Text style={styles.label}>PPU: </Text>{datos?.ppu}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Marca: </Text>{datos?.marca}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Modelo: </Text>{datos?.modelo}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Año: </Text>{datos?.anio}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Color: </Text>{datos?.color}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Tipo de Vehículo: </Text>{datos?.tipo_vehiculo}</Text>
                    <Text style={styles.info}><Text style={styles.label}>N° Motor: </Text>{datos?.motor}</Text>
                    <Text style={styles.info}><Text style={styles.label}>N° Chasis: </Text>{datos?.chasis}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Puertas: </Text>{datos?.pts}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Asientos: </Text>{datos?.ast}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Cilindrada: </Text>{datos?.cilindrada}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Capacidad Carga: </Text>{datos?.carga}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Combustible: </Text>{datos?.combustible}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Tipo Sello: </Text>{datos?.tipo_sello}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Transmisión: </Text>{datos?.transmision}</Text>
                  </View>
                  {/* Información Pago */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Información Pago</Text>
                    <Text style={styles.info}><Text style={styles.label}>N° Comprobante: </Text>{datos?.id}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Tasación: </Text>${datos?.tasacion?.toLocaleString('es-CL')}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Código SII: </Text>{datos?.codigo_sii || 'No disponible'}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Valor Permiso: </Text>${datos?.valor_permiso?.toLocaleString('es-CL')}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Fecha Pago: </Text>{datos?.fecha_emision}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Fecha Vencimiento: </Text>{datos?.fecha_expiracion}</Text>
                  </View>
                  {/* Logo inferior */}
                  <View style={styles.sectionBox}>
                    <Image source={require('../assets/images/tupermiso/logo-cert.png')} style={styles.logoCert} resizeMode="contain" />
                  </View>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: 'transparent', borderRadius: 0, padding: 0, width: '90%', maxHeight: '90%' },
  gradientBg: { borderRadius: 12, padding: 0, flex: 1 },
  logo: { width: 300, height: 20, alignSelf: 'center', marginTop: 15, marginBottom: 0 },
  watermarkContainer: { position: 'relative', alignItems: 'center', minHeight: 600 },
  watermark: { position: 'absolute', opacity: 0.15, width: 200, height: 200, top: 40, alignSelf: 'center', zIndex: 0 },
  translucentCard: {
    // backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 10,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  sectionBox: {
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    marginBottom: 0,
    padding: 8,
    // borderRadius: 8,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Dosis-Bold', // Cambiado aquí
  },
  info: { 
    fontSize: 15, 
    marginBottom: 2, 
    color: '#222', 
    textAlign: 'left', 
    fontFamily: 'Dosis', // Cambiado aquí
  },
  label: { fontWeight: 'bold', fontFamily: 'Dosis-Bold' }, // Cambiado aquí
  logoCert: { width: 120, height: 120, alignSelf: 'center', marginTop: 16, marginBottom: 16 },
  closeButton: { backgroundColor: '#0051A8', padding: 12, borderRadius: 8, marginTop: 12 },
  closeButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});