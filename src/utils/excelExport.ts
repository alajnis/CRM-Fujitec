import * as XLSX from 'xlsx';
import { Obra, Cliente, Equipo } from '../types';
import { formatUSD, formatDateES } from './semaforo';

export const exportObrasToExcel = (obras: Obra[], fileName: string = 'Obras.xlsx') => {
  const data = obras.map(obra => ({
    'Código': obra.codigo,
    'Nombre': obra.nombre,
    'Estado': obra.estado,
    'Región': obra.region,
    'Monto USD': obra.montoUSD,
    'Fecha Ingreso': formatDateES(obra.fechaIngreso),
    'Última Actualización': formatDateES(obra.fechaUltimaActualizacion),
    'Usuario Asignado': obra.usuarioAsignado || '-',
    'Observaciones': obra.observaciones || '-',
    'Equipos Asignados': obra.equipoIds?.length || 0,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Obras');

  // Style header
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'C8102E' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Adjust column widths
  ws['!cols'] = [
    { wch: 12 }, // Código
    { wch: 25 }, // Nombre
    { wch: 18 }, // Estado
    { wch: 12 }, // Región
    { wch: 14 }, // Monto
    { wch: 14 }, // Fecha Ingreso
    { wch: 18 }, // Última Actualización
    { wch: 15 }, // Usuario
    { wch: 25 }, // Observaciones
    { wch: 12 }  // Equipos
  ];

  XLSX.writeFile(wb, fileName);
};

export const exportClientesToExcel = (clientes: Cliente[], fileName: string = 'Clientes.xlsx') => {
  // Expand rows: one row per contact (primary + all secondary)
  const expandedData: any[] = [];

  clientes.forEach(cliente => {
    // Always add primary contact
    expandedData.push({
      'Razón Social': cliente.razonSocial,
      'Contacto': cliente.contactoPrincipal || '-',
      'Cargo': cliente.cargo || '-',
      'Email': cliente.email || '-',
      'Teléfono': cliente.telefono || '-',
      'Dirección': cliente.direccion || '-',
      'Región': cliente.region,
      'CUIT/Rut': cliente.cuitRut || '-'
    });

    // Add secondary contacts if they exist
    if (cliente.contactos && cliente.contactos.length > 0) {
      cliente.contactos.forEach(contacto => {
        expandedData.push({
          'Razón Social': cliente.razonSocial,
          'Contacto': contacto.nombre || '-',
          'Cargo': contacto.cargo || '-',
          'Email': contacto.email || '-',
          'Teléfono': contacto.telefono || '-',
          'Dirección': cliente.direccion || '-',
          'Región': cliente.region,
          'CUIT/Rut': cliente.cuitRut || '-'
        });
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(expandedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  // Style header
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'C8102E' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Adjust column widths
  ws['!cols'] = [
    { wch: 25 }, // Razón Social
    { wch: 20 }, // Contacto
    { wch: 15 }, // Cargo
    { wch: 25 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Dirección
    { wch: 12 }, // Región
    { wch: 15 }  // CUIT/Rut
  ];

  XLSX.writeFile(wb, fileName);
};

export const exportEquiposToExcel = (equipos: Equipo[], fileName: string = 'Equipos.xlsx') => {
  const data = equipos.map(equipo => ({
    'Código Único': equipo.codigoUnico,
    'Nombre': equipo.nombre,
    'Modelo': equipo.modelo,
    'Tipo': equipo.tipo,
    'Velocidad (m/s)': equipo.velocidadMS,
    'Capacidad (kg)': equipo.capacidadKg,
    'Paradas': equipo.paradas,
    'Observaciones': equipo.observaciones || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Equipos');

  // Style header
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'C8102E' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Adjust column widths
  ws['!cols'] = [
    { wch: 15 }, // Código Único
    { wch: 20 }, // Nombre
    { wch: 20 }, // Modelo
    { wch: 15 }, // Tipo
    { wch: 15 }, // Velocidad
    { wch: 15 }, // Capacidad
    { wch: 10 }, // Paradas
    { wch: 25 }  // Observaciones
  ];

  XLSX.writeFile(wb, fileName);
};
