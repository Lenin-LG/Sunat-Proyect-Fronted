export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
  email: string
  rol: string
}

export interface AuthResponse {
  type: string
  token: string
}

export interface User {
  id?: number
  username: string
  email: string
  rol: string
}
