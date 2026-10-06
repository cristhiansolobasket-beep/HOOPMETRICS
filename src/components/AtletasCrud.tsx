import React, { useState } from 'react';
import { Atleta, PosicionBaloncesto, Sexo } from '../types/basketball';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Activity,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Ruler,
  Weight,
  Calendar,
} from 'lucide-react';

interface AtletasCrudProps {
  atletas: Atleta[];
  onSaveAtleta: (atleta: Atleta) => void;
  onDeleteAtleta: (id: string) => void;
  onStartEvaluation: (atleta: Atleta) => void;
}

export const AtletasCrud: React.FC<AtletasCrudProps> = ({
  atletas,
  onSaveAtleta,
  onDeleteAtleta,
  onStartEvaluation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSexo, setSelectedSexo] = useState<'Todos' | Sexo>('Todos');
  const [selectedPosicion, setSelectedPosicion] = useState<string>('Todas');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtleta, setEditingAtleta] = useState<Atleta | null>(null);
  const [viewingAtleta, setViewingAtleta] = useState<Atleta | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    nombreCompleto: string;
    documento: string;
    fechaNacimiento: string;
    edad: number;
    sexo: Sexo;
    tallaCm: number;
    pesoKg: number;
    envergaduraCm?: number;
    posicion: PosicionBaloncesto;
    categoria: 'Sub-17 (15-16)' | 'Sub-19 (17-18)' | 'Sub-21 (19-20)';
    telefono?: string;
    club?: string;
    activo: boolean;
  }>({
    nombreCompleto: '',
    documento: '',
    fechaNacimiento: '2008-01-01',
    edad: 18,
    sexo: 'Masculino',
    tallaCm: 185,
    pesoKg: 78,
    envergaduraCm: 190,
    posicion: 'Escolta',
    categoria: 'Sub-19 (17-18)',
    telefono: '',
    club: '',
    activo: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filtered atletas
  const filteredAtletas = atletas.filter((atleta) => {
    const matchesSearch =
      atleta.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.documento.includes(searchTerm) ||
      (atleta.club && atleta.club.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSexo = selectedSexo === 'Todos' || atleta.sexo === selectedSexo;
    const matchesPos = selectedPosicion === 'Todas' || atleta.posicion === selectedPosicion;

    return matchesSearch && matchesSexo && matchesPos;
  });

  const handleOpenCreateModal = () => {
    setEditingAtleta(null);
    setFormData({
      nombreCompleto: '',
      documento: '',
      fechaNacimiento: '2009-01-01',
      edad: 17,
      sexo: 'Masculino',
      tallaCm: 185,
      pesoKg: 75,
      envergaduraCm: 189,
      posicion: 'Escolta',
      categoria: 'Sub-17 (15-16)',
      telefono: '',
      club: '',
      activo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (atleta: Atleta) => {
    setEditingAtleta(atleta);
    setFormData({
      id: atleta.id,
      nombreCompleto: atleta.nombreCompleto,
      documento: atleta.documento,
      fechaNacimiento: atleta.fechaNacimiento,
      edad: atleta.edad,
      sexo: atleta.sexo,
      tallaCm: atleta.tallaCm,
      pesoKg: atleta.pesoKg,
      envergaduraCm: atleta.envergaduraCm,
      posicion: atleta.posicion,
      categoria: atleta.categoria,
      telefono: atleta.telefono || '',
      club: atleta.club || '',
      activo: atleta.activo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFechaNacimientoChange = (fechaStr: string) => {
    const birthYear = new Date(fechaStr).getFullYear();
    const currentYear = 2026; // Reference time
    const calculatedAge = currentYear - birthYear;

    let cat: 'Sub-17 (15-16)' | 'Sub-19 (17-18)' | 'Sub-21 (19-20)' = 'Sub-17 (15-16)';
    if (calculatedAge >= 19) cat = 'Sub-21 (19-20)';
    else if (calculatedAge >= 17) cat = 'Sub-19 (17-18)';

    setFormData((prev) => ({
      ...prev,
      fechaNacimiento: fechaStr,
      edad: calculatedAge,
      categoria: cat,
    }));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombreCompleto.trim()) {
      setFormError('El nombre completo es obligatorio.');
      return;
    }
    if (!formData.documento.trim()) {
      setFormError('El número de documento es obligatorio.');
      return;
    }
    if (formData.edad < 15 || formData.edad > 20) {
      setFormError('La edad del deportista debe estar estrictamente entre 15 y 20 años.');
      return;
    }
    if (formData.tallaCm < 140 || formData.tallaCm > 235) {
      setFormError('Por favor ingresa una talla válida en centímetros (140 - 235 cm).');
      return;
    }
    if (formData.pesoKg < 40 || formData.pesoKg > 150) {
      setFormError('Por favor ingresa un peso válido en kilogramos (40 - 150 kg).');
      return;
    }

    const atletaToSave: Atleta = {
      id: formData.id || `atl_${Date.now()}`,
      nombreCompleto: formData.nombreCompleto.trim(),
      documento: formData.documento.trim(),
      fechaNacimiento: formData.fechaNacimiento,
      edad: Number(formData.edad),
      sexo: formData.sexo,
      tallaCm: Number(formData.tallaCm),
      pesoKg: Number(formData.pesoKg),
      envergaduraCm: formData.envergaduraCm ? Number(formData.envergaduraCm) : undefined,
      posicion: formData.posicion,
      categoria: formData.categoria,
      telefono: formData.telefono?.trim() || undefined,
      club: formData.club?.trim() || undefined,
      activo: formData.activo,
      creadoEn: editingAtleta ? editingAtleta.creadoEn : new Date().toISOString(),
    };

    onSaveAtleta(atletaToSave);
    setIsModalOpen(false);
  };

  const calculateIMC = (peso: number, tallaCm: number) => {
    if (!peso || !tallaCm) return '0.0';
    const m = tallaCm / 100;
    return (peso / (m * m)).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6B35]" />
            Directorio y Fichas de Deportistas
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Gestión integral de jugadores juveniles (15 a 20 años) con datos antropométricos.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-bold text-xs sm:text-sm shadow-md shadow-[#FF6B35]/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Deportista</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        {/* Filter Sexo */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={selectedSexo}
            onChange={(e) => setSelectedSexo(e.target.value as any)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="Todos">Todos los Géneros</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        {/* Filter Posicion */}
        <div>
          <select
            value={selectedPosicion}
            onChange={(e) => setSelectedPosicion(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="Todas">Todas las Posiciones</option>
            <option value="Base">Base</option>
            <option value="Escolta">Escolta</option>
            <option value="Alero">Alero</option>
            <option value="Ala-Pívot">Ala-Pívot</option>
            <option value="Pívot">Pívot</option>
          </select>
        </div>
      </div>

      {/* PC VIEW: Data Table */}
      <div className="hidden lg:block bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1C2541] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#3A4A76]/40">
            <tr>
              <th className="py-3 px-4">Deportista</th>
              <th className="py-3 px-4">Doc / ID</th>
              <th className="py-3 px-4">Edad & Cat.</th>
              <th className="py-3 px-4">Sexo</th>
              <th className="py-3 px-4">Posición</th>
              <th className="py-3 px-4">Talla / Peso</th>
              <th className="py-3 px-4">IMC</th>
              <th className="py-3 px-4">Club</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2541]">
            {filteredAtletas.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#94A3B8]">
                  No se encontraron deportistas con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredAtletas.map((a) => {
                const imc = calculateIMC(a.pesoKg, a.tallaCm);
                return (
                  <tr key={a.id} className="hover:bg-[#1C2541]/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {a.nombreCompleto}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                      {a.documento}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white font-bold">{a.edad} años</span>
                      <span className="block text-[10px] text-[#94A3B8]">{a.categoria}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          a.sexo === 'Masculino'
                            ? 'bg-[#3A86FF]/15 text-[#3A86FF] border border-[#3A86FF]/30'
                            : 'bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/30'
                        }`}
                      >
                        {a.sexo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#DBE1FF]">
                      {a.posicion}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">
                      {a.tallaCm} cm · {a.pesoKg} kg
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#10B981] font-semibold">
                      {imc}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8] max-w-[130px] truncate">
                      {a.club || 'Sin club'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartEvaluation(a)}
                          title="Tomar Evaluación en Cancha"
                          className="p-1.5 rounded bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-[#080D1A] transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewingAtleta(a)}
                          title="Ver Ficha Antropométrica"
                          className="p-1.5 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-[#DBE1FF] hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          title="Editar Datos"
                          className="p-1.5 rounded bg-[#1C2541] hover:bg-[#F59E0B] text-[#DBE1FF] hover:text-[#080D1A] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar a ${a.nombreCompleto}?`)) {
                              onDeleteAtleta(a.id);
                            }
                          }}
                          title="Eliminar Deportista"
                          className="p-1.5 rounded bg-[#1C2541] hover:bg-[#ffb4ab] text-[#DBE1FF] hover:text-[#690005] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Touch Adaptive Cards */}
      <div className="lg:hidden space-y-3">
        {filteredAtletas.length === 0 ? (
          <div className="bg-[#0B132B] p-6 text-center text-sm text-[#94A3B8] rounded-xl border border-[#3A4A76]/40">
            No se encontraron deportistas registrados.
          </div>
        ) : (
          filteredAtletas.map((a) => {
            const imc = calculateIMC(a.pesoKg, a.tallaCm);
            return (
              <div
                key={a.id}
                className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {a.nombreCompleto}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-[#94A3B8]">
                        Doc: {a.documento}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          a.sexo === 'Masculino'
                            ? 'bg-[#3A86FF]/15 text-[#3A86FF]'
                            : 'bg-[#ff6b35]/15 text-[#ff6b35]'
                        }`}
                      >
                        {a.sexo}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#1C2541] text-[#FF6B35] font-mono text-xs font-bold border border-[#3A4A76]">
                    {a.posicion}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#080D1A] p-2.5 rounded-lg text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">EDAD</span>
                    <span className="font-bold text-white">{a.edad} años</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">TALLA / PESO</span>
                    <span className="font-bold text-white">{a.tallaCm}cm / {a.pesoKg}kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">IMC</span>
                    <span className="font-bold text-[#10B981]">{imc}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1">
                  <span>Club: <strong className="text-white">{a.club || 'Sin club'}</strong></span>
                </div>

                {/* Mobile Touch Action Buttons (min 44px height for field touch) */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1C2541]">
                  <button
                    onClick={() => onStartEvaluation(a)}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded bg-[#FF6B35] text-[#080D1A] font-bold text-xs shadow"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Evaluar</span>
                  </button>
                  <button
                    onClick={() => setViewingAtleta(a)}
                    className="flex items-center justify-center py-2.5 rounded bg-[#1C2541] text-[#DBE1FF] text-xs font-medium border border-[#3A4A76]"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(a)}
                    className="flex items-center justify-center py-2.5 rounded bg-[#1C2541] text-[#DBE1FF] text-xs font-medium border border-[#3A4A76]"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: REGISTRAR / EDITAR DEPORTISTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-[#FF6B35]" />
              {editingAtleta ? 'Editar Datos del Deportista' : 'Registrar Nuevo Deportista'}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Completa la información antropométrica y deportiva oficial (15 a 20 años).
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Ej. Juan Andrés Pérez"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Número de Documento / Cédula *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="Ej. 1098234561"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Fecha Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleFechaNacimientoChange(e.target.value)}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Edad (15 - 20) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="20"
                    required
                    value={formData.edad}
                    onChange={(e) =>
                      setFormData({ ...formData, edad: parseInt(e.target.value) || 15 })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Sexo Biológico *
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value as Sexo })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    value={formData.tallaCm}
                    onChange={(e) =>
                      setFormData({ ...formData, tallaCm: parseFloat(e.target.value) || 170 })
                    }
                    placeholder="188"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
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
                    value={formData.pesoKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoKg: parseFloat(e.target.value) || 70 })
                    }
                    placeholder="80.5"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Envergadura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.envergaduraCm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        envergaduraCm: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ej. 195"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Posición en Cancha *
                  </label>
                  <select
                    value={formData.posicion}
                    onChange={(e) =>
                      setFormData({ ...formData, posicion: e.target.value as PosicionBaloncesto })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  >
                    <option value="Base">Base (Point Guard - 1)</option>
                    <option value="Escolta">Escolta (Shooting Guard - 2)</option>
                    <option value="Alero">Alero (Small Forward - 3)</option>
                    <option value="Ala-Pívot">Ala-Pívot (Power Forward - 4)</option>
                    <option value="Pívot">Pívot (Center - 5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Categoría Formativa *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value as any })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  >
                    <option value="Sub-17 (15-16)">Sub-17 (15 - 16 años)</option>
                    <option value="Sub-19 (17-18)">Sub-19 (17 - 18 años)</option>
                    <option value="Sub-21 (19-20)">Sub-21 (19 - 20 años)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Club / Equipo
                  </label>
                  <input
                    type="text"
                    value={formData.club || ''}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    placeholder="Nombre del club o colegio"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+57 300 123 4567"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>
              </div>

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
                  className="px-5 py-2.5 rounded bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-bold shadow-md shadow-[#FF6B35]/20"
                >
                  {editingAtleta ? 'Guardar Cambios' : 'Registrar Deportista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER FICHA ANTROPOMÉTRICA COMPLETA */}
      {viewingAtleta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setViewingAtleta(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold text-lg font-mono">
                {viewingAtleta.posicion.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {viewingAtleta.nombreCompleto}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {viewingAtleta.posicion} · {viewingAtleta.categoria} · {viewingAtleta.sexo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#080D1A] p-4 rounded-xl border border-[#1C2541] text-center font-mono my-4">
              <div>
                <span className="text-[10px] text-[#94A3B8] block">ESTATURA</span>
                <span className="text-base font-bold text-white">{viewingAtleta.tallaCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">PESO</span>
                <span className="text-base font-bold text-white">{viewingAtleta.pesoKg} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">IMC</span>
                <span className="text-base font-bold text-[#10B981]">
                  {calculateIMC(viewingAtleta.pesoKg, viewingAtleta.tallaCm)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">ENVERGADURA</span>
                <span className="text-base font-bold text-[#3A86FF]">
                  {viewingAtleta.envergaduraCm ? `${viewingAtleta.envergaduraCm} cm` : 'N/D'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#1C2541] pt-3">
              <div className="flex justify-between py-1 border-b border-[#1C2541]">
                <span className="text-[#94A3B8]">Documento:</span>
                <span className="font-mono text-white">{viewingAtleta.documento}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C2541]">
                <span className="text-[#94A3B8]">Fecha Nacimiento:</span>
                <span className="font-mono text-white">{viewingAtleta.fechaNacimiento} ({viewingAtleta.edad} años)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C2541]">
                <span className="text-[#94A3B8]">Club / Academia:</span>
                <span className="text-white">{viewingAtleta.club || 'Sin club'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">Contacto:</span>
                <span className="text-white">{viewingAtleta.telefono || 'Sin teléfono'}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  const target = viewingAtleta;
                  setViewingAtleta(null);
                  onStartEvaluation(target);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FF6B35] text-[#080D1A] font-bold text-xs shadow-md shadow-[#FF6B35]/20"
              >
                <Activity className="w-4 h-4" />
                <span>Evaluar a este Atleta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
