import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Select } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { PleService } from "../services/PleService"
import { Download, FileText, Calendar, HelpCircle, Loader2 } from "lucide-react"

export function PleDownloader() {
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())
  
  const [loadingVentas, setLoadingVentas] = useState(false)
  const [loadingCompras, setLoadingCompras] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ]

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDescargarVentas = async () => {
    setLoadingVentas(true)
    setError(null)
    try {
      const { blob, filename } = await PleService.descargarVentas(mes, anio)
      downloadFile(blob, filename)
    } catch (err: any) {
      setError(err.message || "Error al descargar el libro de ventas PLE.")
    } finally {
      setLoadingVentas(false)
    }
  }

  const handleDescargarCompras = async () => {
    setLoadingCompras(true)
    setError(null)
    try {
      const { blob, filename } = await PleService.descargarCompras(mes, anio)
      downloadFile(blob, filename)
    } catch (err: any) {
      setError(err.message || "Error al descargar el libro de compras PLE.")
    } finally {
      setLoadingCompras(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      <div>
        <h2 className="text-xl font-bold tracking-tight font-display">Libros Electrónicos (PLE)</h2>
        <p className="text-xs text-muted-foreground">
          Genere y descargue los archivos de texto estructurado (.txt) para cargarlos en el Programa de Libros Electrónicos oficial de SUNAT.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Date Selectors Card */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-end gap-4 bg-secondary/10">
          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="ple-mes" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Mes Contable
            </Label>
            <Select id="ple-mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              {meses.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="ple-anio" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Año Contable
            </Label>
            <Select id="ple-anio" value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
              {anios.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Download cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Book Card */}
        <Card className="border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="bg-primary/10 border border-primary/20 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-bold">Libro de Ventas Simplificado (14.1)</CardTitle>
            <CardDescription className="text-xs">
              Estructura oficial que consolida las facturas, boletas y notas de crédito/débito de ventas emitidas en el periodo seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleDescargarVentas}
              disabled={loadingVentas || loadingCompras}
              className="w-full text-xs font-semibold"
            >
              {loadingVentas ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Generando Ventas...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Descargar PLE Ventas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Purchase Book Card */}
        <Card className="border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center text-cyan-500 mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-bold">Libro de Compras Simplificado (8.1)</CardTitle>
            <CardDescription className="text-xs">
              Estructura oficial que reporta todas las adquisiciones, mercaderías y facturas de compras registradas de sus proveedores en el periodo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleDescargarCompras}
              disabled={loadingVentas || loadingCompras}
              variant="outline"
              className="w-full text-xs font-semibold hover:bg-secondary"
            >
              {loadingCompras ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Generando Compras...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Descargar PLE Compras
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>

      <div className="p-4 rounded-lg bg-secondary/15 border border-border/40 text-xs text-muted-foreground leading-normal flex gap-2.5">
        <HelpCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Instrucciones de Carga:</p>
          <p>1. Descargue los archivos correspondientes al mes fiscal.</p>
          <p>2. Ingrese a su aplicativo PLE de SUNAT con su RUC, Usuario y Clave SOL.</p>
          <p>3. Seleccione la opción "Validar" y cargue los archivos descargados.</p>
          <p>4. Una vez validados con éxito (cero errores), proceda a generar el resumen y enviar el libro.</p>
        </div>
      </div>
    </div>
  )
}
