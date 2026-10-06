import React, { useState } from 'react';
import { Atleta, PosicionBaloncesto, Sexo, Usuario } from '../types/basketball';
import {
  Shield,
  User,
  Lock,
  Flame,
  AlertCircle,
  UserPlus,
  LogIn,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  usuarios: Usuario[];
  atletas: Atleta[];
  onLoginSuccess: (user: Usuario) => void;
  onRegisterAthlete: (atleta: Atleta, usuario: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  usuarios,
  atletas,
  onLoginSuccess,
  onRegisterAthlete,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Athlete Registration form
  const [regData, setRegData] = useState<{
    nombreCompleto: string;
    documento: string;
    fechaNacimiento: string;
    edad: number;
    sexo: Sexo;
    tallaCm: number;
    pesoKg: number;
    posicion: PosicionBaloncesto;
    categoria: 'Sub-17 (15-16)' | 'Sub-19 (17-18)' | 'Sub-21 (19-20)';
    club: string;
    telefono: string;
    email: string;
    username: string;
    password: string;
  }>({
    nombreCompleto: '',
    documento: '',
    fechaNacimiento: '2008-05-10',
    edad: 18,
    sexo: 'Masculino',
    tallaCm: 188,
    pesoKg: 79,
    posicion: 'Escolta',
    categoria: 'Sub-19 (17-18)',
    club: '',
    telefono: '',
    email: '',
    username: '',
    password: '',
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const user = usuarios.find(
      (u) =>
        (u.username.toLowerCase() === usernameInput.trim().toLowerCase() ||
          u.email.toLowerCase() === usernameInput.trim().toLowerCase()) &&
        u.activo
    );

    if (!user) {
      setErrorMsg('Usuario o correo no encontrado, o cuenta inactiva.');
      return;
    }

    if (user.password && user.password !== passwordInput.trim()) {
      setErrorMsg('Contraseña incorrecta.');
      return;
    }

    onLoginSuccess(user);
  };

  const handleQuickLogin = (username: string) => {
    const user = usuarios.find((u) => u.username === username);
    if (user) {
      onLoginSuccess(user);
    }
  };

  const handleFechaNacimientoChange = (fechaStr: string) => {
    const birthYear = new Date(fechaStr).getFullYear();
    const currentYear = 2026;
    const calculatedAge = currentYear - birthYear;

    let cat: 'Sub-17 (15-16)' | 'Sub-19 (17-18)' | 'Sub-21 (19-20)' = 'Sub-17 (15-16)';
    if (calculatedAge >= 19) cat = 'Sub-21 (19-20)';
    else if (calculatedAge >= 17) cat = 'Sub-19 (17-18)';

    setRegData((prev) => ({
      ...prev,
      fechaNacimiento: fechaStr,
      edad: calculatedAge,
      categoria: cat,
    }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (regData.edad < 15 || regData.edad > 20) {
      setErrorMsg('La edad del deportista debe estar estrictamente entre 15 y 20 años.');
      return;
    }

    const usernameExists = usuarios.some(
      (u) => u.username.toLowerCase() === regData.username.trim().toLowerCase()
    );
    if (usernameExists) {
      setErrorMsg('El nombre de usuario ya está en uso. Por favor elige otro.');
      return;
    }

    const newAtletaId = `atl_${Date.now()}`;
    const newAtleta: Atleta = {
      id: newAtletaId,
      nombreCompleto: regData.nombreCompleto.trim(),
      documento: regData.documento.trim(),
      fechaNacimiento: regData.fechaNacimiento,
      edad: Number(regData.edad),
      sexo: regData.sexo,
      tallaCm: Number(regData.tallaCm),
      pesoKg: Number(regData.pesoKg),
      posicion: regData.posicion,
      categoria: regData.categoria,
      club: regData.club.trim() || undefined,
      telefono: regData.telefono.trim() || undefined,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    const newUsuario: Usuario = {
      id: `usr_${Date.now()}`,
      username: regData.username.trim().toLowerCase(),
      password: regData.password.trim(),
      nombre: regData.nombreCompleto.trim(),
      email: regData.email.trim(),
      rol: 'deportista',
      atletaId: newAtletaId,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    onRegisterAthlete(newAtleta, newUsuario);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#0B132B] border border-[#3A4A76] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/15 blur-3xl rounded-full pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E85D04] mx-auto flex items-center justify-center shadow-lg shadow-[#FF6B35]/20 mb-3">
            <Flame className="w-7 h-7 text-[#080D1A]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            HOOP<span className="text-[#FF6B35]">METRICS</span> PRO
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Sistema de Evaluación del Rendimiento Deportivo en Baloncesto (15-20 Años)
          </p>
        </div>

        {/* Mode Selector (Login vs Registro) */}
        <div className="flex rounded-lg bg-[#080D1A] p-1 border border-[#1C2541] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#1C2541] text-white shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#1C2541] text-white shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registro de Deportista</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#DBE1FF] font-semibold mb-1">
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="ej. admin o carlos.mendoza"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#DBE1FF] font-semibold mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-extrabold text-sm shadow-lg shadow-[#FF6B35]/20 transition-all"
            >
              Ingresar al Sistema
            </button>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 mt-2 border-t border-[#1C2541]">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block text-center mb-2">
                Acceso Rápido con Cuentas Demo Oficiales:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-2 rounded bg-[#1C2541] hover:bg-[#243054] text-center border border-[#3A4A76]/50 transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#FF6B35] font-bold block">
                    ADMIN
                  </span>
                  <span className="text-[11px] text-white truncate block">admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('carlos.mendoza')}
                  className="p-2 rounded bg-[#1C2541] hover:bg-[#243054] text-center border border-[#3A4A76]/50 transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#3A86FF] font-bold block">
                    ATLETA (18a)
                  </span>
                  <span className="text-[11px] text-white truncate block">carlos.m</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('sofia.rodriguez')}
                  className="p-2 rounded bg-[#1C2541] hover:bg-[#243054] text-center border border-[#3A4A76]/50 transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#10B981] font-bold block">
                    ATLETA (17a)
                  </span>
                  <span className="text-[11px] text-white truncate block">sofia.r</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE: ATHLETE REGISTRATION */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-[#DBE1FF] font-semibold mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={regData.nombreCompleto}
                onChange={(e) => setRegData({ ...regData, nombreCompleto: e.target.value })}
                placeholder="Ej. Santiago Ramos"
                className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Documento / Cédula *
                </label>
                <input
                  type="text"
                  required
                  value={regData.documento}
                  onChange={(e) => setRegData({ ...regData, documento: e.target.value })}
                  placeholder="1098..."
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Sexo Biológico *
                </label>
                <select
                  value={regData.sexo}
                  onChange={(e) => setRegData({ ...regData, sexo: e.target.value as Sexo })}
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={regData.fechaNacimiento}
                  onChange={(e) => handleFechaNacimientoChange(e.target.value)}
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Edad Calculada (15 - 20) *
                </label>
                <input
                  type="number"
                  min="15"
                  max="20"
                  readOnly
                  value={regData.edad}
                  className="w-full bg-[#080D1A] border border-[#3A4A76] rounded p-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Talla (cm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="140"
                  max="235"
                  required
                  value={regData.tallaCm}
                  onChange={(e) =>
                    setRegData({ ...regData, tallaCm: parseFloat(e.target.value) || 170 })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="150"
                  required
                  value={regData.pesoKg}
                  onChange={(e) =>
                    setRegData({ ...regData, pesoKg: parseFloat(e.target.value) || 70 })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Posición *
                </label>
                <select
                  value={regData.posicion}
                  onChange={(e) =>
                    setRegData({ ...regData, posicion: e.target.value as PosicionBaloncesto })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
                >
                  <option value="Base">Base</option>
                  <option value="Escolta">Escolta</option>
                  <option value="Alero">Alero</option>
                  <option value="Ala-Pívot">Ala-Pívot</option>
                  <option value="Pívot">Pívot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Usuario para Acceso *
                </label>
                <input
                  type="text"
                  required
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  placeholder="ej. santiago.ramos"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#DBE1FF] font-semibold mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                placeholder="deportista@ejemplo.com"
                className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#3A86FF] hover:bg-[#2563eb] text-white font-bold text-sm shadow-lg transition-all mt-3"
            >
              Completar Registro y Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
