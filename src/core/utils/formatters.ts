export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00'); // Prevent timezone offset shift
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

export const getDocumentTypeName = (code: string): string => {
  switch (code) {
    case '01':
      return 'Factura Electrónica';
    case '03':
      return 'Boleta de Venta';
    default:
      return 'Comprobante';
  }
};

export const getIdentityDocumentName = (code: string): string => {
  switch (code) {
    case '1':
      return 'DNI';
    case '6':
      return 'RUC';
    case '4':
      return 'Carnet de Extranjería';
    default:
      return 'Documento';
  }
};
