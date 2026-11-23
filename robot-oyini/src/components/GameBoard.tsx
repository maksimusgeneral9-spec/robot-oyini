import React from 'react';
import { Check, Flag, Star, Ban } from 'lucide-react';
import {
  ExecutionStatus,
  LevelConfig,
  PathSegment,
  PlaybackSpeed,
  Point,
  RobotPose,
} from '../types/game';
import { getHeadingLabel, pointsEqual } from '../utils/logoParser';
import { SANDBOX_PRESETS } from '../data/levels';

interface GameBoardProps {
  mode: 'levels' | 'sandbox';
  levels: LevelConfig[];
  currentLevel: LevelConfig;
  completedLevelIds: number[];
  onSelectLevel: (levelId: number) => void;
  onLoadSandboxPreset: (code: string) => void;
  robotPose: RobotPose;
  pathSegments: PathSegment[];
  collectedCheckpoints: Point[];
  status: ExecutionStatus;
  speed: PlaybackSpeed;
  commandCount: number;
  penDown: boolean;
}

const GRID_MAX = 10;
const CELL_SIZE = 44;
const PADDING = 42;
const SVG_SIZE = PADDING * 2 + GRID_MAX * CELL_SIZE; // 524px square viewBox

function toSvgX(x: number): number {
  return PADDING + x * CELL_SIZE;
}

