import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Play,
  Pause,
  StepForward,
  RotateCcw as ResetIcon,
  Trash2,
  Repeat,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react';
import { ExecutionStatus, PlaybackSpeed } from '../types/game';

interface CommandPanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  status: ExecutionStatus;
  errorMessage: string | null;
  errorLine: number | null;
  activeLine: number | null;
  hint: string | null;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onResetBoard: () => void;
  onClearCode: () => void;
  onNextLevel?: () => void;
  hasNextLevel: boolean;
  isSandbox: boolean;
  stepsExecuted: number;
  optimalSteps?: number;
  commandCount: number;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({
  code,
  onCodeChange,
  status,
  errorMessage,
  errorLine,
  activeLine,
  hint,
  speed,
  onSpeedChange,
  onRun,
  onPause,
  onStep,
  onResetBoard,
  onClearCode,
  onNextLevel,
  hasNextLevel,
  isSandbox,
  stepsExecuted,
  optimalSteps,
  commandCount,
}) => {
  const [stepAmount, setStepAmount] = useState<number>(1);
  const [showHint, setShowHint] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setShowHint(false);
  }, [hint]);

  const lines = code.split(/\r?\n/);
  const lineCount = Math.max(lines.length, 8);

  const insertCommand = (cmd: string) => {
    const trimmed = code.replace(/\s+$/, '');
    const nextCode = trimmed.length > 0 ? `${trimmed}\n${cmd}` : cmd;
    onCodeChange(nextCode);
    // Focus textarea at bottom
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (status === 'running') {
        onPause();
      } else {
        onRun();
      }
    }
  };

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isWon = status === 'won';

  return (
    <section
      aria-label="Buyrıq paneli"
      className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden"
    >
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Buyrıq paneli
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Robot ushın qısqartırılǵan buyrıqlardı tańlań yamasa jazıń
          </p>
        </div>

        {hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showHint
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Járdem</span>
          </button>
        )}
      </div>

      {/* Collapsible Hint Box */}
      {hint && showHint && (
        <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200 text-xs leading-relaxed text-amber-950">
          <span className="font-semibold">Keńes: </span>
          {hint}
        </div>
      )}

      {/* Quick Insert Command Palette */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">
            Tez qosıw túymeleri
          </span>

          {/* Step Count Stepper for FD / BK */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Qádem sanı:</span>
            <button
              type="button"
              onClick={() => setStepAmount((s) => Math.max(1, s - 1))}
              aria-label="Qádem sanın kemeytiw"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-mono text-xs font-bold text-slate-900 tabular-nums">
              {stepAmount}
            </span>
            <button
              type="button"
              onClick={() => setStepAmount((s) => Math.min(9, s + 1))}
              aria-label="Qádem sanın arttırıw"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Core Abbreviated Command Buttons + REPEAT */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => insertCommand(`FD ${stepAmount}`)}
            disabled={isRunning}
            className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.99] transition-all text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900">
                  FD {stepAmount}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Aldınǵa (FORWARD)
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => insertCommand(`BK ${stepAmount}`)}
            disabled={isRunning}
            className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.99] transition-all text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900">
                  BK {stepAmount}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Artqa (BACK)
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => insertCommand('RT 90')}
            disabled={isRunning}
            className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.99] transition-all text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <RotateCw className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900">
                  RT 90
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Ońǵa (RIGHT 90°)
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => insertCommand('LT 90')}
            disabled={isRunning}
            className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.99] transition-all text-left disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900">
                  LT 90
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Solǵa (LEFT 90°)
                </div>
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => insertCommand('REPEAT 4 [\n  FD 2\n  RT 90\n]')}
          disabled={isRunning}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:bg-sky-50/40 transition-all text-left disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="font-mono text-xs font-semibold text-slate-900">
              REPEAT 4 [ FD 2 RT 90 ]
            </span>
          </div>
          <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">
            Sikl qosıw
          </span>
        </button>
      </div>

      {/* Line-numbered Code Editor */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-white">
        <div className="px-4 py-2 bg-slate-50/40 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Programma kodı</span>
          <span className="font-mono tabular-nums">
            Ctrl + Enter — Isletiw
          </span>
        </div>

        <div className="relative flex flex-1 font-mono text-sm leading-6 overflow-hidden">
          {/* Line numbers gutter */}
          <div
            aria-hidden="true"
            className="select-none py-3 px-2.5 bg-slate-50 border-r border-slate-200 text-right text-xs leading-6 text-slate-400 tabular-nums min-w-[2.5rem]"
          >
            {Array.from({ length: lineCount }, (_, idx) => {
              const lineNum = idx + 1;
              const isErr = errorLine === lineNum;
              const isActive = activeLine === lineNum;
              return (
                <div
                  key={lineNum}
                  className={`px-1 rounded ${
                    isErr
                      ? 'bg-red-100 text-red-700 font-bold'
                      : isActive
                        ? 'bg-sky-100 text-sky-700 font-bold'
                        : ''
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="characters"
            autoComplete="off"
            aria-label="Robot buyrıqları redaktorı"
            placeholder={'Máselen:\nFD 5\nRT 90\nFD 3'}
            className="flex-1 w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none font-mono text-sm leading-6 min-h-[210px]"
          />
        </div>
      </div>

      {/* Execution Feedback Area */}
      {(errorMessage || isWon) && (
        <div className="px-4 pb-3">
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed"
            >
              <AlertCircle
                className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <span className="font-semibold">Qátelik: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {isWon && !errorMessage && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-emerald-950">
                    Ájayıp! Robot belgilengen orınǵa jetti!
                  </div>
                  <div className="text-emerald-800 mt-0.5 tabular-nums">
                    Buyrıqlar sanı: {commandCount}
                    {optimalSteps !== undefined
                      ? ` · Optimal: ${optimalSteps}`
                      : ''}
                    {' · '}
                    Qádemler: {stepsExecuted}
                  </div>
                </div>
              </div>

              {hasNextLevel && onNextLevel && (
                <button
                  type="button"
                  onClick={onNextLevel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Kelesi</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Playback & Speed Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Pause className="w-4 h-4" aria-hidden="true" />
              <span>Toqtatıw</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRun}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>{isPaused ? 'Dawam etiw' : 'Isletiw'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStep}
            disabled={isRunning}
            title="Bir buyrıqtı qádemlep orınlaw"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <StepForward className="w-4 h-4" aria-hidden="true" />
            <span>Qádemlep</span>
          </button>

          <button
            type="button"
            onClick={onResetBoard}
            title="Robotdı baslanǵısh orınǵa qaytarıw"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ResetIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Qaytarıw</span>
          </button>

          <button
            type="button"
            onClick={onClearCode}
            disabled={isRunning}
            title="Barlıq buyrıqlardı óshiriw"
            aria-label="Kodtı óshiriw"
            className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-slate-600 rounded-lg transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500">
            {isSandbox ? 'Erkin rejim · Tezlik:' : 'Háreket tezligi:'}
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
            {(
              [
                { id: 'slow', label: 'Áste' },
                { id: 'normal', label: 'Ortasha' },
                { id: 'fast', label: 'Tez' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSpeedChange(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  speed === opt.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
