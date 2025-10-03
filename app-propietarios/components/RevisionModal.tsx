import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

interface RevisionModalProps {
  visible: boolean;
  onClose: () => void;
  datos: any;
}

export default function RevisionModal({ visible, onClose, datos }: RevisionModalProps) {
  // Asegúrate de que datos.revision, datos.padron y datos.permiso estén disponibles
  const revision = datos?.revision || {};
  const padron = datos?.padron || {};
  const permiso = datos?.permiso || {};

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {/* Primera sección */}
            <View style={[styles.sectionBox, { marginBottom: 24 }]}>
              <Text style={styles.title}>CERTIFICADO DE REVISIÓN TÉCNICA</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.info}>FECHA REVISIÓN: {revision.fecha || '-'}</Text>
                <Text style={styles.info}>N°: {revision.nom_certificado || '-'}</Text>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.info}>{revision.planta || '-'}</Text>
                  <Text style={styles.info}>Santiago, Chile</Text>
                  <Text style={styles.info}>PLANTA: {revision.codigo_planta || '-'} / FONO: 225826218</Text>
                </View>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222'}]}>
                <View style={{ flex: 1, borderRightWidth: 2, borderColor: '#222', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, textAlign: 'center' }}>PLACA PATENTE</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{revision.ppu || '-'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  {/* Puedes reemplazar la imagen por la que corresponda */}
                  <Image source={require('../assets/images/timbre.png')} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>APROBADO</Text>
                </View>
              </View>
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.info}>FIRMA ELECTRONICA AVANZADA</Text>
                <Text style={styles.info}>{revision.fecha || '-'}</Text>
              </View>
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                {/* Puedes reemplazar la imagen por la que corresponda */}
                <Image source={require('../assets/images/qrcode.png')} style={{ height: 100, width: 100, resizeMode: 'contain' }} />
                <Text style={{ fontWeight: 'bold', marginTop: 6 }}>VÁLIDO HASTA</Text>
                <Text>{revision.fecha_vencimiento || '-'}</Text>
              </View>
            </View>

            {/* Segunda sección */}
            <View style={styles.sectionBox}>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 2, borderRightWidth: 2, borderColor: '#222' }}>
                  <Text style={styles.info}>NOMBRE DEL PROPIETARIO</Text>
                  <Text style={styles.info}>{padron.nombre || '-'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.info}>RUT</Text>
                  <Text style={styles.info}>{padron.rut || '-'}</Text>
                </View>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 2, borderRightWidth: 2, borderColor: '#222' }}>
                  <Text style={styles.info}>TIPO DE VEHICULO</Text>
                  <Text style={styles.info}>{padron.tipo_vehiculo || '-'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.info}>AÑO</Text>
                  <Text style={styles.info}>{padron.anio || '-'}</Text>
                </View>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 2, borderRightWidth: 2, borderColor: '#222' }}>
                  <Text style={styles.info}>MARCA</Text>
                  <Text style={styles.info}>{padron.marca || '-'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.info}>COLOR</Text>
                  <Text style={styles.info}>{padron.color || '-'}</Text>
                </View>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 2, borderRightWidth: 2, borderColor: '#222' }}>
                  <Text style={styles.info}>MODELO</Text>
                  <Text style={styles.info}>{padron.modelo || '-'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.info}>SELLO</Text>
                  <Text style={styles.info}>{permiso.tipo_sello || '-'}</Text>
                </View>
              </View>
              <View style={[styles.rowBetween, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.info}>N° CHASIS/N° VIN</Text>
                  <Text style={styles.info}>{padron.num_chasis || '-'} / {padron.num_vin || '-'}</Text>
                </View>
              </View>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.info}>N° MOTOR</Text>
                  <Text style={styles.info}>{padron.num_motor || '-'}</Text>
                </View>
              </View>
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
    // borderWidth: 2,
    // borderColor: '#222',
  },
  sectionBox: {
    backgroundColor: '#fff',
    // padding: 12,
    // marginBottom: 18,
    // borderRadius: 8,
    borderWidth: 2,
    borderColor: '#222',
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    fontSize: 15,
    color: '#222',
    fontFamily: 'serif',
    // marginBottom: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'flex-start',
    // marginBottom: 2,
  },
  closeButton: {
    backgroundColor: '#6D2077',
    paddingVertical: 12,
    alignItems: 'center',
  },
});