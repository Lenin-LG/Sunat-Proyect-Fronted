import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import { Card, CardContent } from "../../../components/ui/card"
import { Plus, Trash, Info } from "lucide-react"
import { ClienteService } from "../../clientes/services/ClienteService"
import { ProductoService } from "../../productos/services/ProductoService"
import type { Entidad } from "../../clientes/types"
import type { Producto } from "../../productos/types"
import type { ComprobanteRequest, ComprobanteItemRequest, CuotaRequest, Comprobante } from "../types"

interface ComprobanteFormProps {
  onSubmit: (tipo: "01" | "03" | "07" | "08", request: ComprobanteRequest) => Promise<Comprobante>
  loading: boolean
  error: string | null
  successData: Comprobante | null
  resetStates: () => void
}

export function ComprobanteForm({ onSubmit, loading, error, successData, resetStates }: ComprobanteFormProps) {
  // Document Type & Series
  const [tipoDocumento, setTipoDocumento] = useState<"01" | "03" | "07" | "08">("01")
  const [serie, setSerie] = useState("F001")

  // Client Selection
  const [clientes, setClientes] = useState<Entidad[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Entidad | null>(null)

  // Products Catalog
  const [productos, setProductos] = useState<Producto[]>([])

  // Items in current receipt
  const [items, setItems] = useState<ComprobanteItemRequest[]>([
    { descripcion: "", cantidad: 1, precioUnitario: 0.0, codigoInterno: "", tipoUnidad: "NIU", tipoAfectacionIgv: "10" }
  ])

  // Payment Form: CONTADO or CREDITO
  const [formaPago, setFormaPago] = useState<"CONTADO" | "CREDITO">("CONTADO")
  const [saldoPendiente, setSaldoPendiente] = useState(0.0)
  const [cuotas, setCuotas] = useState<CuotaRequest[]>([])

  // Advanced fields
  const [detraccionCodigo, setDetraccionCodigo] = useState("")
  const [detraccionPorcentaje, setDetraccionPorcentaje] = useState(0.0)
  const [detraccionMonto, setDetraccionMonto] = useState(0.0)
  const [descuentoGlobal, setDescuentoGlobal] = useState(0.0)
  const totalImpuestoBolsa = 0.0
  const [anticipoReferencia, setAnticipoReferencia] = useState("")

  // Notes fields (Credit/Debit)
  const [documentoModificadoId, setDocumentoModificadoId] = useState("")
  const [documentoModificadoTipo, setDocumentoModificadoTipo] = useState("01")
  const [notaMotivoCodigo, setNotaMotivoCodigo] = useState("01")
  const [notaMotivoDescripcion, setNotaMotivoDescripcion] = useState("")

  // Load clients and products
  useEffect(() => {
    async function loadData() {
      try {
        const clientsData = await ClienteService.listar()
        setClientes(clientsData || [])
        const productsData = await ProductoService.listar()
        setProductos(productsData || [])
      } catch (e) {
        console.error("Error loading forms data", e)
      }
    }
    loadData()
  }, [])

  // Auto series based on type
  useEffect(() => {
    if (tipoDocumento === "01") {
      setSerie("F001")
    } else if (tipoDocumento === "03") {
      setSerie("B001")
    } else if (tipoDocumento === "07") {
      // Credit Note starts with F or B based on parent
      setSerie(documentoModificadoTipo === "01" ? "FC01" : "BC01")
    } else if (tipoDocumento === "08") {
      // Debit Note starts with F or B based on parent
      setSerie(documentoModificadoTipo === "01" ? "FD01" : "BD01")
    }
  }, [tipoDocumento, documentoModificadoTipo])

  // Calculate Detracción when percentage changes
  const subtotalPagar = items.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario * 1.18), 0) - descuentoGlobal + totalImpuestoBolsa

  useEffect(() => {
    if (detraccionPorcentaje > 0) {
      const calculated = (subtotalPagar * (detraccionPorcentaje / 100))
      setDetraccionMonto(Number(calculated.toFixed(2)))
    } else {
      setDetraccionMonto(0.0)
    }
  }, [detraccionPorcentaje, subtotalPagar])

  // Reset cuotas list if payment form toggles
  useEffect(() => {
    if (formaPago === "CREDITO") {
      setSaldoPendiente(Number(subtotalPagar.toFixed(2)))
      setCuotas([{ numeroCuota: 1, monto: Number(subtotalPagar.toFixed(2)), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }])
    } else {
      setSaldoPendiente(0.0)
      setCuotas([])
    }
  }, [formaPago, subtotalPagar])

  const handleClientChange = (clientId: string) => {
    const found = clientes.find((c) => c.id === Number(clientId))
    setSelectedCliente(found || null)
  }

  const handleItemChange = (index: number, field: keyof ComprobanteItemRequest, value: any) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: value
    }

    // Auto fill fields from product database if codeInterno is selected
    if (field === "codigoInterno" && value !== "") {
      const foundProduct = productos.find(p => p.codigo === value)
      if (foundProduct) {
        updated[index].descripcion = foundProduct.descripcion
        updated[index].precioUnitario = foundProduct.precioUnitario
        updated[index].tipoUnidad = foundProduct.unidadMedidaId
        updated[index].tipoAfectacionIgv = foundProduct.tipoAfectacionIgvId
      }
    }

    setItems(updated)
  }

  const addItem = () => {
    setItems([...items, { descripcion: "", cantidad: 1, precioUnitario: 0.0, codigoInterno: "", tipoUnidad: "NIU", tipoAfectacionIgv: "10" }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    const updated = items.filter((_, idx) => idx !== index)
    setItems(updated)
  }

  // Installment Management
  const addCuota = () => {
    const num = cuotas.length + 1
    const splitMonto = Number((subtotalPagar / num).toFixed(2))
    const updatedCuotas = Array.from({ length: num }, (_, idx) => ({
      numeroCuota: idx + 1,
      monto: splitMonto,
      fechaVencimiento: new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }))
    setCuotas(updatedCuotas)
  }

  const removeCuota = (index: number) => {
    if (cuotas.length <= 1) return
    const filtered = cuotas.filter((_, idx) => idx !== index)
    // Redivide amounts
    const splitMonto = Number((subtotalPagar / filtered.length).toFixed(2))
    const updated = filtered.map((c, idx) => ({
      ...c,
      numeroCuota: idx + 1,
      monto: splitMonto
    }))
    setCuotas(updated)
  }

  const handleCuotaMontoChange = (index: number, monto: number) => {
    const updated = [...cuotas]
    updated[index].monto = monto
    setCuotas(updated)
    // Recalculate remaining balance
    const sum = updated.reduce((acc, c) => acc + c.monto, 0)
    setSaldoPendiente(Number((subtotalPagar - sum).toFixed(2)))
  }

  const handleCuotaFechaChange = (index: number, fecha: string) => {
    const updated = [...cuotas]
    updated[index].fechaVencimiento = fecha
    setCuotas(updated)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCliente) {
      alert("Por favor, seleccione un cliente.")
      return
    }

    if (tipoDocumento === "01" && selectedCliente.tipoEntidadId !== "6") {
      alert("Para emitir una Factura, el cliente debe tener RUC. Este cliente tiene DNI u otro documento — selecciona uno con RUC, o cambia el Tipo Comprobante a Boleta.")
      return
    }

    if (items.some(it => !it.descripcion.trim() || it.precioUnitario <= 0)) {
      alert("Todos los productos añadidos deben tener descripción y precio unitario mayor a 0.")
      return
    }

    const payload: ComprobanteRequest = {
      serie,
      clienteTipoDocumento: selectedCliente.tipoEntidadId,
      clienteNumeroDocumento: selectedCliente.numeroDocumento,
      clienteNombre: selectedCliente.nombreRazonSocial,
      formaPago,
      items: items.map(it => ({
        ...it,
        precioUnitario: Number(it.precioUnitario),
        cantidad: Number(it.cantidad)
      })),
      ...(detraccionCodigo ? {
        detraccionCodigo,
        detraccionPorcentaje: Number(detraccionPorcentaje),
        detraccionMonto: Number(detraccionMonto)
      } : {}),
      ...(descuentoGlobal > 0 ? { descuentoGlobal: Number(descuentoGlobal) } : {}),
      ...(totalImpuestoBolsa > 0 ? { totalImpuestoBolsa: Number(totalImpuestoBolsa) } : {}),
      ...(anticipoReferencia.trim() ? { anticipoReferencia: anticipoReferencia.trim() } : {}),
      ...(formaPago === "CREDITO" ? {
        saldoPendiente: Number(saldoPendiente),
        cuotas: cuotas.map(c => ({
          ...c,
          monto: Number(c.monto)
        }))
      } : {}),
      ...(tipoDocumento === "07" || tipoDocumento === "08" ? {
        documentoModificadoId,
        documentoModificadoTipo,
        notaMotivoCodigo,
        notaMotivoDescripcion: notaMotivoDescripcion.trim() || "Anulación de la operación"
      } : {})
    }

    try {
      await onSubmit(tipoDocumento, payload)
    } catch (err) {
      // Handled in parent hook
    }
  }

  const totalBase = items.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario), 0)
  const totalIGV = totalBase * 0.18
  const totalPagar = totalBase + totalIGV - descuentoGlobal + totalImpuestoBolsa

  if (successData) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 max-w-xl mx-auto text-center space-y-4 animate-fade-in shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success text-2xl font-bold animate-bounce">
          ✓
        </div>
        <div>
          <h3 className="text-lg font-bold">¡Comprobante Emitido con Éxito!</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Se generó el comprobante <span className="font-mono font-semibold text-foreground">{successData.serie}-{successData.numero}</span>.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-secondary/30 text-xs space-y-2 border border-border/40 text-left max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado SUNAT:</span>
            <span className={`font-semibold uppercase ${successData.estado === 'ACEPTADO' ? 'text-success' : 'text-destructive'}`}>
              {successData.estado}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-mono">Código Respuesta:</span>
            <span className="font-mono font-semibold">{successData.sunatResponseCode || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detalle SUNAT:</span>
            <span className="font-semibold text-right max-w-[200px] truncate" title={successData.sunatDescription}>
              {successData.sunatDescription || "Aceptado sin observaciones."}
            </span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-border/40 pt-2 mt-2">
            <span>Total Cobrado:</span>
            <span className="font-mono text-primary">S/. {(successData.totalPagar || totalPagar).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 pt-4">
          <Button onClick={resetStates} variant="default" className="text-xs font-semibold">
            Emitir Otro Comprobante
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Main Settings Panel */}
      <Card className="border-border/60 shadow-sm text-foreground">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-type" className="text-xs font-semibold text-muted-foreground">Tipo Comprobante</Label>
            <Select
              id="doc-type"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value as any)}
              disabled={loading}
            >
              <option value="01">Factura Electrónica</option>
              <option value="03">Boleta de Venta</option>
              <option value="07">Nota de Crédito</option>
              <option value="08">Nota de Débito</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-serie" className="text-xs font-semibold text-muted-foreground">Serie</Label>
            <Input
              id="doc-serie"
              type="text"
              value={serie}
              onChange={(e) => setSerie(e.target.value.toUpperCase())}
              placeholder="F001"
              maxLength={4}
              disabled={loading}
              required
              className="font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="doc-client" className="text-xs font-semibold text-muted-foreground">Cliente / Receptor *</Label>
            <div className="flex gap-2">
              <Select
                id="doc-client"
                value={selectedCliente?.id || ""}
                onChange={(e) => handleClientChange(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">-- Seleccionar de la base de datos --</option>
                {clientes
                  .filter((c) => tipoDocumento !== "01" || c.tipoEntidadId === "6")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.numeroDocumento}] {c.nombreRazonSocial}
                    </option>
                  ))}
              </Select>
            </div>
            <p className="text-[10px] text-muted-foreground">
              ¿No existe? Regístrelo primero en la sección de <strong>Clientes</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credit / Debit Note references */}
      {(tipoDocumento === "07" || tipoDocumento === "08") && (
        <Card className="border-border/60 shadow-sm text-foreground bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-amber-800 dark:text-amber-400">Doc. Modificado Serie-Num *</Label>
              <Input
                type="text"
                placeholder="F001-45"
                value={documentoModificadoId}
                onChange={(e) => setDocumentoModificadoId(e.target.value.toUpperCase())}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-amber-800 dark:text-amber-400">Tipo Doc. Modificado</Label>
              <Select
                value={documentoModificadoTipo}
                onChange={(e) => setDocumentoModificadoTipo(e.target.value)}
                disabled={loading}
              >
                <option value="01">Factura</option>
                <option value="03">Boleta</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-amber-800 dark:text-amber-400">Motivo SUNAT (Código) *</Label>
              <Select
                value={notaMotivoCodigo}
                onChange={(e) => setNotaMotivoCodigo(e.target.value)}
                disabled={loading}
              >
                {tipoDocumento === "07" ? (
                  <>
                    <option value="01">01 - Anulación de la operación</option>
                    <option value="02">02 - Anulación por error en el RUC</option>
                    <option value="03">03 - Corrección por error en la descripción</option>
                    <option value="06">06 - Descuento global</option>
                    <option value="07">07 - Devolución por ítem</option>
                  </>
                ) : (
                  <>
                    <option value="01">01 - Intereses por mora</option>
                    <option value="02">02 - Aumento en el valor</option>
                    <option value="03">03 - Penalidades</option>
                  </>
                )}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-amber-800 dark:text-amber-400">Sustento / Glosa *</Label>
              <Input
                type="text"
                placeholder="Ej. Anulación de venta"
                value={notaMotivoDescripcion}
                onChange={(e) => setNotaMotivoDescripcion(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Section */}
      <Card className="border-border/60 shadow-sm text-foreground">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <h4 className="text-sm font-semibold tracking-tight font-display">Detalle del Comprobante (Ítems)</h4>
            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={loading} className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Añadir Ítem
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg bg-secondary/10 border border-border/40 relative">

                {/* Product Autocomplete */}
                <div className="space-y-1 md:col-span-3">
                  <Label className="text-[10px] text-muted-foreground font-semibold">Producto del Catálogo</Label>
                  <Select
                    value={item.codigoInterno || ""}
                    onChange={(e) => handleItemChange(index, "codigoInterno", e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Escribir descripción libre --</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.codigo}>
                        [{p.codigo}] {p.descripcion}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Free Text Description */}
                <div className="space-y-1 md:col-span-4">
                  <Label className="text-[10px] text-muted-foreground font-semibold">Descripción o Glosa *</Label>
                  <Input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                    placeholder="Descripción del servicio o artículo"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1 md:col-span-1.5">
                  <Label className="text-[10px] text-muted-foreground font-semibold">Cantidad</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={item.cantidad || ""}
                    onChange={(e) => handleItemChange(index, "cantidad", Number(e.target.value))}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[10px] text-muted-foreground font-semibold">P. Unitario (S/.) *</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.precioUnitario || ""}
                    onChange={(e) => handleItemChange(index, "precioUnitario", Number(e.target.value))}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="md:col-span-1.5 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={loading || items.length === 1}
                    className="h-9 w-9 text-slate-400 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings & Totals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Side: Advanced CPE Options */}
        <Card className="md:col-span-2 border-border/60 shadow-sm text-foreground">
          <CardContent className="p-6 space-y-4">
            <h4 className="text-sm font-semibold pb-2 border-b border-border/40 font-display">Parámetros Tributarios Avanzados</h4>

            {/* Contado / Crédito Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="payment-form" className="text-xs">Forma de Pago</Label>
                <Select
                  id="payment-form"
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as any)}
                  disabled={loading}
                >
                  <option value="CONTADO">Contado (Pagado al Instante)</option>
                  <option value="CREDITO">Crédito (A plazos / Cuotas)</option>
                </Select>
              </div>

              {formaPago === "CREDITO" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Saldo Pendiente (S/.)</Label>
                  <Input
                    type="number"
                    value={saldoPendiente}
                    readOnly
                    className="bg-secondary/40 font-mono font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Installments Manager (CREDITO only) */}
            {formaPago === "CREDITO" && (
              <div className="mt-4 p-3 rounded-lg border border-border/60 bg-secondary/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">Cronograma de Cuotas</span>
                  <Button type="button" variant="outline" size="sm" onClick={addCuota} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Fraccionar
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cuotas.map((cuota, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Cuota {cuota.numeroCuota}</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={cuota.monto}
                        onChange={(e) => handleCuotaMontoChange(idx, Number(e.target.value))}
                        placeholder="Monto"
                        className="h-8 text-xs font-mono"
                      />
                      <Input
                        type="date"
                        value={cuota.fechaVencimiento}
                        onChange={(e) => handleCuotaFechaChange(idx, e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCuota(idx)} className="h-8 w-8 text-slate-400 hover:text-destructive">
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-border/40" />

            {/* Detracciones & Anticipos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="det-code" className="text-xs flex items-center gap-1">
                  Cód. Detracción
                  <span title="Código de bien sujeto a detracción (ej. 022 para Harina de Pescado)">
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </span>
                </Label>
                <Select
                  id="det-code"
                  value={detraccionCodigo}
                  onChange={(e) => {
                    setDetraccionCodigo(e.target.value)
                    setDetraccionPorcentaje(e.target.value ? 10.0 : 0.0)
                  }}
                  disabled={loading}
                >
                  <option value="">-- No aplica --</option>
                  <option value="022">022 - Servicios de Transporte</option>
                  <option value="037">037 - Arrendamiento de Bienes</option>
                  <option value="001">001 - Azúcar y alcohol</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="det-pct" className="text-xs">Tasa (%)</Label>
                <Input
                  id="det-pct"
                  type="number"
                  placeholder="0"
                  value={detraccionPorcentaje || ""}
                  onChange={(e) => setDetraccionPorcentaje(Number(e.target.value))}
                  disabled={loading || !detraccionCodigo}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Monto Detracción (S/.)</Label>
                <Input
                  type="number"
                  value={detraccionMonto}
                  readOnly
                  className="bg-secondary/40 font-mono text-xs font-semibold text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ant-ref" className="text-xs">Referencia de Anticipo (Opcional)</Label>
                <Input
                  id="ant-ref"
                  type="text"
                  placeholder="F001-00000123:500.00"
                  value={anticipoReferencia}
                  onChange={(e) => setAnticipoReferencia(e.target.value)}
                  disabled={loading}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc-global" className="text-xs">Descuento Global (S/.)</Label>
                <Input
                  id="desc-global"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={descuentoGlobal || ""}
                  onChange={(e) => setDescuentoGlobal(Number(e.target.value))}
                  disabled={loading}
                  className="font-mono text-xs text-destructive font-semibold"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Right Side: Totals Card & Action */}
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm text-foreground bg-secondary/10">
            <CardContent className="p-6 space-y-3.5 text-xs">
              <h4 className="text-sm font-semibold pb-2 border-b border-border/40 font-display">Totales del Documento</h4>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Gravado:</span>
                <span className="font-mono">S/. {totalBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IGV (18%):</span>
                <span className="font-mono">S/. {totalIGV.toFixed(2)}</span>
              </div>

              {descuentoGlobal > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Descuento Global:</span>
                  <span className="font-mono">- S/. {descuentoGlobal.toFixed(2)}</span>
                </div>
              )}

              {totalImpuestoBolsa > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuesto Bolsa (ICBPER):</span>
                  <span className="font-mono">S/. {totalImpuestoBolsa.toFixed(2)}</span>
                </div>
              )}

              <hr className="border-border/40" />

              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total a Pagar:</span>
                <span className="font-mono text-primary">S/. {totalPagar.toFixed(2)}</span>
              </div>

              {detraccionCodigo && (
                <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-800 dark:text-blue-400 mt-2 space-y-1">
                  <div className="font-semibold uppercase">Neto Sujeto a Detracción:</div>
                  <div className="flex justify-between font-mono">
                    <span>Monto Detraído:</span>
                    <span>S/. {detraccionMonto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono font-bold">
                    <span>Monto Neto Cobro:</span>
                    <span>S/. {(totalPagar - detraccionMonto).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 text-sm shadow-md">
            Emitir y Firmar XML
          </Button>
        </div>

      </div>

    </form>
  )
}
