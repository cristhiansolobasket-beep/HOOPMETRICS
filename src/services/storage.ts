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
  INITIAL_ATLETAS,
  INITIAL_BAREMOS,
  INITIAL_EVALUACIONES,
  INITIAL_TESTS,
  INITIAL_USUARIOS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  ATLETAS: 'hoopmetrics_atletas',
  USUARIOS: 'hoopmetrics_usuarios',
  TESTS: 'hoopmetrics_tests',
  BAREMOS: 'hoopmetrics_baremos',
  EVALUACIONES: 'hoopmetrics_evaluaciones',
  CURRENT_USER: 'hoopmetrics_current_user',
};

// Cargar o inicializar
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Error loading key from localStorage:', key, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving key to localStorage:', key, e);
  }
}

// ============================================================================
// ATLETAS CRUD
// ============================================================================
export function getAtletas(): Atleta[] {
  return loadFromStorage<Atleta[]>(STORAGE_KEYS.ATLETAS, INITIAL_ATLETAS);
}

export function saveAtleta(atleta: Atleta): Atleta[] {
  const atletas = getAtletas();
  const index = atletas.findIndex((a) => a.id === atleta.id);
  if (index >= 0) {
    atletas[index] = atleta;
  } else {
    atletas.unshift(atleta);
  }
  saveToStorage(STORAGE_KEYS.ATLETAS, atletas);
  return atletas;
}

export function deleteAtleta(id: string): Atleta[] {
  const atletas = getAtletas().filter((a) => a.id !== id);
  saveToStorage(STORAGE_KEYS.ATLETAS, atletas);
  // Borrar usuario asociado si existe
  const usuarios = getUsuarios().filter((u) => u.atletaId !== id);
  saveToStorage(STORAGE_KEYS.USUARIOS, usuarios);
  return atletas;
}

// ============================================================================
// USUARIOS CRUD
// ============================================================================
export function getUsuarios(): Usuario[] {
  return loadFromStorage<Usuario[]>(STORAGE_KEYS.USUARIOS, INITIAL_USUARIOS);
}

export function saveUsuario(usuario: Usuario): Usuario[] {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === usuario.id);
  if (index >= 0) {
    usuarios[index] = usuario;
  } else {
    usuarios.unshift(usuario);
  }
  saveToStorage(STORAGE_KEYS.USUARIOS, usuarios);
  return usuarios;
}

export function deleteUsuario(id: string): Usuario[] {
  const usuarios = getUsuarios().filter((u) => u.id !== id);
  saveToStorage(STORAGE_KEYS.USUARIOS, usuarios);
  return usuarios;
}

// ============================================================================
// TESTS CRUD
// ============================================================================
export function getTests(): TestDeportivo[] {
  return loadFromStorage<TestDeportivo[]>(STORAGE_KEYS.TESTS, INITIAL_TESTS);
}

export function saveTest(test: TestDeportivo): TestDeportivo[] {
  const tests = getTests();
  const index = tests.findIndex((t) => t.id === test.id);
  if (index >= 0) {
    tests[index] = test;
  } else {
    tests.push(test);
  }
  saveToStorage(STORAGE_KEYS.TESTS, tests);
  return tests;
}

export function deleteTest(id: string): TestDeportivo[] {
  const tests = getTests().filter((t) => t.id !== id);
  saveToStorage(STORAGE_KEYS.TESTS, tests);
  return tests;
}

// ============================================================================
// BAREMOS CRUD
// ============================================================================
export function getBaremos(): Baremo[] {
  return loadFromStorage<Baremo[]>(STORAGE_KEYS.BAREMOS, INITIAL_BAREMOS);
}

export function saveBaremo(baremo: Baremo): Baremo[] {
  const baremos = getBaremos();
  const index = baremos.findIndex((b) => b.id === baremo.id);
  if (index >= 0) {
    baremos[index] = baremo;
  } else {
    baremos.push(baremo);
  }
  saveToStorage(STORAGE_KEYS.BAREMOS, baremos);
  return baremos;
}

