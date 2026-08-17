import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './core/components/Layout';
import { ToastProvider } from './components/ui/toast';
import { DashboardStats } from './features/comprobantes/components/DashboardStats';
import { ComprobanteForm } from './features/comprobantes/components/ComprobanteForm';
import { ComprobanteList } from './features/comprobantes/components/ComprobanteList';
import { ComprobanteDetail } from './features/comprobantes/components/ComprobanteDetail';
import { PublicInvoiceViewer } from './features/comprobantes/components/PublicInvoiceViewer';
import { useComprobantes } from './features/comprobantes/hooks/useComprobantes';
import { useAuth } from './features/auth/hooks/useAuth';
import { LoginView } from './features/auth/components/LoginView';
import { RegisterView } from './features/auth/components/RegisterView';
import { ClienteList } from './features/clientes/components/ClienteList';
import { ProductoList } from './features/productos/components/ProductoList';
import { CompraList } from './features/compras/components/CompraList';
import { PleDownloader } from './features/ple/components/PleDownloader';
import { EmpresaConfig } from './features/empresa/components/EmpresaConfig';
import type { Comprobante } from './features/comprobantes/types';
import { Button } from './components/ui/button';
import { PlusCircle, ShoppingBag, CreditCard, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedComprobante, setSelectedComprobante] = useState<Comprobante | null>(null);

  // Auth state
  const { user, login, register, logout, isAuthenticated, error: authError } = useAuth();

  // Parse QR verification code on mount or query param change
  const [publicComprobante, setPublicComprobante] = useState<Comprobante | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const verData = urlParams.get('ver');
    if (verData) {
      try {
        const decodedJson = decodeURIComponent(escape(atob(verData)));
        const data = JSON.parse(decodedJson);
        setPublicComprobante({
          id: Date.now(),
          tipoDocumento: data.t,
          serie: data.s,
          numero: data.n,
          fechaEmision: data.f,
          clienteTipoDocumento: data.td,
          clienteNumeroDocumento: data.nd,
          clienteNombre: data.nm,
          totalGravada: data.tg,
          totalIgv: data.ti,
          totalPagar: data.tp,
          estado: data.es,
          sunatResponseCode: data.sc,
          sunatDescription: data.sd,
          creadoEn: new Date().toISOString(),
          detalles: data.it.map((item: any, idx: number) => ({
            id: idx,
            descripcion: item.d,
            cantidad: item.c,
            precioUnitario: item.p,
            codigoProductoSunat: item.s
          }))
        });
      } catch (e) {
        console.error('Error decoding verification data:', e);
      }
    } else {
      setPublicComprobante(null);
    }
  }, [location.search]);

  const {
    comprobantes,
    metrics,
    loading,
    error,
    successData,
    emitirComprobante,
    eliminarComprobante,
    limpiarHistorial,
    resetStates,
  } = useComprobantes();

  const handleOpenDetail = (comprobante: Comprobante) => {
    setSelectedComprobante(comprobante);
  };

  const handleCloseDetail = () => {
    setSelectedComprobante(null);
  };

  // If public verification view is open
  if (publicComprobante) {
    return (
      <PublicInvoiceViewer
        comprobante={publicComprobante}
        onGoBack={() => {
          navigate(location.pathname); // clear query param
        }}
      />
    );
  }

  // Derive active tab from location path
  const path = location.pathname.substring(1) || 'dashboard';
  const activeTab = path as any;

  const handleTabChange = (tabId: string) => {
    navigate('/' + tabId);
  };

  // If not authenticated, force routing to login/register
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route 
          path="/login" 
          element={
            <LoginView
              onLogin={login}
              onSwitchToRegister={() => navigate('/registro')}
              error={authError}
            />
          } 
        />
        <Route 
          path="/registro" 
          element={
            <RegisterView
              onRegister={register}
              onSwitchToLogin={() => navigate('/login')}
              error={authError}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange} user={user} onLogout={logout}>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <div className="space-y-6 animate-fade-in text-foreground">
              {/* Header Dashboard */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight font-display flex items-center gap-2">
                    Panel de Control <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Resumen analítico y accesos rápidos a módulos de facturación y almacén.
                  </p>
                </div>
                
                <div className="flex gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={() => navigate('/emitir')}
                    className="flex-1 sm:flex-initial btn btn-primary flex items-center gap-1.5 text-xs font-semibold h-9"
                  >
                    <PlusCircle className="h-4 w-4" /> Emitir Comprobante
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <DashboardStats metrics={metrics} />

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                
                {/* Quick Actions */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-display">Accesos Rápidos</h4>
                    <p className="text-xs text-muted-foreground mt-1">Navegue rápidamente a las operaciones del día.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button onClick={() => navigate('/productos')} variant="outline" className="text-xs font-semibold py-5">
                      <ShoppingBag className="h-4 w-4 mr-1.5 text-primary" /> Productos
                    </Button>
                    <Button onClick={() => navigate('/clientes')} variant="outline" className="text-xs font-semibold py-5">
                      <UserCheck className="h-4 w-4 mr-1.5 text-primary" /> Clientes
                    </Button>
                    <Button onClick={() => navigate('/compras')} variant="outline" className="text-xs font-semibold py-5">
                      <CreditCard className="h-4 w-4 mr-1.5 text-primary" /> Compras
                    </Button>
                    <Button onClick={() => navigate('/ple')} variant="outline" className="text-xs font-semibold py-5">
                      <PlusCircle className="h-4 w-4 mr-1.5 text-primary" /> Libros PLE
                    </Button>
                  </div>
                </div>

                {/* Recent receipts log summary */}
                <div className="md:col-span-2 rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <h4 className="text-sm font-bold font-display">Últimos Comprobantes Emitidos</h4>
                      <button onClick={() => navigate('/ventas')} className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
                      {comprobantes.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground text-center py-6">No se registran comprobantes emitidos en esta sesión.</p>
                      ) : (
                        comprobantes.slice(0, 3).map((c) => (
                          <div 
                            key={c.id} 
                            onClick={() => handleOpenDetail(c)}
                            className="p-2.5 rounded-md bg-secondary/15 border border-border/30 hover:border-primary/20 cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold font-mono text-primary">{c.serie}-{c.numero}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">{c.clienteNombre}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono text-xs font-bold text-foreground">S/. {c.totalPagar.toFixed(2)}</span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${c.estado === 'ACEPTADO' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                {c.estado}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          } 
        />

        <Route 
          path="/emitir" 
          element={
            <div className="space-y-6 animate-fade-in text-foreground">
              <div className="flex items-center gap-12">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight font-display">Emisión de Comprobantes (Ventas)</h1>
                  <p className="text-xs text-muted-foreground">
                    Firme digitalmente y envíe Boletas, Facturas o Notas a SUNAT en tiempo real.
                  </p>
                </div>
              </div>

              <ComprobanteForm
                onSubmit={emitirComprobante}
                loading={loading}
                error={error}
                successData={successData}
                resetStates={resetStates}
              />
            </div>
          } 
        />

        <Route 
          path="/ventas" 
          element={
            <ComprobanteList
              comprobantes={comprobantes}
              onViewDetail={handleOpenDetail}
              onDelete={eliminarComprobante}
              onClearAll={limpiarHistorial}
            />
          } 
        />

        <Route path="/compras" element={<CompraList />} />
        <Route path="/productos" element={<ProductoList />} />
        <Route path="/clientes" element={<ClienteList />} />
        <Route path="/ple" element={<PleDownloader />} />
        <Route path="/empresa" element={<EmpresaConfig />} />

        {/* Redirect empty path to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Invoice Detail Modal Overlay */}
      {selectedComprobante && (
        <ComprobanteDetail
          comprobante={selectedComprobante}
          onClose={handleCloseDetail}
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
