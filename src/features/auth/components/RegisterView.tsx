import React, { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select } from "../../../components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card"
import { UserPlus, User as UserIcon, Mail, Key, Shield, ShieldAlert, CheckCircle2, Eye, EyeOff } from "lucide-react"
import type { RegisterCredentials } from "../types"
import { toast } from "../../../components/ui/toast"

interface RegisterViewProps {
  onRegister: (credentials: RegisterCredentials) => Promise<boolean>
  onSwitchToLogin: () => void
  error: string | null
}

export function RegisterView({ onRegister, onSwitchToLogin, error }: RegisterViewProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("ROLE_VENDEDOR")
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    if (!username.trim()) {
      setLocalError("El nombre de usuario es requerido.")
      return false
    }
    if (username.trim().length < 3) {
      setLocalError("El nombre de usuario debe tener al menos 3 caracteres.")
      return false
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setLocalError("El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.")
      return false
    }

    if (!email.trim()) {
      setLocalError("El correo electrónico es requerido.")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setLocalError("El formato del correo electrónico no es válido.")
      return false
    }

    if (!password) {
      setLocalError("La contraseña es requerida.")
      return false
    }
    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres.")
      return false
    }

    setLocalError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLocalError(null)
    setLoading(true)
    try {
      const ok = await onRegister({ username, email, password, rol })
      if (ok) {
        toast.success("¡Usuario registrado exitosamente!")
        setSuccess(true)
        setTimeout(() => {
          onSwitchToLogin()
        }, 2000)
      }
    } catch (err: any) {
      // Handled by parent or apiRequest toast
    } finally {
      setLoading(false)
    }
  }

  const displayError = error || localError

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden px-4">
      {/* Decorative Blur Circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10 animate-fade-in text-slate-100">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center border border-primary/20 mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-slate-50 to-slate-400 bg-clip-text text-transparent">
            Registro de Usuario
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Crea una cuenta para comenzar a emitir comprobantes
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="p-6 text-center space-y-3 flex flex-col items-center">
              <CheckCircle2 className="h-12 w-12 text-success animate-bounce" />
              <h4 className="text-lg font-bold text-slate-100">¡Usuario registrado!</h4>
              <p className="text-xs text-slate-400">
                El registro fue exitoso. Redirigiendo a la pantalla de inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="p-3 rounded-md bg-destructive/15 border border-destructive/35 flex items-start gap-2.5 text-xs text-destructive-foreground">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-slate-300 text-xs">Usuario</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Escriba su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-xs">Correo Electrónico</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-xs">Contraseña</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Key className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-9 pr-10 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rol" className="text-slate-300 text-xs">Rol de Usuario</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Shield className="h-4 w-4" />
                  </span>
                  <Select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    disabled={loading}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary"
                  >
                    <option value="ROLE_ADMIN" className="bg-slate-900">Administrador (Acceso Completo)</option>
                    <option value="ROLE_VENDEDOR" className="bg-slate-900">Vendedor (Emisiones y Caja)</option>
                    <option value="ROLE_ALMACENERO" className="bg-slate-900">Almacenero (Productos y Compras)</option>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-2">
                {loading ? "Registrando..." : "Registrar Cuenta"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <div className="text-xs text-slate-400">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Inicia sesión
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
