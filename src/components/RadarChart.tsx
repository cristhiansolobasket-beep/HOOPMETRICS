import React from 'react';
import { ResultadoTest } from '../types/basketball';

interface RadarChartProps {
  resultados: ResultadoTest[];
  size?: number;
  labelColor?: string;
  accentColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  resultados,
  size = 320,
  labelColor = '#94A3B8',
  accentColor = '#FF6B35',
}) => {
  if (!resultados || resultados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[#94A3B8]">
        Sin datos de pruebas para graficar
      </div>
    );
  }

  const center = size / 2;
  const radius = (size / 2) - 48; // padding for labels
  const totalAxes = resultados.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Concentric levels (1 to 5)
  const levels = [1, 2, 3, 4, 5];

  // Helper to calculate coordinates
  const getCoordinates = (index: number, value: number, maxVal = 5) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points for athlete's values
  const athletePoints = resultados
    .map((r, i) => {
      const { x, y } = getCoordinates(i, r.puntajeObtenido);
      return `${x},${y}`;
    })
    .join(' ');

  // Polygon points for ideal Élite benchmark (5 on all axes)
  const elitePoints = resultados
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 5);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Concentric grid webs */}
        {levels.map((lvl) => {
          const points = resultados
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <g key={`level-${lvl}`}>
              <polygon
                points={points}
                fill={lvl === 5 ? '#10B98108' : 'none'}
                stroke="#1C2541"
                strokeWidth={lvl === 5 ? '1.5' : '1'}
                strokeDasharray={lvl % 2 === 0 ? '3 3' : 'none'}
              />
              {/* Level label */}
              <text
                x={center}
                y={center - (lvl / 5) * radius + 10}
                fill="#475569"
                fontSize="9"
                textAnchor="middle"
                className="font-mono font-bold"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* Axis radial spokes */}
        {resultados.map((_, i) => {
          const { x, y } = getCoordinates(i, 5);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#243054"
              strokeWidth="1"
            />
          );
        })}

        {/* Élite reference perimeter */}
        <polygon
          points={elitePoints}
          fill="none"
          stroke="#10B981"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.35"
        />

        {/* Athlete's performance polygon */}
        <polygon
          points={athletePoints}
          fill={`${accentColor}33`}
          stroke={accentColor}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Athlete points markers */}
        {resultados.map((r, i) => {
          const { x, y } = getCoordinates(i, r.puntajeObtenido);
          return (
            <g key={`point-${i}`}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#080D1A"
                stroke={r.colorHex || accentColor}
                strokeWidth="2.5"
              />
              <circle
                cx={x}
                cy={y}
                r="2"
                fill={r.colorHex || accentColor}
              />
            </g>
          );
        })}

        {/* Axis labels */}
        {resultados.map((r, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          // Truncate name or short code
          const shortTitle = r.testNombre.split(' ')[0] || r.testCodigo;

          return (
            <g key={`lbl-${i}`}>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                fontSize="11"
                className="font-mono font-semibold"
              >
                {shortTitle}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill={r.colorHex || '#94A3B8'}
                fontSize="10"
                className="font-mono font-bold"
              >
                {r.puntajeObtenido}.0
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#DBE1FF]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]"></span>
          <span>Resultado Atleta</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#10B981]">
          <span className="w-2 h-0.5 border-t border-dashed border-[#10B981]"></span>
          <span>Nivel Élite (5.0)</span>
        </div>
      </div>
    </div>
  );
};
