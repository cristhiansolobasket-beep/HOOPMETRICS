-- ==============================================================================
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

-- ------------------------------------------------------------------------------
-- 1. TABLA: atletas
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. TABLA: usuarios
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. TABLA: tests_deportivos
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. TABLA: baremos
-- ------------------------------------------------------------------------------
CREATE TABLE baremos (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    test_id VARCHAR(36) NOT NULL,
    sexo ENUM('Masculino', 'Femenino', 'Ambos') NOT NULL,
    rango_edad ENUM('15-17', '18-20', '15-20') NOT NULL,
    CONSTRAINT fk_baremo_test FOREIGN KEY (test_id) REFERENCES tests_deportivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: rangos_baremo
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. TABLA: evaluaciones
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. TABLA: resultados_evaluacion
-- ------------------------------------------------------------------------------
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

-- ==============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- 1. Tests Deportivos
INSERT INTO tests_deportivos (id, codigo, nombre, categoria, unidad, sentido, ponderacion, descripcion_protocolo, activo) VALUES
('test_tiro', 'tiro_media', 'Efectividad en Lanzamiento de Media Distancia', 'Técnico', 'Aciertos / 20', 'mayor_es_mejor', 0.25, '20 lanzamientos desde 5 puntos del perímetro en 60 segundos con pasador.', 1),
('test_dribling', 'dribling_z', 'Dribling y Agilidad (Circuito Slalom en Z)', 'Agilidad', 'Segundos (s)', 'menor_es_mejor', 0.25, 'Slalom con cambio de dirección continuo a través de 6 conos distanciados a 3m.', 1),
('test_velocidad', 'velocidad_28m', 'Velocidad Sprint Lineal 28 Metros', 'Velocidad', 'Segundos (s)', 'menor_es_mejor', 0.15, 'Sprint de máxima aceleración en cancha oficial FIBA de 28m.', 1),
('test_salto', 'salto_cmj', 'Salto Vertical con Contramovimiento (CMJ)', 'Potencia', 'Centímetros (cm)', 'mayor_es_mejor', 0.20, 'Salto vertical con ayuda de brazos para evaluar potencia neuromuscular.', 1),
('test_rast', 'rast_fatiga', 'Resistencia Anaeróbica - Test RAST (Índice de Fatiga)', 'Resistencia', 'Índice Fatiga (W/s)', 'menor_es_mejor', 0.15, '6 sprints de 35m con 10s descanso. Cálculo de Índice de Fatiga.', 1);

-- 2. Deportistas Iniciales
INSERT INTO atletas (id, nombre_completo, documento, fecha_nacimiento, edad, sexo, talla_cm, peso_kg, envergadura_cm, posicion, categoria, telefono, club, activo) VALUES
('atl_01', 'Carlos Eduardo Mendoza', '1098234561', '2008-04-12', 18, 'Masculino', 191.00, 82.50, 198.00, 'Escolta', 'Sub-19 (17-18)', '+57 312 458 9210', 'Titanes del Baloncesto Bogotá', 1),
('atl_02', 'Sofía Valentina Rodríguez', '1097654321', '2009-07-25', 17, 'Femenino', 176.00, 64.00, 181.00, 'Base', 'Sub-17 (15-16)', '+57 315 889 0012', 'Águilas Club Juvenil', 1),
('atl_03', 'Mateo Alejandro Gómez', '1095432109', '2007-02-18', 19, 'Masculino', 202.00, 95.00, 211.00, 'Pívot', 'Sub-21 (19-20)', '+57 320 671 2345', 'Titanes del Baloncesto Bogotá', 1),
('atl_04', 'Camila Andrea Ospina', '1096781234', '2010-09-05', 16, 'Femenino', 183.00, 70.20, 188.00, 'Alero', 'Sub-17 (15-16)', '+57 318 901 3456', 'Club Halcones del Norte', 1),
('atl_05', 'Juan David Herrera', '1094321987', '2006-11-30', 20, 'Masculino', 196.00, 89.00, 204.00, 'Ala-Pívot', 'Sub-21 (19-20)', '+57 310 765 4321', 'Academia Basket Pro', 1);

-- 3. Usuarios Iniciales
-- Contraseña de admin: 'admin123'
-- Contraseña de deportistas: '123456'
INSERT INTO usuarios (id, username, password_hash, nombre, email, rol, atleta_id, activo) VALUES
('usr_admin', 'admin', 'admin123', 'Prof. Diego Morales - Director Técnico', 'admin@baloncesto.com', 'admin', NULL, 1),
('usr_carlos', 'carlos.mendoza', '123456', 'Carlos Eduardo Mendoza', 'carlos.mendoza@baloncesto.com', 'deportista', 'atl_01', 1),
('usr_sofia', 'sofia.rodriguez', '123456', 'Sofía Valentina Rodríguez', 'sofia.rodriguez@baloncesto.com', 'deportista', 'atl_02', 1);

-- 4. Baremos y Rangos
-- Baremo Tiro Masculino 15-17
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_tiro_m_15_17', 'test_tiro', 'Masculino', '15-17');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_tm_1', 'bar_tiro_m_15_17', 'Élite', 5, 16.00, 20.00, '#10B981', 'Sobresaliente puntería (>80%)'),
('r_tm_2', 'bar_tiro_m_15_17', 'Alto Rendimiento', 4, 13.00, 15.00, '#3A86FF', 'Excelente consistencia (65-75%)'),
('r_tm_3', 'bar_tiro_m_15_17', 'Intermedio', 3, 10.00, 12.00, '#F59E0B', 'Rendimiento promedio (50-60%)'),
('r_tm_4', 'bar_tiro_m_15_17', 'Oportunidad de Mejora', 2, 7.00, 9.00, '#FF6B35', 'Mecánica irregular con fatiga'),
('r_tm_5', 'bar_tiro_m_15_17', 'Etapa Inicial', 1, 0.00, 6.00, '#94A3B8', 'Requiere ajuste biomecánico');

