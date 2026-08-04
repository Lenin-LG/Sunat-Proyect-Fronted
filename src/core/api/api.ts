export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("sunat_auth_token");
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
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
      message: errorDetails?.message || response.statusText || 'Error en la petición',
      status: response.status,
      details: errorDetails,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
