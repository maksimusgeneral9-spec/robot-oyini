import { ExecutionStep, ParseResult, Point } from '../types/game';

interface Token {
  value: string;
  line: number;
}

const MAX_EXPANDED_STEPS = 400;

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    // Strip comments starting with ; or # or //
    const rawLine = lines[i].replace(/(;|#|\/\/).*$/, '');
    // Separate [ and ] with spaces so `REPEAT 4 [FD 2]` and `REPEAT 4[FD 2]` both work
    const spaced = rawLine.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ');
    const parts = spaced.trim().split(/\s+/).filter(Boolean);

    for (const part of parts) {
      tokens.push({ value: part, line: lineNum });
    }
  }

  return tokens;
}

function parseNumberToken(token: Token | undefined, cmdName: string): { num?: number; error?: string } {
  if (!token) {
    return { error: `${cmdName} buyrıǵınan keyin san jazılıwı kerek.` };
  }
  const parsed = Number(token.value);
  if (!Number.isFinite(parsed)) {
    return {
      error: `${token.line}-qatar: "${token.value}" durıs san emes. ${cmdName} buyrıǵınan keyin san jazıń (máselen: ${cmdName} 5).`,
    };
  }
  return { num: parsed };
}

export function parseLogoProgram(code: string): ParseResult {
  const tokens = tokenize(code);
  if (tokens.length === 0) {
    return {
      steps: [],
      error: 'Buyrıq maydanı bos. Aldınǵa júriw ushın máselen «FD 5» dep jazıń.',
      errorLine: null,
      commandCount: 0,
    };
  }

  const steps: ExecutionStep[] = [];
  let commandCount = 0;

  function parseBlock(
    index: number,
    insideRepeat: boolean
  ): { nextIndex: number; error?: string; errorLine?: number } {
    let i = index;

    while (i < tokens.length) {
      const tok = tokens[i];
      const upper = tok.value.toUpperCase();

      if (upper === ']') {
        if (!insideRepeat) {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: Artıqsha «]» belgisi tabıldı.`,
            errorLine: tok.line,
          };
        }
        return { nextIndex: i + 1 };
      }

      if (upper === '[') {
        return {
          nextIndex: i,
          error: `${tok.line}-qatar: «[» belgisi tek REPEAT buyrıǵınan keyin qollanıladı.`,
          errorLine: tok.line,
        };
      }

      if (upper === 'FD' || upper === 'FORWARD') {
        const res = parseNumberToken(tokens[i + 1], upper);
        if (res.error || res.num === undefined) {
          return {
            nextIndex: i,
            error: res.error?.includes('-qatar') ? res.error : `${tok.line}-qatar: ${res.error}`,
            errorLine: tok.line,
          };
        }
        if (res.num < 0) {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: Qádem sanı teris bolmawı kerek. Artqa júriw ushın BK qollanıń.`,
            errorLine: tok.line,
          };
        }
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: `${upper} ${res.num}`,
          type: 'move',
          amount: res.num,
        });
        i += 2;
      } else if (upper === 'BK' || upper === 'BACK' || upper === 'BACKWARD') {
        const res = parseNumberToken(tokens[i + 1], upper);
        if (res.error || res.num === undefined) {
          return {
            nextIndex: i,
            error: res.error?.includes('-qatar') ? res.error : `${tok.line}-qatar: ${res.error}`,
            errorLine: tok.line,
          };
        }
        if (res.num < 0) {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: Qádem sanı teris bolmawı kerek.`,
            errorLine: tok.line,
          };
        }
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: `${upper} ${res.num}`,
          type: 'move',
          amount: -res.num,
        });
        i += 2;
      } else if (upper === 'RT' || upper === 'RIGHT') {
        const res = parseNumberToken(tokens[i + 1], upper);
        if (res.error || res.num === undefined) {
          return {
            nextIndex: i,
            error:
              res.error?.includes('-qatar')
                ? res.error
                : `${tok.line}-qatar: RT buyrıǵınan keyin múyeshti jazıń, máselen: RT 90`,
            errorLine: tok.line,
          };
        }
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: `${upper} ${res.num}`,
          type: 'turn',
          amount: res.num,
        });
        i += 2;
      } else if (upper === 'LT' || upper === 'LEFT') {
        const res = parseNumberToken(tokens[i + 1], upper);
        if (res.error || res.num === undefined) {
          return {
            nextIndex: i,
            error:
              res.error?.includes('-qatar')
                ? res.error
                : `${tok.line}-qatar: LT buyrıǵınan keyin múyeshti jazıń, máselen: LT 90`,
            errorLine: tok.line,
          };
        }
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: `${upper} ${res.num}`,
          type: 'turn',
          amount: -res.num,
        });
        i += 2;
      } else if (upper === 'PU' || upper === 'PENUP') {
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: upper,
          type: 'pen',
          amount: 0,
          penDown: false,
        });
        i += 1;
      } else if (upper === 'PD' || upper === 'PENDOWN') {
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: upper,
          type: 'pen',
          amount: 0,
          penDown: true,
        });
        i += 1;
      } else if (upper === 'CS' || upper === 'CLEARSCREEN' || upper === 'HOME') {
        commandCount++;
        steps.push({
          id: steps.length + 1,
          lineNumber: tok.line,
          sourceLine: upper,
          type: 'clear',
          amount: 0,
        });
        i += 1;
      } else if (upper === 'REPEAT') {
        const countRes = parseNumberToken(tokens[i + 1], 'REPEAT');
        if (countRes.error || countRes.num === undefined) {
          return {
            nextIndex: i,
            error: countRes.error?.includes('-qatar')
              ? countRes.error
              : `${tok.line}-qatar: REPEAT buyrıǵınan keyin tákirarlaw sanın jazıń (máselen: REPEAT 4 [FD 2 RT 90]).`,
            errorLine: tok.line,
          };
        }
        const repeatCount = Math.floor(countRes.num);
        if (repeatCount < 1 || repeatCount > 50) {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: REPEAT sanı 1 menen 50 aralıǵında bolıwı kerek.`,
            errorLine: tok.line,
          };
        }
        const openBracket = tokens[i + 2];
        if (!openBracket || openBracket.value !== '[') {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: REPEAT ${repeatCount} buyrıǵınan keyin «[» qawsırması bolıwı shárt.`,
            errorLine: tok.line,
          };
        }

        // Capture inner block steps once by dry-parsing from i + 3
        const startLen = steps.length;
        const startCmdCount = commandCount;
        const blockRes = parseBlock(i + 3, true);
        if (blockRes.error) {
          return blockRes;
        }
        // Check that block ended with ']'
        const prevTok = tokens[blockRes.nextIndex - 1];
        if (!prevTok || prevTok.value !== ']') {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: REPEAT blogı «]» belgisi menen jabılmaǵan.`,
            errorLine: tok.line,
          };
        }

        const blockSteps = steps.slice(startLen);
        if (blockSteps.length === 0) {
          return {
            nextIndex: i,
            error: `${tok.line}-qatar: REPEAT blogı ishinde buyrıq joq.`,
            errorLine: tok.line,
          };
        }

        // Count REPEAT itself as 1 structural command + inner commands already counted once
        commandCount = startCmdCount + (commandCount - startCmdCount) + 1;

        for (let r = 1; r < repeatCount; r++) {
          for (const s of blockSteps) {
            if (steps.length >= MAX_EXPANDED_STEPS) {
              return {
                nextIndex: i,
                error: `Buyrıqlar sanı júdá kóp (${MAX_EXPANDED_STEPS} qádemnen asıp ketti).`,
                errorLine: tok.line,
              };
            }
            steps.push({ ...s, id: steps.length + 1 });
          }
        }
        i = blockRes.nextIndex;
      } else {
        return {
          nextIndex: i,
          error: `${tok.line}-qatar: «${tok.value}» buyrıǵı túsiniksiz. FD, BK, RT, LT yamasa REPEAT buyrıqların qollanıń.`,
          errorLine: tok.line,
        };
      }

      if (steps.length > MAX_EXPANDED_STEPS) {
        return {
          nextIndex: i,
          error: `Buyrıqlar sanı júdá kóp (${MAX_EXPANDED_STEPS} qádemnen asıp ketti).`,
          errorLine: tok.line,
        };
      }
    }

    if (insideRepeat) {
      return {
        nextIndex: i,
        error: `REPEAT blogı «]» belgisi menen jabılmaǵan.`,
        errorLine: tokens[tokens.length - 1]?.line,
      };
    }

    return { nextIndex: i };
  }

  const result = parseBlock(0, false);
  if (result.error) {
    return {
      steps: [],
      error: result.error,
      errorLine: result.errorLine ?? null,
      commandCount,
    };
  }

  return {
    steps,
    error: null,
    errorLine: null,
    commandCount,
  };
}

export function normalizeAngle(angle: number): number {
  const mod = ((angle % 360) + 360) % 360;
  return Math.round(mod * 100) / 100;
}

export function getHeadingLabel(angle: number): string {
  const norm = normalizeAngle(angle);
  if (norm === 0) return 'Arqa (0°)';
  if (norm === 90) return 'Shıǵıs (90°)';
  if (norm === 180) return 'Qubla (180°)';
  if (norm === 270) return 'Batıs (270°)';
  return `${norm}°`;
}

export function pointsEqual(a: Point, b: Point, tolerance = 0.05): boolean {
  return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
}
