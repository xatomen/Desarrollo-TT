import { useState } from 'react';
import API_CONFIG from '@/config/api';
export async function fetchVehicleData(ppu: string, rut: string) {
  // Estados locales para devolver
  let result: any = {
    fechaInscripcion: '-',
    tipoVehiculo: '-',
    marca: '-',
    modelo: '-',
    anio: '-',
    color: '-',
    numChasis: '-',
    numMotor: '-',
    revisionTecnica: 'Desconocido',
    fechaExpiracionRevision: '-',
    soap: 'Desconocido',
    fechaExpiracionSoap: '-',
    encargoRobo: 'Desconocido',
    multasTransito: 'Desconocido',
    multasRPI: 'Desconocido',
    codigoSii: '-',
    tipoSello: '-',
    caso: null,
  };

  // 1. Padrón
  try {
    const inscripcionRes = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
    const inscripcionData = await inscripcionRes.json();
    result.fechaInscripcion = inscripcionData.fecha_inscripcion || '-';
    result.tipoVehiculo = inscripcionData.tipo_vehiculo || '-';
    result.marca = inscripcionData.marca || '-';
    result.modelo = inscripcionData.modelo || '-';
    result.anio = inscripcionData.anio || '-';
    result.color = inscripcionData.color || '-';
    result.numChasis = inscripcionData.num_chasis || '-';
    result.numMotor = inscripcionData.num_motor || '-';
  } catch (error) {
    result.fechaInscripcion = 'Desconocido';
  }

  // 2. Revisión Técnica
  try {
    const revisionRes = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${ppu}`);
    const revisionData = await revisionRes.json();
    result.revisionTecnica = revisionData.vigencia || 'Desconocido';
    result.fechaExpiracionRevision = revisionData.fecha_vencimiento || '-';
  } catch (error) {
    result.revisionTecnica = 'Desconocido';
  }

  // 3. SOAP
  try {
    const soapRes = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${ppu}`);
    const soapData = await soapRes.json();
    result.soap = soapData.vigencia_permiso || 'Desconocido';
    result.fechaExpiracionSoap = soapData.rige_hasta || '-';
  } catch (error) {
    result.soap = 'Desconocido';
  }

  // 4. Encargo por Robo
  try {
    const roboRes = await fetch(`${API_CONFIG.BACKEND}consultar_encargo/${ppu}`);
    const roboData = await roboRes.json();
    if (roboData.encargo === 1) {
      result.encargoRobo = 'Si';
    } else if (roboData.encargo === 0) {
      result.encargoRobo = 'No';
    } else {
      result.encargoRobo = 'No';
    }
  } catch (error) {
    result.encargoRobo = 'Desconocido';
  }

  // 5. Multas de Tránsito
  try {
    const transitoRes = await fetch(`${API_CONFIG.BACKEND}consultar_multas/${ppu}`);
    const transitoData = await transitoRes.json();
    if (transitoData.total_multas !== 0) {
      result.multasTransito = 'Si';
    } else {
      result.multasTransito = 'No';
    }
  } catch (error) {
    result.multasTransito = 'Desconocido';
  }

  // 6. Multas RPI
  try {
    const rpiRes = await fetch(`${API_CONFIG.BACKEND}consultar-multas-rpi/${rut}`);
    const rpiData = await rpiRes.json();
    if (rpiData.cantidad_multas !== 0) {
      result.multasRPI = 'Si';
    } else {
      result.multasRPI = 'No';
    }
  } catch (error) {
    result.multasRPI = 'Desconocido';
  }

  // 7. Permiso de circulación y tipo de sello
  try {
    const vehiculoRes = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
    const vehiculoData = await vehiculoRes.json();
    result.codigoSii = vehiculoData.codigo_sii || '-';
    if (vehiculoRes.ok) {
      result.tipoSello = vehiculoData.tipo_sello;
      result.caso = "Renovación";
    } else {
      // Buscar tipo de sello desde la factura
      const inscripcionRes = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
      const inscripcionData = await inscripcionRes.json();
      const facturaRes = await fetch(`${API_CONFIG.SII}factura_venta_num_chasis/?num_chasis=${encodeURIComponent(inscripcionData.num_chasis)}`, {
        headers: { 'Accept': 'application/json' }
      });
      const facturaData = await facturaRes.json();
      result.tipoSello = facturaData.tipo_sello || '-';
      result.caso = "Primera Obtención";
    }
  } catch (error) {
    // No modificar tipoSello/caso si falla
  }

  return result;
}