import React, { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card"
import { LogIn, Key, User as UserIcon, ShieldAlert } from "lucide-react"
import type { LoginCredentials } from "../types"

interface LoginViewProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>
  onSwitchToRegister: () => void
  error: string | null
}

export function LoginView({ onLogin, onSwitchToRegister, error }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setLocalError("Por favor complete todos los campos.")
      return
    }

    setLocalError(null)
    setLoading(true)
    try {
      await onLogin({ username, password })
    } catch (err: any) {
      // Error handled by hook, but ensure local loading resets
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = () => {
    setUsername("admin")
    setPassword("adminpassword")
  }

  const displayError = error || localError

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden px-4">
      {/* Decorative Blur Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10 animate-fade-in text-slate-100">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center border border-primary/20 mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-slate-50 to-slate-400 bg-clip-text text-transparent">
            Sistema de Facturación SUNAT
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Ingrese sus credenciales para acceder al panel de control
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 text-center pb-6">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors underline cursor-pointer"
          >
            Autocompletar credenciales de prueba (admin / adminpassword)
          </button>
          
          <div className="text-xs text-slate-400">
            ¿No tienes cuenta?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Regístrate aquí
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
