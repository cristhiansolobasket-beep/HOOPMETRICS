import React, { useState } from 'react';
import {
  Atleta,
  Baremo,
  Evaluacion,
  NivelRendimiento,
  TestDeportivo,
  Usuario,
} from '../types/basketball';
import { RadarChart } from './RadarChart';
import {
  Activity,
  Award,
  Layers,
  UserCheck,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  Ruler,
  Weight,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface PortalDeportistaProps {
  currentUser: Usuario;
  atletas: Atleta[];
  evaluaciones: Evaluacion[];
  tests: TestDeportivo[];
  baremos: Baremo[];
  activeTab: 'mi_rendimiento' | 'mis_evaluaciones' | 'tests_disponibles' | 'mi_perfil';
  onUpdateAtleta: (atleta: Atleta) => void;
}

export const PortalDeportista: React.FC<PortalDeportistaProps> = ({
  currentUser,
  atletas,
  evaluaciones,
  tests,
  baremos,
  activeTab,
  onUpdateAtleta,
}) => {
  // Find linked athlete
  const currentAtleta =
    atletas.find((a) => a.id === currentUser.atletaId) ||
    atletas.find((a) => a.nombreCompleto.toLowerCase() === currentUser.nombre.toLowerCase()) ||
    atletas[0];

  // Evaluations belonging to this athlete
  const misEvaluaciones = evaluaciones.filter(
    (e) => e.atletaId === currentAtleta?.id || e.atletaNombre === currentAtleta?.nombreCompleto
  );

  const ultimaEvaluacion = misEvaluaciones[0] || null;

  const [selectedEvalDetail, setSelectedEvalDetail] = useState<Evaluacion | null>(
    ultimaEvaluacion
  );

  // Edit personal profile form state
  const [profileForm, setProfileForm] = useState({
    tallaCm: currentAtleta?.tallaCm || 185,
    pesoKg: currentAtleta?.pesoKg || 75,
    envergaduraCm: currentAtleta?.envergaduraCm || 190,
    telefono: currentAtleta?.telefono || '',
    club: currentAtleta?.club || '',
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const calculateIMC = (peso: number, tallaCm: number) => {
    if (!peso || !tallaCm) return '0.0';
    const m = tallaCm / 100;
    return (peso / (m * m)).toFixed(1);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAtleta) return;

    const updated: Atleta = {
      ...currentAtleta,
      tallaCm: Number(profileForm.tallaCm),
      pesoKg: Number(profileForm.pesoKg),
      envergaduraCm: profileForm.envergaduraCm ? Number(profileForm.envergaduraCm) : undefined,
      telefono: profileForm.telefono,
      club: profileForm.club,
    };

    onUpdateAtleta(updated);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

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

  return (
    <div className="space-y-6">
      {/* Top Banner with Athlete Snapshot */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#131E3D] to-[#0B132B] border border-[#3A4A76]/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3A86FF] to-[#1E3A8A] flex items-center justify-center text-white font-extrabold text-2xl font-mono shadow-lg">
              {currentAtleta?.posicion.substring(0, 2) || 'BK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C2541] text-[#3A86FF] font-semibold border border-[#3A4A76]">
                  PORTAL DEL DEPORTISTA
                </span>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {currentAtleta?.categoria}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {currentAtleta?.nombreCompleto}
              </h1>
              <p className="text-xs text-[#94A3B8]">
                {currentAtleta?.posicion} · {currentAtleta?.edad} años · {currentAtleta?.club || 'Club Juvenil'}
              </p>
            </div>
          </div>

          {ultimaEvaluacion && (
            <div className="bg-[#080D1A] p-3 rounded-xl border border-[#1C2541] flex items-center gap-4 self-start sm:self-auto">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                  ÚLTIMA CLASIFICACIÓN
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold border mt-0.5 ${getBadgeStyle(
                    ultimaEvaluacion.clasificacionGlobal
                  )}`}
                >
                  {ultimaEvaluacion.clasificacionGlobal}
                </span>
              </div>
              <div className="text-right border-l border-[#1C2541] pl-3">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                  PROMEDIO ($PP$)
                </span>
                <span className="font-mono text-xl font-black text-white">
                  {ultimaEvaluacion.promedioPonderado.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: MI RENDIMIENTO (OVERVIEW & RADAR) */}
      {activeTab === 'mi_rendimiento' && (
        <div className="space-y-6">
          {/* Anthropometric Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-3.5 text-center font-mono">
              <span className="text-[10px] text-[#94A3B8] block">ESTATURA OFICIAL</span>
              <span className="text-xl font-bold text-white mt-0.5 block">
                {currentAtleta?.tallaCm} cm
              </span>
            </div>
            <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-3.5 text-center font-mono">
              <span className="text-[10px] text-[#94A3B8] block">PESO CORPORAL</span>
              <span className="text-xl font-bold text-white mt-0.5 block">
                {currentAtleta?.pesoKg} kg
              </span>
            </div>
            <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-3.5 text-center font-mono">
              <span className="text-[10px] text-[#94A3B8] block">ÍNDICE DE MASA (IMC)</span>
              <span className="text-xl font-bold text-[#10B981] mt-0.5 block">
                {calculateIMC(currentAtleta?.pesoKg || 0, currentAtleta?.tallaCm || 0)}
              </span>
            </div>
            <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-3.5 text-center font-mono">
              <span className="text-[10px] text-[#94A3B8] block">ENVERGADURA</span>
              <span className="text-xl font-bold text-[#3A86FF] mt-0.5 block">
                {currentAtleta?.envergaduraCm ? `${currentAtleta?.envergaduraCm} cm` : 'N/D'}
              </span>
            </div>
          </div>

          {ultimaEvaluacion ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar Graphic */}
              <div className="lg:col-span-6 bg-[#0B132B] border border-[#3A4A76]/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FF6B35]" />
                    Mi Huella de Rendimiento (Spider Radar)
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Comparativa de tus 5 capacidades frente a la referencia Élite (5.0)
                  </p>
                </div>

                <div className="py-4 flex justify-center">
                  <RadarChart
                    resultados={ultimaEvaluacion.resultados}
                    size={300}
                    accentColor="#FF6B35"
                  />
                </div>

                <div className="bg-[#080D1A] p-3 rounded-lg border border-[#1C2541] text-xs text-[#94A3B8]">
                  <strong className="text-white">Fecha de Toma:</strong> {ultimaEvaluacion.fecha} · Evaluado por: {ultimaEvaluacion.evaluadorNombre}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="lg:col-span-6 bg-[#0B132B] border border-[#3A4A76]/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Resultados y Calificación por Prueba
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Clasificación automática según los baremos oficiales para tu edad y sexo
                  </p>
                </div>

                <div className="space-y-2.5 my-3">
                  {ultimaEvaluacion.resultados.map((res, idx) => (
                    <div
                      key={idx}
                      className="bg-[#080D1A] p-3 rounded-xl border border-[#1C2541] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">
                          {res.testNombre}
                        </span>
                        <span className="font-mono text-xs text-[#94A3B8]">
                          Marca registrada: <strong className="text-white">{res.valorMedido}</strong> {res.unidad}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(
                            res.clasificacion
                          )}`}
                        >
                          {res.clasificacion}
                        </span>
                        <span className="block font-mono text-[11px] text-white font-bold mt-0.5">
                          {res.puntajeObtenido}.0 / 5.0
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {ultimaEvaluacion.observaciones && (
                  <div className="bg-[#080D1A] p-3 rounded-lg border border-[#1C2541] text-xs">
                    <span className="text-[10px] font-mono text-[#94A3B8] block mb-0.5 uppercase">
                      Nota de tu entrenador:
                    </span>
                    <p className="text-[#DBE1FF] italic">
                      "{ultimaEvaluacion.observaciones}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-2xl p-10 text-center text-[#94A3B8]">
              Aún no tienes evaluaciones registradas por tu entrenador. Una vez se ejecute la batería de tests, tus resultados y radar se mostrarán aquí.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MIS EVALUACIONES (HISTORIAL) */}
      {activeTab === 'mis_evaluaciones' && (
        <div className="space-y-4">
          <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-base mb-1">
              Historial de Mis Evaluaciones Realizadas
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Consulta la progresión de tus marcas y puntajes a lo largo del tiempo.
            </p>

            {misEvaluaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No tienes sesiones de evaluación previas en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1C2541] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#3A4A76]/40">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Evaluador</th>
                      <th className="py-3 px-4">Promedio Ponderado</th>
                      <th className="py-3 px-4">Clasificación Obtenida</th>
                      <th className="py-3 px-4 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2541]">
                    {misEvaluaciones.map((ev) => (
                      <tr key={ev.id} className="hover:bg-[#1C2541]/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {ev.fecha}
                        </td>
                        <td className="py-3.5 px-4 text-[#94A3B8]">
                          {ev.evaluadorNombre}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                          {ev.promedioPonderado.toFixed(2)} / 5.0
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getBadgeStyle(
                              ev.clasificacionGlobal
                            )}`}
                          >
                            {ev.clasificacionGlobal}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedEvalDetail(ev)}
                            className="px-3 py-1 rounded bg-[#1C2541] hover:bg-[#3A86FF] text-white text-xs font-semibold"
                          >
                            Ver Ficha
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
      )}

      {/* TAB 3: TESTS DISPONIBLES Y BAREMOS */}
      {activeTab === 'tests_disponibles' && (
        <div className="space-y-6">
          <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-base">
              Catálogo de Tests Técnicos y Baremos Oficiales
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Protocolos que debes realizar y las marcas requeridas para alcanzar cada nivel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests
              .filter((t) => t.activo)
              .map((test) => {
                // Find baremo matching this athlete's sex & age
                const matchingBaremo = baremos.find((b) => {
                  if (b.testId !== test.id) return false;
                  const sexOk = b.sexo === 'Ambos' || b.sexo === currentAtleta?.sexo;
                  return sexOk;
                });

                return (
                  <div
                    key={test.id}
                    className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C2541] text-[#FF6B35] border border-[#FF6B35]/30 uppercase">
                          {test.categoria}
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8]">
                          Peso en Nota: {Math.round(test.ponderacion * 100)}%
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base mt-2">
                        {test.nombre}
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-1 italic">
                        {test.descripcionProtocolo}
                      </p>
                    </div>

                    {/* Table of thresholds for this athlete */}
                    {matchingBaremo && (
                      <div className="bg-[#080D1A] rounded-xl p-3 border border-[#1C2541]">
                        <span className="text-[10px] font-mono text-[#3A86FF] uppercase font-bold block mb-2">
                          Escala de Baremos ({currentAtleta?.sexo} - {matchingBaremo.rangoEdad} años):
                        </span>

                        <div className="space-y-1.5 text-xs">
                          {matchingBaremo.rangos.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-1 border-b border-[#1C2541] last:border-none"
                            >
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                                style={{
                                  color: r.colorHex,
                                  backgroundColor: `${r.colorHex}15`,
                                  border: `1px solid ${r.colorHex}30`,
                                }}
                              >
                                {r.nivel}
                              </span>
                              <span className="font-mono text-white font-bold text-xs">
                                {r.min} a {r.max} {test.unidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: MI FICHA ANTROPOMÉTRICA (EDITABLE) */}
      {activeTab === 'mi_perfil' && currentAtleta && (
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-2xl p-6 shadow-xl max-w-xl mx-auto space-y-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#3A86FF]" />
              Mi Ficha de Deportista
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Mantén tus datos personales y medidas corporales actualizadas.
            </p>
          </div>

          {profileSavedMsg && (
            <div className="p-3 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Tus datos han sido actualizados con éxito.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-[#080D1A] p-3 rounded-xl border border-[#1C2541]">
              <div>
                <span className="text-[#94A3B8] block">Nombre Completo:</span>
                <span className="text-white font-bold">{currentAtleta.nombreCompleto}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block">Documento de Identidad:</span>
                <span className="font-mono text-white">{currentAtleta.documento}</span>
              </div>
              <div className="mt-2">
                <span className="text-[#94A3B8] block">Edad Oficial:</span>
                <span className="font-mono text-white">{currentAtleta.edad} años ({currentAtleta.categoria})</span>
              </div>
              <div className="mt-2">
                <span className="text-[#94A3B8] block">Posición:</span>
                <span className="text-[#FF6B35] font-bold">{currentAtleta.posicion}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Estatura (cm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={profileForm.tallaCm}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, tallaCm: parseFloat(e.target.value) || 170 })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={profileForm.pesoKg}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, pesoKg: parseFloat(e.target.value) || 70 })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Envergadura (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={profileForm.envergaduraCm}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      envergaduraCm: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white font-mono focus:border-[#3A86FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Club / Colegio
                </label>
                <input
                  type="text"
                  value={profileForm.club}
                  onChange={(e) => setProfileForm({ ...profileForm, club: e.target.value })}
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#3A86FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#DBE1FF] font-semibold mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={profileForm.telefono}
                  onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
                  className="w-full bg-[#1C2541] border border-[#3A4A76] rounded p-2 text-white focus:border-[#3A86FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#3A86FF] hover:bg-[#2563eb] text-white font-bold text-xs shadow-md"
              >
                Actualizar Mi Ficha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
