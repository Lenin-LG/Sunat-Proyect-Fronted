import React, { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import type { Producto } from "../types"

interface StockAdjustmentModalProps {
  producto: Producto
  onSubmit: (id: number, tipo: "INGRESO" | "SALIDA", cantidad: number, valor: number) => Promise<void>
  onClose: () => void
}

export function StockAdjustmentModal({ producto, onSubmit, onClose }: StockAdjustmentModalProps) {
  const [tipo, setTipo] = useState<"INGRESO" | "SALIDA">("INGRESO")
  const [cantidad, setCantidad] = useState(1)
  const [valor, setValor] = useState(tipo === "INGRESO" ? Number(producto.costoPromedio || 0) : producto.precioUnitario)
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTipoChange = (newTipo: "INGRESO" | "SALIDA") => {
    setTipo(newTipo)
    setValor(newTipo === "INGRESO" ? Number(producto.costoPromedio || 0) : producto.precioUnitario)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cantidad <= 0 || valor < 0) {
      setError("La cantidad debe ser mayor a 0 y el valor/costo no puede ser negativo.")
      return
    }

    if (!producto.id) return

    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(producto.id, tipo, Number(cantidad), Number(valor))
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al registrar el movimiento de inventario.")
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

      <div className="space-y-1">
        <Label htmlFor="adj-tipo" className="text-xs">Tipo de Movimiento</Label>
        <Select
          id="adj-tipo"
          value={tipo}
          onChange={(e) => handleTipoChange(e.target.value as "INGRESO" | "SALIDA")}
          disabled={submitting}
        >
          <option value="INGRESO">Ingreso de Stock (Compra / Ajuste Positivo)</option>
          <option value="SALIDA">Salida de Stock (Venta / Ajuste Negativo)</option>
        </Select>
      </div>

      <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Producto:</span>
          <span className="font-semibold text-foreground">{producto.descripcion}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Código:</span>
          <span className="font-mono">{producto.codigo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stock Actual:</span>
          <span className="font-semibold">{producto.stockActual || 0} {producto.unidadMedidaId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Costo Promedio Ponderado:</span>
          <span className="font-mono text-primary font-semibold">S/. {(producto.costoPromedio || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="adj-cantidad" className="text-xs">Cantidad *</Label>
          <Input
            id="adj-cantidad"
            type="number"
            min="1"
            step="1"
            placeholder="1"
            value={cantidad || ""}
            onChange={(e) => setCantidad(Number(e.target.value))}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="adj-valor" className="text-xs">
            {tipo === "INGRESO" ? "Costo Unitario Compra (S/.) *" : "Precio Venta Aplicado (S/.) *"}
          </Label>
          <Input
            id="adj-valor"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={valor || ""}
            onChange={(e) => setValor(Number(e.target.value))}
            disabled={submitting}
            required
          />
        </div>
      </div>

      {tipo === "INGRESO" && (
        <p className="text-[10px] text-muted-foreground leading-normal">
          * El ingreso de stock recalculará el <strong>Costo Promedio Ponderado (CPP)</strong> de este producto de forma automática en la base de datos.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting} className={tipo === "INGRESO" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}>
          {submitting ? (
            "Procesando..."
          ) : (
            <>
              {tipo === "INGRESO" ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownLeft className="h-4 w-4 mr-1" />
              )}
              Registrar {tipo === "INGRESO" ? "Ingreso" : "Salida"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
