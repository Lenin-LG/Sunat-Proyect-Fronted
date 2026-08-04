import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import type { Comprobante } from "../types"
import { FileText, Search, Eye, Trash2, Calendar, User, ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface ComprobanteListProps {
  comprobantes: Comprobante[]
  onViewDetail: (comprobante: Comprobante) => void
  onDelete: (id: number) => void
  onClearAll: () => void
}

export function ComprobanteList({ comprobantes, onViewDetail, onDelete, onClearAll }: ComprobanteListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")

  const getDocName = (type: string) => {
    switch (type) {
      case "01": return "Factura"
      case "03": return "Boleta"
      case "07": return "Nota de Crédito"
      case "08": return "Nota de Débito"
      default: return "CPE"
    }
  }

  const getDocIcon = (type: string) => {
    switch (type) {
      case "07": return <ArrowDownLeft className="h-3 w-3 text-amber-500" />
      case "08": return <ArrowUpRight className="h-3 w-3 text-blue-500" />
      default: return <FileText className="h-3 w-3 text-primary" />
    }
  }

  const getStatusBadge = (c: Comprobante) => {
    const isAnulado = c.sunatDescription?.toUpperCase().startsWith("ANULADO:")
    if (isAnulado) {
      return <Badge variant="destructive" className="font-mono scale-90">Anulado</Badge>
    }

    switch (c.estado) {
      case "ACEPTADO":
        return <Badge variant="success" className="font-mono scale-90">Aceptado</Badge>
      case "PENDIENTE":
        return <Badge variant="warning" className="font-mono scale-90">Pendiente</Badge>
      case "RECHAZADO":
        return <Badge variant="destructive" className="font-mono scale-90">Rechazado</Badge>
      case "ERROR":
      default:
        return <Badge variant="destructive" className="font-mono scale-90">Error</Badge>
    }
  }

  // Filter receipts
  const filtered = comprobantes.filter((c) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      c.serie.toLowerCase().includes(term) ||
      c.numero.toString().includes(term) ||
      c.clienteNombre.toLowerCase().includes(term) ||
      c.clienteNumeroDocumento.includes(term)

    if (filterType === "ALL") return matchesSearch
    return matchesSearch && c.tipoDocumento === filterType
  })

  return (
    <div className="space-y-4 animate-fade-in text-foreground mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight font-display">Historial de Ventas</h2>
          <p className="text-xs text-muted-foreground">
            Listado de boletas, facturas y notas emitidas localmente.
          </p>
        </div>

        {comprobantes.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAll} className="text-xs text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30">
            Limpiar Historial
          </Button>
        )}
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-lg border border-border/60">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por serie, número o nombre cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] bg-[image:url('data:image/svg+xml;charset=utf-8,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%2364748b%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3E%3Cpath_d=%22m6_9_6_6_6-6%22/%3E%3C/svg%3E')]"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="01">Facturas</option>
            <option value="03">Boletas</option>
            <option value="07">Notas de Crédito</option>
            <option value="08">Notas de Débito</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">No se encontraron comprobantes</p>
          <p className="text-xs mt-1">
            {searchTerm || filterType !== "ALL" ? "Pruebe con otros filtros o búsquedas." : "Los comprobantes emitidos aparecerán registrados aquí."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Serie / Correlativo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Receptor</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-semibold">
                  <div className="flex items-center gap-1.5 font-display text-foreground">
                    {getDocIcon(c.tipoDocumento)}
                    <span>{getDocName(c.tipoDocumento)}</span>
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
                <TableCell className="max-w-[200px] truncate text-xs" title={c.clienteNombre}>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{c.clienteNombre}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {c.clienteNumeroDocumento}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                  S/. {c.totalPagar.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(c)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetail(c)} className="h-7 w-7" title="Ver Detalles">
                      <Eye className="h-3.5 w-3.5 text-slate-500 hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)} className="h-7 w-7 text-slate-400 hover:text-destructive" title="Eliminar del historial">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
