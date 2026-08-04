export interface Entidad {
  id?: number
  tipoEntidadId: string // '1' = DNI, '6' = RUC
  numeroDocumento: string
  nombreRazonSocial: string
  direccion: string
  correo?: string
  creadoEn?: string
}