-- Baremo Tiro Masculino 18-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_tiro_m_18_20', 'test_tiro', 'Masculino', '18-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_tm2_1', 'bar_tiro_m_18_20', 'Élite', 5, 17.00, 20.00, '#10B981', 'Competitivo universitario/profesional'),
('r_tm2_2', 'bar_tiro_m_18_20', 'Alto Rendimiento', 4, 14.00, 16.00, '#3A86FF', 'Alta efectividad de lanzamiento'),
('r_tm2_3', 'bar_tiro_m_18_20', 'Intermedio', 3, 11.00, 13.00, '#F59E0B', 'Rango regular de juego'),
('r_tm2_4', 'bar_tiro_m_18_20', 'Oportunidad de Mejora', 2, 8.00, 10.00, '#FF6B35', 'Bajo porcentaje de acierto'),
('r_tm2_5', 'bar_tiro_m_18_20', 'Etapa Inicial', 1, 0.00, 7.00, '#94A3B8', 'Mecánica deficiente');

-- Baremo Tiro Femenino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_tiro_f_15_20', 'test_tiro', 'Femenino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_tf_1', 'bar_tiro_f_15_20', 'Élite', 5, 15.00, 20.00, '#10B981', 'Puntería de alta competencia'),
('r_tf_2', 'bar_tiro_f_15_20', 'Alto Rendimiento', 4, 12.00, 14.00, '#3A86FF', 'Buena mecánica y acierto'),
('r_tf_3', 'bar_tiro_f_15_20', 'Intermedio', 3, 9.00, 11.00, '#F59E0B', 'Promedio en formativa'),
('r_tf_4', 'bar_tiro_f_15_20', 'Oportunidad de Mejora', 2, 6.00, 8.00, '#FF6B35', 'Baja conversión perimetral'),
('r_tf_5', 'bar_tiro_f_15_20', 'Etapa Inicial', 1, 0.00, 5.00, '#94A3B8', 'Mecánica inicial');

-- Baremo Dribling Masculino 15-17
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_drib_m_15_17', 'test_dribling', 'Masculino', '15-17');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_dm1_1', 'bar_drib_m_15_17', 'Élite', 5, 0.00, 11.20, '#10B981', 'Dominio excepcional y velocidad'),
('r_dm1_2', 'bar_drib_m_15_17', 'Alto Rendimiento', 4, 11.21, 12.30, '#3A86FF', 'Excelente fluidez y bote bajo'),
('r_dm1_3', 'bar_drib_m_15_17', 'Intermedio', 3, 12.31, 13.80, '#F59E0B', 'Control estándar de trayectoria'),
('r_dm1_4', 'bar_drib_m_15_17', 'Oportunidad de Mejora', 2, 13.81, 15.20, '#FF6B35', 'Pérdida de inercia en cambios'),
('r_dm1_5', 'bar_drib_m_15_17', 'Etapa Inicial', 1, 15.21, 99.99, '#94A3B8', 'Dificultad con mano no diestra');

