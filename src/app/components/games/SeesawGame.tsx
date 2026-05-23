import { useEffect, useRef } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
  visual?: { comparePair?: [number, number]; a?: number; b?: number };
}

interface SeesawGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

export default function SeesawGame({ question, disabled, onChoose, streak }: SeesawGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    tiltAngle: 0,
    targetTilt: 0,
    leftVal: 0,
    rightVal: 0,
    resolved: false,
    result: '',
    shakeTimer: 0,
    comboFish: 0,
    missed: 0,
  });
  const { comparePair } = question.visual || {};
  const leftVal = Number(comparePair?.[0] ?? question.visual?.a ?? 0);
  const rightVal = Number(comparePair?.[1] ?? question.visual?.b ?? 0);
  const correctSymbol = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';

  const W = 700;
  const H = 480;

  const targetTiltFor = (lv: number, rv: number) => {
    if (lv > rv) return -18;
    if (lv < rv) return 18;
    return 0;
  };

  useEffect(() => {
    stateRef.current.resolved = false;
    stateRef.current.tiltAngle = 0;
    stateRef.current.targetTilt = 0; // start level — don't give away the answer
    stateRef.current.shakeTimer = 0;
    stateRef.current.comboFish = 0;
    stateRef.current.result = '';
  }, [leftVal, rightVal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SEESAW_CX = W / 2;
    const SEESAW_CY = H / 2 + 20;
    const SEESAW_LEN = 220;
    const SEESAW_THICK = 14;
    const FULCRUM_H = 60;

    const drawBackground = () => {
      // sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fde68a');
      grad.addColorStop(0.4, '#fbbf24');
      grad.addColorStop(0.7, '#f59e0b');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // sun
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(580, 60, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(580, 60, 36, 0, Math.PI * 2);
      ctx.fill();

      // clouds
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      [
        [120, 50, 60],
        [350, 70, 50],
        [550, 40, 45],
      ].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.6, cy - 8, r * 0.7, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // sandy ground
      ctx.fillStyle = '#e8c97a';
      ctx.fillRect(0, H - 40, W, 40);
      ctx.fillStyle = '#d4a85c';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(25 + i * 50, H - 25 + Math.sin(i) * 3, 3 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawFulcrum = () => {
      ctx.save();

      // base
      ctx.fillStyle = '#8B6F47';
      ctx.fillRect(SEESAW_CX - 40, SEESAW_CY + 4, 80, 20);

      // triangular fulcrum
      ctx.beginPath();
      ctx.moveTo(SEESAW_CX - 18, SEESAW_CY + 6);
      ctx.lineTo(SEESAW_CX + 18, SEESAW_CY + 6);
      ctx.lineTo(SEESAW_CX, SEESAW_CY - FULCRUM_H + 6);
      ctx.closePath();
      ctx.fillStyle = '#A0895C';
      ctx.fill();
      ctx.strokeStyle = '#6d5734';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const drawSeesaw = (angle: number) => {
      ctx.save();
      ctx.translate(SEESAW_CX, SEESAW_CY + 6);
      ctx.rotate((angle * Math.PI) / 180);

      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(-SEESAW_LEN - 10, 8, SEESAW_LEN * 2 + 20, SEESAW_THICK + 4);

      // board
      const grad = ctx.createLinearGradient(-SEESAW_LEN, 0, SEESAW_LEN, 0);
      grad.addColorStop(0, '#c4954a');
      grad.addColorStop(0.5, '#e0b86a');
      grad.addColorStop(1, '#c4954a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-SEESAW_LEN, 0, SEESAW_LEN * 2, SEESAW_THICK, 6);
      ctx.fill();
      ctx.strokeStyle = '#8B6F47';
      ctx.lineWidth = 2;
      ctx.stroke();

      // wood grain
      ctx.strokeStyle = 'rgba(139,111,71,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const gy = 3 + i * 1.5;
        ctx.moveTo(-SEESAW_LEN + 10, gy);
        ctx.lineTo(SEESAW_LEN - 10, gy);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawNumberBox = (value: number, x: number, y: number, isLeft: boolean) => {
      ctx.save();

      const w = 120;
      const h = 80;

      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, w, h, 8);
      ctx.fill();

      // box gradient
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      const hue = isLeft ? 200 : 30;
      grad.addColorStop(0, `hsl(${hue}, 70%, 65%)`);
      grad.addColorStop(1, `hsl(${hue}, 60%, 45%)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();

      ctx.strokeStyle = '#172033';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.stroke();

      // number
      ctx.fillStyle = '#fff8cf';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fillText(String(value), x + w / 2, y + h / 2 + 2);
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    const drawCrab = (x: number, y: number, flipped: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      if (flipped) ctx.scale(-1, 1);

      // body
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // shell pattern
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.ellipse(0, -4, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // claws
      ctx.fillStyle = '#e74c3c';
      // left claw
      ctx.beginPath();
      ctx.ellipse(-24, -8, 10, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-32, -14, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // right claw
      ctx.beginPath();
      ctx.ellipse(24, -8, 10, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(32, -14, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-8, -16, 6, 0, Math.PI * 2);
      ctx.arc(8, -16, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#172033';
      ctx.beginPath();
      ctx.arc(-8, -16, 3, 0, Math.PI * 2);
      ctx.arc(8, -16, 3, 0, Math.PI * 2);
      ctx.fill();

      // legs
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const legX = -16 + i * 10;
        ctx.beginPath();
        ctx.moveTo(legX, 14);
        ctx.lineTo(legX - 6 + i * 3, 28);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawWeightIndicator = (angle: number) => {
      if (Math.abs(angle) < 2) return;

      ctx.save();
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';

      const arrowY = SEESAW_CY - FULCRUM_H - 30;
      if (angle < 0) {
        // left is heavier, arrow points to left
        ctx.fillStyle = '#ffd700';
        ctx.fillText('⬇', SEESAW_CX - SEESAW_LEN / 2, arrowY);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('更重!', SEESAW_CX - SEESAW_LEN / 2, arrowY + 28);
      } else if (angle > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.fillText('⬇', SEESAW_CX + SEESAW_LEN / 2, arrowY);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('更重!', SEESAW_CX + SEESAW_LEN / 2, arrowY + 28);
      }

      ctx.restore();
    };

    const drawSymbolSelector = (options: Array<number | string>) => {
      const btnW = 80;
      const btnH = 64;
      const gap = 16;
      const totalW = options.length * btnW + (options.length - 1) * gap;
      const startX = (W - totalW) / 2;
      const y = H - 70;

      options.forEach((opt, i) => {
        const x = startX + i * (btnW + gap);
        const isCorrect = opt === correctSymbol;

        ctx.save();

        // button shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, btnW, btnH, 10);
        ctx.fill();

        // button body
        const grad = ctx.createLinearGradient(x, y, x, y + btnH);
        grad.addColorStop(0, '#ffe28a');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 10);
        ctx.fill();

        ctx.strokeStyle = '#172033';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 10);
        ctx.stroke();

        // symbol
        ctx.fillStyle = '#172033';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(opt), x + btnW / 2, y + btnH / 2 + 2);

        ctx.restore();
      });

      return startX;
    };

    const handleClick = (clientX: number, clientY: number) => {
      const state = stateRef.current;
      if (disabled || state.resolved) return;

      const rect = canvas.getBoundingClientRect();
      const cx = ((clientX - rect.left) / rect.width) * W;
      const cy = ((clientY - rect.top) / rect.height) * H;

      const question_options = question.options;
      const btnW = 80;
      const btnH = 64;
      const gap = 16;
      const totalW = question_options.length * btnW + (question_options.length - 1) * gap;
      const startX = (W - totalW) / 2;
      const y = H - 70;

      for (let i = 0; i < question_options.length; i++) {
        const bx = startX + i * (btnW + gap);
        if (cx >= bx && cx <= bx + btnW && cy >= y && cy <= y + btnH) {
          const selected = question_options[i];
          if (selected === correctSymbol) {
            state.resolved = true;
            state.result = 'correct';
            // Tilt the seesaw as correct feedback — never before
            state.targetTilt = targetTiltFor(leftVal, rightVal);
            playFeedbackSound('coin');
            setTimeout(() => onChoose(question.answer), 700);
          } else {
            state.result = 'wrong';
            state.shakeTimer = 15;
            playUISound('error');
            setTimeout(() => { state.result = ''; }, 600);
          }
          return;
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      handleClick(e.clientX, e.clientY);
    };

    canvas.addEventListener('pointerdown', onPointerDown);

    const loop = () => {
      const state = stateRef.current;

      // smoothly animate tilt
      state.tiltAngle += (state.targetTilt - state.tiltAngle) * 0.08;
      if (Math.abs(state.tiltAngle) < 0.3) state.tiltAngle = state.targetTilt;

      const angle = state.result === 'wrong'
        ? state.tiltAngle + (state.shakeTimer % 2 === 0 ? 6 : -6)
        : state.tiltAngle;

      if (state.shakeTimer > 0) state.shakeTimer--;

      // Draw
      drawBackground();
      drawFulcrum();
      drawSeesaw(angle);

      // Numbers on seesaw with correct positioning
      const cosA = Math.cos((angle * Math.PI) / 180);
      const sinA = Math.sin((angle * Math.PI) / 180);

      const leftOffsetX = -SEESAW_LEN + 10;
      const leftX = SEESAW_CX + leftOffsetX * cosA - 60;
      const leftY = SEESAW_CY + 6 + leftOffsetX * sinA - 90;
      drawNumberBox(leftVal, leftX, leftY, true);

      const rightOffsetX = SEESAW_LEN - 130;
      const rightX = SEESAW_CX + rightOffsetX * cosA - 0;
      const rightY = SEESAW_CY + 6 + rightOffsetX * sinA - 90;
      drawNumberBox(rightVal, rightX, rightY, false);

      // Crab on the higher side
      const crabSide = angle < -2 ? 'left' : angle > 2 ? 'right' : null;
      if (crabSide === 'left') {
        const crabX = SEESAW_CX + (-SEESAW_LEN + 50) * cosA;
        const crabY = SEESAW_CY + 6 + (-SEESAW_LEN + 50) * sinA - 40;
        drawCrab(crabX, crabY, true);
      } else if (crabSide === 'right') {
        const crabX = SEESAW_CX + (SEESAW_LEN - 50) * cosA;
        const crabY = SEESAW_CY + 6 + (SEESAW_LEN - 50) * sinA - 40;
        drawCrab(crabX, crabY, false);
      }

      drawWeightIndicator(angle);

      // Symbol buttons
      drawSymbolSelector(question.options);

      // Minimal hint (only shows tilt direction after answering)
      // HUD left to parent top bar
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [question, disabled, onChoose, streak, leftVal, rightVal, correctSymbol]);

  return (
    <div className="game-wrapper seesaw-game">
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="跷跷板比大小" />
      <div className="game-instruction">观察跷跷板倾斜方向，点击正确的比较符号（&gt; &lt; =）</div>
    </div>
  );
}
