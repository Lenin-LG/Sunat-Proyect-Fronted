export interface CompraItemRequest {
  productoId: number
  cantidad: number
  precioUnitario: number
}

export interface CompraRequest {
  tipoDocumento: string
  serie: string
  numero: number
  fechaEmision: string
  proveedorId: number
  items: CompraItemRequest[]
}

export interface CompraItem {
  id?: number
  productoId: number
  productoCodigo?: string
  productoDescripcion?: string
  cantidad: number
  precioUnitario: number
}

export interface Compra {
  id: number
  tipoDocumento: string
  serie: string
  numero: number
  fechaEmision: string
  proveedorId: number
  proveedorNombre?: string
  proveedorDocumento?: string
  total?: number
  totalPagar?: number
  creadoEn?: string
  items: CompraItem[]
}
