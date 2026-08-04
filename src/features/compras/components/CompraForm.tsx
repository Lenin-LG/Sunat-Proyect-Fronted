import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"

import { Plus, Trash, Info } from "lucide-react"
import { ClienteService } from "../../clientes/services/ClienteService"
import { ProductoService } from "../../productos/services/ProductoService"
import type { Entidad } from "../../clientes/types"
import type { Producto } from "../../productos/types"
import type { CompraRequest, CompraItemRequest } from "../types"

interface CompraFormProps {
  onSubmit: (compra: CompraRequest) => Promise<void>
  onCancel: () => void
}

export function CompraForm({ onSubmit, onCancel }: CompraFormProps) {
  const [tipoDocumento, setTipoDocumento] = useState("01")
  const [serie, setSerie] = useState("")
  const [numero, setNumero] = useState(0)
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split("T")[0])
  const [proveedorId, setProveedorId] = useState("")
  
  const [clientes, setClientes] = useState<Entidad[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  
  const [items, setItems] = useState<CompraItemRequest[]>([
    { productoId: 0, cantidad: 1, precioUnitario: 0.0 }
  ])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const clients = await ClienteService.listar()
        setClientes(clients || [])
        const prods = await ProductoService.listar()
        setProductos(prods || [])
      } catch (e) {
        console.error("Error loading suppliers/products", e)
      }
    }
    loadData()
  }, [])

  const handleItemChange = (index: number, field: keyof CompraItemRequest, value: any) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    
    // Auto fill cost if product changes and price is not set
    if (field === "productoId" && value !== 0) {
      const found = productos.find(p => p.id === Number(value))
      if (found && updated[index].precioUnitario === 0) {
        updated[index].precioUnitario = found.costoPromedio || 0.0
      }
    }

    setItems(updated)
  }

  const addItem = () => {
    setItems([...items, { productoId: 0, cantidad: 1, precioUnitario: 0.0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proveedorId) {
      setError("Debe seleccionar un proveedor.")
      return
    }
    if (!serie.trim() || numero <= 0) {
      setError("Ingrese una serie y un número de comprobante válidos.")
      return
    }
    if (items.some(it => it.productoId === 0 || it.cantidad <= 0 || it.precioUnitario < 0)) {
      setError("Todos los ítems de compra deben tener un producto seleccionado, cantidad mayor a 0 y costo no negativo.")
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const payload: CompraRequest = {
        tipoDocumento,
        serie: serie.trim().toUpperCase(),
        numero: Number(numero),
        fechaEmision,
        proveedorId: Number(proveedorId),
        items: items.map(it => ({
          productoId: Number(it.productoId),
          cantidad: Number(it.cantidad),
          precioUnitario: Number(it.precioUnitario)
        }))
      }
      await onSubmit(payload)
    } catch (err: any) {
      setError(err.message || "Error al registrar la compra.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalCompra = items.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario), 0)

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label htmlFor="compra-tipo" className="text-xs">Tipo Documento</Label>
          <Select
            id="compra-tipo"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            disabled={submitting}
          >
            <option value="01">Factura</option>
            <option value="03">Boleta</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="compra-serie" className="text-xs">Serie *</Label>
          <Input
            id="compra-serie"
            type="text"
            placeholder="F001"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            maxLength={4}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="compra-numero" className="text-xs">Número *</Label>
          <Input
            id="compra-numero"
            type="number"
            placeholder="12345"
            value={numero || ""}
            onChange={(e) => setNumero(Number(e.target.value))}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="compra-fecha" className="text-xs">Fecha de Emisión</Label>
          <Input
            id="compra-fecha"
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            disabled={submitting}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="compra-proveedor" className="text-xs">Proveedor *</Label>
          <Select
            id="compra-proveedor"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            disabled={submitting}
            required
          >
            <option value="">-- Seleccionar Proveedor --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                [{c.numeroDocumento}] {c.nombreRazonSocial}
              </option>
            ))}
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs">Total Compra (S/.)</Label>
          <Input
            type="text"
            value={`S/. ${totalCompra.toFixed(2)}`}
            readOnly
            className="bg-secondary/40 font-mono font-bold text-primary"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="border-t border-border/40 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground">Detalle de Compra (Productos)</span>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={submitting} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Producto
          </Button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 rounded-lg bg-secondary/15 border border-border/20">
              
              <div className="md:col-span-6">
                <Select
                  value={item.productoId || ""}
                  onChange={(e) => handleItemChange(idx, "productoId", Number(e.target.value))}
                  disabled={submitting}
                  required
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.codigo}] {p.descripcion} (CPP: S/. {(p.costoPromedio || 0).toFixed(2)})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <Input
                  type="number"
                  placeholder="Cantidad"
                  value={item.cantidad || ""}
                  onChange={(e) => handleItemChange(idx, "cantidad", Number(e.target.value))}
                  min={1}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="md:col-span-3">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Costo Unit."
                  value={item.precioUnitario || ""}
                  onChange={(e) => handleItemChange(idx, "precioUnitario", Number(e.target.value))}
                  min={0}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  disabled={submitting || items.length === 1}
                  className="h-8 w-8 text-slate-400 hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-800 dark:text-blue-400 rounded-md flex gap-2">
        <Info className="h-4 w-4 shrink-0" />
        <p className="leading-normal">
          Al registrar la compra, los productos ingresados verán incrementado su stock en la base de datos y el backend recalculará de forma ponderada su costo promedio.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Registrar Compra"}
        </Button>
      </div>
    </form>
  )
}
