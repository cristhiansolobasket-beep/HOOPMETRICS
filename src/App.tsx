/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Atleta,
  Baremo,
  Evaluacion,
  TestDeportivo,
  Usuario,
} from './types/basketball';
import {
  deleteAtleta,
  deleteBaremo,
  deleteEvaluacion,
  deleteTest,
  deleteUsuario,
  getAtletas,
  getBaremos,
  getCurrentUser,
  getEvaluaciones,
  getTests,
  getUsuarios,
  resetStorage,
  saveAtleta,
  saveBaremo,
  saveEvaluacion,
  saveTest,
  saveUsuario,
  setCurrentUser,
} from './services/storage';
import { Navbar, AdminTab, DeportistaTab } from './components/Navbar';
import { DashboardAdmin } from './components/DashboardAdmin';
import { AtletasCrud } from './components/AtletasCrud';
import { UsuariosCrud } from './components/UsuariosCrud';
import { TestsCrud } from './components/TestsCrud';
import { BaremosCrud } from './components/BaremosCrud';
import { EvaluacionEnVivo } from './components/EvaluacionEnVivo';
import { HistorialEvaluaciones } from './components/HistorialEvaluaciones';
import { PortalDeportista } from './components/PortalDeportista';
import { SqlExportModal } from './components/SqlExportModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // Application Data States
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tests, setTests] = useState<TestDeportivo[]>([]);
  const [baremos, setBaremos] = useState<Baremo[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [currentUser, setCurUser] = useState<Usuario | null>(null);

  // Navigation States
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [deportistaTab, setDeportistaTab] = useState<DeportistaTab>('mi_rendimiento');
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);

  // Workflow Handlers
  const [atletaToEvaluate, setAtletaToEvaluate] = useState<Atleta | null>(null);
  const [evaluacionToInspect, setEvaluacionToInspect] = useState<Evaluacion | null>(null);
  const [testForBaremosFilter, setTestForBaremosFilter] = useState<string | undefined>(undefined);

  // Load from Storage
  const loadAllData = () => {
    setAtletas(getAtletas());
    setUsuarios(getUsuarios());
    setTests(getTests());
    setBaremos(getBaremos());
    setEvaluaciones(getEvaluaciones());
    setCurUser(getCurrentUser());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Login & Session Handlers
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    setCurUser(user);
    setIsSwitchingUser(false);
    if (user.rol === 'admin') {
      setAdminTab('dashboard');
    } else {
      setDeportistaTab('mi_rendimiento');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurUser(null);
    setIsSwitchingUser(true);
  };

  const handleRegisterAthlete = (atleta: Atleta, usuario: Usuario) => {
    saveAtleta(atleta);
    saveUsuario(usuario);
    loadAllData();
    handleLoginSuccess(usuario);
  };

  // CRUD Actions for Atletas
  const handleSaveAtleta = (atleta: Atleta) => {
    const updated = saveAtleta(atleta);
    setAtletas([...updated]);
  };

  const handleDeleteAtleta = (id: string) => {
    const updated = deleteAtleta(id);
    setAtletas([...updated]);
    setUsuarios([...getUsuarios()]);
  };

  // CRUD Actions for Usuarios
  const handleSaveUsuario = (usuario: Usuario) => {
    const updated = saveUsuario(usuario);
    setUsuarios([...updated]);
  };

  const handleDeleteUsuario = (id: string) => {
    const updated = deleteUsuario(id);
    setUsuarios([...updated]);
  };

  // CRUD Actions for Tests
  const handleSaveTest = (test: TestDeportivo) => {
    const updated = saveTest(test);
    setTests([...updated]);
  };

  const handleDeleteTest = (id: string) => {
    const updated = deleteTest(id);
    setTests([...updated]);
  };

  // CRUD Actions for Baremos
  const handleSaveBaremo = (baremo: Baremo) => {
    const updated = saveBaremo(baremo);
    setBaremos([...updated]);
  };

  const handleDeleteBaremo = (id: string) => {
    const updated = deleteBaremo(id);
    setBaremos([...updated]);
  };

  // CRUD Actions for Evaluaciones
  const handleSaveEvaluacion = (evaluacion: Evaluacion) => {
    const updated = saveEvaluacion(evaluacion);
    setEvaluaciones([...updated]);
    setEvaluacionToInspect(evaluacion);
    setAdminTab('historial');
  };

  const handleDeleteEvaluacion = (id: string) => {
    const updated = deleteEvaluacion(id);
    setEvaluaciones([...updated]);
    if (evaluacionToInspect?.id === id) {
      setEvaluacionToInspect(null);
    }
  };

  // Factory Reset
  const handleResetFactory = () => {
    resetStorage();
    loadAllData();
    setAdminTab('dashboard');
  };

  // Transition shortcuts
  const handleStartEvaluationForAthlete = (atleta: Atleta) => {
    setAtletaToEvaluate(atleta);
    setAdminTab('evaluar');
  };

  const handleInspectEvaluacion = (ev: Evaluacion) => {
    setEvaluacionToInspect(ev);
    setAdminTab('historial');
  };

  const handleNavigateToBaremosForTest = (testId: string) => {
    setTestForBaremosFilter(testId);
    setAdminTab('baremos');
  };

  // Render Login Modal if no user or switching
  if (!currentUser || isSwitchingUser) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center text-[#DBE1FF]">
        <LoginModal
          usuarios={usuarios}
          atletas={atletas}
          onLoginSuccess={handleLoginSuccess}
          onRegisterAthlete={handleRegisterAthlete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-[#DBE1FF] flex flex-col">
      {/* Top Main Navigation */}
      <Navbar
        currentUser={currentUser}
        activeAdminTab={adminTab}
        setActiveAdminTab={setAdminTab}
        activeDeportistaTab={deportistaTab}
        setActiveDeportistaTab={setDeportistaTab}
        onLogout={handleLogout}
        onSwitchUser={() => setIsSwitchingUser(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.rol === 'admin' ? (
          // ================= ADMIN VIEWS =================
          <>
            {adminTab === 'dashboard' && (
              <DashboardAdmin
                atletas={atletas}
                evaluaciones={evaluaciones}
                tests={tests}
                onNavigateTab={(tab) => setAdminTab(tab)}
                onSelectEvaluacion={handleInspectEvaluacion}
              />
            )}

            {adminTab === 'evaluar' && (
              <EvaluacionEnVivo
                atletas={atletas}
                tests={tests}
                baremos={baremos}
                currentUser={currentUser}
                initialSelectedAtleta={atletaToEvaluate}
                onSaveEvaluacion={handleSaveEvaluacion}
                onCancel={() => setAdminTab('dashboard')}
              />
            )}

            {adminTab === 'historial' && (
              <HistorialEvaluaciones
                evaluaciones={evaluaciones}
                atletas={atletas}
                selectedEvaluacionInitial={evaluacionToInspect}
                onDeleteEvaluacion={handleDeleteEvaluacion}
                onStartNewEvaluation={() => {
                  setAtletaToEvaluate(null);
                  setAdminTab('evaluar');
                }}
              />
            )}

            {adminTab === 'atletas' && (
              <AtletasCrud
                atletas={atletas}
                onSaveAtleta={handleSaveAtleta}
                onDeleteAtleta={handleDeleteAtleta}
                onStartEvaluation={handleStartEvaluationForAthlete}
              />
            )}

            {adminTab === 'tests' && (
              <TestsCrud
                tests={tests}
                onSaveTest={handleSaveTest}
                onDeleteTest={handleDeleteTest}
                onNavigateToBaremos={handleNavigateToBaremosForTest}
              />
            )}

            {adminTab === 'baremos' && (
              <BaremosCrud
                baremos={baremos}
                tests={tests}
                selectedTestIdInitial={testForBaremosFilter}
                onSaveBaremo={handleSaveBaremo}
                onDeleteBaremo={handleDeleteBaremo}
              />
            )}

            {adminTab === 'usuarios' && (
              <UsuariosCrud
                usuarios={usuarios}
                atletas={atletas}
                currentUserId={currentUser.id}
                onSaveUsuario={handleSaveUsuario}
                onDeleteUsuario={handleDeleteUsuario}
              />
            )}

            {adminTab === 'sql' && (
              <SqlExportModal onResetFactoryData={handleResetFactory} />
            )}
          </>
        ) : (
          // ================= DEPORTISTA VIEWS =================
          <PortalDeportista
            currentUser={currentUser}
            atletas={atletas}
            evaluaciones={evaluaciones}
            tests={tests}
            baremos={baremos}
            activeTab={deportistaTab}
            onUpdateAtleta={handleSaveAtleta}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#1C2541] bg-[#0B132B]/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-white font-bold">HOOPMETRICS PRO</span>
            <span>· Sistema de Evaluación del Rendimiento Deportivo en Baloncesto (15-20 Años)</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Base de datos: <strong className="text-[#10B981]">datos.sql</strong></span>
            <span>Admin por defecto: <strong className="text-white">admin / admin123</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
