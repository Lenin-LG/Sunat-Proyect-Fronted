import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import type { Producto } from "../types"

interface ProductoFormProps {
  productoInicial?: Producto | null
  onSubmit: (producto: Producto) => Promise<void>
  onCancel: () => void
}

export function ProductoForm({ productoInicial, onSubmit, onCancel }: ProductoFormProps) {
  const [codigo, setCodigo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precioUnitario, setPrecioUnitario] = useState(0.0)
  const [tipoAfectacionIgvId, setTipoAfectacionIgvId] = useState("10")
  const [unidadMedidaId, setUnidadMedidaId] = useState("NIU")
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (productoInicial) {
      setCodigo(productoInicial.codigo)
      setDescripcion(productoInicial.descripcion)
      setPrecioUnitario(productoInicial.precioUnitario)
      setTipoAfectacionIgvId(productoInicial.tipoAfectacionIgvId)
      setUnidadMedidaId(productoInicial.unidadMedidaId)
    } else {
      setCodigo("")
      setDescripcion("")
      setPrecioUnitario(0.0)
      setTipoAfectacionIgvId("10")
      setUnidadMedidaId("NIU")
    }
    setError(null)
  }, [productoInicial])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim() || !descripcion.trim() || precioUnitario <= 0) {
      setError("Por favor, complete los campos obligatorios. El precio debe ser mayor a 0.")
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const data: Producto = {
        ...(productoInicial?.id ? { id: productoInicial.id } : {}),
        codigo: codigo.trim().toUpperCase(),
        descripcion: descripcion.trim(),
        precioUnitario: Number(precioUnitario),
        tipoAfectacionIgvId,
        unidadMedidaId,
      }
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto.")
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
          <Label htmlFor="codigo" className="text-xs">Código Interno *</Label>
          <Input
            id="codigo"
            type="text"
            placeholder="PROD-001"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="precioUnitario" className="text-xs">Precio Unitario Venta (S/.) *</Label>
          <Input
            id="precioUnitario"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={precioUnitario || ""}
            onChange={(e) => setPrecioUnitario(Number(e.target.value))}
            disabled={submitting}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="descripcion" className="text-xs">Descripción del Producto *</Label>
        <Input
          id="descripcion"
          type="text"
          placeholder="Laptop Lenovo ThinkPad T490"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={submitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="unidadMedidaId" className="text-xs">Unidad de Medida (Catálogo 03)</Label>
          <Select
            id="unidadMedidaId"
            value={unidadMedidaId}
            onChange={(e) => setUnidadMedidaId(e.target.value)}
            disabled={submitting}
          >
            <option value="NIU">NIU - Unidades</option>
            <option value="ZZ">ZZ - Servicios</option>
            <option value="KGM">KGM - Kilogramos</option>
            <option value="LTR">LTR - Litros</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tipoAfectacionIgvId" className="text-xs">Afectación IGV (Catálogo 07)</Label>
          <Select
            id="tipoAfectacionIgvId"
            value={tipoAfectacionIgvId}
            onChange={(e) => setTipoAfectacionIgvId(e.target.value)}
            disabled={submitting}
          >
            <option value="10">10 - Gravado - Operación Onerosa</option>
            <option value="20">20 - Exonerado - Operación Onerosa</option>
            <option value="30">30 - Inafecto - Operación Onerosa</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : productoInicial ? "Actualizar" : "Registrar"}
        </Button>
      </div>
    </form>
  )
}
