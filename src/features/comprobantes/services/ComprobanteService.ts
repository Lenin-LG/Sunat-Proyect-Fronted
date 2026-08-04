import { apiRequest } from "../../../core/api/api"
import type { Comprobante, ComprobanteRequest } from "../types"

export const ComprobanteService = {
  async emitirFactura(request: ComprobanteRequest): Promise<Comprobante> {
    return apiRequest<Comprobante>("/api/comprobantes/factura", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async emitirBoleta(request: ComprobanteRequest): Promise<Comprobante> {
    return apiRequest<Comprobante>("/api/comprobantes/boleta", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async emitirNotaCredito(request: ComprobanteRequest): Promise<Comprobante> {
    return apiRequest<Comprobante>("/api/comprobantes/nota-credito", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async emitirNotaDebito(request: ComprobanteRequest): Promise<Comprobante> {
    return apiRequest<Comprobante>("/api/comprobantes/nota-debito", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async anular(id: number, motivo: string): Promise<Comprobante> {
    return apiRequest<Comprobante>(`/api/comprobantes/${id}/anular?motivo=${encodeURIComponent(motivo)}`, {
      method: "POST",
    })
  },

  async consultarTicket(id: number): Promise<Comprobante> {
    return apiRequest<Comprobante>(`/api/comprobantes/${id}/consultar-ticket`)
  },
}
