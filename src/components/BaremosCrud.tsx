import React, { useState } from 'react';
import { Baremo, RangoBaremo, Sexo, TestDeportivo } from '../types/basketball';
import {
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  X,
  Layers,
  ChevronDown,
  Save,
} from 'lucide-react';

interface BaremosCrudProps {
  baremos: Baremo[];
  tests: TestDeportivo[];
  selectedTestIdInitial?: string;
  onSaveBaremo: (baremo: Baremo) => void;
  onDeleteBaremo: (id: string) => void;
}

export const BaremosCrud: React.FC<BaremosCrudProps> = ({
  baremos,
  tests,
  selectedTestIdInitial,
  onSaveBaremo,
  onDeleteBaremo,
}) => {
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>(
    selectedTestIdInitial || (tests[0]?.id || '')
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBaremo, setEditingBaremo] = useState<Baremo | null>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    testId: string;
    sexo: Sexo | 'Ambos';
    rangoEdad: '15-17' | '18-20' | '15-20';
    rangos: RangoBaremo[];
  }>({
    testId: tests[0]?.id || '',
    sexo: 'Masculino',
    rangoEdad: '15-20',
    rangos: [
      { nivel: 'Élite', puntaje: 5, min: 16, max: 20, colorHex: '#10B981', descripcion: 'Sobresaliente' },
      { nivel: 'Alto Rendimiento', puntaje: 4, min: 13, max: 15, colorHex: '#3A86FF', descripcion: 'Excelente' },
      { nivel: 'Intermedio', puntaje: 3, min: 10, max: 12, colorHex: '#F59E0B', descripcion: 'Promedio' },
      { nivel: 'Oportunidad de Mejora', puntaje: 2, min: 7, max: 9, colorHex: '#FF6B35', descripcion: 'En desarrollo' },
      { nivel: 'Etapa Inicial', puntaje: 1, min: 0, max: 6, colorHex: '#94A3B8', descripcion: 'Inicial' },
    ],
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filtered baremos for the selected test
  const currentBaremos = baremos.filter((b) => b.testId === selectedTestFilter);
  const currentTest = tests.find((t) => t.id === selectedTestFilter);

  const handleOpenCreate = () => {
    setEditingBaremo(null);
    setFormData({
      testId: selectedTestFilter || (tests[0]?.id || ''),
      sexo: 'Masculino',
      rangoEdad: '15-20',
      rangos: [
        { nivel: 'Élite', puntaje: 5, min: 0, max: 0, colorHex: '#10B981', descripcion: 'Nivel Élite' },
        { nivel: 'Alto Rendimiento', puntaje: 4, min: 0, max: 0, colorHex: '#3A86FF', descripcion: 'Alto Rendimiento' },
        { nivel: 'Intermedio', puntaje: 3, min: 0, max: 0, colorHex: '#F59E0B', descripcion: 'Nivel Intermedio' },
        { nivel: 'Oportunidad de Mejora', puntaje: 2, min: 0, max: 0, colorHex: '#FF6B35', descripcion: 'Oportunidad de Mejora' },
        { nivel: 'Etapa Inicial', puntaje: 1, min: 0, max: 0, colorHex: '#94A3B8', descripcion: 'Etapa Inicial' },
      ],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (baremo: Baremo) => {
    setEditingBaremo(baremo);
    setFormData({
      id: baremo.id,
      testId: baremo.testId,
      sexo: baremo.sexo,
      rangoEdad: baremo.rangoEdad,
      rangos: JSON.parse(JSON.stringify(baremo.rangos)),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleUpdateRango = (index: number, field: keyof RangoBaremo, value: any) => {
    setFormData((prev) => {
      const copy = [...prev.rangos];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, rangos: copy };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const baremoToSave: Baremo = {
      id: formData.id || `bar_${Date.now()}`,
      testId: formData.testId,
      sexo: formData.sexo,
      rangoEdad: formData.rangoEdad,
      rangos: formData.rangos,
    };

    onSaveBaremo(baremoToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#10B981]" />
            Baremos Oficiales y Escalas de Calificación
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Tablas de referencia normativa para clasificar el rendimiento por sexo y rangos de edad (15-20 años).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#080D1A] font-bold text-xs sm:text-sm shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Configurar Nuevo Baremo</span>
        </button>
      </div>

      {/* Test Selector Tabs */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-[#94A3B8] font-mono uppercase px-2 font-semibold">
          Test Seleccionado:
        </span>
        {tests.map((test) => {
          const isSelected = selectedTestFilter === test.id;
          return (
            <button
              key={test.id}
              onClick={() => setSelectedTestFilter(test.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#FF6B35] text-[#080D1A] font-bold shadow'
                  : 'bg-[#1C2541] text-[#DBE1FF] hover:bg-[#243054]'
              }`}
            >
              {test.nombre}
            </button>
          );
        })}
      </div>

      {/* Selected Test Information */}
      {currentTest && (
        <div className="bg-[#080D1A] border border-[#1C2541] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="text-white font-bold text-sm">
              {currentTest.nombre} ({currentTest.unidad})
            </h4>
            <p className="text-[#94A3B8] mt-0.5">
              Sentido de clasificación:{' '}
              <strong className="text-[#10B981]">
                {currentTest.sentido === 'mayor_es_mejor' ? 'Mayor valor es mejor' : 'Menor tiempo/valor es mejor'}
              </strong>{' '}
              · Ponderación en Promedio General: <strong className="text-white">{Math.round(currentTest.ponderacion * 100)}%</strong>
            </p>
          </div>
          <span className="text-xs font-mono text-[#3A86FF] bg-[#1C2541] px-3 py-1.5 rounded-lg self-start sm:self-auto">
            {currentBaremos.length} baremo(s) configurado(s)
          </span>
        </div>
      )}

      {/* Baremos Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentBaremos.length === 0 ? (
          <div className="lg:col-span-2 bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-8 text-center text-sm text-[#94A3B8]">
            No hay baremos configurados para este test. Haz clic en "Configurar Nuevo Baremo" arriba.
          </div>
        ) : (
          currentBaremos.map((baremo) => {
            return (
              <div
                key={baremo.id}
                className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#1C2541] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        baremo.sexo === 'Masculino'
                          ? 'bg-[#3A86FF]/20 text-[#3A86FF]'
                          : baremo.sexo === 'Femenino'
                          ? 'bg-[#ff6b35]/20 text-[#ff6b35]'
                          : 'bg-[#10B981]/20 text-[#10B981]'
                      }`}
                    >
                      {baremo.sexo}
                    </span>
                    <span className="text-xs font-mono text-white bg-[#1C2541] px-2 py-0.5 rounded font-bold">
                      {baremo.rangoEdad} años
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(baremo)}
                      className="p-1.5 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-[#DBE1FF] hover:text-white transition-colors"
                      title="Editar Rangos"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este baremo?')) {
                          onDeleteBaremo(baremo.id);
                        }
                      }}
                      className="p-1.5 rounded bg-[#1C2541] hover:bg-[#690005] text-[#DBE1FF] hover:text-[#ffb4ab] transition-colors"
                      title="Eliminar Baremo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Table of Levels */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1C2541]/50 text-[#94A3B8] font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Nivel</th>
                        <th className="py-2 px-3">Pts</th>
                        <th className="py-2 px-3">Rango ({currentTest?.unidad})</th>
                        <th className="py-2 px-3">Interpretación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2541]">
                      {baremo.rangos.map((r, idx) => (
                        <tr key={idx} className="hover:bg-[#1C2541]/20">
                          <td className="py-2.5 px-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                              style={{
                                color: r.colorHex,
                                backgroundColor: `${r.colorHex}1A`,
                                border: `1px solid ${r.colorHex}40`,
                              }}
                            >
                              {r.nivel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">
                            {r.puntaje}.0
                          </td>
                          <td className="py-2.5 px-3 font-mono text-white">
                            {r.min} — {r.max}
                          </td>
                          <td className="py-2.5 px-3 text-[#94A3B8] text-[11px]">
                            {r.descripcion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL EDITAR / CREAR BAREMO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-5 h-5 text-[#10B981]" />
              {editingBaremo ? 'Editar Umbrales del Baremo' : 'Crear Nuevo Baremo'}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Calibra las marcas mínimas y máximas para cada uno de los 5 niveles de rendimiento.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Test Asignado *
                  </label>
                  <select
                    value={formData.testId}
                    onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#10B981] focus:outline-none"
                  >
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Sexo Biológico *
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#10B981] focus:outline-none"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Ambos">Ambos (Unisex)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#DBE1FF] font-semibold mb-1">
                    Rango de Edad *
                  </label>
                  <select
                    value={formData.rangoEdad}
                    onChange={(e) => setFormData({ ...formData, rangoEdad: e.target.value as any })}
                    className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2.5 text-white focus:border-[#10B981] focus:outline-none"
                  >
                    <option value="15-20">15 - 20 años (General)</option>
                    <option value="15-17">15 - 17 años (Sub-17)</option>
                    <option value="18-20">18 - 20 años (Sub-19 / Sub-21)</option>
                  </select>
                </div>
              </div>

              {/* Editable Levels Matrix */}
              <div className="border border-[#1C2541] rounded-lg overflow-hidden">
                <div className="bg-[#1C2541] p-2.5 text-white font-mono text-[11px] font-semibold flex justify-between">
                  <span>Ajuste de Límites Numéricos</span>
                  <span className="text-[#94A3B8]">Unidad: {currentTest?.unidad}</span>
                </div>

                <div className="p-3 space-y-3 bg-[#080D1A]">
                  {formData.rangos.map((rango, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#0B132B] p-2.5 rounded border border-[#1C2541]"
                    >
                      <div className="col-span-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold block text-center"
                          style={{
                            color: rango.colorHex,
                            backgroundColor: `${rango.colorHex}20`,
                          }}
                        >
                          {rango.nivel} (5 pts)
                        </span>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-[#94A3B8] block">Mínimo</label>
                        <input
                          type="number"
                          step="0.01"
                          value={rango.min}
                          onChange={(e) =>
                            handleUpdateRango(idx, 'min', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-1.5 text-white font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-[#94A3B8] block">Máximo</label>
                        <input
                          type="number"
                          step="0.01"
                          value={rango.max}
                          onChange={(e) =>
                            handleUpdateRango(idx, 'max', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-1.5 text-white font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-[#94A3B8] block">Descripción</label>
                        <input
                          type="text"
                          value={rango.descripcion}
                          onChange={(e) => handleUpdateRango(idx, 'descripcion', e.target.value)}
                          className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-1.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#10B981] hover:bg-[#059669] text-[#080D1A] font-bold shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Baremo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
