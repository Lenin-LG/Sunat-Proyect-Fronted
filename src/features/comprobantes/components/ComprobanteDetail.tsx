import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { toast } from "../../../components/ui/toast"
import { createPortal } from "react-dom"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"

import { Badge } from "../../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { Card, CardContent } from "../../../components/ui/card"
import { ComprobanteService } from "../services/ComprobanteService"
import { CajaService, type CobroPago } from "../../caja/services/CajaService"
import type { Comprobante } from "../types"
import { Printer, X, FileText, Landmark, RefreshCw, QrCode } from "lucide-react"

interface ComprobanteDetailProps {
  comprobante: Comprobante | null
  onClose: () => void
  onAnular?: (id: number, motivo: string) => Promise<any>
  onConsultarTicket?: (id: number) => Promise<any>
}

export function ComprobanteDetail({ comprobante, onClose }: ComprobanteDetailProps) {
  const navigate = useNavigate()
  const [pagos, setPagos] = useState<CobroPago[]>([])
  const [loadingPagos, setLoadingPagos] = useState(false)
  
  // Local states for updating receipt state without full page reload
  const [localComprobante, setLocalComprobante] = useState<Comprobante | null>(null)

  // Voiding interface states
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [motivoBaja, setMotivoBaja] = useState("")
  const [voiding, setVoiding] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)

  // Register payment states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [pagoMonto, setPagoMonto] = useState(0.0)
  const [pagoMetodo, setPagoMetodo] = useState("EFECTIVO")
  const [pagoReferencia, setPagoReferencia] = useState("")
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const [ticketChecking, setTicketChecking] = useState(false)

  useEffect(() => {
    if (comprobante) {
      setLocalComprobante(comprobante)
      loadPagos(comprobante.id)
    } else {
      setLocalComprobante(null)
      setPagos([])
    }
    setVoidDialogOpen(false)
    setPaymentDialogOpen(false)
    setMotivoBaja("")
    setVoidError(null)
    setPayError(null)
  }, [comprobante])

  const loadPagos = async (comprobanteId: number) => {
    setLoadingPagos(true)
    try {
      const data = await CajaService.listarPorComprobante(comprobanteId)
      setPagos(data || [])
    } catch (e) {
      console.error("Error loading payments log", e)
    } finally {
      setLoadingPagos(false)
    }
  }

  if (!localComprobante) return null

  const getDocName = (type: string) => {
    switch (type) {
      case "01": return "FACTURA ELECTRÓNICA"
      case "03": return "BOLETA DE VENTA ELECTRÓNICA"
      case "07": return "NOTA DE CRÉDITO ELECTRÓNICA"
      case "08": return "NOTA DE DÉBITO ELECTRÓNICA"
      default: return "COMPROBANTE ELECTRÓNICO"
    }
  }

  const isAnulado = localComprobante.sunatDescription?.toUpperCase().startsWith("ANULADO:")
  const isBajaPendiente = localComprobante.estado === "PENDIENTE" && localComprobante.sunatDescription?.toUpperCase().includes("TICKET")

  // Generate mock QR data for print validation

  const handlePrint = () => {
    window.print()
  }

  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivoBaja.trim()) {
      setVoidError("Por favor, ingrese el motivo de la baja.")
      return
    }

    setVoidError(null)
    setVoiding(true)
    try {
      const res = await ComprobanteService.anular(localComprobante.id, motivoBaja)
      setLocalComprobante(res)
      setVoidDialogOpen(false)
      toast.success("Solicitud de baja enviada a SUNAT con éxito.")
      // Save update to browser's main list history
      const savedHistory = localStorage.getItem("sunat_comprobantes_historial")
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as Comprobante[]
        const updated = parsed.map(c => c.id === localComprobante.id ? { ...c, ...res } : c)
        localStorage.setItem("sunat_comprobantes_historial", JSON.stringify(updated))
      }
    } catch (err: any) {
      setVoidError(err.message || "Error al solicitar la baja a SUNAT.")
    } finally {
      setVoiding(false)
    }
  }

  const handleCheckTicket = async () => {
    setTicketChecking(true)
    try {
      const res = await ComprobanteService.consultarTicket(localComprobante.id)
      setLocalComprobante(res)
      toast.success("Ticket verificado y comprobante actualizado con éxito.")
      // Save update to browser's main list history
      const savedHistory = localStorage.getItem("sunat_comprobantes_historial")
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as Comprobante[]
        const updated = parsed.map(c => c.id === localComprobante.id ? { ...c, ...res } : c)
        localStorage.setItem("sunat_comprobantes_historial", JSON.stringify(updated))
      }
    } catch (err: any) {
      toast.error(err.message || "Error al verificar el ticket.")
    } finally {
      setTicketChecking(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pagoMonto <= 0) {
      setPayError("Monto de pago debe ser mayor a 0.")
      return
    }

    const currentSaldo = localComprobante.saldoPendiente || 0
    if (pagoMonto > currentSaldo) {
      setPayError(`El monto no puede superar el saldo pendiente actual de S/. ${currentSaldo.toFixed(2)}.`)
      return
    }

    setPayError(null)
    setPaying(true)
    try {
      await CajaService.registrar({
        comprobanteId: localComprobante.id,
        monto: Number(pagoMonto),
        metodoPago: pagoMetodo,
        referencia: pagoReferencia.trim() || undefined
      })
      
      // Update local storage remaining balance
      const updatedSaldo = Number((currentSaldo - pagoMonto).toFixed(2))
      const updatedComprobante = {
        ...localComprobante,
        saldoPendiente: updatedSaldo
      }
      setLocalComprobante(updatedComprobante)

      const savedHistory = localStorage.getItem("sunat_comprobantes_historial")
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as Comprobante[]
        const updated = parsed.map(c => c.id === localComprobante.id ? updatedComprobante : c)
        localStorage.setItem("sunat_comprobantes_historial", JSON.stringify(updated))
      }

      setPaymentDialogOpen(false)
      toast.success(`Pago de S/. ${pagoMonto.toFixed(2)} registrado con éxito.`)
      loadPagos(localComprobante.id)
    } catch (err: any) {
      setPayError(err.message || "Error al registrar el cobro.")
    } finally {
      setPaying(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      
      {/* Click outside to close */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl z-10 animate-fade-in flex flex-col">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-secondary/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Detalles y Estado del Comprobante</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="h-3.5 w-3.5 mr-1" />
              Imprimir / PDF
            </Button>
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Print container - spans 2 columns */}
          <div className="md:col-span-2 space-y-6 print-container bg-white text-slate-950 p-6 rounded-lg border border-slate-200">
            
            {/* CPE Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b border-slate-200 pb-4">
              <div className="md:col-span-7 space-y-1">
                <h1 className="text-sm font-extrabold tracking-tight uppercase">MI EMPRESA S.A.C.</h1>
                <p className="text-[10px] text-slate-500">AV. JAVIER PRADO ESTE 1234 - SAN ISIDRO</p>
                <p className="text-[10px] text-slate-500">LIMA - LIMA - PERÚ</p>
                <p className="text-[10px] text-slate-500">CORREO: contacto@miempresa.com</p>
              </div>
              
              <div className="md:col-span-5 border-2 border-slate-950 rounded p-3 text-center bg-slate-50 space-y-1">
                <p className="text-[10px] font-bold">R.U.C. 20601234567</p>
                <p className="text-xs font-black tracking-tight">{getDocName(localComprobante.tipoDocumento)}</p>
                <p className="text-xs font-mono font-bold">{localComprobante.serie} - {localComprobante.numero}</p>
              </div>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <p><span className="font-bold text-slate-500">ADQUIRIENTE:</span> {localComprobante.clienteNombre}</p>
                <p><span className="font-bold text-slate-500">RUC/DNI:</span> {localComprobante.clienteNumeroDocumento}</p>
                <p><span className="font-bold text-slate-500">DIRECCIÓN:</span> Av. Javier Prado 123, Lima</p>
              </div>
              <div className="space-y-1 text-right">
                <p><span className="font-bold text-slate-500">FECHA EMISIÓN:</span> {localComprobante.fechaEmision}</p>
                <p><span className="font-bold text-slate-500">MONEDA:</span> SOLES (S/.)</p>
                <p><span className="font-bold text-slate-500">FORMA PAGO:</span> {localComprobante.formaPago || "CONTADO"}</p>
              </div>
            </div>

            {/* Note adjustments reference */}
            {(localComprobante.tipoDocumento === "07" || localComprobante.tipoDocumento === "08") && (
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[9px] space-y-0.5">
                <p className="font-bold uppercase text-slate-800">CPE de Referencia:</p>
                <p>• Comprobante Modificado: <span className="font-mono font-semibold">{localComprobante.documentoModificadoId}</span> (Tipo: {localComprobante.documentoModificadoTipo === "01" ? "Factura" : "Boleta"})</p>
                <p>• Motivo: [{localComprobante.notaMotivoCodigo}] {localComprobante.notaMotivoDescripcion}</p>
              </div>
            )}

            {/* Items Table */}
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-slate-950 font-bold bg-slate-100">
                  <th className="py-1 px-2">Cant</th>
                  <th className="py-1 px-2">Medida</th>
                  <th className="py-1 px-2">Descripción</th>
                  <th className="py-1 px-2 text-right">P. Unitario</th>
                  <th className="py-1 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {localComprobante.detalles && localComprobante.detalles.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-1.5 px-2 font-mono">{it.cantidad}</td>
                    <td className="py-1.5 px-2 font-mono uppercase">{it.tipoUnidad || "NIU"}</td>
                    <td className="py-1.5 px-2">{it.descripcion}</td>
                    <td className="py-1.5 px-2 text-right font-mono">S/. {((it.precioUnitario * 1.18) || 0).toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">S/. {((it.cantidad * it.precioUnitario * 1.18) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Block */}
            <div className="flex flex-col md:flex-row justify-between items-end border-t border-slate-200 pt-4 gap-4">
              {/* QR Block */}
              <div className="flex items-center gap-3 border border-slate-300 p-2 rounded">
                <QrCode className="h-14 w-14 text-slate-800" />
                <div className="text-[8px] text-slate-500 max-w-[120px] font-mono leading-tight break-all">
                  SUNAT CPE ELECTRONICO VALIDATE DATA: {localComprobante.serie}-{localComprobante.numero}
                </div>
              </div>

              {/* Amounts totals */}
              <div className="w-64 space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Op. Gravada:</span>
                  <span className="font-mono">S/. {localComprobante.totalGravada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">I.G.V. (18%):</span>
                  <span className="font-mono">S/. {localComprobante.totalIgv.toFixed(2)}</span>
                </div>
                {localComprobante.descuentoGlobal && localComprobante.descuentoGlobal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span className="font-mono">- S/. {localComprobante.descuentoGlobal.toFixed(2)}</span>
                  </div>
                )}
                {localComprobante.totalImpuestoBolsa && localComprobante.totalImpuestoBolsa > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">ICBPER (Bolsa):</span>
                    <span className="font-mono">S/. {localComprobante.totalImpuestoBolsa.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-950 pt-1 font-bold text-xs">
                  <span>Importe Total:</span>
                  <span className="font-mono">S/. {localComprobante.totalPagar.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Print Footer message */}
            <div className="text-center text-[8px] text-slate-400 border-t border-slate-100 pt-3">
              Representación impresa de la Boleta o Factura Electrónica. Consulte su CDR en la web.
            </div>

          </div>

          {/* Right side: SUNAT State / Void controls / Payments */}
          <div className="space-y-4 text-foreground text-xs">
            
            {/* Status Panel */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado de Validación</h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Estado:</span>
                  {isAnulado ? (
                    <Badge variant="destructive" className="font-mono scale-90">Anulado</Badge>
                  ) : localComprobante.estado === "ACEPTADO" ? (
                    <Badge variant="success" className="font-mono scale-90">Aceptado SUNAT</Badge>
                  ) : localComprobante.estado === "PENDIENTE" ? (
                    <Badge variant="warning" className="font-mono scale-90">Pendiente</Badge>
                  ) : (
                    <Badge variant="destructive" className="font-mono scale-90">{localComprobante.estado}</Badge>
                  )}
                </div>

                <div className="space-y-1 bg-secondary/35 p-2.5 rounded border border-border/40 font-mono text-[10px]">
                  <p className="font-bold text-foreground">Respuesta CDR:</p>
                  <p className="text-muted-foreground mt-0.5 leading-normal">
                    {localComprobante.sunatDescription || "El comprobante no ha sido enviado o no se obtuvo respuesta."}
                  </p>
                </div>

                {/* Void actions */}
                {!isAnulado && localComprobante.estado === "ACEPTADO" && (
                  localComprobante.tipoDocumento === "01" ? (
                    <Button
                      onClick={() => setVoidDialogOpen(true)}
                      variant="outline"
                      className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      Comunicar Baja (Anular)
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 leading-normal">
                        Las boletas de venta no pueden ser anuladas mediante Comunicación de Baja. Para anular esta boleta, debe emitir una <strong>Nota de Crédito</strong>.
                      </p>
                      <Button
                        onClick={() => {
                          onClose();
                          navigate(`/emitir?docModificadoId=${localComprobante.serie}-${localComprobante.numero}&docModificadoTipo=03&tipoDocumento=07&clienteId=${localComprobante.clienteNumeroDocumento}`);
                        }}
                        variant="outline"
                        className="w-full text-xs text-amber-600 hover:bg-amber-500/10 border-amber-500/20 font-semibold"
                      >
                        Emitir Nota de Crédito
                      </Button>
                    </div>
                  )
                )}

                {isBajaPendiente && (
                  <Button
                    onClick={handleCheckTicket}
                    disabled={ticketChecking}
                    className="w-full bg-warning text-warning-foreground hover:bg-warning/90 font-semibold"
                  >
                    {ticketChecking ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Landmark className="h-3.5 w-3.5 mr-1" />
                    )}
                    Consultar Ticket Baja
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payments / Collections Panel */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pagos / Crédito</h4>
                  {localComprobante.formaPago === "CREDITO" && (localComprobante.saldoPendiente || 0) > 0 && (
                    <Button onClick={() => setPaymentDialogOpen(true)} size="sm" className="h-6 text-[10px] px-2 py-0">
                      Amortizar
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-secondary/30 p-2.5 rounded border border-border/40">
                  <div>
                    <p className="text-muted-foreground">Forma Pago:</p>
                    <p className="font-bold text-foreground font-mono">{localComprobante.formaPago || "CONTADO"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saldo Pendiente:</p>
                    <p className="font-bold text-primary font-mono">S/. {(localComprobante.saldoPendiente || 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Cuotas schedules */}
                {localComprobante.formaPago === "CREDITO" && localComprobante.cuotas && localComprobante.cuotas.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cronograma Pactado:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto border border-border/30 rounded p-1.5">
                      {localComprobante.cuotas.map((cuota, idx) => (
                        <div key={idx} className="flex justify-between font-mono text-[10px] border-b border-border/10 pb-0.5 last:border-0 last:pb-0">
                          <span>Cuota {cuota.numeroCuota}:</span>
                          <span className="font-semibold text-foreground">S/. {cuota.monto.toFixed(2)} ({cuota.fechaVencimiento})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amortizations Log list */}
                <div className="space-y-1.5 mt-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Historial de Cobros:</p>
                  {loadingPagos ? (
                    <p className="text-center italic text-muted-foreground">Cargando...</p>
                  ) : pagos.length === 0 ? (
                    <p className="text-[10px] italic text-muted-foreground/60">No se registran amortizaciones en caja.</p>
                  ) : (
                    <div className="space-y-1 border border-border/30 rounded p-1.5 max-h-36 overflow-y-auto">
                      {pagos.map((p, idx) => (
                        <div key={idx} className="p-1 rounded bg-secondary/15 flex flex-col font-mono text-[9px] border-b border-border/20 last:border-0 pb-1">
                          <div className="flex justify-between font-bold text-foreground">
                            <span>S/. {p.monto.toFixed(2)}</span>
                            <span>{p.metodoPago}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground mt-0.5">
                            <span>{p.fechaPago ? p.fechaPago.split("T")[0] : ""}</span>
                            <span>{p.referencia || "Sin Ref"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </div>

      {/* Dialog for Void Request */}
      <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitud de Baja de Comprobante</DialogTitle>
            <DialogDescription>
              Ingrese el motivo por el cual desea anular el comprobante. Se generará un resumen de baja para enviarlo a SUNAT.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVoidSubmit} className="space-y-4">
            {voidError && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded text-destructive-foreground">
                {voidError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="void-motivo" className="text-xs">Motivo de la Anulación *</Label>
              <Input
                id="void-motivo"
                type="text"
                placeholder="Ejemplo: Error en el precio o anulación de la transacción"
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                required
                disabled={voiding}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
              <Button type="button" variant="outline" onClick={() => setVoidDialogOpen(false)} disabled={voiding}>
                Cancelar
              </Button>
              <Button type="submit" disabled={voiding} className="bg-destructive hover:bg-destructive/95">
                {voiding ? "Enviando..." : "Anular Comprobante"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Register Payment */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Cobro / Amortización</DialogTitle>
            <DialogDescription>
              Registre el monto recibido para disminuir el saldo pendiente de esta venta al crédito.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {payError && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded text-destructive-foreground">
                {payError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-monto" className="text-xs">Monto Recibido (S/.) *</Label>
                <Input
                  id="pay-monto"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={localComprobante.saldoPendiente || 0}
                  value={pagoMonto || ""}
                  onChange={(e) => setPagoMonto(Number(e.target.value))}
                  required
                  disabled={paying}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-metodo" className="text-xs">Método de Pago</Label>
                <Select
                  id="pay-metodo"
                  value={pagoMetodo}
                  onChange={(e) => setPagoMetodo(e.target.value)}
                  disabled={paying}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-ref" className="text-xs">Referencia / Operación (Opcional)</Label>
              <Input
                id="pay-ref"
                type="text"
                placeholder="Número de operación o cheque"
                value={pagoReferencia}
                onChange={(e) => setPagoReferencia(e.target.value)}
                disabled={paying}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={paying}>
                Cancelar
              </Button>
              <Button type="submit" disabled={paying}>
                {paying ? "Procesando..." : "Registrar Pago"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>,
    document.body
  )
}
