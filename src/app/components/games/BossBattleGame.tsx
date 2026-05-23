import { useEffect, useRef } from 'react';
import { playFeedbackSound, playUISound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
  kind?: string;
  visual?: {
    comparePair?: [number, number];
    a?: number;
    b?: number;
    total?: number;
    mode?: string;
    label?: string;
  };
}

interface BossBattleGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
  progress: number;
  bossName?: string;
}

const BOSS_CONFIG: Record<string, { color: string; attack: string; icon: string }> = {
  '迷雾水母': { color: '#4fc3f7', attack: '⚡触须缠绕', icon: '🪼' },
  '巨嘴鸟王': { color: '#ff8a65', attack: '🪶羽刃风暴', icon: '🐦' },
  '岩石巨人': { color: '#8d6e63', attack: '🪨岩石投掷', icon: '🪨' },
  '算术法师': { color: '#7e57c2', attack: '🔮暗影法球', icon: '🧙' },
  '遗迹守护者': { color: '#ffb300', attack: '🗿石化射线', icon: '🗿' },
  '暗影巨龙': { color: '#ef5350', attack: '🐉暗影吐息', icon: '🐉' },
};

const SPRITES = {
  idle: { file: 'Idle (44x30).png', frameW: 44, frameH: 30, frames: 10, speed: 8 },
  hit: { file: 'Hit (44x30).png', frameW: 44, frameH: 30, frames: 5, speed: 5 },
  appear: { file: 'Appear (44x30).png', frameW: 44, frameH: 30, frames: 4, speed: 6 },
  desappear: { file: 'Desappear (44x30).png', frameW: 44, frameH: 30, frames: 4, speed: 6 },
} as const;

const HERO_SPRITE = {
  file: '龙骑士.png',
  path: 'assets/PixelSRPG-Forge-main/other_其他素材3万多张/xs004-像素小图标整理【31000多张】/赠品-像素小人和杂物/4方向角色',
  frameW: 96,
  frameH: 96,
  cols: 4,
  animRow: 2, // row 2 = facing right
  frameCount: 4,
  speed: 10,
  scale: 1.6,
  attackSpeed: 4,
};

type SpriteAnim = keyof typeof SPRITES;