export function deleteBaremo(id: string): Baremo[] {
  const baremos = getBaremos().filter((b) => b.id !== id);
  saveToStorage(STORAGE_KEYS.BAREMOS, baremos);
  return baremos;
}

// ============================================================================
// EVALUACIONES CRUD
// ============================================================================
export function getEvaluaciones(): Evaluacion[] {
  return loadFromStorage<Evaluacion[]>(STORAGE_KEYS.EVALUACIONES, INITIAL_EVALUACIONES);
}

export function saveEvaluacion(evaluacion: Evaluacion): Evaluacion[] {
  const evaluaciones = getEvaluaciones();
  const index = evaluaciones.findIndex((e) => e.id === evaluacion.id);
  if (index >= 0) {
    evaluaciones[index] = evaluacion;
  } else {
    evaluaciones.unshift(evaluacion);
  }
  saveToStorage(STORAGE_KEYS.EVALUACIONES, evaluaciones);
  return evaluaciones;
}

export function deleteEvaluacion(id: string): Evaluacion[] {
  const evaluaciones = getEvaluaciones().filter((e) => e.id !== id);
  saveToStorage(STORAGE_KEYS.EVALUACIONES, evaluaciones);
  return evaluaciones;
}

// ============================================================================
// SESIÓN DE USUARIO ACTUAL
// ============================================================================
export function getCurrentUser(): Usuario | null {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!user) {
    // Por defecto iniciar como admin para facilidad de prueba inmediata
    const admin = INITIAL_USUARIOS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
    return admin;
  }
  try {
    return JSON.parse(user);
  } catch {
    return INITIAL_USUARIOS[0];
  }
}

