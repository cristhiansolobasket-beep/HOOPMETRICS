import React from 'react';
import { Atleta, Evaluacion, NivelRendimiento, TestDeportivo } from '../types/basketball';
import { RadarChart } from './RadarChart';
import {
  Users,
  Award,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Database,
  PlusCircle,
} from 'lucide-react';

interface DashboardAdminProps {
  atletas: Atleta[];
  evaluaciones: Evaluacion[];
  tests: TestDeportivo[];
  onNavigateTab: (tab: any) => void;
  onSelectEvaluacion: (evaluacion: Evaluacion) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  atletas,
  evaluaciones,
  tests,
  onNavigateTab,
  onSelectEvaluacion,
}) => {
  // Calculos generales
  const totalAtletas = atletas.length;
  const totalEvaluaciones = evaluaciones.length;
  const testsActivos = tests.filter((t) => t.activo).length;

  const promedioGeneralEquipo =
    totalEvaluaciones > 0
      ? (
          evaluaciones.reduce((acc, e) => acc + e.promedioPonderado, 0) /
          totalEvaluaciones
        ).toFixed(2)
      : '0.00';

  // Distribución por nivel
  const niveles: NivelRendimiento[] = [
    'Élite',
    'Alto Rendimiento',
    'Intermedio',
    'Oportunidad de Mejora',
    'Etapa Inicial',
  ];

  const conteoNiveles = niveles.map((nivel) => {
    const count = evaluaciones.filter((e) => e.clasificacionGlobal === nivel).length;
    const pct = totalEvaluaciones > 0 ? Math.round((count / totalEvaluaciones) * 100) : 0;
    return { nivel, count, pct };
  });

  // Generar datos promedio por test para el Radar del equipo
  const resultadosPromedioRadar = tests
    .filter((t) => t.activo)
    .map((test) => {
      let sumaPuntos = 0;
      let conteoPuntos = 0;

      evaluaciones.forEach((e) => {
        const res = e.resultados.find((r) => r.testId === test.id);
        if (res) {
          sumaPuntos += res.puntajeObtenido;
          conteoPuntos++;
        }
      });

      const puntajeProm = conteoPuntos > 0 ? Number((sumaPuntos / conteoPuntos).toFixed(1)) : 3;

      return {
        testId: test.id,
        testCodigo: test.codigo,
        testNombre: test.nombre,
        valorMedido: 0,
        unidad: test.unidad,
        puntajeObtenido: puntajeProm,
        clasificacion: 'Intermedio' as NivelRendimiento,
        colorHex: '#3A86FF',
      };
    });

  const getBadgeColor = (nivel: NivelRendimiento) => {
    switch (nivel) {
      case 'Élite':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
      case 'Alto Rendimiento':
        return 'text-[#3A86FF] bg-[#3A86FF]/10 border-[#3A86FF]/30';
      case 'Intermedio':
        return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'Oportunidad de Mejora':
        return 'text-[#FF6B35] bg-[#FF6B35]/10 border-[#FF6B35]/30';
      case 'Etapa Inicial':
      default:
        return 'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Actions */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#131D3B] to-[#0B132B] border border-[#3A4A76]/50 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF6B35]/15 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1C2541] border border-[#3A4A76] text-xs font-mono text-[#FF6B35] mb-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              SISTEMA TÉCNICO DE CAMPO
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel de Control Deportivo
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1 max-w-2xl">
              Monitoreo biomecánico, antropométrico y técnico de basquetbolistas en categorías formativas y de rendimiento (15 a 20 años).
            </p>
          </div>

          {/* Quick CTA buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('evaluar')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B35] hover:bg-[#ff7e4e] text-[#080D1A] font-bold text-xs sm:text-sm shadow-lg shadow-[#FF6B35]/25 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Nueva Evaluación en Cancha</span>
            </button>

            <button
              onClick={() => onNavigateTab('atletas')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] border border-[#3A4A76]/60 font-semibold text-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#10B981]" />
              <span>Registrar Atleta</span>
            </button>

            <button
              onClick={() => onNavigateTab('sql')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] border border-[#3A4A76]/60 font-semibold text-xs transition-all"
            >
              <Database className="w-4 h-4 text-[#3A86FF]" />
              <span>Base datos.sql</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Deportistas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1C2541] flex items-center justify-center text-[#FF6B35]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            {totalAtletas}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
            <span className="text-[#10B981] font-semibold">100%</span> en rango 15-20 años
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Evaluaciones
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1C2541] flex items-center justify-center text-[#10B981]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            {totalEvaluaciones}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Sesiones de campo registradas
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Promedio Plantel
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1C2541] flex items-center justify-center text-[#3A86FF]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            {promedioGeneralEquipo} <span className="text-sm text-[#94A3B8]">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Promedio Ponderado ($PP$)
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Batería Oficial
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1C2541] flex items-center justify-center text-[#F59E0B]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            {testsActivos}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Tests técnicos con baremo activo
          </p>
        </div>
      </div>

      {/* Middle Grid: Team Radar & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar del Equipo */}
        <div className="lg:col-span-6 bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1C2541] pb-3 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF6B35]" />
                Radar de Rendimiento Colectivo
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Promedio de las 5 capacidades técnicas del equipo
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C2541] text-[#3A86FF] font-semibold border border-[#3A4A76]">
              FIBA 15-20
            </span>
          </div>

          <div className="py-2 flex justify-center">
            <RadarChart
              resultados={resultadosPromedioRadar}
              size={300}
              accentColor="#3A86FF"
            />
          </div>

          <div className="bg-[#080D1A] rounded-lg p-3 text-xs text-[#94A3B8] border border-[#1C2541] mt-2">
            <strong className="text-white">Diagnóstico Rápido:</strong> El plantel exhibe solidez en salto vertical y dribling dinámico. Se recomienda enfatizar el volumen de tiro perimetral bajo fatiga de juego.
          </div>
        </div>

        {/* Distribución por Niveles de Baremo */}
        <div className="lg:col-span-6 bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1C2541] pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Distribución por Escala de Rendimiento
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Clasificación de evaluaciones según baremos oficiales
              </p>
            </div>
            <span className="text-xs font-mono text-[#94A3B8]">
              Total: {totalEvaluaciones}
            </span>
          </div>

          <div className="space-y-3.5 my-auto">
            {conteoNiveles.map((item) => {
              const badgeClass = getBadgeColor(item.nivel);
              return (
                <div key={item.nivel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeClass}`}>
                        {item.nivel}
                      </span>
                    </span>
                    <span className="font-mono text-[#94A3B8]">
                      {item.count} evaluación(es) · <strong className="text-white">{item.pct}%</strong>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#1C2541] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.nivel === 'Élite'
                          ? 'bg-[#10B981]'
                          : item.nivel === 'Alto Rendimiento'
                          ? 'bg-[#3A86FF]'
                          : item.nivel === 'Intermedio'
                          ? 'bg-[#F59E0B]'
                          : item.nivel === 'Oportunidad de Mejora'
                          ? 'bg-[#FF6B35]'
                          : 'bg-[#64748B]'
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1C2541] flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">
              Criterio: Ponderación oficial de 5 test
            </span>
            <button
              onClick={() => onNavigateTab('baremos')}
              className="text-xs text-[#FF6B35] hover:underline flex items-center gap-1 font-semibold"
            >
              Consultar Baremos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1C2541]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-base font-bold text-white">
              Últimas Evaluaciones Registradas
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('historial')}
            className="text-xs font-semibold text-[#3A86FF] hover:underline flex items-center gap-1"
          >
            Ver Historial Completo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {evaluaciones.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#94A3B8]">
            Aún no se han ejecutado evaluaciones. Haz clic en "Nueva Evaluación en Cancha".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C2541]/50 text-[#94A3B8] font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Deportista</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Promedio Ponderado ($PP$)</th>
                  <th className="py-2.5 px-3">Clasificación</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2541]">
                {evaluaciones.slice(0, 5).map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-[#1C2541]/30 transition-colors cursor-pointer"
                    onClick={() => onSelectEvaluacion(ev)}
                  >
                    <td className="py-3 px-3 font-semibold text-white">
                      {ev.atletaNombre}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">
                      {ev.fecha}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {ev.promedioPonderado.toFixed(2)} / 5.0
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeColor(
                          ev.clasificacionGlobal
                        )}`}
                      >
                        {ev.clasificacionGlobal}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvaluacion(ev);
                        }}
                        className="px-2.5 py-1 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-[#DBE1FF] hover:text-white font-mono text-[11px] transition-colors"
                      >
                        Ver Detalle & Radar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
