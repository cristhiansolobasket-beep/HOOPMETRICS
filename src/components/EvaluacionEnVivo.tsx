import React, { useState, useEffect, useMemo } from 'react';
import {
  Atleta,
  Baremo,
  Evaluacion,
  NivelRendimiento,
  ResultadoTest,
  TestDeportivo,
  Usuario,
} from '../types/basketball';
import {
  calcularPromedioPonderado,
  clasificarConBaremo,
  clasificarPuntajeGlobal,
  colorDeNivel,
} from '../services/storage';
import { Stopwatch } from './Stopwatch';
import { RadarChart } from './RadarChart';
import {
  Activity,
  Users,
  CheckCircle2,
  Calendar,
  Save,
  HelpCircle,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Timer,
  Award,
  Flame,
} from 'lucide-react';

interface EvaluacionEnVivoProps {
  atletas: Atleta[];
  tests: TestDeportivo[];
  baremos: Baremo[];
  currentUser: Usuario;
  initialSelectedAtleta?: Atleta | null;
  onSaveEvaluacion: (evaluacion: Evaluacion) => void;
  onCancel: () => void;
}

export const EvaluacionEnVivo: React.FC<EvaluacionEnVivoProps> = ({
  atletas,
  tests,
  baremos,
  currentUser,
  initialSelectedAtleta,
  onSaveEvaluacion,
  onCancel,
}) => {
  const [selectedAtletaId, setSelectedAtletaId] = useState<string>(
    initialSelectedAtleta?.id || (atletas[0]?.id || '')
  );
  const [fechaEvaluacion, setFechaEvaluacion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observaciones, setObservaciones] = useState<string>('');

  // Values map: testId -> measured value
  const [testValues, setTestValues] = useState<Record<string, number>>({});

  // Active stopwatch target test
  const [activeStopwatchTestId, setActiveStopwatchTestId] = useState<string | null>(null);

  // RAST helper calculator state
  const [rastSprints, setRastSprints] = useState<number[]>([4.8, 4.9, 5.1, 5.3, 5.5, 5.7]);
  const [showRastCalc, setShowRastCalc] = useState(false);

  const selectedAtleta = useMemo(
    () => atletas.find((a) => a.id === selectedAtletaId) || atletas[0],
    [atletas, selectedAtletaId]
  );

  // Initialize test values with sensible default or empty
  useEffect(() => {
    if (tests.length > 0 && Object.keys(testValues).length === 0) {
      const initialMap: Record<string, number> = {};
      tests.forEach((t) => {
        if (t.codigo === 'tiro_media') initialMap[t.id] = 14;
        else if (t.codigo === 'dribling_z') initialMap[t.id] = 11.5;
        else if (t.codigo === 'velocidad_28m') initialMap[t.id] = 3.85;
        else if (t.codigo === 'salto_cmj') initialMap[t.id] = 54.0;
        else if (t.codigo === 'rast_fatiga') initialMap[t.id] = 7.0;
        else initialMap[t.id] = 0;
      });
      setTestValues(initialMap);
    }
  }, [tests]);

  // Real-time evaluation results calculation (<50ms)
  const evaluatedResults: ResultadoTest[] = useMemo(() => {
    if (!selectedAtleta) return [];

    return tests
      .filter((t) => t.activo)
      .map((test) => {
        const measured = testValues[test.id] !== undefined ? testValues[test.id] : 0;
        const evaluation = clasificarConBaremo(test, measured, selectedAtleta, baremos);

        return {
          testId: test.id,
          testCodigo: test.codigo,
          testNombre: test.nombre,
          valorMedido: measured,
          unidad: test.unidad,
          puntajeObtenido: evaluation.puntaje,
          clasificacion: evaluation.nivel,
          colorHex: evaluation.colorHex,
          detallesExtra: { descripcion: evaluation.descripcion },
        };
      });
  }, [tests, testValues, selectedAtleta, baremos]);

  // Calculate live Promedio Ponderado
  const { pp, clasificacion: globalNivel, colorHex: globalColor } = useMemo(() => {
    return calcularPromedioPonderado(evaluatedResults, tests);
  }, [evaluatedResults, tests]);

  const handleValueChange = (testId: string, val: number) => {
    setTestValues((prev) => ({
      ...prev,
      [testId]: Number(val),
    }));
  };

  const handleIncrement = (testId: string, step = 1, max?: number) => {
    setTestValues((prev) => {
      const current = prev[testId] || 0;
      const next = current + step;
      if (max !== undefined && next > max) return prev;
      return { ...prev, [testId]: Number(next.toFixed(2)) };
    });
  };

  const handleDecrement = (testId: string, step = 1, min = 0) => {
    setTestValues((prev) => {
      const current = prev[testId] || 0;
      const next = current - step;
      if (next < min) return prev;
      return { ...prev, [testId]: Number(next.toFixed(2)) };
    });
  };

  // Compute RAST Fatigue Index from 6 sprints
  const computeRastFatigue = () => {
    if (!selectedAtleta) return;
    const peso = selectedAtleta.pesoKg;
    const dist = 35; // meters
    // Potencia en cada sprint = (peso * dist^2) / t^3
    const powers = rastSprints.map((t) => (peso * Math.pow(dist, 2)) / Math.pow(t, 3));
    const pMax = Math.max(...powers);
    const pMin = Math.min(...powers);
    const totalTime = rastSprints.reduce((a, b) => a + b, 0);
    const fatigueIndex = (pMax - pMin) / totalTime;
    const finalVal = Number(fatigueIndex.toFixed(2));

    const rastTest = tests.find((t) => t.codigo === 'rast_fatiga');
    if (rastTest) {
      handleValueChange(rastTest.id, finalVal);
    }
    setShowRastCalc(false);
  };

  const handleSave = () => {
    if (!selectedAtleta) return;

    const nuevaEvaluacion: Evaluacion = {
      id: `eval_${Date.now()}`,
      atletaId: selectedAtleta.id,
      atletaNombre: selectedAtleta.nombreCompleto,
      evaluadorId: currentUser.id,
      evaluadorNombre: currentUser.nombre,
      fecha: fechaEvaluacion,
      promedioPonderado: pp,
      clasificacionGlobal: globalNivel,
      observaciones: observaciones.trim() || undefined,
      resultados: evaluatedResults,
      creadoEn: new Date().toISOString(),
    };

    onSaveEvaluacion(nuevaEvaluacion);
  };

  return (
    <div className="space-y-6">
      {/* PERSISTENT LIVE HEADER - Dynamic telemetry and instant feedback */}
      <div className="sticky top-16 z-30 bg-[#0B132B]/95 backdrop-blur-md border border-[#3A4A76] rounded-xl p-4 shadow-2xl transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Athlete Info Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#E85D04] flex items-center justify-center text-[#080D1A] font-extrabold text-xl font-mono shadow-md">
              {selectedAtleta ? selectedAtleta.posicion.substring(0, 2) : 'BB'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {selectedAtleta ? selectedAtleta.nombreCompleto : 'Selecciona un Atleta'}
                </h2>
                {selectedAtleta && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2541] text-[#3A86FF] font-semibold border border-[#3A4A76]">
                    {selectedAtleta.categoria} · {selectedAtleta.sexo}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">
                {selectedAtleta
                  ? `${selectedAtleta.edad} años · ${selectedAtleta.tallaCm}cm · ${selectedAtleta.pesoKg}kg · Pos: ${selectedAtleta.posicion}`
                  : ''}
              </p>
            </div>
          </div>

          {/* Real-time Weighted Score ($PP$) readout */}
          <div className="flex items-center gap-4 bg-[#080D1A] px-4 py-2.5 rounded-lg border border-[#1C2541]">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                Promedio Ponderado ($PP$)
              </span>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
                  {pp.toFixed(2)}
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">/ 5.0</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[#1C2541]"></div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                Clasificación
              </span>
              <span
                className="inline-block px-2.5 py-1 rounded text-xs font-mono font-black border uppercase tracking-wider"
                style={{
                  color: globalColor,
                  backgroundColor: `${globalColor}15`,
                  borderColor: `${globalColor}50`,
                }}
              >
                {globalNivel}
              </span>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-bold text-xs shadow-lg shadow-[#FF6B35]/20 ml-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar Evaluación</span>
              <span className="sm:hidden">Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Athlete Selector & Session Date Bar */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[#94A3B8] font-semibold mb-1">
            Deportista a Evaluar:
          </label>
          <select
            value={selectedAtletaId}
            onChange={(e) => setSelectedAtletaId(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76] rounded-lg p-2.5 text-xs text-white focus:border-[#FF6B35] focus:outline-none"
          >
            {atletas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombreCompleto} ({a.edad} años - {a.posicion})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#94A3B8] font-semibold mb-1">
            Fecha de la Sesión en Cancha:
          </label>
          <input
            type="date"
            value={fechaEvaluacion}
            onChange={(e) => setFechaEvaluacion(e.target.value)}
            className="w-full bg-[#1C2541] border border-[#3A4A76] rounded-lg p-2.5 text-xs text-white font-mono focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#94A3B8] font-semibold mb-1">
            Evaluador Oficial:
          </label>
          <div className="bg-[#1C2541] border border-[#3A4A76] rounded-lg p-2.5 text-xs text-[#DBE1FF] truncate">
            {currentUser.nombre} ({currentUser.rol})
          </div>
        </div>
      </div>

      {/* Main Grid: Tests Battery Input Pad + Real-Time Live Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Battery of Tests Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF6B35]" />
              Batería de Pruebas Técnicas Oficiales
            </h3>
            <span className="text-xs font-mono text-[#94A3B8]">
              Recálculo Instantáneo: &lt; 50ms
            </span>
          </div>

          {tests
            .filter((t) => t.activo)
            .map((test, index) => {
              const currentVal = testValues[test.id] !== undefined ? testValues[test.id] : 0;
              const res = evaluatedResults.find((r) => r.testId === test.id);
              const isStopwatchActive = activeStopwatchTestId === test.id;

              return (
                <div
                  key={test.id}
                  className="bg-[#0B132B] border border-[#3A4A76]/50 rounded-xl p-4 sm:p-5 shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1C2541] text-[#FF6B35] font-mono font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-white text-base">
                          {test.nombre}
                        </h4>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1 pl-7">
                        {test.descripcionProtocolo}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-7 sm:pl-0">
                      <span className="text-[10px] font-mono text-[#94A3B8] bg-[#080D1A] px-2 py-1 rounded border border-[#1C2541]">
                        Ponderación: {Math.round(test.ponderacion * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Input Pad Area */}
                  <div className="bg-[#080D1A] p-3 sm:p-4 rounded-xl border border-[#1C2541] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Measurement Controllers */}
                    <div className="sm:col-span-7 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* Stepper Down */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDecrement(
                              test.id,
                              test.codigo === 'tiro_media' ? 1 : 0.1,
                              0
                            )
                          }
                          className="w-12 h-12 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-white flex items-center justify-center font-bold text-lg border border-[#3A4A76]/50 transition-colors active:bg-[#FF6B35] active:text-[#080D1A]"
                          title="Restar valor"
                        >
                          <Minus className="w-5 h-5" />
                        </button>

                        {/* Numeric Input */}
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            step={test.codigo === 'tiro_media' ? '1' : '0.01'}
                            value={currentVal}
                            onChange={(e) =>
                              handleValueChange(test.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-[#171E37] border-2 border-[#3A4A76] rounded-lg py-2.5 px-3 text-center text-white font-mono text-2xl font-extrabold focus:border-[#FF6B35] focus:outline-none tabular-nums"
                          />
                          <span className="text-[10px] font-mono text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {test.unidad}
                          </span>
                        </div>

                        {/* Stepper Up */}
                        <button
                          type="button"
                          onClick={() =>
                            handleIncrement(
                              test.id,
                              test.codigo === 'tiro_media' ? 1 : 0.1,
                              test.codigo === 'tiro_media' ? 20 : undefined
                            )
                          }
                          className="w-12 h-12 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-white flex items-center justify-center font-bold text-lg border border-[#3A4A76]/50 transition-colors active:bg-[#FF6B35] active:text-[#080D1A]"
                          title="Sumar valor"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Rapid shortcuts for specific drills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {test.codigo === 'tiro_media' && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]">
                            <span>Rápidos:</span>
                            {[8, 12, 15, 17, 20].map((shots) => (
                              <button
                                key={shots}
                                type="button"
                                onClick={() => handleValueChange(test.id, shots)}
                                className="px-2 py-1 rounded bg-[#1C2541] hover:bg-[#FF6B35] hover:text-[#080D1A] text-white"
                              >
                                {shots}
                              </button>
                            ))}
                          </div>
                        )}

                        {(test.categoria === 'Velocidad' || test.categoria === 'Agilidad') && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveStopwatchTestId(isStopwatchActive ? null : test.id)
                            }
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold border transition-colors ${
                              isStopwatchActive
                                ? 'bg-[#FF6B35] text-[#080D1A] border-[#FF6B35]'
                                : 'bg-[#1C2541] text-[#DBE1FF] border-[#3A4A76] hover:bg-[#243054]'
                            }`}
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span>{isStopwatchActive ? 'Ocultar Cronómetro' : 'Abrir Cronómetro'}</span>
                          </button>
                        )}

                        {test.codigo === 'rast_fatiga' && (
                          <button
                            type="button"
                            onClick={() => setShowRastCalc(!showRastCalc)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[#1C2541] text-[#3A86FF] border border-[#3A86FF]/40 hover:bg-[#243054]"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Calculadora de 6 Sprints RAST</span>
                          </button>
                        )}
                      </div>

                      {/* Integrated Stopwatch if active for this test */}
                      {isStopwatchActive && (
                        <div className="mt-2 pt-2 border-t border-[#1C2541]">
                          <Stopwatch
                            label={`Toma de tiempo: ${test.nombre}`}
                            onCaptureTime={(capturedSec) => {
                              handleValueChange(test.id, capturedSec);
                              setActiveStopwatchTestId(null);
                            }}
                          />
                        </div>
                      )}

                      {/* Integrated RAST Sprints Calculator */}
                      {test.codigo === 'rast_fatiga' && showRastCalc && (
                        <div className="mt-2 p-3 bg-[#0B132B] rounded-lg border border-[#3A4A76] space-y-2">
                          <span className="text-xs font-bold text-white block">
                            Tiempos de los 6 Sprints de 35 metros (segundos):
                          </span>
                          <div className="grid grid-cols-6 gap-1.5 font-mono text-xs">
                            {rastSprints.map((time, sprintIdx) => (
                              <div key={sprintIdx}>
                                <span className="text-[10px] text-[#94A3B8] block text-center">
                                  S{sprintIdx + 1}
                                </span>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={time}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 5;
                                    const nextArr = [...rastSprints];
                                    nextArr[sprintIdx] = val;
                                    setRastSprints(nextArr);
                                  }}
                                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-1 text-center text-white"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowRastCalc(false)}
                              className="px-2 py-1 text-xs text-[#94A3B8] hover:text-white"
                            >
                              Cerrar
                            </button>
                            <button
                              type="button"
                              onClick={computeRastFatigue}
                              className="px-3 py-1 bg-[#3A86FF] hover:bg-[#2563eb] text-white text-xs font-bold rounded"
                            >
                              Calcular Índice de Fatiga (W/s)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Instant Feedback Tier Card (<50ms calculation) */}
                    <div className="sm:col-span-5 bg-[#0B132B] p-3 rounded-lg border border-[#1C2541] flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                          Baremo Científico
                        </span>
                        <span className="font-mono text-xs font-black text-white">
                          Puntaje: <span style={{ color: res?.colorHex }}>{res?.puntajeObtenido}.0 / 5.0</span>
                        </span>
                      </div>

                      <div className="my-2">
                        <div
                          className="px-2.5 py-1.5 rounded font-mono text-xs font-black text-center uppercase tracking-wider shadow-sm"
                          style={{
                            color: res?.colorHex,
                            backgroundColor: `${res?.colorHex}20`,
                            border: `1.5px solid ${res?.colorHex}`,
                          }}
                        >
                          {res?.clasificacion}
                        </div>
                      </div>

                      <p className="text-[11px] text-[#94A3B8] italic leading-tight">
                        {res?.detallesExtra?.descripcion || 'En análisis normativo.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Observaciones del Entrenador */}
          <div className="bg-[#0B132B] border border-[#3A4A76]/50 rounded-xl p-4 shadow-lg space-y-2">
            <label className="block text-xs font-bold text-white">
              Observaciones Cualitativas y Recomendaciones Técnicas:
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles sobre biomecánica, actitud, ritmo o aspectos a reforzar en los entrenamientos..."
              className="w-full bg-[#1C2541] border border-[#3A4A76] rounded-lg p-2.5 text-xs text-white placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
            />
          </div>
        </div>

        {/* Right Column (4 cols): Real-Time Radar Preview & Action Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* Radar Card */}
          <div className="bg-[#0B132B] border border-[#3A4A76]/50 rounded-xl p-5 shadow-xl sticky top-44">
            <div className="flex items-center justify-between border-b border-[#1C2541] pb-3 mb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF6B35]" />
                Radar Reactivo en Vivo
              </h4>
              <span className="text-[10px] font-mono text-[#10B981] animate-pulse">
                • VINCULADO
              </span>
            </div>

            <div className="py-2 flex justify-center">
              <RadarChart
                resultados={evaluatedResults}
                size={270}
                accentColor="#FF6B35"
              />
            </div>

            <div className="mt-3 p-3 bg-[#080D1A] rounded-lg border border-[#1C2541] space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-[#94A3B8]">Promedio Ponderado ($PP$):</span>
                <strong className="text-white">{pp.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#94A3B8]">Nivel General:</span>
                <strong style={{ color: globalColor }}>{globalNivel}</strong>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#FF6B35] hover:bg-[#ff8559] text-[#080D1A] font-extrabold text-sm shadow-xl shadow-[#FF6B35]/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Guardar y Finalizar Evaluación</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-xs text-[#94A3B8] hover:text-white transition-colors"
              >
                Cancelar y Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
