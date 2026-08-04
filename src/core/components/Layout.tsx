import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  Database, 
  ShoppingCart, 
  Tag, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  History,
  User as UserIcon
} from 'lucide-react';
import type { User } from '../../features/auth/types';
import { Button } from '../../components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'emitir' | 'ventas' | 'compras' | 'productos' | 'clientes' | 'ple' | 'empresa';
  setActiveTab: (tab: any) => void;
  user: User | null;
  onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, user, onLogout }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Panel Control', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_ALMACENERO'] },
    { id: 'emitir', label: 'Emitir CPE', icon: <FileSpreadsheet className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR'] },
    { id: 'ventas', label: 'Historial Ventas', icon: <History className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR'] },
    { id: 'compras', label: 'Compras / Gastos', icon: <ShoppingCart className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_ALMACENERO'] },
    { id: 'productos', label: 'Catálogo Stock', icon: <Tag className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_ALMACENERO'] },
    { id: 'clientes', label: 'Clientes / Prov', icon: <Users className="h-4 w-4" />, roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_ALMACENERO'] },
    { id: 'ple', label: 'Libros PLE', icon: <BookOpen className="h-4 w-4" />, roles: ['ROLE_ADMIN'] },
    { id: 'empresa', label: 'Configuración', icon: <Settings className="h-4 w-4" />, roles: ['ROLE_ADMIN'] },
  ];

  // Filter navigation by role
  const userRole = user?.rol || 'ROLE_VENDEDOR';
  const allowedNavItems = navItems.filter(item => item.roles.includes(userRole));

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrador';
      case 'ROLE_VENDEDOR': return 'Ventas/Caja';
      case 'ROLE_ALMACENERO': return 'Almacén/Inventario';
      default: return 'Usuario';
    }
  };

  const handleNavClick = (tabId: any) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-[260px_1fr] bg-background text-foreground transition-all duration-150">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border/60 no-print z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Database className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight font-display">
            SUNAT<span className="text-primary">PRO</span>
          </span>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-slate-500 hover:text-foreground">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-[260px] md:w-auto h-full bg-card border-r border-border/60 z-30 p-6 flex flex-col justify-between no-print
      `}>
        <div className="space-y-6">
          {/* Logo / Brand */}
          <div className="hidden md:flex items-center gap-2.5 pb-2 border-b border-border/30">
            <div className="bg-primary p-2 rounded-xl text-white shadow-md shadow-primary/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight font-display leading-none">
                SUNAT<span className="text-primary">PRO</span>
              </h1>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-1">Facturación</span>
            </div>
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="p-3 bg-secondary/30 border border-border/30 rounded-lg flex items-center gap-3">
              <div className="bg-primary/10 border border-primary/20 p-1.5 rounded-full text-primary shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-foreground leading-tight" title={user.username}>
                  {user.username}
                </p>
                <span className="text-[9px] text-muted-foreground font-semibold block mt-0.5">
                  {getRoleLabel(user.rol)}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {allowedNavItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-100
                    ${active 
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10' 
                      : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-4 border-t border-border/40 mt-6">
          <div className="flex gap-2">
            
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="flex-1 text-muted-foreground hover:text-foreground"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onLogout}
              className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/35"
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center text-[9px] text-muted-foreground font-mono">
            Version 1.0.0
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 md:hidden animate-fade-in"
        />
      )}

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto overflow-y-auto no-print">
        {children}
      </main>
      
    </div>
  );
}
