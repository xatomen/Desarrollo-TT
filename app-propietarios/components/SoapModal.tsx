import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';

interface SoapModalProps {
  visible: boolean;
  onClose: () => void;
  datos: any;
}

export default function SoapModal({ visible, onClose, datos }: SoapModalProps) {
  const [fontsLoaded] = useFonts({
    'Dosis': require('../assets/fonts/Dosis-Regular.ttf'),
    'Dosis-Bold': require('../assets/fonts/Dosis-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const soap = datos?.soap || {};
  const padron = datos?.padron || {};

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {/* PRIMERA SECCIÓN */}
            <View style={styles.sectionBox}>
              {/* Fila 1: Encabezado (solo columna derecha, ocupa todo el ancho) */}
              <View style={[styles.row, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8 }}>
                  <View style={[styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                      Seguros {soap.compania || '-'} S.A.
                    </Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>Póliza N° {soap.num_poliza || '-'}</Text>
                      <Text style={{ fontSize: 12, textAlign: 'center' }}>
                        Consulta sobre la vigencia de este seguro en www.seguros{(soap.compania || '').toLowerCase()}.cl o en el fono 600 411 1000
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.row, { alignItems: 'center', marginTop: 8 }]}>
                    <Text style={{ fontWeight: 'bold', flex: 2, fontSize: 12, textAlign: 'center' }}>
                      CERTIFICADO SEGURO OBLIGATORIO ACCIDENTES PERSONALES ELECTRONICO LEY 18.490
                    </Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Image
                        source={
                          soap.compania
                            ? { uri: `../assets/images/aseguradoras/${soap.compania}.png` }
                            : require('../assets/images/aseguradoras/consorcio.png')
                        }
                        style={{ height: 40, width: 80, resizeMode: 'contain' }}
                      />
                    </View>
                  </View>
                  {/* Ahora el texto original va aquí abajo */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: 'bold' }}>ORIGINAL: ASEGURADO</Text>
                    <Text style={{ fontWeight: 'bold' }}>N° Folio {soap.folio || '-'}</Text>
                    <Text style={{ fontStyle: 'italic', fontSize: 13, textAlign: 'justify', marginTop: 4 }}>
                      Este certificado acredita que el vehículo aquí individualizado está asegurado contra el riesgo de Accidentes Personales de acuerdo a la Ley Nº 18.490 y la Póliza del Seguro Obligatorio de Accidentes Personales causados por Vehículos Motorizados, incorporada en el Depósito de Pólizas de la Comisión para el Mercado Financiero bajo el código POL 320130487.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fila 2: Inscripción y Propietario (Propietario en una sola celda) */}
              <View style={[styles.row, { borderBottomWidth: 2, borderColor: '#222'}]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Inscripción R.V.M</Text>
                  <Text>{soap.ppu || '-'}</Text>
                </View>
                <View style={{ width: 2, backgroundColor: '#222', alignSelf: 'stretch' }} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontWeight: 'bold' }}>Propietario</Text>
                  <Text>{padron.nombre || '-'}</Text>
                </View>
              </View>

              {/* Fila 3: Tipo Vehículo y Rut (Rut en una sola celda) */}
              <View style={[styles.row, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Tipo Vehículo</Text>
                  <Text>{padron.tipo_vehiculo || '-'}</Text>
                </View>
                <View style={{ width: 2, backgroundColor: '#222', alignSelf: 'stretch' }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold' }}>Rut</Text>
                  <Text>{padron.rut || '-'}</Text>
                </View>
              </View>

              {/* Fila 4: Marca y Fechas (Rige Desde y Rige Hasta en una sola celda cada uno) */}
              <View style={[styles.row, { borderBottomWidth: 2, borderColor: '#222'}]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Marca</Text>
                  <Text>{padron.marca || '-'}</Text>
                </View>
                <View style={{ width: 2, backgroundColor: '#222', alignSelf: 'stretch' }} />
                <View style={{ flex: 2 }}>
                  <View style={[styles.row, { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 1, borderRightWidth: 2, borderColor: '#222', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>Rut</Text>
                      <Text>{padron.rut || '-'}</Text>
                    </View>
                    <View style={{ flex: 1, borderRightWidth: 2, borderColor: '#222', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>Rige Desde</Text>
                      <Text>{soap.rige_desde || '-'}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>Rige Hasta</Text>
                      <Text>{soap.rige_hasta || '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Fila 5: Modelo, Año y Prima */}
              <View style={[styles.row, { borderBottomWidth: 2, borderColor: '#222' }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold' }}>Modelo</Text>
                      <Text>{padron.modelo || '-'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold' }}>Año</Text>
                      <Text>{padron.anio || '-'}</Text>
                    </View>
                  </View>
                </View>
                {/* Separador vertical */}
                <View style={{ width: 2, backgroundColor: '#222', alignSelf: 'stretch' }} />
                {/* Celda derecha: Prima debajo de los tres campos */}
                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', width: '100%' }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>Prima</Text>
                      <Text>{soap.prima ? `$${soap.prima.toLocaleString('es-CL')}` : '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Fila 6: Motor, Prima, Timbre */}
              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>N° Motor</Text>
                  <Text>{padron.num_motor || '-'}</Text>
                </View>
                <View style={{ width: 2, backgroundColor: '#222', alignSelf: 'stretch' }} />
                <View style={{ flex: 2 }}>
                  <View style={styles.row}>
                    <View style={{ flex: 2, alignItems: 'center' }}>
                      <Image
                        source={require('../assets/images/timbre.png')}
                        style={{ height: 40, width: 80, resizeMode: 'contain', marginBottom: 4 }}
                      />
                      <View style={{ borderTopWidth: 2, borderColor: '#222', marginHorizontal: 30, marginTop: 4 }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Firma apoderado compañía</Text>
                      </View>
                    </View>
                  </View>
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
    borderWidth: 2,
    borderColor: '#222',
  },
  sectionBox: {
    backgroundColor: '#fff',
    // padding: 12,
    marginBottom: 18,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#222',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  closeButton: {
    backgroundColor: '#6D2077',
    paddingVertical: 12,
    alignItems: 'center',
  },
});