import React, { useState } from 'react';
import { SentidoPuntuacion, TestDeportivo } from '../types/basketball';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

interface TestsCrudProps {
  tests: TestDeportivo[];
  onSaveTest: (test: TestDeportivo) => void;
  onDeleteTest: (id: string) => void;
  onNavigateToBaremos: (testId: string) => void;
}

export const TestsCrud: React.FC<TestsCrudProps> = ({
  tests,
  onSaveTest,
  onDeleteTest,
  onNavigateToBaremos,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestDeportivo | null>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    codigo: string;
    nombre: string;
    categoria: 'Técnico' | 'Agilidad' | 'Velocidad' | 'Potencia' | 'Resistencia';
    unidad: string;
    sentido: SentidoPuntuacion;
    ponderacion: number;
    descripcionProtocolo: string;
    activo: boolean;
  }>({
    codigo: '',
    nombre: '',
    categoria: 'Técnico',
    unidad: 'Aciertos',
    sentido: 'mayor_es_mejor',
    ponderacion: 0.20,
    descripcionProtocolo: '',
    activo: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingTest(null);
    setFormData({
      codigo: '',
      nombre: '',
      categoria: 'Técnico',
      unidad: 'Repeticiones / Segundos',
      sentido: 'mayor_es_mejor',
      ponderacion: 0.20,
      descripcionProtocolo: '',
      activo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: TestDeportivo) => {
    setEditingTest(test);
    setFormData({
      id: test.id,
      codigo: test.codigo,
      nombre: test.nombre,
      categoria: test.categoria,
      unidad: test.unidad,
      sentido: test.sentido,
      ponderacion: test.ponderacion,
      descripcionProtocolo: test.descripcionProtocolo,
      activo: test.activo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombre.trim()) {
      setFormError('El nombre del test es obligatorio.');
      return;
    }
    if (!formData.codigo.trim()) {
      setFormError('El código identificador es obligatorio.');
      return;
    }
    if (formData.ponderacion <= 0 || formData.ponderacion > 1) {
      setFormError('La ponderación debe estar entre 0.01 y 1.00 (ej: 0.25 para 25%).');
      return;
    }

    const testToSave: TestDeportivo = {
      id: formData.id || `test_${Date.now()}`,
      codigo: formData.codigo.trim().toLowerCase().replace(/\s+/g, '_'),
      nombre: formData.nombre.trim(),
      categoria: formData.categoria,
      unidad: formData.unidad.trim(),
      sentido: formData.sentido,
      ponderacion: Number(formData.ponderacion),
      descripcionProtocolo: formData.descripcionProtocolo.trim(),
      activo: formData.activo,
    };

    onSaveTest(testToSave);
    setIsModalOpen(false);
  };

  const totalPonderacion = tests.reduce((acc, t) => acc + (t.activo ? t.ponderacion : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F59E0B]" />
            Batería de Tests Deportivos Específicos
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Configuración de protocolos, unidades de medida y ponderación en el cálculo de rendimiento.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#080D1A] font-bold text-xs sm:text-sm shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Test Deportivo</span>
        </button>
      </div>

      {/* Ponderation status bar */}
      <div className="bg-[#080D1A] border border-[#1C2541] rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#3A86FF]" />
          <span>
            Suma de ponderaciones de tests activos:{' '}
            <strong className={`font-mono ${Math.round(totalPonderacion * 100) === 100 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {Math.round(totalPonderacion * 100)}%
            </strong>
          </span>
        </div>
        <span className="text-[#94A3B8]">
          Fórmula oficial: $PP = \sum (P_i \times w_i)$
        </span>
      </div>

      {/* Tests Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => {
          return (
            <div
              key={test.id}
              className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C2541] text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                    {test.categoria}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#080D1A] px-2 py-0.5 rounded border border-[#1C2541]">
                    Peso: {Math.round(test.ponderacion * 100)}%
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mt-2">
                  {test.nombre}
                </h3>
                <span className="text-[11px] font-mono text-[#94A3B8] block">
                  Código: {test.codigo}
                </span>

                <div className="bg-[#080D1A] rounded p-2.5 my-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Unidad de Medida:</span>
                    <span className="font-mono text-white font-medium">{test.unidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Criterio Escala:</span>
                    <span className="font-mono text-[#10B981] font-medium">
                      {test.sentido === 'mayor_es_mejor' ? '▲ Mayor valor es mejor' : '▼ Menor tiempo es mejor'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] line-clamp-3 italic">
                  {test.descripcionProtocolo}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#1C2541] flex items-center justify-between">
                <button
                  onClick={() => onNavigateToBaremos(test.id)}
                  className="flex items-center gap-1.5 text-xs text-[#3A86FF] hover:underline font-semibold"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ver Baremos</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="p-1.5 rounded bg-[#1C2541] hover:bg-[#F59E0B] text-[#DBE1FF] hover:text-[#080D1A] transition-colors"
                    title="Editar Test"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el test ${test.nombre}?`)) {
                        onDeleteTest(test.id);
                      }
                    }}
                    className="p-1.5 rounded bg-[#1C2541] hover:bg-[#690005] text-[#DBE1FF] hover:text-[#ffb4ab] transition-colors"
                    title="Eliminar Test"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR / EDITAR TEST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-[#F59E0B]" />
              {editingTest ? 'Editar Test Deportivo' : 'Crear Nuevo Test Deportivo'}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Define las especificaciones del protocolo, unidad y ponderación.
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
                  Nombre Oficial del Test *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Salto Vertical CMJ"
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Código Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="ej. salto_cmj"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Categoría de Capacidad *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#F59E0B] focus:outline-none"
                  >
                    <option value="Técnico">Técnico (Tiro/Pase)</option>
                    <option value="Agilidad">Agilidad (Dribling/Cambios)</option>
                    <option value="Velocidad">Velocidad (Sprint)</option>
                    <option value="Potencia">Potencia (Salto/Explosividad)</option>
                    <option value="Resistencia">Resistencia (Anaeróbica)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Unidad de Medida *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    placeholder="ej. Segundos (s), Centímetros (cm)"
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Ponderación (0.05 a 1.0) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="1.00"
                    required
                    value={formData.ponderacion}
                    onChange={(e) =>
                      setFormData({ ...formData, ponderacion: parseFloat(e.target.value) || 0.2 })
                    }
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white font-mono focus:border-[#F59E0B] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#94A3B8]">
                    Equivale a: {Math.round(formData.ponderacion * 100)}% del total
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Criterio de Evaluación *
                </label>
                <select
                  value={formData.sentido}
                  onChange={(e) =>
                    setFormData({ ...formData, sentido: e.target.value as SentidoPuntuacion })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#F59E0B] focus:outline-none"
                >
                  <option value="mayor_es_mejor">Mayor valor medido es mejor (ej. Aciertos, CM de salto)</option>
                  <option value="menor_es_mejor">Menor valor medido es mejor (ej. Segundos de carrera, Fatiga)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Descripción del Protocolo Oficial de Cancha
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcionProtocolo}
                  onChange={(e) => setFormData({ ...formData, descripcionProtocolo: e.target.value })}
                  placeholder="Instrucciones paso a paso para el evaluador en cancha..."
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#F59E0B] focus:outline-none"
                />
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
                  className="px-5 py-2.5 rounded bg-[#F59E0B] hover:bg-[#d97706] text-[#080D1A] font-bold shadow-md"
                >
                  {editingTest ? 'Guardar Cambios' : 'Registrar Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
