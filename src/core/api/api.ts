import { toast } from "../../components/ui/toast"

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export interface ApiRequestOptions extends RequestInit {
  skipToast?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("sunat_auth_token");
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const { skipToast, ...fetchOptions } = options;

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorDetails: any = null;
    try {
      errorDetails = await response.json();
    } catch {
      // Ignored if response is not JSON
    }

    const error: ApiError = {
      message: errorDetails?.message || errorDetails?.error || response.statusText || 'Error en la petición',
      status: response.status,
      details: errorDetails,
    };

    if (!skipToast) {
      toast.error(error.message);
    }

    throw error;
  }

  return response.json() as Promise<T>;
}
