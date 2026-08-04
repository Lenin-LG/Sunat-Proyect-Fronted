export const PleService = {
  async descargarVentas(mes: number, anio: number): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem("sunat_auth_token")
    const response = await fetch(`/api/ple/ventas?mes=${mes}&anio=${anio}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error("Error al generar el libro electrónico PLE de ventas.")
    }

    // Extract filename from Content-Disposition header if available
    const disposition = response.headers.get("content-disposition")
    let filename = `LE206012345672026080014010011112.txt` // Default name matching naming conventions
    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "")
      }
    }

    const blob = await response.blob()
    return { blob, filename }
  },

  async descargarCompras(mes: number, anio: number): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem("sunat_auth_token")
    const response = await fetch(`/api/ple/compras?mes=${mes}&anio=${anio}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error("Error al generar el libro electrónico PLE de compras.")
    }

    const disposition = response.headers.get("content-disposition")
    let filename = `LE206012345672026080008010011112.txt`
    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "")
      }
    }

    const blob = await response.blob()
    return { blob, filename }
  },
}