function toSvgY(y: number): number {
  return PADDING + (GRID_MAX - y) * CELL_SIZE;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  levels,
  currentLevel,
  completedLevelIds,
  onSelectLevel,
  onLoadSandboxPreset,
  robotPose,
  pathSegments,
  collectedCheckpoints,
  status,
  speed,
  commandCount,
  penDown,
}) => {
  const isSandbox = mode === 'sandbox';
  const transitionMs =
    speed === 'slow' ? 520 : speed === 'normal' ? 280 : 120;

  const robotSvgX = toSvgX(robotPose.x);
  const robotSvgY = toSvgY(robotPose.y);

  const isCheckpointCollected = (cp: Point) =>
    collectedCheckpoints.some((c) => pointsEqual(c, cp));

  return (
    <section
      aria-label="Oyın maydanı"
      className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden"
    >
      {/* Top Stage Header: Level Selector or Sandbox Presets */}
      <div className="px-5 py-4 border-b border-slate-200 space-y-3">
        {!isSandbox ? (
          <>
            {/* Level Stepper Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex items-center gap-1 flex-wrap"
                role="tablist"
                aria-label="Tapsırmalar dizimi"
              >
                {levels.map((lvl) => {
                  const isActive = lvl.id === currentLevel.id;
                  const isDone = completedLevelIds.includes(lvl.id);
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => onSelectLevel(lvl.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : isDone
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{lvl.id}</span>
                      {isDone && (
                        <Check
                          className={`w-3 h-3 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-500 tabular-nums">
                Ótildi: {completedLevelIds.length} / {levels.length}
              </div>
            </div>

            {/* Level Title & Objective */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-sky-700">
                  {currentLevel.id}-tapsırma · {currentLevel.subtitle}
                </div>
                <h1 className="font-display text-lg font-bold text-slate-900 text-balance mt-0.5">
                  {currentLevel.title}
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  {currentLevel.objective}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900">
                Erkin oyın maydanı
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Qálegen buyrıqlardı sınap kóriń hám geometriyalıq figuralar sızıń.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Úlgiler:</span>
              {SANDBOX_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onLoadSandboxPreset(preset.code)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unboxed Tabular Live Telemetry Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
          <span>
            Orını:{' '}
            <strong className="font-mono text-slate-900">
              ({Math.round(robotPose.x * 10) / 10},{' '}
              {Math.round(robotPose.y * 10) / 10})
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            Baǵıtı:{' '}
            <strong className="font-mono text-slate-900">
              {getHeadingLabel(robotPose.angle)}
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            Buyrıqlar:{' '}
            <strong className="font-mono text-slate-900">{commandCount}</strong>
            {!isSandbox && ` / Optimal: ${currentLevel.optimalSteps}`}
          </span>
          {isSandbox && (
            <>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>
                Qálem:{' '}
                <strong className="font-mono text-slate-900">
                  {penDown ? 'Túsirilgen (PD)' : 'Kóterilgen (PU)'}
                </strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main SVG Coordinate Grid Stage */}
      <div className="flex-1 p-4 sm:p-6 bg-slate-50/50 flex flex-col items-center justify-center">
        <div className="w-full max-w-[540px] bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Robot háreketleniw koordinata maydanı"
          >
            <defs>
              {/* Crisp red arrowhead matching 6.11-súwret */}
              <marker
                id="path-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#DC2626" />
              </marker>
              <marker
                id="path-arrow-back"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#EA580C" />
              </marker>
            </defs>

            {/* Grid Background */}
            <rect
              x={PADDING}
              y={PADDING}
              width={GRID_MAX * CELL_SIZE}
              height={GRID_MAX * CELL_SIZE}
              fill="#FFFFFF"
            />

            {/* Grid Lines & Axis Labels */}
            {Array.from({ length: GRID_MAX + 1 }, (_, i) => {
              const posX = toSvgX(i);
              const posY = toSvgY(i);
              const isEdge = i === 0 || i === GRID_MAX;
              return (
                <g key={i}>
                  {/* Vertical grid line */}
                  <line
                    x1={posX}
                    y1={PADDING}
                    x2={posX}
                    y2={PADDING + GRID_MAX * CELL_SIZE}
                    stroke={isEdge ? '#64748B' : '#CBD5E1'}
                    strokeWidth={isEdge ? 1.5 : 1}
                  />
                  {/* Horizontal grid line */}
                  <line
                    x1={PADDING}
                    y1={posY}
                    x2={PADDING + GRID_MAX * CELL_SIZE}
                    y2={posY}
                    stroke={isEdge ? '#64748B' : '#CBD5E1'}
                    strokeWidth={isEdge ? 1.5 : 1}
                  />
                  {/* X axis numbers (bottom) */}
                  <text
                    x={posX}
                    y={PADDING + GRID_MAX * CELL_SIZE + 20}
                    textAnchor="middle"
                    className="fill-slate-500 text-[11px] font-mono tabular-nums"
                  >
                    {i}
                  </text>
                  {/* Y axis numbers (left) */}
                  <text
                    x={PADDING - 14}
                    y={posY + 4}
                    textAnchor="end"
                    className="fill-slate-500 text-[11px] font-mono tabular-nums"
                  >
                    {i}
                  </text>
                </g>
              );
            })}

            {/* Axis Titles */}
            <text
              x={PADDING + (GRID_MAX * CELL_SIZE) / 2}
              y={SVG_SIZE - 5}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-mono"
            >
              X oqı
            </text>
            <text
              x={12}
              y={PADDING + (GRID_MAX * CELL_SIZE) / 2}
              textAnchor="middle"
              transform={`rotate(-90, 12, ${PADDING + (GRID_MAX * CELL_SIZE) / 2})`}
              className="fill-slate-400 text-[10px] font-mono"
            >
              Y oqı
            </text>

            {/* Start Point Subtle Marker */}
            <circle
              cx={toSvgX(isSandbox ? 5 : currentLevel.start.x)}
              cy={toSvgY(isSandbox ? 5 : currentLevel.start.y)}
              r={5}
              fill="#F1F5F9"
              stroke="#94A3B8"
              strokeWidth={1.5}
            />

            {/* Obstacles (Levels Mode) */}
            {!isSandbox &&
              currentLevel.obstacles.map((obs, idx) => {
                const cx = toSvgX(obs.x);
                const cy = toSvgY(obs.y);
                return (
                  <g
                    key={`obs-${idx}`}
                    transform={`translate(${cx}, ${cy})`}
                    aria-label={`Tosıq (${obs.x}, ${obs.y})`}
                  >
                    <rect
                      x={-15}
                      y={-15}
                      width={30}
                      height={30}
                      rx={6}
                      fill="#1E293B"
                      stroke="#0F172A"
                      strokeWidth={1.5}
                    />
                    <path
                      d="M -7 -7 L 7 7 M 7 -7 L -7 7"
                      stroke="#F87171"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

            {/* Checkpoints (Stars) */}
            {!isSandbox &&
              currentLevel.checkpoints.map((cp, idx) => {
                const cx = toSvgX(cp.x);
                const cy = toSvgY(cp.y);
                const collected = isCheckpointCollected(cp);
                return (
                  <g
                    key={`cp-${idx}`}
                    transform={`translate(${cx}, ${cy})`}
                    aria-label={`Juldızsha (${cp.x}, ${cp.y})`}
                  >
                    <circle
                      r={14}
                      fill={collected ? '#ECFDF5' : '#FEF3C7'}
                      stroke={collected ? '#10B981' : '#F59E0B'}
                      strokeWidth={1.5}
                    />
                    <polygon
                      points="0,-8 2.4,-2.6 8.2,-2.2 3.8,1.7 5.1,7.5 0,4.3 -5.1,7.5 -3.8,1.7 -8.2,-2.2 -2.4,-2.6"
                      fill={collected ? '#10B981' : '#F59E0B'}
                    />
                  </g>
                );
              })}

            {/* Target Goal Flag (Levels Mode) */}
            {!isSandbox && (
              <g
                transform={`translate(${toSvgX(currentLevel.target.x)}, ${toSvgY(currentLevel.target.y)})`}
                aria-label={`Bayraqsha (${currentLevel.target.x}, ${currentLevel.target.y})`}
              >
                <circle
                  r={17}
                  fill={status === 'won' ? '#D1FAE5' : '#ECFDF5'}
                  stroke={status === 'won' ? '#059669' : '#10B981'}
                  strokeWidth={2}
                  strokeDasharray={status === 'won' ? 'none' : '4 3'}
                />
                {/* Flagpole & Pennant */}
                <line
                  x1={-5}
                  y1={9}
                  x2={-5}
                  y2={-9}
                  stroke="#065F46"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <polygon points="-4,-9 9,-4 -4,1" fill="#059669" />
              </g>
            )}

            {/* Robot Path Segments (Vivid Red Arrow Trail like 6.11-súwret) */}
            {pathSegments.map((seg, idx) => {
              if (!seg.penDown) return null;
              const x1 = toSvgX(seg.from.x);
              const y1 = toSvgY(seg.from.y);
              const x2 = toSvgX(seg.to.x);
              const y2 = toSvgY(seg.to.y);
              const isLast = idx === pathSegments.length - 1;
              return (
                <line
                  key={`seg-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={seg.isBackward ? '#EA580C' : '#DC2626'}
                  strokeWidth={2.75}
                  strokeLinecap="round"
                  strokeDasharray={seg.isBackward ? '5 4' : undefined}
                  markerEnd={
                    isLast
                      ? seg.isBackward
                        ? 'url(#path-arrow-back)'
                        : 'url(#path-arrow)'
                      : undefined
                  }
                />
              );
            })}

            {/* Animated Robot (Classic White Triangle with Dark Border, inspired by 6.11-súwret) */}
            <g
              className="robot-avatar"
              style={{
                transform: `translate(${robotSvgX}px, ${robotSvgY}px) rotate(${robotPose.angle}deg)`,
                transition: `transform ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                filter: 'drop-shadow(0 0 9px rgba(34, 211, 238, .65))',
              }}
            >
              <circle r={21} fill="#22D3EE" opacity={0.13} />
              {/* Faint forward direction ray */}
              <line
                x1={0}
                y1={-16}
                x2={0}
                y2={-30}
                stroke="#0284C7"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.65}
              />
              {/* Triangle Robot Body (tip at 0, -17) */}
              <polygon
                points="0,-17 13,13 -13,13"
                fill="#FFFFFF"
                stroke={status === 'error' ? '#DC2626' : '#0F172A'}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              {/* Nose accent dot so direction is unmistakable */}
              <circle
                cx={0}
                cy={-8}
                r={2.5}
                fill={status === 'won' ? '#059669' : '#0284C7'}
              />
            </g>
          </svg>
        </div>

        {/* Compact Legend Below Grid */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block border-2 border-slate-900 bg-white rotate-45" />
            <span>Robot</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-red-600 inline-block" />
            <span>Aldınǵa jol (FD)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-orange-600 inline-block" />
            <span>Artqa jol (BK)</span>
          </span>
          {!isSandbox && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Maqset</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                <span>Juldızsha</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-slate-800" aria-hidden="true" />
                <span>Tosıq</span>
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