-- Baremo Dribling Masculino 18-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_drib_m_18_20', 'test_dribling', 'Masculino', '18-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_dm2_1', 'bar_drib_m_18_20', 'Élite', 5, 0.00, 10.70, '#10B981', 'Velocidad de élite en transición'),
('r_dm2_2', 'bar_drib_m_18_20', 'Alto Rendimiento', 4, 10.71, 11.80, '#3A86FF', 'Gran agilidad en ambos perfiles'),
('r_dm2_3', 'bar_drib_m_18_20', 'Intermedio', 3, 11.81, 13.20, '#F59E0B', 'Control estándar'),
('r_dm2_4', 'bar_drib_m_18_20', 'Oportunidad de Mejora', 2, 13.21, 14.60, '#FF6B35', 'Bote alto y lentitud'),
('r_dm2_5', 'bar_drib_m_18_20', 'Etapa Inicial', 1, 14.61, 99.99, '#94A3B8', 'Fundamentos deficientes');

-- Baremo Dribling Femenino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_drib_f_15_20', 'test_dribling', 'Femenino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_df_1', 'bar_drib_f_15_20', 'Élite', 5, 0.00, 11.80, '#10B981', 'Extraordinario control dinámico'),
('r_df_2', 'bar_drib_f_15_20', 'Alto Rendimiento', 4, 11.81, 12.90, '#3A86FF', 'Excelente cambio de ritmo'),
('r_df_3', 'bar_drib_f_15_20', 'Intermedio', 3, 12.91, 14.40, '#F59E0B', 'Manejo correcto en circuito'),
('r_df_4', 'bar_drib_f_15_20', 'Oportunidad de Mejora', 2, 14.41, 15.80, '#FF6B35', 'Lenta en transiciones'),
('r_df_5', 'bar_drib_f_15_20', 'Etapa Inicial', 1, 15.81, 99.99, '#94A3B8', 'Inestabilidad en la conducción');

-- Baremo Velocidad 28m Masculino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_vel_m_15_20', 'test_velocidad', 'Masculino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_vm_1', 'bar_vel_m_15_20', 'Élite', 5, 0.00, 3.65, '#10B981', 'Aceleración explosiva'),
('r_vm_2', 'bar_vel_m_15_20', 'Alto Rendimiento', 4, 3.66, 3.90, '#3A86FF', 'Gran velocidad lineal'),
('r_vm_3', 'bar_vel_m_15_20', 'Intermedio', 3, 3.91, 4.25, '#F59E0B', 'Velocidad estándar formativa'),
('r_vm_4', 'bar_vel_m_15_20', 'Oportunidad de Mejora', 2, 4.26, 4.60, '#FF6B35', 'Arranque inicial lento'),
('r_vm_5', 'bar_vel_m_15_20', 'Etapa Inicial', 1, 4.61, 99.99, '#94A3B8', 'Fuerza reactiva insuficiente');

-- Baremo Velocidad 28m Femenino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_vel_f_15_20', 'test_velocidad', 'Femenino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_vf_1', 'bar_vel_f_15_20', 'Élite', 5, 0.00, 3.95, '#10B981', 'Velocidad sobresaliente'),
('r_vf_2', 'bar_vel_f_15_20', 'Alto Rendimiento', 4, 3.96, 4.20, '#3A86FF', 'Buena capacidad de sprint'),
('r_vf_3', 'bar_vel_f_15_20', 'Intermedio', 3, 4.21, 4.55, '#F59E0B', 'Promedio competitivo'),
('r_vf_4', 'bar_vel_f_15_20', 'Oportunidad de Mejora', 2, 4.56, 4.90, '#FF6B35', 'Desaceleración prematura'),
('r_vf_5', 'bar_vel_f_15_20', 'Etapa Inicial', 1, 4.91, 99.99, '#94A3B8', 'Fuerza explosiva deficiente');

-- Baremo Salto CMJ Masculino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_salto_m_15_20', 'test_salto', 'Masculino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_sm_1', 'bar_salto_m_15_20', 'Élite', 5, 62.00, 120.00, '#10B981', 'Elevación de campeonato'),
('r_sm_2', 'bar_salto_m_15_20', 'Alto Rendimiento', 4, 53.00, 61.90, '#3A86FF', 'Excelente despegue y rebote'),
('r_sm_3', 'bar_salto_m_15_20', 'Intermedio', 3, 44.00, 52.90, '#F59E0B', 'Salto adecuado formativo'),
('r_sm_4', 'bar_salto_m_15_20', 'Oportunidad de Mejora', 2, 36.00, 43.90, '#FF6B35', 'Fuerza explosiva baja'),
('r_sm_5', 'bar_salto_m_15_20', 'Etapa Inicial', 1, 0.00, 35.90, '#94A3B8', 'Requiere plan pliométrico');