export default function BossBattleGame({ question, disabled, onChoose, streak, progress, bossName = 'Boss' }: BossBattleGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bossCfg = BOSS_CONFIG[bossName] || { color: '#ef5350', attack: '🔥攻击', icon: '👹' };

  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const imagesLoadedRef = useRef(false);

  const stateRef = useRef({
    bossHp: 1,
    maxHp: 1,
    heroHp: 3,
    shakeTimer: 0,
    flashTimer: 0,
    attackWave: 0,
    phase: 1,
    resolved: false,
    showOptions: false,
    animTick: 0,
    spriteAnim: 'appear' as SpriteAnim,
    frameIndex: 0,
    frameTimer: 0,
    // Hero sprite animation
    heroFrame: 0,
    heroFrameTimer: 0,
  });

  // Load sprite images once
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const path = 'assets/PixelSRPG-Forge-main/Characters_角色人物/monster/Ghost';
    let loaded = 0;
    const total = Object.keys(SPRITES).length + 1; // +1 for hero sprite

    for (const [key, cfg] of Object.entries(SPRITES)) {
      const img = new Image();
      img.src = `${base}${path}/${cfg.file}`;
      img.onload = () => {
        imagesRef.current[key] = img;
        loaded++;
        if (loaded >= total) imagesLoadedRef.current = true;
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) imagesLoadedRef.current = true;
      };
    }

    // Load hero sprite
    const heroImg = new Image();
    heroImg.src = `${base}${HERO_SPRITE.path}/${HERO_SPRITE.file}`;
    heroImg.onload = () => {
      imagesRef.current['hero'] = heroImg;
      loaded++;
      if (loaded >= total) imagesLoadedRef.current = true;
    };
    heroImg.onerror = () => {
      loaded++;
      if (loaded >= total) imagesLoadedRef.current = true;
    };
  }, []);

  // Reset per question
  useEffect(() => {
    const state = stateRef.current;
    state.resolved = false;
    state.showOptions = true;
    state.flashTimer = 0;
    state.shakeTimer = 0;
    state.attackWave = 0;
    const remaining = Math.max(1, Math.ceil((1 - progress / 100) * 5));
    state.bossHp = remaining;
    state.maxHp = remaining;
    state.heroHp = 3;
  }, [question.prompt, question.answer, progress]);

  const W = 700;
  const H = 420;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBackground = () => {
      // Deep ocean arena
      const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 400);
      grad.addColorStop(0, '#0d2b45');
      grad.addColorStop(0.5, '#081a2e');
      grad.addColorStop(1, '#030a14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Seabed
      ctx.fillStyle = '#0a1520';
      ctx.fillRect(0, H - 80, W, 80);
      const groundGrad = ctx.createLinearGradient(0, H - 80, 0, H);
      groundGrad.addColorStop(0, 'rgba(20,80,120,0.15)');
      groundGrad.addColorStop(1, 'rgba(10,40,60,0.05)');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, H - 80, W, 80);

      // Floating bubbles
      ctx.fillStyle = 'rgba(100,200,255,0.06)';
      for (let i = 0; i < 8; i++) {
        const bx = (stateRef.current.animTick * 1.5 + i * 97) % W;
        const by = (stateRef.current.animTick * 0.8 + i * 137) % H;
        ctx.beginPath();
        ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBoss = () => {
      const state = stateRef.current;
      ctx.save();

      const shake = state.shakeTimer;
      const bx = W - 160 + (shake > 0 ? (Math.random() - 0.5) * shake * 3 : 0);
      const by = H / 2 - 20 + (shake > 0 ? (Math.random() - 0.5) * shake * 3 : 0)
        + Math.sin(state.animTick * 0.03) * 6; // float

      const phase = state.phase;
      const glowSize = phase === 3 ? 200 : phase === 2 ? 170 : 150;
      ctx.shadowBlur = glowSize;
      ctx.shadowColor = phase === 3 ? '#ff1744' : bossCfg.color;

      const img = imagesRef.current[state.spriteAnim];
      const cfg = SPRITES[state.spriteAnim];

      if (img && img.complete && img.naturalWidth > 0) {
        // Draw ghost sprite
        const scale = 3.5;
        const sx = state.frameIndex * cfg.frameW;
        const dw = cfg.frameW * scale;
        const dh = cfg.frameH * scale;
        const dx = bx - dw / 2;
        const dy = by - dh / 2;

        ctx.drawImage(img, sx, 0, cfg.frameW, cfg.frameH, dx, dy, dw, dh);
        ctx.shadowBlur = 0;

        // Phase tint
        if (phase === 3) {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(dx, dy, dw, dh);
          ctx.globalAlpha = 1;
        } else if (phase === 2) {
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(dx, dy, dw, dh);
          ctx.globalAlpha = 1;
        }
      } else {
        // Fallback canvas boss when sprites not loaded
        const bossGrad = ctx.createRadialGradient(bx - 20, by - 30, 10, bx, by, 70);
        bossGrad.addColorStop(0, bossCfg.color);
        bossGrad.addColorStop(0.5, '#4a2060');
        bossGrad.addColorStop(1, '#1a0a2a');
        ctx.fillStyle = bossGrad;
        ctx.beginPath();
        ctx.ellipse(bx, by, 64, 56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff8cf';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bossCfg.icon, bx, by - 4);
      }

      // Boss name
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.fillStyle = '#fff8cf';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bossName, bx, by + cfg.frameH * 1.75 + 8);
      }

      ctx.restore();
    };

    const drawHero = (attackWave: number, heroFrame: number) => {
      ctx.save();
      const hx = 120;
      const hy = H / 2 + 10;

      const heroImg = imagesRef.current['hero'];

      if (heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
        // Dragon Knight sprite
        if (attackWave > 0) {
          ctx.translate(attackWave * 20, 0);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(hx + 10, hy + 60, 40, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        const sx = heroFrame * HERO_SPRITE.frameW;
        const sy = HERO_SPRITE.animRow * HERO_SPRITE.frameH;
        const scale = HERO_SPRITE.scale;
        const dw = HERO_SPRITE.frameW * scale;
        const dh = HERO_SPRITE.frameH * scale;

        ctx.translate(hx, hy);
        ctx.drawImage(heroImg, sx, sy, HERO_SPRITE.frameW, HERO_SPRITE.frameH,
          -dw / 2, -dh / 2, dw, dh);
      } else {
        // Fallback: canvas-drawn hero when sprite not loaded
        if (attackWave > 0) {
          ctx.translate(attackWave * 20, 0);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(hx, hy + 50, 36, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body / armor
        ctx.fillStyle = '#4a90d9';
        ctx.beginPath();
        ctx.ellipse(hx, hy, 28, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffcc80';
        ctx.beginPath();
        ctx.arc(hx, hy - 32, 20, 0, Math.PI * 2);
        ctx.fill();

        // Hat / helmet
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(hx - 22, hy - 52, 44, 8);
        ctx.fillRect(hx - 14, hy - 64, 28, 14);

        // Eyes
        ctx.fillStyle = '#172033';
        ctx.beginPath();
        ctx.arc(hx - 6, hy - 34, 3, 0, Math.PI * 2);
        ctx.arc(hx + 6, hy - 34, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sword when attacking
        if (attackWave > 0) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(hx + 30, hy - 10);
          ctx.lineTo(hx + 80, hy - 40);
          ctx.stroke();
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(hx + 80, hy - 40, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const drawBossHp = () => {
      const state = stateRef.current;
      const barW = 240;
      const barH = 18;
      const bx = W / 2 - barW / 2;
      const by = 14;

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 4);
      ctx.fill();

      const hpRatio = Math.max(0, state.bossHp / state.maxHp);
      const hpColor = hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336';
      ctx.fillStyle = hpColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW * hpRatio, barH, 3);
      ctx.fill();

      ctx.strokeStyle = '#172033';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 4);
      ctx.stroke();

      ctx.fillStyle = '#fff8cf';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${bossName} HP: ${state.bossHp}/${state.maxHp}`, W / 2, by + barH - 3);
    };

    const drawAnswerButtons = (options: Array<number | string>) => {
      const state = stateRef.current;
      if (!state.showOptions || state.resolved) return;

      const btnW = 120;
      const btnH = 56;
      const gap = 14;
      const totalW = options.length * btnW + (options.length - 1) * gap;
      const startX = (W - totalW) / 2;
      const y = H - 68;

      options.forEach((opt, i) => {
        const x = startX + i * (btnW + gap);

        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';

        const grad = ctx.createLinearGradient(x, y, x, y + btnH);
        grad.addColorStop(0, '#5d4037');
        grad.addColorStop(1, '#3e2723');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 8);
        ctx.fill();

        ctx.strokeStyle = '#172033';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 8);
        ctx.stroke();

        // Rune pattern
        ctx.strokeStyle = 'rgba(255,215,0,0.15)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(x + 15 + r * 45, y + btnH - 12, 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(String(opt), x + btnW / 2, y + btnH / 2 + 1);

        ctx.restore();
      });
    };

    const drawAttackEffect = () => {
      const state = stateRef.current;
      if (state.flashTimer <= 0) return;

      const intensity = state.flashTimer / 20;
      ctx.save();
      ctx.globalAlpha = intensity * 0.3;
      ctx.fillStyle = state.flashTimer > 0 ? '#ffd700' : '#ff1744';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      if (state.flashTimer > 10) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 52px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.fillText('⚔️ -1', W - 160, H / 2 - 60);
      }
      ctx.restore();
    };

    const drawQuestion = () => {
      const prompt = question.prompt;
      if (!prompt) return;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const qx = W / 2 - 260;
      const qw = 520;
      const qh = 38;
      const qy = 44;
      ctx.fillRect(qx, qy, qw, qh);

      ctx.fillStyle = '#fff8cf';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(prompt, W / 2, qy + qh / 2);

      // For compare questions, show the comparison pair below the prompt
      if (question.kind === 'compare' || question.visual?.comparePair) {
        const [a, b] = question.visual?.comparePair || [0, 0];
        if (a && b) {
          ctx.fillStyle = '#b0d4f1';
          ctx.font = 'bold 22px monospace';
          ctx.fillText(`${a}  ?  ${b}`, W / 2, 98);
        }
      }

      ctx.restore();
    };

    const detectButtonHit = (cx: number, cy: number): number | string | null => {
      const state = stateRef.current;
      if (!state.showOptions || state.resolved) return null;

      const options = question.options;
      const btnW = 120;
      const btnH = 56;
      const gap = 14;
      const totalW = options.length * btnW + (options.length - 1) * gap;
      const startX = (W - totalW) / 2;
      const y = H - 68;

      for (let i = 0; i < options.length; i++) {
        const x = startX + i * (btnW + gap);
        if (cx >= x && cx <= x + btnW && cy >= y && cy <= y + btnH) {
          return options[i];
        }
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const state = stateRef.current;
      if (disabled || state.resolved || !state.showOptions) return;

      const rect = canvas.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * W;
      const cy = ((e.clientY - rect.top) / rect.height) * H;

      const selected = detectButtonHit(cx, cy);
      if (selected === null) return;

      state.showOptions = false;

      if (selected === question.answer) {
        // Correct: hero attacks, boss takes hit animation
        state.bossHp = Math.max(0, state.bossHp - 1);
        state.attackWave = 8;
        state.flashTimer = 18;
        state.spriteAnim = 'hit';
        state.frameIndex = 0;
        state.frameTimer = 0;

        if (state.bossHp / state.maxHp <= 0.33) state.phase = 3;
        else if (state.bossHp / state.maxHp <= 0.66) state.phase = 2;
        playBattleSound('attack');
        playFeedbackSound('coin');

        if (state.bossHp <= 0) {
          state.resolved = true;
          state.spriteAnim = 'desappear';
          state.frameIndex = 0;
          state.frameTimer = 0;
          setTimeout(() => onChoose(question.answer), 1000);
        } else {
          setTimeout(() => {
            state.showOptions = true;
            state.attackWave = 0;
            state.flashTimer = 0;
            if (state.spriteAnim === 'hit') {
              state.spriteAnim = 'idle';
              state.frameIndex = 0;
            }
            onChoose(question.answer);
          }, 600);
        }
      } else {
        // Wrong: boss attacks
        state.flashTimer = -15;
        state.shakeTimer = 12;
        playBattleSound('damage');

        setTimeout(() => {
          state.showOptions = true;
          state.flashTimer = 0;
          const wrong = question.options.find(o => o !== question.answer) ?? '__wrong__';
          onChoose(wrong);
        }, 600);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);

    const loop = () => {
      const state = stateRef.current;
      state.animTick++;

      // Sprite animation
      state.frameTimer++;
      const cfg = SPRITES[state.spriteAnim];
      if (state.frameTimer >= cfg.speed) {
        state.frameTimer = 0;
        state.frameIndex = (state.frameIndex + 1);
        if (state.frameIndex >= cfg.frames) {
          if (state.spriteAnim === 'appear') {
            state.spriteAnim = 'idle';
            state.frameIndex = 0;
          } else if (state.spriteAnim === 'hit') {
            state.spriteAnim = 'idle';
            state.frameIndex = 0;
          } else if (state.spriteAnim === 'desappear') {
            state.frameIndex = cfg.frames - 1; // hold last frame
          } else {
            state.frameIndex = 0; // loop idle
          }
        }
      }

      // Hero sprite animation (4-frame loop)
      const heroSpeed = state.attackWave > 0 ? HERO_SPRITE.attackSpeed : HERO_SPRITE.speed;
      state.heroFrameTimer++;
      if (state.heroFrameTimer >= heroSpeed) {
        state.heroFrameTimer = 0;
        state.heroFrame = (state.heroFrame + 1) % HERO_SPRITE.frameCount;
      }

      // Decay effects
      if (state.shakeTimer > 0) state.shakeTimer -= 0.5;
      if (state.attackWave > 0) state.attackWave -= 0.3;
      if (state.flashTimer > 0) state.flashTimer -= 0.5;
      else if (state.flashTimer < 0) state.flashTimer += 0.5;

      // Draw
      drawBackground();
      drawBoss();
      drawHero(state.attackWave, state.heroFrame);
      drawBossHp();
      drawAttackEffect();
      drawQuestion();
      drawAnswerButtons(question.options);

      // Streak indicator
      if (streak > 1 && state.showOptions && !state.resolved) {
        ctx.fillStyle = 'rgba(255,215,0,0.6)';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`🔥 连击 x${streak}`, 14, H - 16);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [question, disabled, onChoose, streak, bossName, bossCfg]);

  return (
    <div className="game-wrapper boss-battle-game">
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="Boss对战" />
      <div className="game-instruction">答对攻击 Boss，答错被反击！击败 {bossName}！</div>
    </div>
  );
}
