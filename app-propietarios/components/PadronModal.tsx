import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

interface PadronModalProps {
  visible: boolean;
  onClose: () => void;
  datos: any;
}

export default function PadronModal({ visible, onClose, datos }: PadronModalProps) {
  const [fontsLoaded] = useFonts({
    'Dosis': require('../assets/fonts/Dosis-Regular.ttf'),
    'Dosis-Bold': require('../assets/fonts/Dosis-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ margin: 18,  border: '2px solid orange', borderStyle: 'dashed', borderRadius: 12 }}>
            {/* Primera columna */}
            <View style={styles.sectionBox}>
              <Text style={styles.title}>CERTIFICADO DE INSCRIPCIÓN R.V.M.</Text>
              <View style={styles.infoTable}>
                <InfoRow label="PROPIETARIO" value={datos?.nombre || '-'} />
                <InfoRow label="DOMICILIO" value={datos?.domicilio || '-'} />
                <InfoRow label="" value="" />
                <InfoRow label="TIPO VEHICULO" value={datos?.tipo_vehiculo || '-'} />
                <InfoRow label="AÑO" value={datos?.anio || '-'} />
                <InfoRow label="MARCA" value={datos?.marca || '-'} />
                <InfoRow label="MODELO" value={datos?.modelo || '-'} />
                <InfoRow label="Nro. MOTOR" value={datos?.num_motor || '-'} />
                <InfoRow label="Nro. CHASIS" value={datos?.num_chasis || '-'} />
                <InfoRow label="Nro. SERIE" value={datos?.serie || '-'} />
                <InfoRow label="Nro. VIN" value={datos?.num_vin || '-'} />
                <InfoRow label="COLOR" value={datos?.color || '-'} />
              </View>
            </View>

            {/* Segunda columna (debajo) */}
            <View style={styles.sectionBox}>
              <Text style={styles.title}>SRCeI</Text>
              <View style={styles.infoTable}>
                <InfoRow label="INSC. PPU" value={datos?.ppu || '-'} bold />
                <InfoRow label="RUN o RUT" value={datos?.rut || '-'} bold />
                <InfoRow label="ADQUISICIÓN" value={datos?.fecha_inscripcion || '-'} />
                <InfoRow label="INSCRIPCIÓN" value={datos?.fecha_inscripcion || '-'} />
                <InfoRow label="EMISIÓN" value={new Date().toLocaleDateString() || '-'} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>FOLIO: </Text>
                  <Text style={{ fontWeight: '400' }}>{Math.floor(Math.random() * 1000000)}</Text>
                </Text>
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>Código Verificación: </Text>
                  <Text style={{ fontWeight: '700' }}>{datos?.codigo_verificacion || '-'}</Text>
                </Text>
              </View>
              <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Image source={require('../assets/images/barcode.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} />
                <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{Math.floor(Math.random() * 1000000)}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center' }}>
                <Image source={require('../assets/images/qrcode.png')} style={{ width: 80, height: 80, marginRight: 10 }} />
                <Image source={require('../assets/images/imagenes_padron.png')} style={{ width: 220, height: 80, resizeMode: 'contain' }} />
              </View>
              <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                <Text style={{ fontSize: 15 }}>
                  FECHA EMISIÓN: {new Date().toLocaleString() || '-'}
                </Text>
              </View>
              {datos?.qr_url && (
                <View style={{ marginTop: 10, alignItems: 'center' }}>
                  <Image source={{ uri: datos.qr_url }} style={{ width: 80, height: 80 }} />
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Componente auxiliar para filas de información
function InfoRow({ label, value, bold }: { label: string, value: string, bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
      <Text style={[styles.infoLabel, bold && { fontWeight: 'bold' }]}>{label}</Text>
      <Text style={[styles.infoValue, bold && { fontWeight: 'bold' }]}>: {value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '92%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  sectionBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 18,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    fontFamily: 'serif',
    color: '#222',
  },
  infoTable: {
    // marginBottom: 4,
  },
  infoLabel: {
    width: 120,
    fontSize: 16,
    color: '#333',
    fontFamily: 'serif',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'serif',
  },
  closeButton: {
    backgroundColor: '#6D2077',
    paddingVertical: 12,
    alignItems: 'center',
  },
});