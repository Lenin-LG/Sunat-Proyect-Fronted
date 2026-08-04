import React, { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { CajaService } from "../services/CajaService"

interface CobroFormDialogProps {
  open: boolean
  comprobanteId: number
  maxMonto: number
  onPaymentRegistered: () => void
  onClose: () => void
}

export function CobroFormDialog({ open, comprobanteId, maxMonto, onPaymentRegistered, onClose }: CobroFormDialogProps) {
  const [monto, setMonto] = useState(0.0)
  const [metodoPago, setMetodoPago] = useState("EFECTIVO")
  const [referencia, setReferencia] = useState("")
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (monto <= 0) {
      setError("El monto de pago debe ser mayor a 0.")
      return
    }

    if (monto > maxMonto) {
      setError(`El monto no puede superar el saldo pendiente actual de S/. ${maxMonto.toFixed(2)}.`)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await CajaService.registrar({
        comprobanteId,
        monto: Number(monto),
        metodoPago,
        referencia: referencia.trim() || undefined
      })
      onPaymentRegistered()
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al registrar el cobro en caja.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Cobro / Amortización</DialogTitle>
          <DialogDescription>
            Registre el pago recibido para amortizar la deuda de esta venta al crédito (Máximo S/. {maxMonto.toFixed(2)}).
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cobro-monto" className="text-xs">Monto Recibido (S/.) *</Label>
              <Input
                id="cobro-monto"
                type="number"
                step="0.01"
                min="0.01"
                max={maxMonto}
                placeholder="0.00"
                value={monto || ""}
                onChange={(e) => setMonto(Number(e.target.value))}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cobro-metodo" className="text-xs">Método de Pago</Label>
              <Select
                id="cobro-metodo"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                disabled={submitting}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="TARJETA">Tarjeta de Crédito/Débito</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cobro-ref" className="text-xs">Referencia / N° Operación (Opcional)</Label>
            <Input
              id="cobro-ref"
              type="text"
              placeholder="Ej. Operación Yape 29108"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Procesando..." : "Registrar Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
