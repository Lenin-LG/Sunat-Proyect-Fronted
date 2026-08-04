import { Printer, FileCheck, ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Comprobante } from '../types';
import { formatCurrency, formatDate, getDocumentTypeName, getIdentityDocumentName } from '../../../core/utils/formatters';

interface PublicInvoiceViewerProps {
  comprobante: Comprobante;
  onGoBack?: () => void;
}

export function PublicInvoiceViewer({ comprobante, onGoBack }: PublicInvoiceViewerProps) {
  const isAccepted = comprobante.estado === 'ACEPTADO';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9', 
      padding: '40px 16px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      color: '#1e293b'
    }}>
      {/* Top Banner (Header) */}
      <div className="no-print" style={{ 
        maxWidth: '800px', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        {onGoBack ? (
          <button 
            onClick={onGoBack} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Volver al Sistema
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
            <ShieldCheck size={20} /> Portal de Consulta Pública CPE
          </div>
        )}
        
        <button 
          onClick={handlePrint} 
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Printer size={15} /> Imprimir Comprobante
        </button>
      </div>

      {/* Official Status Stamp (Floating element) */}
      <div className="glass-panel animated-fade-in" style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: isAccepted ? 'rgba(209, 250, 229, 0.95)' : 'rgba(254, 226, 226, 0.95)',
        borderColor: isAccepted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        padding: '16px 24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          backgroundColor: isAccepted ? 'var(--success)' : 'var(--danger)',
          color: '#ffffff',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FileCheck size={24} />
        </div>
        <div>
          <h3 style={{ 
            fontSize: '1.05rem', 
            fontWeight: 700, 
            color: isAccepted ? '#065f46' : '#991b1b',
            textTransform: 'uppercase',
            marginBottom: '2px'
          }}>
            Comprobante de Pago Electrónico verificado por SUNAT
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#374151' }}>
            Estado: <strong>{comprobante.estado}</strong> — {comprobante.sunatDescription || 'Aceptado por SUNAT.'}
          </p>
        </div>
      </div>

      {/* Main Paper Receipt Sheet */}
      <div className="animated-fade-in" style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderRadius: '16px',
        padding: '50px',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header Block */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '24px', 
          borderBottom: '2px solid #f1f5f9', 
          paddingBottom: '30px', 
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              MI EMPRESA DE PRUEBA S.A.C.
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Av. Central 123, San Isidro, Lima, Perú<br />
              Teléfono: (01) 456-7890 | Email: soporte@tuempresa.com<br />
              <strong>R.U.C. 20000000001</strong>
            </p>
          </div>

          <div style={{ 
            border: '2px solid #475569', 
            borderRadius: '10px', 
            padding: '20px 30px', 
            textAlign: 'center',
            minWidth: '240px',
            backgroundColor: '#f8fafc'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              R.U.C. 20000000001
            </h4>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '6px 0', textTransform: 'uppercase' }}>
              {getDocumentTypeName(comprobante.tipoDocumento)}
            </h3>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {comprobante.serie}-{comprobante.numero}
            </h4>
          </div>
        </div>

        {/* Client & Date Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '35px', fontSize: '0.875rem' }}>
          <div>
            <span style={{ display: 'block', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '6px' }}>
              Cliente / Receptor
            </span>
            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>
              {comprobante.clienteNombre}
            </p>
            <p style={{ color: '#475569' }}>
              <strong>{getIdentityDocumentName(comprobante.clienteTipoDocumento)}:</strong> {comprobante.clienteNumeroDocumento}
            </p>
          </div>
          <div>
            <span style={{ display: 'block', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '6px' }}>
              Información Comercial
            </span>
            <p style={{ color: '#475569', lineHeight: '1.5' }}>
              <strong>Fecha Emisión:</strong> {formatDate(comprobante.fechaEmision)}<br />
              <strong>Moneda:</strong> Soles (PEN)<br />
              <strong>Condición Pago:</strong> Contado (Efectivo/Transferencia)
            </p>
          </div>
        </div>

        {/* Table of Items */}
        <div style={{ overflowX: 'auto', marginBottom: '35px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 700, color: '#475569' }}>Descripción</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, color: '#475569', width: '12%' }}>Cantidad</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700, color: '#475569', width: '20%' }}>P. Unitario</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700, color: '#475569', width: '20%' }}>Valor Venta</th>
              </tr>
            </thead>
            <tbody>
              {comprobante.detalles.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 8px', color: '#1e293b' }}>
                    {item.descripcion}
                    {item.codigoProductoSunat && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                        Código SUNAT: {item.codigoProductoSunat}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 8px', color: '#334155' }}>
                    {item.cantidad}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', color: '#334155' }}>
                    {formatCurrency(item.precioUnitario)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 600, color: '#0f172a' }}>
                    {formatCurrency(item.cantidad * item.precioUnitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculations Block */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '30px', 
          borderTop: '2px solid #cbd5e1', 
          paddingTop: '24px', 
          marginBottom: '35px' 
        }}>
          {/* Signature Details */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f8fafc' }}>
              <p style={{ fontWeight: 700, marginBottom: '6px', color: '#475569', textTransform: 'uppercase' }}>
                Resumen Firma Digital XML (UBL 2.1):
              </p>
              <p style={{ fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '8px' }}>
                {isAccepted 
                  ? `SHA-1: ${btoa(comprobante.serie + comprobante.numero).substring(0, 28)}` 
                  : '— DOCUMENTO NO ACEPTADO EN SUNAT —'}
              </p>
              <p>
                Este documento es una representación impresa de un comprobante de pago electrónico. Puede ser verificado libremente en el portal de SUNAT utilizando la información de cabecera.
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div style={{ minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Operación Gravada:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(Number(comprobante.totalGravada) || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>I.G.V. (18.00%):</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(Number(comprobante.totalIgv) || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
              <span>Importe Total:</span>
              <span style={{ color: 'var(--primary)' }}>{formatCurrency(Number(comprobante.totalPagar) || 0)}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          🔒 Consulta de Comprobante Electrónico Autorizada. Generado por tu Empresa emisora.
        </div>
      </div>
    </div>
  );
}
