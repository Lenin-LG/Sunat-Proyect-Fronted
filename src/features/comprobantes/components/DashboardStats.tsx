import { FileSpreadsheet, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { DashboardMetrics } from '../types';
import { formatCurrency } from '../../../core/utils/formatters';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const acceptanceRate = metrics.totalComprobantes > 0 
    ? Math.round((metrics.totalAceptados / metrics.totalComprobantes) * 100) 
    : 0;

  const statCards = [
    {
      title: 'Comprobantes Emitidos',
      value: metrics.totalComprobantes,
      subtitle: `${metrics.totalFacturas} Facturas / ${metrics.totalBoletas} Boletas`,
      icon: <FileSpreadsheet className="h-5 w-5 text-primary" />,
      bg: 'bg-primary/10 border-primary/20',
    },
    {
      title: 'Ventas Gravadas (Aceptadas)',
      value: formatCurrency(metrics.totalGravadaAcumulada),
      subtitle: `Total Pagar: ${formatCurrency(metrics.totalPagarAcumulado)}`,
      icon: <TrendingUp className="h-5 w-5 text-cyan-500" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'IGV Recaudado (18%)',
      value: formatCurrency(metrics.totalIgvAcumulado),
      subtitle: 'Impuesto de ventas aceptadas',
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      bg: 'bg-success/10 border-success/20',
    },
    {
      title: 'Tasa de Aceptación SUNAT',
      value: `${acceptanceRate}%`,
      subtitle: `${metrics.totalAceptados} Aceptados / ${metrics.totalRechazados} Fallidos`,
      icon: <AlertTriangle className={`h-5 w-5 ${acceptanceRate >= 80 || metrics.totalComprobantes === 0 ? 'text-success' : 'text-warning'}`} />,
      bg: acceptanceRate >= 80 || metrics.totalComprobantes === 0 ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {statCards.map((card, idx) => (
        <div 
          key={idx} 
          className="rounded-lg border border-border bg-card p-6 shadow-sm text-foreground hover:shadow-md transition-shadow animate-fade-in flex flex-col justify-between"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex justify-between items-start gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`p-2 rounded-lg border ${card.bg} flex items-center justify-center shrink-0`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight font-display">
              {card.value}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
