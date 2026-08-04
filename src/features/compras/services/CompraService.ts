import { apiRequest } from "../../../core/api/api"
import type { Compra, CompraRequest } from "../types"

export const CompraService = {
  async listar(): Promise<Compra[]> {
    return apiRequest<Compra[]>("/api/compras")
  },

  async registrar(compra: CompraRequest): Promise<Compra> {
    return apiRequest<Compra>("/api/compras", {
      method: "POST",
      body: JSON.stringify(compra),
    })
  },
}
