export interface ComprobanteItemRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  codigoProductoSunat?: string;
  codigoInterno?: string;
  tipoUnidad?: string; // e.g. "NIU", "ZZ"
  tipoAfectacionIgv?: string; // e.g. "10", "20", "30"
  impuestoBolsa?: number;
}

export interface CuotaRequest {
  numeroCuota: number;
  monto: number;
  fechaVencimiento: string; // yyyy-MM-dd
}

export interface ComprobanteRequest {
  serie: string;
  numero?: number;
  clienteTipoDocumento: string; // "1" = DNI, "6" = RUC
  clienteNumeroDocumento: string;
  clienteNombre: string;
  formaPago: "CONTADO" | "CREDITO";
  detraccionCodigo?: string;
  detraccionPorcentaje?: number;
  detraccionMonto?: number;
  descuentoGlobal?: number;
  totalImpuestoBolsa?: number;
  anticipoReferencia?: string;
  saldoPendiente?: number;
  cuotas?: CuotaRequest[];
  documentoModificadoId?: string; // e.g. "F001-45"
  documentoModificadoTipo?: string; // e.g. "01" (Factura), "03" (Boleta)
  notaMotivoCodigo?: string; // e.g. "01" (Anulación de la operación)
  notaMotivoDescripcion?: string;
  items: ComprobanteItemRequest[];
}

export interface ComprobanteDetalle {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  codigoProductoSunat?: string;
  codigoInterno?: string;
  tipoUnidad?: string;
  tipoAfectacionIgv?: string;
  impuestoBolsa?: number;
}

export interface Cuota {
  id?: number;
  numeroCuota: number;
  monto: number;
  fechaVencimiento: string;
}

export type EstadoComprobante = 'PENDIENTE' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'ERROR';

export interface Comprobante {
  id: number;
  tipoDocumento: string; // "01" = Factura, "03" = Boleta, "07" = Nota de Crédito, "08" = Nota de Débito
  serie: string;
  numero: number;
  fechaEmision: string; // yyyy-MM-dd
  clienteTipoDocumento: string;
  clienteNumeroDocumento: string;
  clienteNombre: string;
  totalGravada: number;
  totalIgv: number;
  totalPagar: number;
  estado: EstadoComprobante;
  sunatResponseCode?: string;
  sunatDescription?: string;
  creadoEn: string;
  enviadoEn?: string;
  detalles: ComprobanteDetalle[];

  // Advanced fields
  formaPago?: string;
  detraccionCodigo?: string;
  detraccionPorcentaje?: number;
  detraccionMonto?: number;
  descuentoGlobal?: number;
  totalImpuestoBolsa?: number;
  anticipoReferencia?: string;
  saldoPendiente?: number;
  cuotas?: Cuota[];

  // Notes
  documentoModificadoId?: string;
  documentoModificadoTipo?: string;
  notaMotivoCodigo?: string;
  notaMotivoDescripcion?: string;
}

export interface DashboardMetrics {
  totalComprobantes: number;
  totalFacturas: number;
  totalBoletas: number;
  totalAceptados: number;
  totalRechazados: number;
  totalGravadaAcumulada: number;
  totalIgvAcumulado: number;
  totalPagarAcumulado: number;
}
