import { apiRequest } from "../../../core/api/api"
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from "../types"

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    return apiRequest<User>("/api/auth/registro", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },
}
