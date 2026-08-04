import { useState, useEffect, useCallback } from "react"
import { AuthService } from "../services/AuthService"
import type { LoginCredentials, RegisterCredentials, User } from "../types"

const TOKEN_KEY = "sunat_auth_token"

function parseJwt(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}
function normalizeRole(role: string): string {
  if (!role) return "ROLE_VENDEDOR";
  let cleaned = role.toUpperCase();
  while (cleaned.startsWith("ROLE_ROLE_")) {
    cleaned = cleaned.substring(5);
  }
  if (!cleaned.startsWith("ROLE_")) {
    cleaned = "ROLE_" + cleaned;
  }
  return cleaned;
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize from LocalStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const decoded = parseJwt(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          username: decoded.sub,
          email: "", // email not in token payload, but we can leave blank
          rol: normalizeRole(decoded.role),
        })
      } else {
        // Expired token
        localStorage.removeItem(TOKEN_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthService.login(credentials)
      const token = (response as any).token ?? (response as any).accessToken ?? (response as any).jwt
      localStorage.setItem(TOKEN_KEY, token)

      const decoded = parseJwt(token)
      if (decoded) {
        setUser({
          username: decoded.sub,
          email: "",
          rol: normalizeRole(decoded.role),
        })
      }
      return true
    } catch (err: any) {
      const msg = err.message || "Credenciales incorrectas o error en el servidor."
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true)
    setError(null)
    try {
      await AuthService.register(credentials)
      return true
    } catch (err: any) {
      const msg = err.message || "Error al registrar el usuario."
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
