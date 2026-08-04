import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import { Search, Loader2 } from "lucide-react"
import { ClienteService } from "../services/ClienteService"
import type { Entidad } from "../types"

interface ClienteFormProps {
  clienteInicial?: Entidad | null
  onSubmit: (cliente: Entidad) => Promise<void>
  onCancel: () => void
}

export function ClienteForm({ clienteInicial, onSubmit, onCancel }: ClienteFormProps) {
  const [tipoEntidadId, setTipoEntidadId] = useState("6")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [nombreRazonSocial, setNombreRazonSocial] = useState("")
  const [direccion, setDireccion] = useState("")
  const [correo, setCorreo] = useState("")
  
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clienteInicial) {
      setTipoEntidadId(clienteInicial.tipoEntidadId)
      setNumeroDocumento(clienteInicial.numeroDocumento)
      setNombreRazonSocial(clienteInicial.nombreRazonSocial)
      setDireccion(clienteInicial.direccion)
      setCorreo(clienteInicial.correo || "")
    } else {
      setTipoEntidadId("6")
      setNumeroDocumento("")
      setNombreRazonSocial("")
      setDireccion("")
      setCorreo("")
    }
    setError(null)
  }, [clienteInicial])

  const handleLookup = async () => {
    if (!numeroDocumento.trim()) {
      setError("Ingrese un número de documento para consultar.")
      return
    }

    // Validate lengths
    if (tipoEntidadId === "1" && numeroDocumento.length !== 8) {
      setError("El DNI debe tener 8 dígitos.")
      return
    }
    if (tipoEntidadId === "6" && numeroDocumento.length !== 11) {
      setError("El RUC debe tener 11 dígitos.")
      return
    }

    setError(null)
    setSearching(true)
    try {
      const result = await ClienteService.buscarAuto(tipoEntidadId, numeroDocumento)
      if (result) {
        setNombreRazonSocial(result.nombreRazonSocial)
        setDireccion(result.direccion)
        if (result.correo) setCorreo(result.correo)
      } else {
        setError("No se encontraron resultados en el padrón de SUNAT/RENIEC.")
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con la consulta de SUNAT/RENIEC.")
    } finally {
      setSearching(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numeroDocumento.trim() || !nombreRazonSocial.trim() || !direccion.trim()) {
      setError("Por favor, complete los campos obligatorios.")
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const data: Entidad = {
        ...(clienteInicial?.id ? { id: clienteInicial.id } : {}),
        tipoEntidadId,
        numeroDocumento,
        nombreRazonSocial,
        direccion,
        correo: correo.trim() || undefined,
      }
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || "Error al guardar el registro.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="tipoEntidadId" className="text-xs">Tipo de Documento</Label>
          <Select
            id="tipoEntidadId"
            value={tipoEntidadId}
            onChange={(e) => setTipoEntidadId(e.target.value)}
            disabled={searching || submitting || !!clienteInicial}
          >
            <option value="6">RUC (Empresa)</option>
            <option value="1">DNI (Persona Natural)</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="numeroDocumento" className="text-xs">Número de Documento</Label>
          <div className="flex gap-2">
            <Input
              id="numeroDocumento"
              type="text"
              placeholder={tipoEntidadId === "6" ? "20601234567" : "12345678"}
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value.replace(/\D/g, ""))}
              maxLength={tipoEntidadId === "6" ? 11 : 8}
              disabled={searching || submitting || !!clienteInicial}
            />
            {!clienteInicial && (
              <Button
                type="button"
                variant="outline"
                onClick={handleLookup}
                disabled={searching || submitting}
                className="shrink-0"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="hidden sm:inline ml-1 text-xs">Consultar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="nombreRazonSocial" className="text-xs">Nombre / Razón Social *</Label>
        <Input
          id="nombreRazonSocial"
          type="text"
          placeholder="Razón Social o Nombre Completo"
          value={nombreRazonSocial}
          onChange={(e) => setNombreRazonSocial(e.target.value)}
          disabled={submitting}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="direccion" className="text-xs">Dirección Fiscal *</Label>
        <Input
          id="direccion"
          type="text"
          placeholder="Av. Principal 123, Lima"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          disabled={submitting}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="correo" className="text-xs">Correo Electrónico (Opcional)</Label>
        <Input
          id="correo"
          type="email"
          placeholder="cliente@dominio.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={submitting}
        />
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Se utilizará para enviar el PDF/XML firmado digitalmente de forma automática.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : clienteInicial ? "Actualizar" : "Registrar"}
        </Button>
      </div>
    </form>
  )
}
