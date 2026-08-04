import { apiRequest } from "../../../core/api/api"
import type { Empresa } from "../types"

export const EmpresaService = {
  async obtener(ruc: string): Promise<Empresa> {
    return apiRequest<Empresa>(`/api/empresa/${ruc}`)
  },

  async configurar(empresa: Empresa): Promise<Empresa> {
    return apiRequest<Empresa>("/api/empresa/config", {
      method: "PUT",
      body: JSON.stringify(empresa),
    })
  },
}
