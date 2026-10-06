export type RolUsuario = 'admin' | 'deportista';

export type Sexo = 'Masculino' | 'Femenino';

export type PosicionBaloncesto = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

export type NivelRendimiento = 
  | 'Élite' 
  | 'Alto Rendimiento' 
  | 'Intermedio' 
  | 'Oportunidad de Mejora' 
  | 'Etapa Inicial';

export type SentidoPuntuacion = 'mayor_es_mejor' | 'menor_es_mejor';

export interface Usuario {
  id: string;
  username: string;
  password?: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  atletaId?: string; // Vinculación si es deportista
  activo: boolean;
  creadoEn: string;
}

export interface Atleta {
  id: string;
  nombreCompleto: string;
  documento: string; // Cédula o DNI
  fechaNacimiento: string;
  edad: number; // 15 a 20 años
  sexo: Sexo;
  tallaCm: number; // Ej: 188
  pesoKg: number;  // Ej: 78.5
  envergaduraCm?: number; // Opcional
  posicion: PosicionBaloncesto;
  categoria: 'Sub-17 (15-16)' | 'Sub-19 (17-18)' | 'Sub-21 (19-20)';
  telefono?: string;
  club?: string;
  activo: boolean;
  creadoEn: string;
}

export interface RangoBaremo {
  nivel: NivelRendimiento;
  puntaje: number; // 1 a 5
  min: number;
  max: number;
  colorHex: string;
  descripcion: string;
}

export interface Baremo {
  id: string;
  testId: string;
  sexo: Sexo | 'Ambos';
  rangoEdad: '15-17' | '18-20' | '15-20';
  rangos: RangoBaremo[];
}

export interface TestDeportivo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'Técnico' | 'Agilidad' | 'Velocidad' | 'Potencia' | 'Resistencia';
  unidad: string; // ej: 'Aciertos / 20', 'Segundos (s)', 'Centímetros (cm)', 'W/s'
  sentido: SentidoPuntuacion; // mayor_es_mejor o menor_es_mejor
  ponderacion: number; // 0.25 = 25%
  descripcionProtocolo: string;
  activo: boolean;
}

export interface ResultadoTest {
  testId: string;
  testCodigo: string;
  testNombre: string;
  valorMedido: number;
  unidad: string;
  puntajeObtenido: number; // 1 a 5
  clasificacion: NivelRendimiento;
  colorHex: string;
  detallesExtra?: Record<string, any>;
}

export interface Evaluacion {
  id: string;
  atletaId: string;
  atletaNombre: string;
  evaluadorId: string;
  evaluadorNombre: string;
  fecha: string;
  promedioPonderado: number; // 1.00 a 5.00
  clasificacionGlobal: NivelRendimiento;
  observaciones?: string;
  resultados: ResultadoTest[];
  creadoEn: string;
}
