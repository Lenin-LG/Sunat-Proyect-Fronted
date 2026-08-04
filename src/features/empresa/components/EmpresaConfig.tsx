import React, { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Select } from "../../../components/ui/select"
import { EmpresaService } from "../services/EmpresaService"
import type { Empresa } from "../types"
import { ShieldCheck, FileKey, Building2, Upload, AlertCircle, Save, Loader2 } from "lucide-react"

export function EmpresaConfig() {
  const [ruc, setRuc] = useState("20601234567")
  const [razonSocial, setRazonSocial] = useState("")
  const [nombreComercial, setNombreComercial] = useState("")
  const [direccionFiscal, setDireccionFiscal] = useState("")
  const [ubigeo, setUbigeo] = useState("")
  const [departamento, setDepartamento] = useState("")
  const [provincia, setProvincia] = useState("")
  const [distrito, setDistrito] = useState("")
  
  const [usuarioSolProduccion, setUsuarioSolProduccion] = useState("")
  const [passwordSolProduccion, setPasswordSolProduccion] = useState("")
  const [modoProduccion, setModoProduccion] = useState(false)
  const [certificadoBase64, setCertificadoBase64] = useState("")
  const [certificadoPassword, setCertificadoPassword] = useState("")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Adjust to call obtaining API in Spanish: "obtener"
  const fetchEmpresa = async (rucVal: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await EmpresaService.obtener(rucVal)
      if (data) {
        setRuc(data.ruc)
        setRazonSocial(data.razonSocial)
        setNombreComercial(data.nombreComercial)
        setDireccionFiscal(data.direccionFiscal)
        setUbigeo(data.ubigeo)
        setDepartamento(data.departamento)
        setProvincia(data.provincia)
        setDistrito(data.distrito)
        setUsuarioSolProduccion(data.usuarioSolProduccion || "")
        setPasswordSolProduccion(data.passwordSolProduccion || "")
        setModoProduccion(data.modoProduccion)
        setCertificadoBase64(data.certificadoBase64 || "")
        setCertificadoPassword(data.certificadoPassword || "")
      }
    } catch (e) {
      console.log("Company not registered yet.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresa("20601234567")
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        const base64 = result.split(",")[1]
        setCertificadoBase64(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruc.trim() || !razonSocial.trim() || !direccionFiscal.trim()) {
      setError("Por favor complete los campos obligatorios del perfil de empresa.")
      return
    }

    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      const payload: Empresa = {
        ruc,
        razonSocial,
        nombreComercial,
        direccionFiscal,
        ubigeo,
        departamento,
        provincia,
        distrito,
        modoProduccion,
        usuarioSolProduccion: usuarioSolProduccion.trim() || undefined,
        passwordSolProduccion: passwordSolProduccion.trim() || undefined,
        certificadoBase64: certificadoBase64 || undefined,
        certificadoPassword: certificadoPassword.trim() || undefined,
      }
      await EmpresaService.configurar(payload)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Error al guardar la configuración de empresa.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-foreground max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight font-display">Configuración de Empresa</h2>
        <p className="text-xs text-muted-foreground">
          Configure los datos de su empresa emisora, credenciales de envío SOL (SUNAT) y cargue su certificado de firma digital.
        </p>
      </div>

      {success && (
        <div className="p-3 text-xs bg-success/10 border border-success/20 rounded-md text-success-foreground font-semibold flex items-center gap-2">
          ✓ Configuración guardada con éxito.
        </div>
      )}

      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-md text-destructive-foreground">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General Business Details */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-sm font-bold">Información de la Empresa</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Datos generales que figurarán impresos en sus facturas y boletas electrónicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emp-ruc" className="text-xs">RUC Emisor *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="emp-ruc"
                      type="text"
                      placeholder="20601234567"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value.replace(/\D/g, ""))}
                      maxLength={11}
                      required
                    />
                    <Button type="button" variant="outline" onClick={() => fetchEmpresa(ruc)} className="text-xs shrink-0">
                      Cargar
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="emp-rs" className="text-xs">Razón Social *</Label>
                  <Input
                    id="emp-rs"
                    type="text"
                    placeholder="MI EMPRESA S.A.C."
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emp-nc" className="text-xs">Nombre Comercial</Label>
                  <Input
                    id="emp-nc"
                    type="text"
                    placeholder="Mi Tienda Online"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emp-dir" className="text-xs">Dirección Fiscal *</Label>
                  <Input
                    id="emp-dir"
                    type="text"
                    placeholder="Av. Las Camelias 450, San Isidro"
                    value={direccionFiscal}
                    onChange={(e) => setDireccionFiscal(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emp-ubigeo" className="text-xs">Ubigeo (6 dígitos)</Label>
                  <Input
                    id="emp-ubigeo"
                    type="text"
                    placeholder="150131"
                    value={ubigeo}
                    onChange={(e) => setUbigeo(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emp-dep" className="text-xs">Departamento</Label>
                  <Input
                    id="emp-dep"
                    type="text"
                    placeholder="Lima"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emp-prov" className="text-xs">Provincia</Label>
                  <Input
                    id="emp-prov"
                    type="text"
                    placeholder="Lima"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emp-dist" className="text-xs">Distrito</Label>
                  <Input
                    id="emp-dist"
                    type="text"
                    placeholder="San Isidro"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SUNAT SOL Credentials */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-sm font-bold">Credenciales SUNAT SOL</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Credenciales del usuario secundario SOL creado en el portal de SUNAT para el envío de los comprobantes XML.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emp-soluser" className="text-xs">Usuario SOL Secundario</Label>
                  <Input
                    id="emp-soluser"
                    type="text"
                    placeholder="MODDATOS (Ej: FACTURADOR)"
                    value={usuarioSolProduccion}
                    onChange={(e) => setUsuarioSolProduccion(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emp-solpass" className="text-xs">Clave SOL Secundario</Label>
                  <Input
                    id="emp-solpass"
                    type="password"
                    placeholder="••••••••"
                    value={passwordSolProduccion}
                    onChange={(e) => setPasswordSolProduccion(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emp-envmode" className="text-xs">Ambiente de Envío</Label>
                  <Select
                    id="emp-envmode"
                    value={modoProduccion ? "PROD" : "BETA"}
                    onChange={(e) => setModoProduccion(e.target.value === "PROD")}
                  >
                    <option value="BETA">SUNAT BETA (Pruebas / Demo)</option>
                    <option value="PROD">SUNAT PRODUCCIÓN (Ventas Reales)</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Settings */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary">
                <FileKey className="h-5 w-5" />
                <CardTitle className="text-sm font-bold">Certificado de Firma Digital</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Cargue el archivo del certificado digital (.pfx o .p12) emitido por una entidad de registro acreditada para sellar el XML del CPE.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Cargar Archivo Certificado (.pfx / .p12)
                  </Label>
                  <Input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emp-certpass" className="text-xs">Contraseña del Certificado</Label>
                  <Input
                    id="emp-certpass"
                    type="password"
                    placeholder="Contraseña de firma digital"
                    value={certificadoPassword}
                    onChange={(e) => setCertificadoPassword(e.target.value)}
                  />
                </div>
              </div>

              {certificadoBase64 ? (
                <div className="p-3 bg-success/10 border border-success/20 rounded text-xs text-success-foreground flex items-center gap-2">
                  <span>✓ El certificado digital se cargó y codificó correctamente en Base64.</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-800 dark:text-amber-400 flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Ningún certificado cargado. Asegúrese de subir uno antes de emitir comprobantes reales en producción.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-border/40 pt-4">
            <Button type="submit" disabled={submitting} className="font-bold flex items-center gap-1.5">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>

        </form>
      )}
    </div>
  )
}
