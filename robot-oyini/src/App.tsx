import { useCallback, useEffect, useMemo, useState } from 'react';
import { LEVELS } from './data/levels';
import {
  ExecutionStatus,
  ExecutionStep,
  PathSegment,
  PlaybackSpeed,
  Point,
  RobotPose,
} from './types/game';
import { parseLogoProgram, pointsEqual } from './utils/logoParser';
import { TopBar } from './components/TopBar';
import { CommandPanel } from './components/CommandPanel';
import { GameBoard } from './components/GameBoard';
import { GuideModal } from './components/GuideModal';

const STORAGE_KEY = 'basqariw_robot_completed_v1';
const CODE_STORAGE_KEY = 'basqariw_robot_code_v1';
const SANDBOX_START: RobotPose = { x: 5, y: 5, angle: 0 };

type StudentResult = {
  student: string;
  levelId: number;
  levelTitle: string;
  points: number;
  commands: number;
  completedAt: string;
};

const RESULTS_STORAGE_KEY = 'basqariw_robot_results_v1';

function loadResults(): StudentResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveResult(result: StudentResult) {
  try {
    const current = loadResults();
    const sameAttempt = current.findIndex((item) =>
      item.student === result.student && item.levelId === result.levelId
    );
    if (sameAttempt >= 0) current[sameAttempt] = result;
    else current.push(result);
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Gameplay must remain available if local storage is disabled.
  }
}


