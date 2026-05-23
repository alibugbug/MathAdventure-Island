import { useEffect, useRef } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
}

interface LavaJumpGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

type Platform = {
  id: number;
  x: number;
  y: number;
  value: number;
  width: number;
  sinking: boolean;
  sinkProgress: number;
};

export default function LavaJumpGame({ question, disabled, onChoose, streak }: LavaJumpGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    platforms: [] as Platform[],
    playerX: 350,
    playerY: 100,
    playerVx: 0,
    playerVy: 0,
    onPlatform: -1,
    scrollY: 0,
    resolved: false,
    lastId: 0,
    targetValue: 0,
    score: 0,
    spawnCount: 0,
    message: '',
    messageTimer: 0,
  });

  const W = 700;
  const H = 500;

  useEffect(() => {
    stateRef.current.targetValue = Number(question.answer);
    stateRef.current.resolved = false;
    stateRef.current.scrollY = 0;
    stateRef.current.score = 0;
    stateRef.current.spawnCount = 0;
    stateRef.current.platforms = [];
    stateRef.current.playerX = 350;
    stateRef.current.playerY = 100;
    stateRef.current.playerVx = 0;
    stateRef.current.playerVy = 0;
    stateRef.current.onPlatform = -1;
    stateRef.current.message = '';

    // Initial platforms
    const initial: Platform[] = [];
    for (let i = 0; i < 5; i++) {
      initial.push({
        id: i,
        x: 50 + Math.random() * (W - 150),
        y: H - 60 - i * 100,
        value: Number(question.options[Math.floor(Math.random() * question.options.length)]),
        width: 90 + Math.random() * 40,
        sinking: false,
        sinkProgress: 0,
      });
    }
    // Make sure one platform has the correct answer
    initial[2].value = Number(question.answer);
    stateRef.current.platforms = initial;
    stateRef.current.playerX = initial[0].x + initial[0].width / 2;
    stateRef.current.playerY = initial[0].y - 15;

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [question.prompt, question.answer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawLavaBg = () => {
      // Dark cave background
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(0, 0, W, H);

      // Lava glow at bottom
      const lavaGrad = ctx.createLinearGradient(0, H - 80, 0, H);
      lavaGrad.addColorStop(0, 'rgba(200, 50, 0, 0)');
      lavaGrad.addColorStop(0.3, 'rgba(200, 50, 0, 0.3)');
      lavaGrad.addColorStop(1, 'rgba(255, 100, 0, 0.8)');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, H - 80, W, 80);

      // Lava surface
      const time = Date.now() / 500;
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) {
        const waveY = H - 20 + Math.sin(x / 30 + time) * 4 + Math.sin(x / 15 + time * 1.3) * 3;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Lava highlights
      ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
      ctx.beginPath();
      for (let x = 0; x <= W; x += 15) {
        const hY = H - 18 + Math.sin(x / 25 + time * 0.7) * 5;
        if (x === 0) ctx.moveTo(x, hY);
        else ctx.lineTo(x, hY);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Cave ceiling
      ctx.fillStyle = '#0d0505';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= W; x += 15) {
        const ceilY = 5 + Math.sin(x / 40 + 1) * 4;
        ctx.lineTo(x, ceilY);
      }
      ctx.lineTo(W, 0);
      ctx.closePath();
      ctx.fill();
    };

    const drawRoundRect = (cx: number, cy: number, cw: number, ch: number, cr: number) => {
      ctx.beginPath();
      ctx.moveTo(cx + cr, cy);
      ctx.lineTo(cx + cw - cr, cy);
      ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + cr);
      ctx.lineTo(cx + cw, cy + ch - cr);
      ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - cr, cy + ch);
      ctx.lineTo(cx + cr, cy + ch);
      ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - cr);
      ctx.lineTo(cx, cy + cr);
      ctx.quadraticCurveTo(cx, cy, cx + cr, cy);
      ctx.fill();
    };

    const drawPlatform = (plat: Platform) => {
      ctx.save();

      const sinkOff = Math.min(1, plat.sinkProgress / 30);
      const py = plat.y + sinkOff * 40;

      // Platform shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(plat.x + 4, py + 6, plat.width, 12);

      // Stone platform
      const grad = ctx.createLinearGradient(plat.x, py, plat.x, py + 14);
      grad.addColorStop(0, '#6b5b4f');
      grad.addColorStop(1, '#4a3d34');
      ctx.fillStyle = grad;

      drawRoundRect(plat.x, py, plat.width, 14, 4);

      // Stone texture
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(plat.x + 8 + i * 25, py + 4);
        ctx.lineTo(plat.x + 20 + i * 25, py + 10);
        ctx.stroke();
      }

      // Value text on platform
      const isTarget = plat.value === stateRef.current.targetValue;
      ctx.fillStyle = isTarget ? '#ffd700' : '#fff';
      ctx.font = `bold ${isTarget ? 16 : 13}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = isTarget ? 8 : 2;
      ctx.shadowColor = isTarget ? '#ffd700' : 'rgba(0,0,0,0.5)';
      ctx.fillText(String(plat.value), plat.x + plat.width / 2, py + 7);
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    const drawPlayer = (px: number, py: number) => {
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(255,200,0,0.3)';

      // Body
      ctx.fillStyle = '#f5d742';
      ctx.beginPath();
      ctx.arc(px, py - 8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Hat
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(px - 14, py - 22, 28, 6);
      ctx.fillRect(px - 9, py - 30, 18, 10);

      // Eyes
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(px - 4, py - 10, 2, 0, Math.PI * 2);
      ctx.arc(px + 4, py - 10, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const gameLoop = () => {
      const state = stateRef.current;
      if (disabled || state.resolved) {
        drawLavaBg();
        for (const p of state.platforms) drawPlatform(p);
        drawPlayer(state.playerX, state.playerY);
        animRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Spawn new platforms as player moves up
      state.spawnCount++;
      if (state.spawnCount % 30 === 0 && state.platforms.length < 12) {
        const isTarget = Math.random() < 0.25;
        const val = isTarget ? state.targetValue : Number(question.options[Math.floor(Math.random() * question.options.length)]);
        const lastY = state.platforms.reduce((min, p) => Math.min(min, p.y), H);
        state.platforms.push({
          id: state.lastId++,
          x: 20 + Math.random() * (W - 160),
          y: lastY - 70 - Math.random() * 50,
          value: val,
          width: 80 + Math.random() * 50,
          sinking: false,
          sinkProgress: 0,
        });
      }

      // Gravity
      state.playerVy += 0.5;
      state.playerY += state.playerVy;

      // Platform collision
      state.onPlatform = -1;
      for (let i = 0; i < state.platforms.length; i++) {
        const p = state.platforms[i];
        const sinkOff = Math.min(1, p.sinkProgress / 30) * 40;
        if (state.playerX > p.x && state.playerX < p.x + p.width &&
            state.playerY > p.y + sinkOff - 18 && state.playerY < p.y + sinkOff + 4 &&
            state.playerVy > 0) {
          state.onPlatform = i;
          state.playerY = p.y + sinkOff - 14;
          state.playerVy = 0;
          break;
        }
      }

      // Check if standing on wrong platform (it starts sinking)
      for (let i = 0; i < state.platforms.length; i++) {
        const p = state.platforms[i];
        if (i === state.onPlatform) {
          if (p.value !== state.targetValue) {
            p.sinking = true;
          }
        }
        if (p.sinking) {
          p.sinkProgress++;
          if (p.sinkProgress > 60 && i === state.onPlatform) {
            // Fell into lava
            state.resolved = true;
            stateRef.current.message = '💀 掉进熔岩了！';
            playBattleSound('damage');
            const wrong = question.options.find(o => o !== question.answer) ?? '__wrong__';
            setTimeout(() => onChoose(wrong), 500);
          }
        }
      }

      // Check if standing on correct platform
      if (state.onPlatform >= 0) {
        const p = state.platforms[state.onPlatform];
        if (p.value === state.targetValue) {
          state.resolved = true;
          state.score += 10;
          stateRef.current.message = '✓ 跳到了正确平台！';
          playFeedbackSound('coin');
          setTimeout(() => onChoose(question.answer), 500);
        }
      }

      // Remove platforms that have fallen
      state.platforms = state.platforms.filter(p => p.sinkProgress < 80);

      // Draw
      drawLavaBg();
      for (const p of state.platforms) drawPlatform(p);
      drawPlayer(state.playerX, state.playerY);

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, 36);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`🎯 ${state.targetValue}`, 16, 25);
      ctx.textAlign = 'right';
      ctx.fillText(`⭐ ${state.score}`, W - 16, 25);

      // Message
      const msg = stateRef.current.message;
      if (msg) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(W / 2 - 100, H / 2 - 25, 200, 50);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(msg, W / 2, H / 2);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(gameLoop);
    };

    // Movement
    const onKey = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (disabled || state.resolved) return;
      if (e.key === 'ArrowLeft') { state.playerX -= 14; state.playerVx = -4; }
      if (e.key === 'ArrowRight') { state.playerX += 14; state.playerVx = 4; }
      if (e.key === 'ArrowUp' && state.onPlatform >= 0) { state.playerVy = -9; state.onPlatform = -1; }
      state.playerX = Math.max(10, Math.min(W - 10, state.playerX));
    };
    window.addEventListener('keydown', onKey);

    // Touch controls
    let touchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const state = stateRef.current;
      if (disabled || state.resolved) return;
      const dx = e.touches[0].clientX - touchX;
      state.playerX += dx * 0.5;
      state.playerX = Math.max(10, Math.min(W - 10, state.playerX));
      touchX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      const state = stateRef.current;
      if (state.onPlatform >= 0) state.playerVy = -9;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    animRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [question, disabled, onChoose, streak]);

  return (
    <div className="game-wrapper lava-jump-game">
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="熔岩跳跃" />
      <div className="game-instruction">用方向键移动/跳跃，跳到值为 {question.answer} 的正确平台上！</div>
    </div>
  );
}
