export interface Point {
  x: number;
  y: number;
}

export interface RobotPose {
  x: number;
  y: number;
  angle: number; // 0 = Arqa (North/+Y), 90 = Shıǵıs (East/+X), 180 = Qubla (South/-Y), 270 = Batıs (West/-X)
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  objective: string;
  hint: string;
  gridSize: number;
  start: RobotPose;
  target: Point;
  obstacles: Point[];
  checkpoints: Point[];
  starterCode: string;
  optimalSteps: number;
  recommendedCommands: string[];
}

export interface ExecutionStep {
  id: number;
  lineNumber: number;
  sourceLine: string;
  type: 'move' | 'turn' | 'pen' | 'clear';
  /** Positive for FD / RT, negative for BK / LT */
  amount: number;
  /** Pen up/down for 'pen' type */
  penDown?: boolean;
}

export interface PathSegment {
  from: Point;
  to: Point;
  isBackward: boolean;
  penDown: boolean;
}

export type ExecutionStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'won'
  | 'error'
  | 'stopped';

export interface ParseResult {
  steps: ExecutionStep[];
  error: string | null;
  errorLine: number | null;
  commandCount: number;
}

export type PlaybackSpeed = 'slow' | 'normal' | 'fast';