-- Baremo Salto CMJ Femenino 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_salto_f_15_20', 'test_salto', 'Femenino', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_sf_1', 'bar_salto_f_15_20', 'Élite', 5, 48.00, 90.00, '#10B981', 'Excelente potencia de despegue'),
('r_sf_2', 'bar_salto_f_15_20', 'Alto Rendimiento', 4, 41.00, 47.90, '#3A86FF', 'Gran alcance y suspensión'),
('r_sf_3', 'bar_salto_f_15_20', 'Intermedio', 3, 33.00, 40.90, '#F59E0B', 'Rendimiento promedio'),
('r_sf_4', 'bar_salto_f_15_20', 'Oportunidad de Mejora', 2, 26.00, 32.90, '#FF6B35', 'Bajo componente elástico'),
('r_sf_5', 'bar_salto_f_15_20', 'Etapa Inicial', 1, 0.00, 25.90, '#94A3B8', 'Desarrollo inicial');

-- Baremo RAST Ambos 15-20
INSERT INTO baremos (id, test_id, sexo, rango_edad) VALUES ('bar_rast_ambos_15_20', 'test_rast', 'Ambos', '15-20');
INSERT INTO rangos_baremo (id, baremo_id, nivel, puntaje, min_val, max_val, color_hex, descripcion) VALUES
('r_ra_1', 'bar_rast_ambos_15_20', 'Élite', 5, 0.00, 5.50, '#10B981', 'Sostenibilidad anaeróbica superior'),
('r_ra_2', 'bar_rast_ambos_15_20', 'Alto Rendimiento', 4, 5.51, 8.50, '#3A86FF', 'Buena resistencia a sprints repetidos'),
('r_ra_3', 'bar_rast_ambos_15_20', 'Intermedio', 3, 8.51, 12.00, '#F59E0B', 'Fatiga controlada en tramos finales'),
('r_ra_4', 'bar_rast_ambos_15_20', 'Oportunidad de Mejora', 2, 12.01, 16.50, '#FF6B35', 'Pérdida pronunciada de potencia'),
('r_ra_5', 'bar_rast_ambos_15_20', 'Etapa Inicial', 1, 16.51, 99.99, '#94A3B8', 'Agotamiento temprano del sistema');

-- 5. Evaluaciones Iniciales
INSERT INTO evaluaciones (id, atleta_id, evaluador_id, fecha, promedio_ponderado, clasificacion_global, observaciones) VALUES
('eval_01', 'atl_01', 'usr_admin', '2026-09-20', 4.45, 'Alto Rendimiento', 'Excelente capacidad anotadora y potencia en el salto. Gran fluidez técnica con su mano diestra.'),
('eval_02', 'atl_02', 'usr_admin', '2026-09-22', 4.65, 'Élite', 'Extraordinaria visión de juego, velocidad de reacción y agilidad en el bote bajo.');

-- 6. Resultados Evaluaciones
INSERT INTO resultados_evaluacion (id, evaluacion_id, test_id, valor_medido, puntaje_obtenido, clasificacion, detalles_extra) VALUES
('res_01', 'eval_01', 'test_tiro', 16.00, 4, 'Alto Rendimiento', '{"aciertos": 16}'),
('res_02', 'eval_01', 'test_dribling', 10.65, 5, 'Élite', '{"tiempo_seg": 10.65}'),
('res_03', 'eval_01', 'test_velocidad', 3.68, 4, 'Alto Rendimiento', '{"tiempo_seg": 3.68}'),
('res_04', 'eval_01', 'test_salto', 64.50, 5, 'Élite', '{"altura_cm": 64.5}'),
('res_05', 'eval_01', 'test_rast', 6.80, 4, 'Alto Rendimiento', '{"indice_fatiga": 6.8}'),

('res_06', 'eval_02', 'test_tiro', 17.00, 5, 'Élite', '{"aciertos": 17}'),
('res_07', 'eval_02', 'test_dribling', 11.45, 5, 'Élite', '{"tiempo_seg": 11.45}'),
('res_08', 'eval_02', 'test_velocidad', 4.02, 4, 'Alto Rendimiento', '{"tiempo_seg": 4.02}'),
('res_09', 'eval_02', 'test_salto', 49.00, 5, 'Élite', '{"altura_cm": 49.0}'),
('res_10', 'eval_02', 'test_rast', 7.20, 4, 'Alto Rendimiento', '{"indice_fatiga": 7.2}');

-- ==============================================================================
-- FIN DEL SCRIPT datos.sql
-- ==============================================================================
