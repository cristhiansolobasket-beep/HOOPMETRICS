import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface StopwatchProps {
  onCaptureTime?: (seconds: number) => void;
  label?: string;
}

export const Stopwatch: React.FC<StopwatchProps> = ({
  onCaptureTime,
  label = 'Cronómetro de Cancha',
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - timeMs;
      const update = () => {
        setTimeMs(performance.now() - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const toggleRun = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeMs(0);
  };

  const seconds = (timeMs / 1000).toFixed(2);
  const mins = Math.floor(timeMs / 60000);
  const secsRemainder = Math.floor((timeMs % 60000) / 1000);
  const centis = Math.floor((timeMs % 1000) / 10);

  const formatDisplay = () => {
    const mm = String(mins).padStart(2, '0');
    const ss = String(secsRemainder).padStart(2, '0');
    const cc = String(centis).padStart(2, '0');
    return `${mm}:${ss}.${cc}`;
  };

  return (
    <div className="bg-[#0B132B] border border-[#3A4A76]/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono font-medium">
          {label}
        </span>
        {isRunning && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#10B981] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            CORRIENDO
          </span>
        )}
      </div>

      <div className="font-mono text-3xl font-bold tracking-tight text-white my-1 tabular-nums">
        {formatDisplay()}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          type="button"
          onClick={toggleRun}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded font-mono font-bold text-sm transition-colors ${
            isRunning
              ? 'bg-[#FF6B35] text-[#080D1A] hover:bg-[#ff8559]'
              : 'bg-[#10B981] text-[#080D1A] hover:bg-[#34d399]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Iniciar
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center p-2.5 rounded bg-[#1C2541] hover:bg-[#243054] text-[#DBE1FF] border border-[#3A4A76]/40 transition-colors"
          title="Reiniciar a 0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {onCaptureTime && (
          <button
            type="button"
            onClick={() => onCaptureTime(parseFloat(seconds))}
            disabled={timeMs === 0}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded bg-[#3A86FF] hover:bg-[#2563eb] text-white font-mono text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Usar esta marca en el campo"
          >
            <Check className="w-3.5 h-3.5" />
            Tomar ({seconds}s)
          </button>
        )}
      </div>
    </div>
  );
};
