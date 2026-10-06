import React, { useState } from 'react';
import { Atleta, Evaluacion, NivelRendimiento } from '../types/basketball';
import { RadarChart } from './RadarChart';
import {
  History,
  Search,
  Calendar,
  Filter,
  Eye,
  Trash2,
  Printer,
  X,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface HistorialEvaluacionesProps {
  evaluaciones: Evaluacion[];
  atletas: Atleta[];
  selectedEvaluacionInitial?: Evaluacion | null;
  onDeleteEvaluacion: (id: string) => void;
  onStartNewEvaluation: () => void;
}

export const HistorialEvaluaciones: React.FC<HistorialEvaluacionesProps> = ({
  evaluaciones,
  atletas,
  selectedEvaluacionInitial,
  onDeleteEvaluacion,
  onStartNewEvaluation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivelFilter, setSelectedNivelFilter] = useState<string>('Todos');
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<Evaluacion | null>(
    selectedEvaluacionInitial || null
  );

  const filteredEvaluaciones = evaluaciones.filter((ev) => {
    const matchesSearch =
      ev.atletaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.evaluadorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.fecha.includes(searchTerm);

    const matchesNivel =
      selectedNivelFilter === 'Todos' || ev.clasificacionGlobal === selectedNivelFilter;

    return matchesSearch && matchesNivel;
  });

  const getBadgeStyle = (nivel: NivelRendimiento) => {
    switch (nivel) {
      case 'Élite':
        return 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40';
      case 'Alto Rendimiento':
        return 'text-[#3A86FF] bg-[#3A86FF]/15 border-[#3A86FF]/40';
      case 'Intermedio':
        return 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40';
      case 'Oportunidad de Mejora':
        return 'text-[#FF6B35] bg-[#FF6B35]/15 border-[#FF6B35]/40';
      case 'Etapa Inicial':
      default:
        return 'text-[#94A3B8] bg-[#94A3B8]/15 border-[#94A3B8]/40';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#3A86FF]" />
            Historial de Evaluaciones Técnicas y Físicas
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Registro cronológico y seguimiento longitudinal del rendimiento individual.
          </p>
        </div>

        <button
          onClick={onStartNewEvaluation}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-bold text-xs sm:text-sm shadow-md transition-all self-start md:self-auto"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Realizar Nueva Evaluación</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre de atleta, evaluador o fecha (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:border-[#3A86FF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={selectedNivelFilter}
            onChange={(e) => setSelectedNivelFilter(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76]/50 rounded-lg px-3 py-2 text-xs text-white focus:border-[#3A86FF] focus:outline-none"
          >
            <option value="Todos">Todas las Clasificaciones</option>
            <option value="Élite">Élite</option>
            <option value="Alto Rendimiento">Alto Rendimiento</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Oportunidad de Mejora">Oportunidad de Mejora</option>
            <option value="Etapa Inicial">Etapa Inicial</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table (PC & Tablet) */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C2541] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#3A4A76]/40">
              <tr>
                <th className="py-3 px-4">Deportista</th>
                <th className="py-3 px-4">Fecha Sesión</th>
                <th className="py-3 px-4">Evaluador</th>
                <th className="py-3 px-4">Promedio Ponderado ($PP$)</th>
                <th className="py-3 px-4">Clasificación Obtenida</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2541]">
              {filteredEvaluaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#94A3B8]">
                    No se registran evaluaciones con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredEvaluaciones.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-[#1C2541]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvaluacion(ev)}
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      {ev.atletaNombre}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#DBE1FF]">
                      {ev.fecha}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {ev.evaluadorNombre}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                      {ev.promedioPonderado.toFixed(2)}{' '}
                      <span className="text-[10px] text-[#94A3B8] font-normal">/ 5.0</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getBadgeStyle(
                          ev.clasificacionGlobal
                        )}`}
                      >
                        {ev.clasificacionGlobal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvaluacion(ev);
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-[#DBE1FF] hover:text-white font-mono text-xs flex items-center gap-1 transition-colors"
                          title="Ver Ficha y Radar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalle</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar la evaluación de ${ev.atletaNombre} del ${ev.fecha}?`)) {
                              onDeleteEvaluacion(ev.id);
                            }
                          }}
                          className="p-1.5 rounded bg-[#1C2541] hover:bg-[#690005] text-[#DBE1FF] hover:text-[#ffb4ab] transition-colors"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / PRINT REPORT */}
      {selectedEvaluacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#3A4A76] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8 print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between border-b border-[#1C2541] pb-4 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="text-lg font-bold text-white">
                  Reporte Técnico de Rendimiento Deportivo
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] text-xs font-mono font-semibold border border-[#3A4A76]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedEvaluacion(null)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#080D1A] p-4 rounded-xl border border-[#1C2541]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                    ATLETA EVALUADO
                  </span>
                  <h4 className="text-xl font-extrabold text-white">
                    {selectedEvaluacion.atletaNombre}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Fecha de Evaluación: <strong className="text-white">{selectedEvaluacion.fecha}</strong> · Evaluador: {selectedEvaluacion.evaluadorNombre}
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-[#1C2541] sm:pl-4">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                    PUNTAJE GLOBAL ($PP$)
                  </span>
                  <div className="font-mono text-3xl font-black text-white tabular-nums">
                    {selectedEvaluacion.promedioPonderado.toFixed(2)}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border mt-1 ${getBadgeStyle(
                      selectedEvaluacion.clasificacionGlobal
                    )}`}
                  >
                    {selectedEvaluacion.clasificacionGlobal}
                  </span>
                </div>
              </div>

              {/* Spider Radar & Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 flex justify-center py-2 bg-[#080D1A] rounded-xl border border-[#1C2541]">
                  <RadarChart
                    resultados={selectedEvaluacion.resultados}
                    size={280}
                    accentColor="#FF6B35"
                  />
                </div>

                <div className="md:col-span-6 space-y-3">
                  <h5 className="font-bold text-white text-sm">
                    Desglose de Resultados por Test
                  </h5>
                  <div className="space-y-2 text-xs">
                    {selectedEvaluacion.resultados.map((res, i) => (
                      <div
                        key={i}
                        className="bg-[#080D1A] p-2.5 rounded-lg border border-[#1C2541] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-white block">
                            {res.testNombre}
                          </span>
                          <span className="font-mono text-[11px] text-[#94A3B8]">
                            Marca: {res.valorMedido} {res.unidad}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{
                              color: res.colorHex,
                              backgroundColor: `${res.colorHex}20`,
                              border: `1px solid ${res.colorHex}50`,
                            }}
                          >
                            {res.clasificacion} ({res.puntajeObtenido}.0)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Qualitative Observations */}
              {selectedEvaluacion.observaciones && (
                <div className="bg-[#080D1A] p-4 rounded-xl border border-[#1C2541] text-xs">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                    OBSERVACIONES TÉCNICAS DEL ENTRENADOR
                  </span>
                  <p className="text-[#DBE1FF] italic">
                    "{selectedEvaluacion.observaciones}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2541] flex justify-end print:hidden">
              <button
                onClick={() => setSelectedEvaluacion(null)}
                className="px-5 py-2 rounded-lg bg-[#1C2541] text-[#DBE1FF] hover:bg-[#243054] text-xs font-semibold"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
