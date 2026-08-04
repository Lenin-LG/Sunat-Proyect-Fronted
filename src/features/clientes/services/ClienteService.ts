import { apiRequest } from "../../../core/api/api"
import type { Entidad } from "../types"

export const ClienteService = {
  async listar(): Promise<Entidad[]> {
    return apiRequest<Entidad[]>("/api/clientes")
  },

  async obtener(id: number): Promise<Entidad> {
    return apiRequest<Entidad>(`/api/clientes/${id}`)
  },

  async registrar(cliente: Entidad): Promise<Entidad> {
    return apiRequest<Entidad>("/api/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  },

  async actualizar(id: number, cliente: Entidad): Promise<Entidad> {
    return apiRequest<Entidad>(`/api/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    })
  },

  async eliminar(id: number): Promise<void> {
    const token = localStorage.getItem("sunat_auth_token");
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`/api/clientes/${id}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      throw new Error("Error al eliminar el cliente")
    }
  },

  async buscarAuto(tipoDoc: string, numeroDoc: string): Promise<Entidad> {
    return apiRequest<Entidad>(`/api/clientes/buscar-auto?tipoDoc=${tipoDoc}&numeroDoc=${numeroDoc}`)
  },
}
