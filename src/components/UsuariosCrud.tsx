import React, { useState } from 'react';
import { Atleta, RolUsuario, Usuario } from '../types/basketball';
import {
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  UserCheck,
  AlertCircle,
  X,
  Key,
} from 'lucide-react';

interface UsuariosCrudProps {
  usuarios: Usuario[];
  atletas: Atleta[];
  currentUserId: string;
  onSaveUsuario: (usuario: Usuario) => void;
  onDeleteUsuario: (id: string) => void;
}

export const UsuariosCrud: React.FC<UsuariosCrudProps> = ({
  usuarios,
  atletas,
  currentUserId,
  onSaveUsuario,
  onDeleteUsuario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    nombre: string;
    username: string;
    password?: string;
    email: string;
    rol: RolUsuario;
    atletaId?: string;
    activo: boolean;
  }>({
    nombre: '',
    username: '',
    password: '',
    email: '',
    rol: 'deportista',
    atletaId: '',
    activo: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const filteredUsuarios = usuarios.filter((u) => {
    return (
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setFormData({
      nombre: '',
      username: '',
      password: '',
      email: '',
      rol: 'deportista',
      atletaId: '',
      activo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setFormData({
      id: user.id,
      nombre: user.nombre,
      username: user.username,
      password: user.password || '',
      email: user.email,
      rol: user.rol,
      atletaId: user.atletaId || '',
      activo: user.activo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('El correo electrónico es obligatorio.');
      return;
    }
    if (!editingUsuario && !formData.password?.trim()) {
      setFormError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    // Check username uniqueness
    const usernameExists = usuarios.some(
      (u) => u.username.toLowerCase() === formData.username.trim().toLowerCase() && u.id !== formData.id
    );
    if (usernameExists) {
      setFormError('El nombre de usuario ya está en uso.');
      return;
    }

    const userToSave: Usuario = {
      id: formData.id || `usr_${Date.now()}`,
      nombre: formData.nombre.trim(),
      username: formData.username.trim(),
      password: formData.password ? formData.password.trim() : editingUsuario?.password || '123456',
      email: formData.email.trim(),
      rol: formData.rol,
      atletaId: formData.rol === 'deportista' && formData.atletaId ? formData.atletaId : undefined,
      activo: formData.activo,
      creadoEn: editingUsuario ? editingUsuario.creadoEn : new Date().toISOString(),
    };

    onSaveUsuario(userToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#3A86FF]" />
            Control de Acceso y Usuarios del Sistema
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Administración de cuentas de entrenadores/administradores y portales de deportistas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3A86FF] hover:bg-[#2563eb] text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:border-[#3A86FF] focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C2541] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#3A4A76]/40">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Atleta Vinculado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2541]">
              {filteredUsuarios.map((u) => {
                const linkedAtleta = atletas.find((a) => a.id === u.atletaId);
                const isCurrent = u.id === currentUserId;

                return (
                  <tr key={u.id} className="hover:bg-[#1C2541]/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {u.nombre}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] font-mono text-[#10B981] font-bold">
                          (Tú)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#DBE1FF]">
                      @{u.username}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          u.rol === 'admin'
                            ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40'
                            : 'bg-[#3A86FF]/20 text-[#3A86FF] border border-[#3A86FF]/40'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#DBE1FF]">
                      {linkedAtleta ? (
                        <span className="flex items-center gap-1 text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                          {linkedAtleta.nombreCompleto}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          u.activo
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : 'bg-[#94A3B8]/15 text-[#94A3B8]'
                        }`}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Usuario"
                          className="p-1.5 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-[#DBE1FF] hover:text-white transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al usuario ${u.username}?`)) {
                                onDeleteUsuario(u.id);
                              }
                            }}
                            title="Eliminar Usuario"
                            className="p-1.5 rounded bg-[#1C2541] hover:bg-[#690005] text-[#DBE1FF] hover:text-[#ffb4ab] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR / CREAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[#3A86FF]" />
              {editingUsuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Configura los permisos de acceso y credenciales de autenticación.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Entrenador Carlos Ruiz"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Nombre de Usuario (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="ej. cruiz"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@baloncesto.com"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Contraseña {editingUsuario ? '(dejar en blanco para conservar)' : '*'}
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUsuario ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Rol en el Sistema *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value as RolUsuario })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#3A86FF] focus:outline-none"
                  >
                    <option value="admin">Administrador (Director/Coach)</option>
                    <option value="deportista">Deportista (Jugador)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Estado de Cuenta
                  </label>
                  <select
                    value={formData.activo ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.value === 'true' })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#3A86FF] focus:outline-none"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              {formData.rol === 'deportista' && (
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Vincular a Ficha de Deportista
                  </label>
                  <select
                    value={formData.atletaId || ''}
                    onChange={(e) => setFormData({ ...formData, atletaId: e.target.value })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#3A86FF] focus:outline-none"
                  >
                    <option value="">-- Sin Vincular / Seleccionar Atleta --</option>
                    {atletas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombreCompleto} ({a.documento})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C2541]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-[#1C2541] text-[#DBE1FF] hover:bg-[#243054]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-[#3A86FF] hover:bg-[#2563eb] text-white font-bold shadow-md"
                >
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
