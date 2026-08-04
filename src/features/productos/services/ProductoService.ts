import { apiRequest } from "../../../core/api/api"
import type { Producto } from "../types"

export const ProductoService = {
  async listar(): Promise<Producto[]> {
    return apiRequest<Producto[]>("/api/productos")
  },

  async obtener(id: number): Promise<Producto> {
    return apiRequest<Producto>(`/api/productos/${id}`)
  },

  async registrar(producto: Producto): Promise<Producto> {
    return apiRequest<Producto>("/api/productos", {
      method: "POST",
      body: JSON.stringify(producto),
    })
  },

  async actualizar(id: number, producto: Producto): Promise<Producto> {
    return apiRequest<Producto>(`/api/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    })
  },

  async eliminar(id: number): Promise<void> {
    const token = localStorage.getItem("sunat_auth_token");
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      throw new Error("Error al eliminar el producto")
    }
  },

  async ingresoStock(id: number, cantidad: number, costo: number): Promise<Producto> {
    return apiRequest<Producto>(`/api/productos/${id}/ingreso-stock?cantidad=${cantidad}&costo=${costo}`, {
      method: "POST",
    })
  },

  async salidaStock(id: number, cantidad: number, venta: number): Promise<Producto> {
    return apiRequest<Producto>(`/api/productos/${id}/salida-stock?cantidad=${cantidad}&venta=${venta}`, {
      method: "POST",
    })
  },
}
