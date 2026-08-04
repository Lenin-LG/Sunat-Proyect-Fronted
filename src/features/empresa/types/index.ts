export interface Empresa {
  id?: number
  ruc: string
  razonSocial: string
  nombreComercial: string
  ubigeo: string
  departamento: string
  provincia: string
  distrito: string
  direccionFiscal: string
  usuarioSolProduccion?: string
  passwordSolProduccion?: string
  modoProduccion: boolean
  certificadoBase64?: string
  certificadoPassword?: string
}
