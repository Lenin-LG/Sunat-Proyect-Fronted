export interface Producto {
  id?: number
  codigo: string
  descripcion: string
  precioUnitario: number
  costoPromedio?: number // Average weighted cost
  stockActual?: number
  tipoAfectacionIgvId: string // Catalog 07 (e.g. 10 = Gravado, 20 = Exonerado)
  unidadMedidaId: string // Catalog 03 (e.g. NIU = Unidades, ZZ = Servicios)
  categoriaId?: number
  creadoEn?: string
}