export function setCurrentUser(user: Usuario | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// ============================================================================
// MOTOR DE EVALUACIÓN Y CÁLCULO DE BAREMOS (TIEMPO REAL < 50ms)
// ============================================================================

export function clasificarConBaremo(
  test: TestDeportivo,
  valorMedido: number,
  atleta: Atleta,
  baremos: Baremo[]
): {
  puntaje: number;
  nivel: NivelRendimiento;
  colorHex: string;
  descripcion: string;
} {
  // 1. Filtrar baremos correspondientes a este test
  const baremosDeTest = baremos.filter((b) => b.testId === test.id);
  if (baremosDeTest.length === 0) {
    // Baremo por defecto genérico
    return {
      puntaje: 3,
      nivel: 'Intermedio',
      colorHex: '#F59E0B',
      descripcion: 'Baremo no configurado para este test.',
    };
  }

  // 2. Buscar por sexo y edad
  let baremoMatch = baremosDeTest.find((b) => {
    const sexoOk = b.sexo === 'Ambos' || b.sexo === atleta.sexo;
    let edadOk = false;
    if (b.rangoEdad === '15-20') edadOk = atleta.edad >= 15 && atleta.edad <= 20;
    else if (b.rangoEdad === '15-17') edadOk = atleta.edad >= 15 && atleta.edad <= 17;
    else if (b.rangoEdad === '18-20') edadOk = atleta.edad >= 18 && atleta.edad <= 20;
    return sexoOk && edadOk;
  });

  // Si no hay match exacto, buscar solo por sexo
  if (!baremoMatch) {
    baremoMatch = baremosDeTest.find((b) => b.sexo === 'Ambos' || b.sexo === atleta.sexo) || baremosDeTest[0];
  }

  // 3. Comparar con rangos
  for (const r of baremoMatch.rangos) {
    if (valorMedido >= r.min && valorMedido <= r.max) {
      return {
        puntaje: r.puntaje,
        nivel: r.nivel,
        colorHex: r.colorHex,
        descripcion: r.descripcion,
      };
    }
  }

  // Si está fuera de los límites:
  // Si sentido es 'mayor_es_mejor' y supera el máximo, es Élite
  if (test.sentido === 'mayor_es_mejor') {
    const maxRango = baremoMatch.rangos.find((r) => r.puntaje === 5);
    if (maxRango && valorMedido > maxRango.max) {
      return {
        puntaje: 5,
        nivel: 'Élite',
        colorHex: '#10B981',
        descripcion: 'Récord excepcional superior al rango máximo élite.',
      };
    }
    const minRango = baremoMatch.rangos.find((r) => r.puntaje === 1);
    if (minRango && valorMedido < minRango.min) {
      return {
        puntaje: 1,
        nivel: 'Etapa Inicial',
        colorHex: '#94A3B8',
        descripcion: 'Rendimiento por debajo del umbral mínimo.',
      };
    }
  } else {
    // Menor es mejor
    const eliteRango = baremoMatch.rangos.find((r) => r.puntaje === 5);
    if (eliteRango && valorMedido < eliteRango.min) {
      return {
        puntaje: 5,
        nivel: 'Élite',
        colorHex: '#10B981',
        descripcion: 'Tiempo récord sobresaliente.',
      };
    }
    return {
      puntaje: 1,
      nivel: 'Etapa Inicial',
      colorHex: '#94A3B8',
      descripcion: 'Marca superior al tiempo máximo establecido.',
    };
  }

  return {
    puntaje: 1,
    nivel: 'Etapa Inicial',
    colorHex: '#94A3B8',
    descripcion: 'Sin clasificación exacta.',
  };
}

export function clasificarPuntajeGlobal(pp: number): NivelRendimiento {
  if (pp >= 4.5) return 'Élite';
  if (pp >= 3.8) return 'Alto Rendimiento';
  if (pp >= 3.0) return 'Intermedio';
  if (pp >= 2.0) return 'Oportunidad de Mejora';
  return 'Etapa Inicial';
}

export function colorDeNivel(nivel: NivelRendimiento): string {
  switch (nivel) {
    case 'Élite':
      return '#10B981';
    case 'Alto Rendimiento':
      return '#3A86FF';
    case 'Intermedio':
      return '#F59E0B';
    case 'Oportunidad de Mejora':
      return '#FF6B35';
    case 'Etapa Inicial':
    default:
      return '#94A3B8';
  }
}

// Calcular Promedio Ponderado
export function calcularPromedioPonderado(
  resultados: ResultadoTest[],
  tests: TestDeportivo[]
): {
  pp: number;
  clasificacion: NivelRendimiento;
  colorHex: string;
} {
  if (resultados.length === 0) {
    return { pp: 0, clasificacion: 'Etapa Inicial', colorHex: '#94A3B8' };
  }

  let sumaPonderada = 0;
  let sumaPesos = 0;

  for (const res of resultados) {
    const test = tests.find((t) => t.id === res.testId);
    const peso = test ? test.ponderacion : 1 / resultados.length;
    sumaPonderada += res.puntajeObtenido * peso;
    sumaPesos += peso;
  }

  const pp = sumaPesos > 0 ? Number((sumaPonderada / sumaPesos).toFixed(2)) : 0;
  const clasificacion = clasificarPuntajeGlobal(pp);
  const colorHex = colorDeNivel(clasificacion);

  return { pp, clasificacion, colorHex };
}

// Restablecer valores de fábrica
export function resetStorage(): void {
  localStorage.setItem(STORAGE_KEYS.ATLETAS, JSON.stringify(INITIAL_ATLETAS));
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
  localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(INITIAL_TESTS));
  localStorage.setItem(STORAGE_KEYS.BAREMOS, JSON.stringify(INITIAL_BAREMOS));
  localStorage.setItem(STORAGE_KEYS.EVALUACIONES, JSON.stringify(INITIAL_EVALUACIONES));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USUARIOS[0]));
}
