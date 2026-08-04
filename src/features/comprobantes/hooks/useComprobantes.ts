import { useState, useEffect, useMemo } from "react"
import type { Comprobante, ComprobanteRequest, DashboardMetrics } from "../types"
import { ComprobanteService } from "../services/ComprobanteService"

const LOCAL_STORAGE_KEY = "sunat_comprobantes_historial"

export function useComprobantes() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<Comprobante | null>(null)

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        setComprobantes(JSON.parse(saved))
      } catch (e) {
        console.error("Error parsing stored receipts:", e)
      }
    }
  }, [])

  // Save to LocalStorage when list changes
  const saveComprobantes = (updated: Comprobante[]) => {
    setComprobantes(updated)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  // Compute metrics in real-time
  const metrics = useMemo<DashboardMetrics>(() => {
    let totalComprobantes = comprobantes.length
    let totalFacturas = 0
    let totalBoletas = 0
    let totalAceptados = 0
    let totalRechazados = 0
    let totalGravadaAcumulada = 0
    let totalIgvAcumulado = 0
    let totalPagarAcumulado = 0

    comprobantes.forEach((c) => {
      if (c.tipoDocumento === "01") totalFacturas++
      if (c.tipoDocumento === "03") totalBoletas++
      if (c.estado === "ACEPTADO") totalAceptados++
      if (c.estado === "RECHAZADO" || c.estado === "ERROR") totalRechazados++

      // Only accumulate money metrics for accepted receipts (valid sales)
      if (c.estado === "ACEPTADO") {
        totalGravadaAcumulada += Number(c.totalGravada || 0)
        totalIgvAcumulado += Number(c.totalIgv || 0)
        totalPagarAcumulado += Number(c.totalPagar || 0)
      }
    })

    return {
      totalComprobantes,
      totalFacturas,
      totalBoletas,
      totalAceptados,
      totalRechazados,
      totalGravadaAcumulada,
      totalIgvAcumulado,
      totalPagarAcumulado,
    }
  }, [comprobantes])

  const emitirComprobante = async (tipo: "01" | "03" | "07" | "08", request: ComprobanteRequest) => {
    setLoading(true)
    setError(null)
    setSuccessData(null)

    try {
      let response: Comprobante
      if (tipo === "01") {
        response = await ComprobanteService.emitirFactura(request)
      } else if (tipo === "03") {
        response = await ComprobanteService.emitirBoleta(request)
      } else if (tipo === "07") {
        response = await ComprobanteService.emitirNotaCredito(request)
      } else {
        response = await ComprobanteService.emitirNotaDebito(request)
      }

      // If response has no id, generate a unique one for local storage representation
      if (!response.id) {
        response.id = Date.now()
      }

      // Add to local history list
      const updated = [response, ...comprobantes]
      saveComprobantes(updated)
      setSuccessData(response)
      return response
    } catch (err: any) {
      const msg = err.message || "Error desconocido al conectar con el backend."
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const anularComprobante = async (id: number, motivo: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ComprobanteService.anular(id, motivo)
      // Update local storage history item
      const updated = comprobantes.map((c) => {
        if (c.id === id) {
          return { ...c, ...response }
        }
        return c
      })
      saveComprobantes(updated)
      return response
    } catch (err: any) {
      const msg = err.message || "Error al anular el comprobante."
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const consultarEstadoTicket = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ComprobanteService.consultarTicket(id)
      const updated = comprobantes.map((c) => {
        if (c.id === id) {
          return { ...c, ...response }
        }
        return c
      })
      saveComprobantes(updated)
      return response
    } catch (err: any) {
      const msg = err.message || "Error al consultar el ticket de la anulación."
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const eliminarComprobante = (id: number) => {
    const updated = comprobantes.filter((c) => c.id !== id)
    saveComprobantes(updated)
  }

  const limpiarHistorial = () => {
    saveComprobantes([])
  }

  const resetStates = () => {
    setError(null)
    setSuccessData(null)
  }

  return {
    comprobantes,
    metrics,
    loading,
    error,
    successData,
    emitirComprobante,
    anularComprobante,
    consultarEstadoTicket,
    eliminarComprobante,
    limpiarHistorial,
    resetStates,
  }
}
