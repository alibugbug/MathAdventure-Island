import { useEffect, useRef, useState } from 'react';
import { playFeedbackSound, playUISound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
}

interface ShellCatchGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

type FallingShell = {
  id: number;
  x: number;
  y: number;
  expression: string;
  result: number;
  speed: number;
  caught: boolean;
  missed: boolean;
  wobble: number;
};

export default function ShellCatchGame({ question, disabled, onChoose, streak }: ShellCatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [basketX, setBasketX] = useState(300);
  const [targetAnswer, setTargetAnswer] = useState(0);
  const stateRef = useRef({
    shells: [] as FallingShell[],
    basketX: 300,
    basketW: 90,
    score: 0,
    missed: 0,
    maxMissed: 3,
    lastId: 0,
    roundResolved: false,
    spawnTimer: 0,
    speed: 1.2,
    target: 0,
    message: '',
    messageTimer: 0,
  });

  const W = 700;
  const H = 500;
  const BASKET_Y = H - 50;
  const SHELL_RADIUS = 30;

  useEffect(() => {
    setTargetAnswer(Number(question.answer));
    stateRef.current.target = Number(question.answer);
    stateRef.current.roundResolved = false;
    stateRef.current.shells = [];
    stateRef.current.score = 0;
    stateRef.current.missed = 0;
    stateRef.current.spawnTimer = 0;
    stateRef.current.message = '';
  }, [question.prompt, question.answer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate an expression that equals `result`
    const makeExpression = (result: number) => {
      const type = Math.floor(Math.random() * 5);
      switch (type) {
        case 0: {
          // "A个十和B个一" form (数位组合)
          const tens = Math.floor(result / 10);
          const ones = result % 10;
          if (tens > 0) return { expression: `${tens}个十和${ones}个一`, result };
          break;
        }
        case 1: {
          // "A+B" addition form
          const a = Math.max(1, Math.floor(result * (0.2 + Math.random() * 0.4)));
          const b = result - a;
          if (b > 0) return { expression: `${a}+${b}`, result };
          break;
        }
        case 2: {
          // "C-D" subtraction form
          const minuend = result + Math.max(1, Math.floor(Math.random() * 15) + 1);
          const subtrahend = minuend - result;
          return { expression: `${minuend}-${subtrahend}`, result };
        }
        case 3: {
          // "A个十+B" form (整十加个位)
          const tens2 = Math.floor(result / 10);
          const ones2 = result % 10;
          if (tens2 > 0) return { expression: `${tens2 * 10}+${ones2}`, result };
          break;
        }
        case 4: {
          // "C-D" where C is a nearby ten
          const nearTen = Math.ceil(result / 10) * 10;
          const diff = nearTen - result;
          if (diff > 0 && nearTen <= result + 20) return { expression: `${nearTen}-${diff}`, result };
          break;
        }
      }
      // fallback
      return { expression: `${result}`, result };
    };

    // Generate a WRONG expression that does NOT equal target
    const makeWrongExpression = () => {
      const t = stateRef.current.target;
      let wrongResult = t;
      while (wrongResult === t) {
        wrongResult = t + Math.floor(Math.random() * 21) - 10;
        if (wrongResult < 0) wrongResult = Math.abs(wrongResult) + 1;
        if (wrongResult === t) wrongResult = t + 5 + Math.floor(Math.random() * 10);
      }
      return makeExpression(wrongResult);
    };

    const spawnShell = () => {
      const state = stateRef.current;
      const isCorrect = Math.random() < 0.28;
      const { expression, result } = isCorrect
        ? makeExpression(state.target)
        : makeWrongExpression();
      const id = state.lastId++;
      const shell: FallingShell = {
        id,
        x: 40 + Math.random() * (W - 80),
        y: -SHELL_RADIUS,
        expression,
        result,
        speed: state.speed + Math.random() * 0.5,
        caught: false,
        missed: false,
        wobble: Math.random() * Math.PI * 2,
      };
      state.shells.push(shell);
    };

    const drawOceanBg = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#7ecbf5');
      grad.addColorStop(0.6, '#4da6e0');
      grad.addColorStop(1, '#2a7fc9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // waves
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const wy = 60 + i * 90 + Math.sin(Date.now() / 800 + i) * 6;
        ctx.ellipse(100 + i * 150, wy, 120, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // sandy bottom
      ctx.fillStyle = '#e8c97a';
      ctx.fillRect(0, H - 30, W, 30);
      ctx.fillStyle = '#d4a85c';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(20 + i * 38, H - 15 + Math.sin(i * 2) * 3, 4 + Math.random() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawShell = (shell: FallingShell) => {
      const { x, y, expression, wobble } = shell;
      ctx.save();

      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';

      const wobbleOff = Math.sin(Date.now() / 300 + wobble) * 2;
      const sx = x + wobbleOff;

      // shell shape (slightly bigger for text)
      ctx.beginPath();
      ctx.ellipse(sx, y, SHELL_RADIUS, SHELL_RADIUS * 0.85, 0, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(sx - 6, y - 8, 4, sx, y, SHELL_RADIUS);
      grad.addColorStop(0, '#ffe5b4');
      grad.addColorStop(0.5, '#f0c27a');
      grad.addColorStop(1, '#c8934a');
      ctx.fillStyle = grad;
      ctx.fill();

      // shell lines
      ctx.strokeStyle = 'rgba(139,90,43,0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const sy = y - SHELL_RADIUS * 0.5 + i * (SHELL_RADIUS * 0.38);
        ctx.ellipse(sx, sy, SHELL_RADIUS * 0.6, 4, 0.2, 0, Math.PI);
        ctx.stroke();
      }

      // expression text — auto-size
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3d2a15';
      const fontSize = expression.length > 7 ? 15 : expression.length > 5 ? 17 : 19;
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(expression, sx, y + (expression.includes('个') ? 0 : 2));

      // if expression contains '个', add second line if needed
      if (expression.includes('个') && expression.length > 6) {
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#5d3a15';
        ctx.fillText('=?', sx, y + 16);
      }

      // Small "=?" hint for non-obvious expressions
      if (!expression.includes('个') && expression.length > 3) {
        ctx.fillStyle = 'rgba(93,58,21,0.5)';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('=?', sx + SHELL_RADIUS - 12, y + SHELL_RADIUS * 0.6);
      }

      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(sx - 8, y - 10, 8, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawBasket = (bx: number) => {
      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.25)';

      // basket body (wider)
      ctx.fillStyle = '#8B5E3C';
      ctx.beginPath();
      ctx.moveTo(bx + 5, BASKET_Y);
      ctx.lineTo(bx + 5, BASKET_Y - 32);
      ctx.lineTo(bx + 10, BASKET_Y - 38);
      ctx.lineTo(bx + stateRef.current.basketW - 10, BASKET_Y - 38);
      ctx.lineTo(bx + stateRef.current.basketW - 5, BASKET_Y - 32);
      ctx.lineTo(bx + stateRef.current.basketW - 5, BASKET_Y);
      ctx.closePath();
      ctx.fill();

      // weave pattern
      ctx.strokeStyle = '#6d4529';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(bx + 8 + i * 14, BASKET_Y - 4);
        ctx.lineTo(bx + 8 + i * 14, BASKET_Y - 32);
        ctx.stroke();
      }

      ctx.fillStyle = '#A0724E';
      ctx.fillRect(bx + 8, BASKET_Y - 4, stateRef.current.basketW - 16, 4);

      // Basket label showing target
      ctx.fillStyle = '#fff8cf';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`=${stateRef.current.target}`, bx + stateRef.current.basketW / 2, BASKET_Y - 14);

      ctx.restore();
    };

    const drawHUD = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, 42);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`🎯 结果=${stateRef.current.target}`, 16, 29);
      ctx.textAlign = 'right';
      ctx.fillText(`❤️ ${3 - stateRef.current.missed}`, W - 16, 29);
    };

    const drawMessage = () => {
      const msg = stateRef.current.message;
      if (!msg) return;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(W / 2 - 120, H / 2 - 30, 240, 60);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(msg, W / 2, H / 2 + 2);
      ctx.restore();
    };

    const showFlash = (msg: string) => {
      stateRef.current.message = msg;
      stateRef.current.messageTimer = 40;
    };

    const loop = () => {
      const state = stateRef.current;
      if (disabled || state.roundResolved) {
        drawOceanBg();
        drawBasket(state.basketX);
        drawHUD();
        drawMessage();
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      state.speed = 1.2 + streak * 0.15;

      // spawn
      state.spawnTimer++;
      if (state.spawnTimer > Math.max(30, 65 - streak * 4)) {
        spawnShell();
        state.spawnTimer = 0;
      }

      // update shells
      const toRemove: number[] = [];
      for (const shell of state.shells) {
        shell.y += shell.speed;
        shell.wobble += 0.03;

        // check if caught by basket
        if (shell.y + SHELL_RADIUS > BASKET_Y - 38 && shell.y - SHELL_RADIUS < BASKET_Y + 10 &&
            shell.x + SHELL_RADIUS > state.basketX && shell.x - SHELL_RADIUS < state.basketX + state.basketW) {
          shell.caught = true;
          toRemove.push(shell.id);
          if (shell.result === state.target) {
            state.score += 10;
            showFlash(`✓ ${shell.expression}=${state.target}`);
            state.roundResolved = true;
            playFeedbackSound('coin');
            setTimeout(() => onChoose(question.answer), 500);
          } else {
            playUISound('error');
            showFlash(`✗ ${shell.expression}=${shell.result}`);
            state.missed++;
            if (state.missed >= state.maxMissed) {
              const wrong = question.options.find(o => o !== question.answer) ?? '__wrong__';
              state.roundResolved = true;
              playBattleSound('damage');
              setTimeout(() => onChoose(wrong), 400);
            }
          }
        }

        // miss (fell off screen)
        if (shell.y > H + SHELL_RADIUS && !shell.caught && !shell.missed) {
          shell.missed = true;
          toRemove.push(shell.id);
        }
      }

      state.shells = state.shells.filter(s => !toRemove.includes(s.id));

      // message timer
      if (stateRef.current.messageTimer > 0) {
        stateRef.current.messageTimer--;
        if (stateRef.current.messageTimer <= 0) stateRef.current.message = '';
      }

      // draw everything
      drawOceanBg();
      for (const shell of state.shells) {
        drawShell(shell);
      }
      drawBasket(state.basketX);
      drawHUD();
      drawMessage();

      animRef.current = requestAnimationFrame(loop);
    };

    // mouse/touch control for basket
    const onMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      stateRef.current.basketX = Math.max(5, Math.min(W - stateRef.current.basketW - 5, x - stateRef.current.basketW / 2));
      setBasketX(stateRef.current.basketX);
    };

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      onMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) onMove(e.touches[0].clientX);
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        stateRef.current.basketX = Math.max(5, stateRef.current.basketX - 20);
        setBasketX(stateRef.current.basketX);
      }
      if (e.key === 'ArrowRight') {
        stateRef.current.basketX = Math.min(W - stateRef.current.basketW - 5, stateRef.current.basketX + 20);
        setBasketX(stateRef.current.basketX);
      }
    };
    window.addEventListener('keydown', onKey);

    // spawn initial shells quickly
    setTimeout(() => { spawnShell(); }, 200);
    setTimeout(() => { spawnShell(); }, 600);

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [question, disabled, onChoose, streak]);

  return (
    <div className="game-wrapper shell-catch-game">
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="接算式贝壳游戏" />
      <div className="game-instruction">贝壳上写着算式，用篮子接住结果等于 {targetAnswer} 的贝壳！</div>
    </div>
  );
}
