import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { ProductoService } from "../services/ProductoService"
import { ProductoForm } from "./ProductoForm"
import { StockAdjustmentModal } from "./StockAdjustmentModal"
import type { Producto } from "../types"
import { PlusCircle, Search, Edit2, Trash2, Tag, RefreshCw, Loader2, ArrowUpDown } from "lucide-react"

export function ProductoList() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null)

  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [adjustingProducto, setAdjustingProducto] = useState<Producto | null>(null)

  const loadProductos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ProductoService.listar()
      setProductos(data || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de productos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductos()
  }, [])

  const handleCreate = () => {
    setSelectedProducto(null)
    setFormOpen(true)
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setFormOpen(true)
  }

  const handleDeleteClick = (producto: Producto) => {
    setProductoToDelete(producto)
    setDeleteConfirmOpen(true)
  }

  const handleAdjustmentClick = (producto: Producto) => {
    setAdjustingProducto(producto)
    setAdjustmentOpen(true)
  }

  const handleFormSubmit = async (productoData: Producto) => {
    try {
      if (selectedProducto && selectedProducto.id) {
        await ProductoService.actualizar(selectedProducto.id, productoData)
      } else {
        await ProductoService.registrar(productoData)
      }
      setFormOpen(false)
      loadProductos()
    } catch (err: any) {
      throw new Error(err.message || "Error al guardar el producto.")
    }
  }

  const handleAdjustmentSubmit = async (id: number, tipo: "INGRESO" | "SALIDA", cantidad: number, valor: number) => {
    try {
      if (tipo === "INGRESO") {
        await ProductoService.ingresoStock(id, cantidad, valor)
      } else {
        await ProductoService.salidaStock(id, cantidad, valor)
      }
      loadProductos()
    } catch (err: any) {
      throw new Error(err.message || "Error al registrar el ajuste de stock.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!productoToDelete || !productoToDelete.id) return
    try {
      await ProductoService.eliminar(productoToDelete.id)
      setDeleteConfirmOpen(false)
      loadProductos()
    } catch (err: any) {
      setError(err.message || "Error al eliminar el producto.")
    }
  }

  // Filter products
  const filteredProductos = productos.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.codigo.toLowerCase().includes(term) ||
      p.descripcion.toLowerCase().includes(term)
    );
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display">Catálogo de Productos e Inventario</h2>
          <p className="text-xs text-muted-foreground">
            Gestione códigos de barras/SUNAT, precios de venta, costos promedios y control de stock.
          </p>
        </div>

        <Button onClick={handleCreate} className="flex items-center gap-1.5 self-stretch sm:self-auto text-xs">
          <PlusCircle className="h-4 w-4" />
          Registrar Producto
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
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        
        <Button variant="outline" size="icon" onClick={loadProductos} disabled={loading} title="Recargar lista">
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
      ) : filteredProductos.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">No se encontraron productos</p>
          <p className="text-xs mt-1">
            {searchTerm ? "Intente otra búsqueda o registre un nuevo producto." : "Comience agregando productos a su catálogo."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Impuesto</TableHead>
              <TableHead className="text-right">CPP (Costo Promedio)</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead className="text-center">Stock Actual</TableHead>
              <TableHead className="w-[140px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductos.map((p) => {
              const stock = p.stockActual || 0
              let stockColor: "outline" | "success" | "warning" | "destructive" = "outline"
              if (stock > 10) stockColor = "success"
              else if (stock > 0) stockColor = "warning"
              else stockColor = "destructive"

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">
                    {p.codigo}
                  </TableCell>
                  <TableCell className="font-medium text-xs font-display">
                    {p.descripcion}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="scale-90 font-mono">
                      {p.unidadMedidaId}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px]">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                      Afectación {p.tipoAfectacionIgvId}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    S/. {(p.costoPromedio || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                    S/. {(p.precioUnitario || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={stockColor} className="font-mono font-bold scale-90">
                      {stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdjustmentClick(p)}
                        className="h-7 text-[10px] px-2 py-0"
                        title="Ajustar Stock"
                      >
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Stock
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-7 w-7">
                        <Edit2 className="h-3 w-3 text-slate-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(p)} className="h-7 w-7">
                        <Trash2 className="h-3 w-3 text-slate-500 hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProducto ? "Editar Producto" : "Registrar Producto"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para definir el código de barra, descripción y precios del artículo.
            </DialogDescription>
          </DialogHeader>
          <ProductoForm
            productoInicial={selectedProducto}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustmentOpen} onClose={() => setAdjustmentOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste de Stock y Costo Promedio</DialogTitle>
            <DialogDescription>
              Ajuste el inventario sumando compras o restando salidas. Afecta el costo promedio.
            </DialogDescription>
          </DialogHeader>
          {adjustingProducto && (
            <StockAdjustmentModal
              producto={adjustingProducto}
              onSubmit={handleAdjustmentSubmit}
              onClose={() => setAdjustmentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el producto{" "}
              <strong className="text-foreground">{productoToDelete?.descripcion}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
