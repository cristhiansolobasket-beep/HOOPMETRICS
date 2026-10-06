import React, { useState } from 'react';
import { Usuario } from '../types/basketball';
import {
  Activity,
  BarChart3,
  Users,
  Shield,
  FileSpreadsheet,
  Layers,
  Database,
  History,
  Menu,
  X,
  LogOut,
  UserCheck,
  Flame,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'evaluar'
  | 'historial'
  | 'atletas'
  | 'tests'
  | 'baremos'
  | 'usuarios'
  | 'sql';

export type DeportistaTab =
  | 'mi_rendimiento'
  | 'mis_evaluaciones'
  | 'tests_disponibles'
  | 'mi_perfil';

interface NavbarProps {
  currentUser: Usuario;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeDeportistaTab: DeportistaTab;
  setActiveDeportistaTab: (tab: DeportistaTab) => void;
  onLogout: () => void;
  onSwitchUser: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeAdminTab,
  setActiveAdminTab,
  activeDeportistaTab,
  setActiveDeportistaTab,
  onLogout,
  onSwitchUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentUser.rol === 'admin';

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'evaluar', label: 'Toma en Vivo', icon: Activity, highlight: true },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'atletas', label: 'Deportistas', icon: Users },
    { id: 'tests', label: 'Tests', icon: Layers },
    { id: 'baremos', label: 'Baremos', icon: FileSpreadsheet },
    { id: 'usuarios', label: 'Usuarios', icon: Shield },
    { id: 'sql', label: 'datos.sql', icon: Database },
  ];

  const deportistaNavItems = [
    { id: 'mi_rendimiento', label: 'Mi Rendimiento', icon: BarChart3 },
    { id: 'mis_evaluaciones', label: 'Mis Evaluaciones', icon: History },
    { id: 'tests_disponibles', label: 'Tests & Baremos', icon: Layers },
    { id: 'mi_perfil', label: 'Mi Ficha', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080D1A]/95 backdrop-blur-md border-b border-[#3A4A76]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#FF6B35] to-[#E85D04] flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
              <Flame className="w-6 h-6 text-[#080D1A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  HOOP<span className="text-[#FF6B35]">METRICS</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C2541] text-[#10B981] border border-[#10B981]/30 font-semibold">
                  PRO 15-20
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#94A3B8] -mt-0.5">
                Evaluación Técnica y Física en Baloncesto
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {isAdmin
              ? adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveAdminTab(item.id as AdminTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isActive
                          ? item.highlight
                            ? 'bg-[#FF6B35] text-[#080D1A] shadow-md shadow-[#FF6B35]/20'
                            : 'bg-[#1C2541] text-[#DBE1FF] border border-[#3A4A76]'
                          : item.highlight
                          ? 'text-[#FF6B35] hover:bg-[#FF6B35]/10'
                          : 'text-[#94A3B8] hover:text-[#DBE1FF] hover:bg-[#0B132B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })
              : deportistaNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDeportistaTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveDeportistaTab(item.id as DeportistaTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1C2541] text-[#DBE1FF] border border-[#3A4A76]'
                          : 'text-[#94A3B8] hover:text-[#DBE1FF] hover:bg-[#0B132B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
          </nav>

          {/* User Status & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">
                {currentUser.nombre}
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {currentUser.rol === 'admin' ? (
                  <span className="text-[#FF6B35] font-semibold">ADMINISTRADOR</span>
                ) : (
                  <span className="text-[#3A86FF] font-semibold">DEPORTISTA</span>
                )}
              </span>
            </div>

            <button
              onClick={onSwitchUser}
              title="Cambiar de Rol / Usuario"
              className="p-2 rounded bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] border border-[#3A4A76]/50 text-xs flex items-center gap-1 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#3A86FF]" />
              <span className="hidden sm:inline font-mono text-[11px]">Cambiar</span>
            </button>

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 rounded bg-[#1C2541] hover:bg-[#690005]/40 text-[#DBE1FF] hover:text-[#ffb4ab] border border-[#3A4A76]/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded bg-[#1C2541] text-[#DBE1FF] border border-[#3A4A76]/50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B132B] border-b border-[#3A4A76] px-4 pt-3 pb-5 space-y-1.5 shadow-2xl">
          <div className="pb-2 border-b border-[#1C2541] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>Usuario: <strong className="text-white">{currentUser.username}</strong></span>
            <span className="px-2 py-0.5 rounded bg-[#1C2541] text-[#FF6B35] uppercase font-bold">
              {currentUser.rol}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {isAdmin
              ? adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveAdminTab(item.id as AdminTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded text-xs font-semibold text-left transition-colors ${
                        isActive
                          ? item.highlight
                            ? 'bg-[#FF6B35] text-[#080D1A]'
                            : 'bg-[#1C2541] text-white border border-[#3A4A76]'
                          : 'bg-[#080D1A] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })
              : deportistaNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDeportistaTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveDeportistaTab(item.id as DeportistaTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded text-xs font-semibold text-left transition-colors ${
                        isActive
                          ? 'bg-[#1C2541] text-white border border-[#3A4A76]'
                          : 'bg-[#080D1A] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </header>
  );
};
