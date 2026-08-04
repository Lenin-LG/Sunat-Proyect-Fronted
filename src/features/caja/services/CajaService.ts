import { apiRequest } from "../../../core/api/api"

export interface CobroPago {
  id?: number
  comprobanteId: number
  monto: number
  metodoPago: string // e.g. YAPE, PLIN, EFECTIVO, TRANSFERENCIA
  fechaPago?: string
  referencia?: string
}

export const CajaService = {
  async registrar(pago: CobroPago): Promise<CobroPago> {
    return apiRequest<CobroPago>("/api/cobros-pagos", {
      method: "POST",
      body: JSON.stringify(pago),
    })
  },

  async listarPorComprobante(comprobanteId: number): Promise<CobroPago[]> {
    return apiRequest<CobroPago[]>(`/api/cobros-pagos/comprobante/${comprobanteId}`)
  },
}