function loadCompletedLevels(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [mode, setMode] = useState<'levels' | 'sandbox'>('levels');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>(() =>
    loadCompletedLevels()
  );

  // Store code per level + sandbox so switching tabs keeps user's draft
  const [codeByTarget, setCodeByTarget] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      sandbox: 'REPEAT 4 [\n  FD 3\n  RT 90\n]',
    };
    for (const lvl of LEVELS) initial[`level-${lvl.id}`] = lvl.starterCode;
    try {
      const saved = localStorage.getItem(CODE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && (key === 'sandbox' || key.startsWith('level-'))) {
            initial[key] = value;
          }
        }
      }
    } catch {
      // Ignore invalid or unavailable local storage and use the built-in examples.
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(codeByTarget));
    } catch {
      // The game remains playable when browser storage is unavailable.
    }
  }, [codeByTarget]);

  const currentLevel = useMemo(
    () => LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0],
    [currentLevelId]
  );

  const codeKey = mode === 'sandbox' ? 'sandbox' : `level-${currentLevel.id}`;
  const currentCode = codeByTarget[codeKey] ?? '';

  const startPose: RobotPose =
    mode === 'sandbox' ? SANDBOX_START : currentLevel.start;

  const [robotPose, setRobotPose] = useState<RobotPose>(startPose);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [collectedCheckpoints, setCollectedCheckpoints] = useState<Point[]>([]);
  const [penDown, setPenDown] = useState<boolean>(true);

  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [commandCount, setCommandCount] = useState<number>(0);
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [speed, setSpeed] = useState<PlaybackSpeed>('normal');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(() => {
    try { return localStorage.getItem('basqariw_robot_student_v1') || ''; } catch { return ''; }
  });
  const [results, setResults] = useState<StudentResult[]>(() => loadResults());
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('basqariw_robot_student_v1', studentName); } catch { /* optional storage */ }
  }, [studentName]);


  // Live command count preview while typing
  const liveParsePreview = useMemo(() => parseLogoProgram(currentCode), [currentCode]);

  const resetBoardToStart = useCallback(
    (targetPose: RobotPose) => {
      setRobotPose(targetPose);
      setPathSegments([]);
      setCollectedCheckpoints([]);
      setPenDown(true);
      setSteps([]);
      setStepIndex(0);
      setStatus('idle');
      setErrorMessage(null);
      setErrorLine(null);
      setActiveLine(null);
    },
    []
  );

  const handleSelectLevel = useCallback(
    (levelId: number) => {
      const targetLvl = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
      setMode('levels');
      setCurrentLevelId(levelId);
      resetBoardToStart(targetLvl.start);
    },
    [resetBoardToStart]
  );

  const handleModeChange = useCallback(
    (nextMode: 'levels' | 'sandbox') => {
      setMode(nextMode);
      resetBoardToStart(
        nextMode === 'sandbox' ? SANDBOX_START : currentLevel.start
      );
    },
    [currentLevel.start, resetBoardToStart]
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCodeByTarget((prev) => ({ ...prev, [codeKey]: newCode }));
      if (status !== 'idle') {
        // Editing code invalidates any paused/running execution plan.
        resetBoardToStart(startPose);
      }
      setErrorMessage(null);
      setErrorLine(null);
    },
    [codeKey, resetBoardToStart, startPose, status]
  );

  const executeSingleStep = useCallback(
    (
      step: ExecutionStep,
      pose: RobotPose,
      collected: Point[],
      isPenDown: boolean
    ): {
      nextPose: RobotPose;
      newSegment: PathSegment | null;
      nextCollected: Point[];
      nextPenDown: boolean;
      clearPath: boolean;
      error: string | null;
    } => {
      if (step.type === 'turn') {
        return {
          nextPose: { ...pose, angle: pose.angle + step.amount },
          newSegment: null,
          nextCollected: collected,
          nextPenDown: isPenDown,
          clearPath: false,
          error: null,
        };
      }

      if (step.type === 'pen') {
        return {
          nextPose: pose,
          newSegment: null,
          nextCollected: collected,
          nextPenDown: step.penDown ?? true,
          clearPath: false,
          error: null,
        };
      }

      if (step.type === 'clear') {
        return {
          nextPose: mode === 'sandbox' ? SANDBOX_START : currentLevel.start,
          newSegment: null,
          nextCollected: [],
          nextPenDown: true,
          clearPath: true,
          error: null,
        };
      }

      // Move step: walk in small sub-steps (<= 1 unit) for accurate wall/boundary checks
      const totalDist = step.amount;
      const sign = totalDist >= 0 ? 1 : -1;
      const absDist = Math.abs(totalDist);
      const rad = (pose.angle * Math.PI) / 180;
      const dirX = Math.sin(rad) * sign;
      const dirY = Math.cos(rad) * sign;

      const subStepCount = Math.max(1, Math.ceil(absDist));
      const subStepSize = absDist / subStepCount;

      let curX = pose.x;
      let curY = pose.y;
      const updatedCollected = [...collected];

      for (let s = 1; s <= subStepCount; s++) {
        const nextX = Math.round((curX + dirX * subStepSize) * 1000) / 1000;
        const nextY = Math.round((curY + dirY * subStepSize) * 1000) / 1000;

        // Boundary check [0..10]
        if (nextX < -0.01 || nextX > 10.01 || nextY < -0.01 || nextY > 10.01) {
          const validSegment =
            curX !== pose.x || curY !== pose.y
              ? {
                  from: { x: pose.x, y: pose.y },
                  to: { x: curX, y: curY },
                  isBackward: sign < 0,
                  penDown: isPenDown,
                }
              : null;
          return {
            nextPose: { ...pose, x: curX, y: curY },
            newSegment: validSegment,
            nextCollected: updatedCollected,
            nextPenDown: isPenDown,
            clearPath: false,
            error: `${step.lineNumber}-qatar: Robot maydan shegarasınan (0..10) shıǵıp ketti!`,
          };
        }

        // Obstacle collision check in levels mode
        if (mode === 'levels') {
          const hitObs = currentLevel.obstacles.find((obs) =>
            pointsEqual(obs, { x: nextX, y: nextY }, 0.2)
          );
          if (hitObs) {
            const validSegment =
              curX !== pose.x || curY !== pose.y
                ? {
                    from: { x: pose.x, y: pose.y },
                    to: { x: curX, y: curY },
                    isBackward: sign < 0,
                    penDown: isPenDown,
                  }
                : null;
            return {
              nextPose: { ...pose, x: curX, y: curY },
              newSegment: validSegment,
              nextCollected: updatedCollected,
              nextPenDown: isPenDown,
              clearPath: false,
              error: `${step.lineNumber}-qatar: Robot (${hitObs.x}, ${hitObs.y}) noqattaǵı tosıqqa urıldı!`,
            };
          }

          // Collect checkpoints passed along the path
          for (const cp of currentLevel.checkpoints) {
            const matches = pointsEqual(cp, { x: nextX, y: nextY }, 0.2);
            const already = updatedCollected.some((c) => pointsEqual(c, cp));
            if (matches && !already) {
              updatedCollected.push(cp);
            }
          }
        }

        curX = nextX;
        curY = nextY;
      }

      return {
        nextPose: { ...pose, x: curX, y: curY },
        newSegment:
          absDist > 0
            ? {
                from: { x: pose.x, y: pose.y },
                to: { x: curX, y: curY },
                isBackward: sign < 0,
                penDown: isPenDown,
              }
            : null,
        nextCollected: updatedCollected,
        nextPenDown: isPenDown,
        clearPath: false,
        error: null,
      };
    },
    [currentLevel.checkpoints, currentLevel.obstacles, currentLevel.start, mode]
  );

  const evaluateCompletion = useCallback(
    (finalPose: RobotPose, finalCollected: Point[]) => {
      if (mode === 'sandbox') {
        setStatus('stopped');
        setActiveLine(null);
        return;
      }

      const atTarget = pointsEqual(finalPose, currentLevel.target, 0.12);
      const allCheckpoints = currentLevel.checkpoints.every((cp) =>
        finalCollected.some((c) => pointsEqual(c, cp))
      );

      if (atTarget && allCheckpoints) {
        if (studentName.trim()) {
          const earned = Math.max(50, 100 - Math.max(0, commandCount - currentLevel.optimalSteps) * 5);
          const result: StudentResult = {
            student: studentName.trim(),
            levelId: currentLevel.id,
            levelTitle: currentLevel.title,
            points: earned,
            commands: commandCount,
            completedAt: new Date().toISOString(),
          };
          saveResult(result);
          setResults(loadResults());
        }
        setStatus('won');
        setActiveLine(null);
        setCompletedLevelIds((prev) => {
          if (prev.includes(currentLevel.id)) return prev;
          const next = [...prev, currentLevel.id];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore storage failure
          }
          return next;
        });
      } else if (atTarget && !allCheckpoints) {
        setStatus('error');
        setActiveLine(null);
        setErrorMessage(
          `Robot bayraqshaǵa jetti, biraq barlıq juldızshalar jıynalmadı (${finalCollected.length}/${currentLevel.checkpoints.length}).`
        );
      } else {
        setStatus('error');
        setActiveLine(null);
        setErrorMessage(
          `Programma tamamlandı, biraq robot (${currentLevel.target.x}, ${currentLevel.target.y}) bayraqshaǵa jetpedi.`
        );
      }
    },
    [commandCount, currentLevel.checkpoints, currentLevel.id, currentLevel.optimalSteps, currentLevel.target, mode, studentName]
  );

  // Playback Timer Effect
  useEffect(() => {
    if (status !== 'running') return;

    const delay = speed === 'slow' ? 620 : speed === 'normal' ? 340 : 140;

    if (stepIndex >= steps.length) {
      const finishTimer = window.setTimeout(() => {
        evaluateCompletion(robotPose, collectedCheckpoints);
      }, delay * 0.75);
      return () => window.clearTimeout(finishTimer);
    }

    const timer = window.setTimeout(() => {
      const currentStep = steps[stepIndex];
      setActiveLine(currentStep.lineNumber);

      const outcome = executeSingleStep(
        currentStep,
        robotPose,
        collectedCheckpoints,
        penDown
      );

      setRobotPose(outcome.nextPose);
      if (outcome.clearPath) {
        setPathSegments([]);
      } else if (outcome.newSegment) {
        setPathSegments((prev) => [...prev, outcome.newSegment!]);
      }
      setCollectedCheckpoints(outcome.nextCollected);
      setPenDown(outcome.nextPenDown);

      if (outcome.error) {
        setStatus('error');
        setErrorMessage(outcome.error);
        setErrorLine(currentStep.lineNumber);
        return;
      }

      setStepIndex(stepIndex + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    collectedCheckpoints,
    evaluateCompletion,
    executeSingleStep,
    penDown,
    robotPose,
    speed,
    status,
    stepIndex,
    steps,
  ]);

  const handleRun = () => {
    if (status === 'paused' && stepIndex < steps.length) {
      setStatus('running');
      return;
    }

    const parsed = parseLogoProgram(currentCode);
    if (parsed.error) {
      resetBoardToStart(startPose);
      setStatus('error');
      setErrorMessage(parsed.error);
      setErrorLine(parsed.errorLine);
      return;
    }

    resetBoardToStart(startPose);
    setSteps(parsed.steps);
    setCommandCount(parsed.commandCount);
    setStepIndex(0);
    setStatus('running');
  };

  const handlePause = () => {
    if (status === 'running') {
      setStatus('paused');
    }
  };

  const handleStep = () => {
    if (status === 'running') return;

    let activeSteps = steps;
    let curIdx = stepIndex;
    let curPose = robotPose;
    let curCollected = collectedCheckpoints;
    let curPen = penDown;

    if (status !== 'paused' || steps.length === 0) {
      const parsed = parseLogoProgram(currentCode);
      if (parsed.error) {
        resetBoardToStart(startPose);
        setStatus('error');
        setErrorMessage(parsed.error);
        setErrorLine(parsed.errorLine);
        return;
      }
      curPose = startPose;
      curCollected = [];
      curPen = true;
      curIdx = 0;
      activeSteps = parsed.steps;

      setRobotPose(startPose);
      setPathSegments([]);
      setCollectedCheckpoints([]);
      setPenDown(true);
      setSteps(parsed.steps);
      setCommandCount(parsed.commandCount);
      setErrorMessage(null);
      setErrorLine(null);
    }

    if (curIdx >= activeSteps.length) {
      evaluateCompletion(curPose, curCollected);
      return;
    }

    const currentStep = activeSteps[curIdx];
    setActiveLine(currentStep.lineNumber);

    const outcome = executeSingleStep(
      currentStep,
      curPose,
      curCollected,
      curPen
    );

    setRobotPose(outcome.nextPose);
    if (outcome.clearPath) {
      setPathSegments([]);
    } else if (outcome.newSegment) {
      setPathSegments((prev) => [...prev, outcome.newSegment!]);
    }
    setCollectedCheckpoints(outcome.nextCollected);
    setPenDown(outcome.nextPenDown);

    if (outcome.error) {
      setStatus('error');
      setErrorMessage(outcome.error);
      setErrorLine(currentStep.lineNumber);
      return;
    }

    const nextIdx = curIdx + 1;
    setStepIndex(nextIdx);
    if (nextIdx >= activeSteps.length) {
      evaluateCompletion(outcome.nextPose, outcome.nextCollected);
    } else {
      setStatus('paused');
    }
  };

  const handleResetBoard = () => {
    resetBoardToStart(startPose);
  };

  const handleClearCode = () => {
    setCodeByTarget((prev) => ({ ...prev, [codeKey]: '' }));
    resetBoardToStart(startPose);
  };

  const handleLoadSandboxPreset = (presetCode: string) => {
    setCodeByTarget((prev) => ({ ...prev, sandbox: presetCode }));
    resetBoardToStart(SANDBOX_START);
  };

  const handleNextLevel = () => {
    const idx = LEVELS.findIndex((l) => l.id === currentLevel.id);
    if (idx >= 0 && idx < LEVELS.length - 1) {
      handleSelectLevel(LEVELS[idx + 1].id);
    }
  };

  const handleResetAll = () => {
    if (mode === 'levels') {
      setCodeByTarget((prev) => ({
        ...prev,
        [`level-${currentLevel.id}`]: currentLevel.starterCode,
      }));
      resetBoardToStart(currentLevel.start);
    } else {
      resetBoardToStart(SANDBOX_START);
    }
  };

  const exportResults = () => {
    const rows = [['Oqıwshı', 'Tapsırma', 'Ball', 'Buyrıq sanı', 'Waqıt'], ...results.map((r) => [
      r.student, r.levelTitle, String(r.points), String(r.commands), new Date(r.completedAt).toLocaleString()
    ])];
    const csv = '\\uFEFF' + rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robot-oyini-natiyjeleri.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const leaderboard = Object.values(results.reduce<Record<string, { student: string; points: number; levels: number }>>((acc, item) => {
    const key = item.student.toLocaleLowerCase();
    if (!acc[key]) acc[key] = { student: item.student, points: 0, levels: 0 };
    acc[key].points += item.points;
    acc[key].levels += 1;
    return acc;
  }, {})).sort((a, b) => b.points - a.points);

  const hasNextLevel =
    mode === 'levels' &&
    LEVELS.findIndex((l) => l.id === currentLevel.id) < LEVELS.length - 1;

  return (
    <div className="app-shell min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <TopBar
        mode={mode}
        onModeChange={handleModeChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetAll={handleResetAll}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        <section className="mb-5 rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 shadow-lg shadow-cyan-950/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Oqıwshı profili</div>
              <div className="mt-1 text-sm text-slate-300">Atıńızdı jazıń — nátiyjeler usı brauzerde saqlanadı.</div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input aria-label="Oqıwshı atı" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Oqıwshınıń atı-jóni" className="min-w-0 rounded-lg border border-cyan-400/30 bg-slate-950 px-3 py-2 text-sm text-white sm:w-64" />
              <button type="button" onClick={() => setShowTeacherPanel((v) => !v)} className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20">{showTeacherPanel ? 'Paneldi jabıw' : 'Muǵallim paneli'}</button>
            </div>
          </div>
          {showTeacherPanel && (
            <div className="mt-4 border-t border-cyan-300/15 pt-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-white">Oqıwshılar reytingi <span className="text-xs font-normal text-slate-400">(usı qurılǵıdaǵı nátiyjeler)</span></h2>
                <button type="button" onClick={exportResults} disabled={!results.length} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">CSV esabatın júklew</button>
              </div>
              {leaderboard.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-400"><tr><th className="py-2 pr-3">#</th><th className="py-2 pr-3">Oqıwshı</th><th className="py-2 pr-3">Ball</th><th className="py-2">Tapsırma</th></tr></thead>
                    <tbody>{leaderboard.map((item, index) => <tr key={item.student} className="border-t border-cyan-300/10"><td className="py-2 pr-3 text-cyan-300">{index + 1}</td><td className="py-2 pr-3">{item.student}</td><td className="py-2 pr-3 font-bold">{item.points}</td><td className="py-2">{item.levels}/8</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-slate-400">Házirinshe nátiyjeler joq. Oqıwshılar tapsırmalardı orınlaǵannan keyin bul jerde kórinedi.</p>}
              <p className="mt-3 text-xs text-amber-300/90">Eskertiw: bul standalone nusqada nátiyjeler tek usı brauzer qurılǵısında saqlanadı. Hár túrli kompyuterlerden ortaq reyting alıw ushın server bazası kerek.</p>
            </div>
          )}
        </section>
        {/* Two-Column Split: Left = Buyrıq paneli, Right = Oyın maydanı */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <CommandPanel
              code={currentCode}
              onCodeChange={handleCodeChange}
              status={status}
              errorMessage={errorMessage}
              errorLine={errorLine}
              activeLine={activeLine}
              hint={mode === 'levels' ? currentLevel.hint : null}
              speed={speed}
              onSpeedChange={setSpeed}
              onRun={handleRun}
              onPause={handlePause}
              onStep={handleStep}
              onResetBoard={handleResetBoard}
              onClearCode={handleClearCode}
              onNextLevel={handleNextLevel}
              hasNextLevel={hasNextLevel}
              isSandbox={mode === 'sandbox'}
              stepsExecuted={stepIndex}
              optimalSteps={
                mode === 'levels' ? currentLevel.optimalSteps : undefined
              }
              commandCount={
                status === 'idle' ? liveParsePreview.commandCount : commandCount
              }
            />
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <GameBoard
              mode={mode}
              levels={LEVELS}
              currentLevel={currentLevel}
              completedLevelIds={completedLevelIds}
              onSelectLevel={handleSelectLevel}
              onLoadSandboxPreset={handleLoadSandboxPreset}
              robotPose={robotPose}
              pathSegments={pathSegments}
              collectedCheckpoints={collectedCheckpoints}
              status={status}
              speed={speed}
              commandCount={
                status === 'idle' ? liveParsePreview.commandCount : commandCount
              }
              penDown={penDown}
            />
          </div>
        </div>
      </main>

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
