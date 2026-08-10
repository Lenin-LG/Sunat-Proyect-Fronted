import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { CompraService } from "../services/CompraService"
import { CompraForm } from "./CompraForm"
import type { Compra, CompraRequest } from "../types"
import { PlusCircle, Search, RefreshCw, Loader2, Calendar, User, FileText, Eye, ShoppingCart } from "lucide-react"

export function CompraList() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null)

  const loadCompras = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await CompraService.listar()
      setCompras(data || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar el historial de compras.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompras()
  }, [])

  const handleCreate = () => {
    setFormOpen(true)
  }

  const handleFormSubmit = async (compraRequest: CompraRequest) => {
    try {
      await CompraService.registrar(compraRequest)
      setFormOpen(false)
      loadCompras()
    } catch (err: any) {
      throw new Error(err.message || "Error al guardar el registro de compra.")
    }
  }

  const handleViewDetail = (compra: Compra) => {
    setSelectedCompra(compra)
    setDetailOpen(true)
  }

  const filtered = compras.filter((c) => {
    const term = searchTerm.toLowerCase()
    return (
      c.serie.toLowerCase().includes(term) ||
      c.numero.toString().includes(term) ||
      (c.proveedorNombre && c.proveedorNombre.toLowerCase().includes(term)) ||
      (c.proveedorDocumento && c.proveedorDocumento.includes(term))
    );
  })

  // Calculate purchase total locally if backend doesn't aggregate it in the list (or print it if it exists)
  const getCompraTotal = (c: Compra) => {
    if (c.totalPagar) return c.totalPagar
    if (c.total) return c.total
    return c.items ? c.items.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario * 1.18), 0) : 0
  }

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display">Registro de Compras (Gastos)</h2>
          <p className="text-xs text-muted-foreground">
            Historial de facturas recibidas de proveedores. Incrementa stock y ajusta el Costo Promedio Ponderado.
          </p>
        </div>

        <Button onClick={handleCreate} className="flex items-center gap-1.5 self-stretch sm:self-auto text-xs">
          <PlusCircle className="h-4 w-4" />
          Registrar Compra
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border/60">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por serie, número o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        
        <Button variant="outline" size="icon" onClick={loadCompras} disabled={loading} title="Recargar lista">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">No se encontraron compras</p>
          <p className="text-xs mt-1">
            {searchTerm ? "Intente otra búsqueda." : "Comience registrando compras de stock de sus proveedores."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprobante</TableHead>
              <TableHead>Serie / Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead className="w-[80px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-semibold">
                  <div className="flex items-center gap-1.5 font-display">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{c.tipoDocumento === "01" ? "Factura" : "Boleta"} Compra</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-primary">
                  {c.serie}-{c.numero}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{c.fechaEmision}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs" title={c.proveedorNombre}>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{c.proveedorNombre || `Proveedor ID ${c.proveedorId}`}</span>
                  </div>
                  {c.proveedorDocumento && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {c.proveedorDocumento}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                  S/. {getCompraTotal(c).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleViewDetail(c)} className="h-7 w-7" title="Ver Detalles">
                    <Eye className="h-3.5 w-3.5 text-slate-500 hover:text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Compra / Gasto</DialogTitle>
            <DialogDescription>
              Complete los datos del comprobante para ingresar stock y promediar costos.
            </DialogDescription>
          </DialogHeader>
          <CompraForm
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Compra</DialogTitle>
            <DialogDescription>
              Lista de artículos y costos unitarios asociados a la compra.
            </DialogDescription>
          </DialogHeader>
          {selectedCompra && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-secondary/25 p-3 border border-border/40 rounded-lg">
                <div>
                  <p className="text-muted-foreground">Comprobante:</p>
                  <p className="font-semibold text-foreground font-mono">{selectedCompra.serie}-{selectedCompra.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha Emisión:</p>
                  <p className="font-semibold">{selectedCompra.fechaEmision}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Proveedor:</p>
                  <p className="font-semibold text-foreground">{selectedCompra.proveedorNombre || `ID ${selectedCompra.proveedorId}`}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">Artículos Comprados</span>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant</TableHead>
                      <TableHead className="text-right">Costo Unit</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCompra.items && selectedCompra.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">
                          <p className="font-medium text-foreground">{it.productoDescripcion || "Producto"}</p>
                          <span className="font-mono text-[9px] text-muted-foreground">{it.productoCodigo || `ID: ${it.productoId}`}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{it.cantidad}</TableCell>
                        <TableCell className="text-right font-mono text-xs">S/. {(it.precioUnitario * 1.18).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-foreground">S/. {(it.cantidad * it.precioUnitario * 1.18).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40 font-bold text-sm">
                <span>Total Compra: S/. {getCompraTotal(selectedCompra).toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
