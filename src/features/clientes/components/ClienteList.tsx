import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog"
import { ClienteService } from "../services/ClienteService"
import { ClienteForm } from "./ClienteForm"
import type { Entidad } from "../types"
import { PlusCircle, Search, Edit2, Trash2, Mail, MapPin, Building, RefreshCw, Loader2 } from "lucide-react"

export function ClienteList() {
  const [clientes, setClientes] = useState<Entidad[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Entidad | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<Entidad | null>(null)

  const loadClientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ClienteService.listar()
      setClientes(data || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de clientes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const handleCreate = () => {
    setSelectedCliente(null)
    setFormOpen(true)
  }

  const handleEdit = (cliente: Entidad) => {
    setSelectedCliente(cliente)
    setFormOpen(true)
  }

  const handleDeleteClick = (cliente: Entidad) => {
    setClienteToDelete(cliente)
    setDeleteConfirmOpen(true)
  }

  const handleFormSubmit = async (clienteData: Entidad) => {
    try {
      if (selectedCliente && selectedCliente.id) {
        await ClienteService.actualizar(selectedCliente.id, clienteData)
      } else {
        await ClienteService.registrar(clienteData)
      }
      setFormOpen(false)
      loadClientes()
    } catch (err: any) {
      throw new Error(err.message || "Error al guardar el cliente.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete || !clienteToDelete.id) return
    try {
      await ClienteService.eliminar(clienteToDelete.id)
      setDeleteConfirmOpen(false)
      loadClientes()
    } catch (err: any) {
      setError(err.message || "Error al eliminar el cliente.")
    }
  }

  // Filter clients
  const filteredClientes = clientes.filter((c) => {
    const term = searchTerm.toLowerCase()
    return (
      c.numeroDocumento.includes(term) ||
      c.nombreRazonSocial.toLowerCase().includes(term) ||
      c.direccion.toLowerCase().includes(term)
    );
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display">Clientes y Proveedores</h2>
          <p className="text-xs text-muted-foreground">
            Gestión del catálogo de entidades para facturación y compras.
          </p>
        </div>

        <Button onClick={handleCreate} className="flex items-center gap-1.5 self-stretch sm:self-auto text-xs">
          <PlusCircle className="h-4 w-4" />
          Registrar Entidad
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
            placeholder="Buscar por RUC/DNI o razón social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        
        <Button variant="outline" size="icon" onClick={loadClientes} disabled={loading} title="Recargar lista">
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
      ) : filteredClientes.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          <Building className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">No se encontraron clientes</p>
          <p className="text-xs mt-1">
            {searchTerm ? "Intente otra búsqueda o registre un nuevo cliente." : "Comience agregando clientes a la base de datos."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-xs whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.tipoEntidadId === "6" ? "default" : "secondary"} className="scale-90 font-mono">
                      {c.tipoEntidadId === "6" ? "RUC" : "DNI"}
                    </Badge>
                    <span className="font-mono">{c.numeroDocumento}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-xs font-display">
                  {c.nombreRazonSocial}
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs" title={c.direccion}>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{c.direccion}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {c.correo ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span>{c.correo}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 italic">Sin correo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-7 w-7">
                      <Edit2 className="h-3 w-3 text-slate-500 hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(c)} className="h-7 w-7">
                      <Trash2 className="h-3 w-3 text-slate-500 hover:text-destructive" />
                    </Button>
                  </div>
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
            <DialogTitle>
              {selectedCliente ? "Editar Entidad" : "Registrar Entidad"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para guardar los datos del cliente o proveedor.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            clienteInicial={selectedCliente}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar a{" "}
              <strong className="text-foreground">{clienteToDelete?.nombreRazonSocial}</strong>?
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
