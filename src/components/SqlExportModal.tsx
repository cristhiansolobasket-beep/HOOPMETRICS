import React, { useState } from 'react';
import { Database, Download, Copy, Check, Server, FileText, Code2, AlertTriangle } from 'lucide-react';

interface SqlExportModalProps {
  onResetFactoryData: () => void;
}

export const SqlExportModal: React.FC<SqlExportModalProps> = ({ onResetFactoryData }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'cpanel' | 'php'>('sql');

  const sqlContent = `-- ==============================================================================
-- SISTEMA DE EVALUACIÓN DEL RENDIMIENTO DEPORTIVO EN BALONCESTO (15 - 20 AÑOS)
-- Base de Datos Oficial: datos.sql
-- Compatible con: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, cPanel phpMyAdmin
-- Codificación: UTF-8 Unicode (utf8mb4_unicode_ci)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS resultados_evaluacion;
DROP TABLE IF EXISTS evaluaciones;
DROP TABLE IF EXISTS rangos_baremo;
DROP TABLE IF EXISTS baremos;
DROP TABLE IF EXISTS tests_deportivos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS atletas;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TABLA: atletas
CREATE TABLE atletas (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    edad INT NOT NULL,
    sexo ENUM('Masculino', 'Femenino') NOT NULL,
    talla_cm DECIMAL(5,2) NOT NULL,
    peso_kg DECIMAL(5,2) NOT NULL,
    envergadura_cm DECIMAL(5,2) NULL,
    posicion ENUM('Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot') NOT NULL,
    categoria ENUM('Sub-17 (15-16)', 'Sub-19 (17-18)', 'Sub-21 (19-20)') NOT NULL,
    telefono VARCHAR(30) NULL,
    club VARCHAR(100) NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: usuarios
CREATE TABLE usuarios (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('admin', 'deportista') NOT NULL DEFAULT 'deportista',
    atleta_id VARCHAR(36) NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_atleta FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: tests_deportivos
CREATE TABLE tests_deportivos (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria ENUM('Técnico', 'Agilidad', 'Velocidad', 'Potencia', 'Resistencia') NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    sentido ENUM('mayor_es_mejor', 'menor_es_mejor') NOT NULL,
    ponderacion DECIMAL(4,2) NOT NULL DEFAULT 0.20,
    descripcion_protocolo TEXT NULL,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: baremos
CREATE TABLE baremos (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    test_id VARCHAR(36) NOT NULL,
    sexo ENUM('Masculino', 'Femenino', 'Ambos') NOT NULL,
    rango_edad ENUM('15-17', '18-20', '15-20') NOT NULL,
    CONSTRAINT fk_baremo_test FOREIGN KEY (test_id) REFERENCES tests_deportivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: rangos_baremo
CREATE TABLE rangos_baremo (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    baremo_id VARCHAR(36) NOT NULL,
    nivel ENUM('Élite', 'Alto Rendimiento', 'Intermedio', 'Oportunidad de Mejora', 'Etapa Inicial') NOT NULL,
    puntaje INT NOT NULL,
    min_val DECIMAL(8,2) NOT NULL,
    max_val DECIMAL(8,2) NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255) NULL,
    CONSTRAINT fk_rango_baremo FOREIGN KEY (baremo_id) REFERENCES baremos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: evaluaciones
CREATE TABLE evaluaciones (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    atleta_id VARCHAR(36) NOT NULL,
    evaluador_id VARCHAR(36) NOT NULL,
    fecha DATE NOT NULL,
    promedio_ponderado DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    clasificacion_global ENUM('Élite', 'Alto Rendimiento', 'Intermedio', 'Oportunidad de Mejora', 'Etapa Inicial') NOT NULL,
    observaciones TEXT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluacion_atleta FOREIGN KEY (atleta_id) REFERENCES atletas(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluacion_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA: resultados_evaluacion
CREATE TABLE resultados_evaluacion (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    evaluacion_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36) NOT NULL,
    valor_medido DECIMAL(8,2) NOT NULL,
    puntaje_obtenido INT NOT NULL,
    clasificacion ENUM('Élite', 'Alto Rendimiento', 'Intermedio', 'Oportunidad de Mejora', 'Etapa Inicial') NOT NULL,
    detalles_extra JSON NULL,
    CONSTRAINT fk_resultado_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_resultado_test FOREIGN KEY (test_id) REFERENCES tests_deportivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USUARIO ADMINISTRADOR POR DEFECTO:
-- Usuario: admin | Contraseña: admin123
INSERT INTO usuarios (id, username, password_hash, nombre, email, rol, activo) VALUES
('usr_admin', 'admin', 'admin123', 'Prof. Diego Morales - Director Técnico', 'admin@baloncesto.com', 'admin', 1);
`;

  const phpSnippet = `<?php
/**
 * config.php - Conexión de Base de Datos para Hosting cPanel
 * Sistema de Evaluación de Baloncesto
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario_cpanel');
define('DB_PASS', 'tu_contraseña_segura');
define('DB_NAME', 'tu_basedatos_baloncesto');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    die("Error crítico de conexión: " . $e->getMessage());
}
?>`;

  const handleDownloadSql = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'datos.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B132B] border border-[#3A4A76]/50 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C2541] border border-[#3A4A76] text-xs font-mono text-[#3A86FF] mb-2 font-semibold">
            <Database className="w-3.5 h-3.5" />
            ENTREGABLE OFICIAL · ARCHIVO DATOS.SQL
          </div>
          <h2 className="text-2xl font-bold text-white">
            Base de Datos y Despliegue cPanel PHP
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
            Script SQL completo con tablas relacionales normalizadas, baremos, tests y usuario administrador por defecto (<strong className="text-white">admin</strong> / <strong className="text-white">admin123</strong>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#080D1A] font-bold text-xs sm:text-sm shadow-lg shadow-[#10B981]/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar datos.sql</span>
          </button>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] border border-[#3A4A76] font-semibold text-xs transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#3A86FF]" />}
            <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-[#1C2541] pb-2">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'sql'
              ? 'bg-[#1C2541] text-white border border-[#3A4A76]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4 text-[#FF6B35]" />
          <span>Script datos.sql</span>
        </button>

        <button
          onClick={() => setActiveTab('cpanel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'cpanel'
              ? 'bg-[#1C2541] text-white border border-[#3A4A76]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Server className="w-4 h-4 text-[#3A86FF]" />
          <span>Guía de Instalación cPanel</span>
        </button>

        <button
          onClick={() => setActiveTab('php')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'php'
              ? 'bg-[#1C2541] text-white border border-[#3A4A76]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-[#10B981]" />
          <span>Código PHP Conexión</span>
        </button>
      </div>

      {/* Tab 1: Script viewer */}
      {activeTab === 'sql' && (
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono">
            <span>Archivo: <strong>/datos.sql</strong> (7 tablas + datos iniciales)</span>
            <span>Motor: InnoDB · UTF-8 (utf8mb4)</span>
          </div>

          <div className="bg-[#080D1A] rounded-lg p-4 font-mono text-xs text-[#DBE1FF] overflow-x-auto max-h-[460px] border border-[#1C2541]">
            <pre>{sqlContent}</pre>
          </div>
        </div>
      )}

      {/* Tab 2: cPanel instructions */}
      {activeTab === 'cpanel' && (
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-6 shadow-lg space-y-4 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-[#3A86FF]" />
            Pasos de Instalación en Hosting cPanel con PHP y MySQL
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-[#080D1A] p-4 rounded-xl border border-[#1C2541] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#FF6B35] text-[#080D1A] font-bold font-mono flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-white text-sm">Crear Base de Datos MySQL</h4>
              <p className="text-[#94A3B8]">
                Ingresa al cPanel &gt; "Bases de datos MySQL". Crea una nueva base de datos (ej. `miempresa_basket`) y crea un usuario con todos los privilegios concedidos.
              </p>
            </div>

            <div className="bg-[#080D1A] p-4 rounded-xl border border-[#1C2541] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#3A86FF] text-white font-bold font-mono flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-white text-sm">Importar datos.sql</h4>
              <p className="text-[#94A3B8]">
                Abre <strong>phpMyAdmin</strong> en cPanel, selecciona tu base de datos recién creada, dirígete a la pestaña <strong>Importar</strong> y sube el archivo <strong className="text-white">datos.sql</strong> descargado.
              </p>
            </div>

            <div className="bg-[#080D1A] p-4 rounded-xl border border-[#1C2541] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#10B981] text-[#080D1A] font-bold font-mono flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-white text-sm">Iniciar Sesión con Admin</h4>
              <p className="text-[#94A3B8]">
                El script ya contiene el usuario administrador oficial creado:<br />
                • Usuario: <strong className="text-white">admin</strong><br />
                • Contraseña: <strong className="text-white">admin123</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PHP Snippet */}
      {activeTab === 'php' && (
        <div className="bg-[#0B132B] border border-[#3A4A76]/40 rounded-xl p-6 shadow-lg space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#10B981]" />
            Plantilla PHP de Conexión PDO (config.php)
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Utiliza este archivo para conectar cualquier backend PHP tradicional en tu servidor cPanel con la base de datos importada.
          </p>

          <div className="bg-[#080D1A] rounded-lg p-4 font-mono text-xs text-[#DBE1FF] overflow-x-auto border border-[#1C2541]">
            <pre>{phpSnippet}</pre>
          </div>
        </div>
      )}

      {/* Danger Zone: Factory Reset */}
      <div className="bg-[#0B132B] border border-[#93000a]/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#ffb4ab]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            ¿Deseas restaurar todos los datos iniciales de fábrica de la aplicación?
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm('¿Restablecer deportistas, tests, baremos y usuarios a valores de fábrica?')) {
              onResetFactoryData();
            }
          }}
          className="px-3 py-1.5 rounded bg-[#93000a] hover:bg-[#b00020] text-white font-semibold transition-colors self-start sm:self-auto"
        >
          Restablecer a Valores de Fábrica
        </button>
      </div>
    </div>
  );
};
