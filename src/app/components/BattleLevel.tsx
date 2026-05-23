import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { PixelButton, PixelPanel, PixelProgressBar, PixelBadge, PixelAvatar } from './PixelUI';
import { playBattleSound, playUISound, playMonsterSound, playBackgroundMusic, stopBackgroundMusic } from '../utils/audioManager';

interface Rune {
  id: string;
  operator: '+' | '-' | '×' | '÷';
  value: number;
  icon: string;
}

interface Monster {
  name: string;
  emoji: string;
  health: number;
  maxHealth: number;
  weakness: number;
  reward: number;
}

interface BattleLevelProps {
  level: {
    range: { min: number; max: number };
    questions: number;
  };
  onComplete: (score: number) => void;
  onGameOver: () => void;
}

export default function BattleLevel({ level, onComplete, onGameOver }: BattleLevelProps) {
  const [playerValue, setPlayerValue] = useState(5);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [availableRunes, setAvailableRunes] = useState<Rune[]>([]);
  const [collectedRunes, setCollectedRunes] = useState<Rune[]>([]);
  const [score, setScore] = useState(0);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [damageNumber, setDamageNumber] = useState<number | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const monsterTypes = [
    { name: '史莱姆', emoji: '👾', healthMultiplier: 1 },
    { name: '哥布林', emoji: '👺', healthMultiplier: 1.2 },
    { name: '骷髅兵', emoji: '💀', healthMultiplier: 1.5 },
    { name: '暗影龙', emoji: '🐉', healthMultiplier: 2 },
    { name: '魔法师', emoji: '🧙', healthMultiplier: 1.3 },
  ];

  useEffect(() => {
    playBackgroundMusic('battle');
    generateMonster();
    generateRunes();

    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const generateMonster = () => {
    const { min, max } = level.range;
    const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const weakness = Math.floor(Math.random() * (max - min + 1)) + min;
    const maxHealth = Math.floor(weakness * monsterType.healthMultiplier);

    // 播放怪物出场音效
    playMonsterSound('spawn');

    setMonster({
      name: monsterType.name,
      emoji: monsterType.emoji,
      health: maxHealth,
      maxHealth,
      weakness,
      reward: weakness * 10,
    });
  };

  const generateRunes = () => {
    const runes: Rune[] = [];
    const { min, max } = level.range;

    // 生成加法符文
    for (let i = 0; i < 3; i++) {
      runes.push({
        id: `add-${i}`,
        operator: '+',
        value: Math.floor(Math.random() * max) + 1,
        icon: '✨',
      });
    }

    // 生成减法符文
    for (let i = 0; i < 2; i++) {
      runes.push({
        id: `sub-${i}`,
        operator: '-',
        value: Math.floor(Math.random() * (max / 2)) + 1,
        icon: '💫',
      });
    }

    // 生成乘法符文（较少）
    if (max >= 10) {
      runes.push({
        id: 'mul-0',
        operator: '×',
        value: 2,
        icon: '⚡',
      });
    }

    setAvailableRunes(runes.sort(() => Math.random() - 0.5));
  };

  const collectRune = (rune: Rune) => {
    setCollectedRunes([...collectedRunes, rune]);
    setAvailableRunes(availableRunes.filter(r => r.id !== rune.id));

    let newValue = playerValue;
    switch (rune.operator) {
      case '+':
        newValue += rune.value;
        break;
      case '-':
        newValue = Math.max(0, newValue - rune.value);
        break;
      case '×':
        newValue *= rune.value;
        break;
      case '÷':
        newValue = Math.floor(newValue / rune.value);
        break;
    }
    setPlayerValue(newValue);

    playUISound('select');
  };

  const uncollectRune = (rune: Rune) => {
    setCollectedRunes(collectedRunes.filter(r => r.id !== rune.id));
    setAvailableRunes([...availableRunes, rune]);

    let newValue = playerValue;
    switch (rune.operator) {
      case '+':
        newValue -= rune.value;
        break;
      case '-':
        newValue += rune.value;
        break;
      case '×':
        newValue = Math.floor(newValue / rune.value);
        break;
      case '÷':
        newValue *= rune.value;
        break;
    }
    setPlayerValue(Math.max(0, newValue));

    playUISound('select');
  };

  const attack = () => {
    if (!monster || isAttacking) return;

    setIsAttacking(true);

    const damage = playerValue === monster.weakness ? monster.maxHealth : Math.floor(playerValue / 2);
    const isPerfect = playerValue === monster.weakness;

    setDamageNumber(damage);
    setShakeScreen(true);

    if (isPerfect) {
      playBattleSound('victory');
      triggerConfetti();
    } else {
      playBattleSound('attack');
    }

    setTimeout(() => {
      setShakeScreen(false);
      setDamageNumber(null);
    }, 500);

    const newHealth = Math.max(0, monster.health - damage);

    setTimeout(() => {
      if (newHealth <= 0) {
        // 怪物被击败
        setScore(score + monster.reward + (isPerfect ? monster.reward : 0));
        setMonstersDefeated(monstersDefeated + 1);

        // 播放怪物死亡音效
        playMonsterSound('death');
        playBattleSound('levelUp');

        setTimeout(() => {
          if (monstersDefeated + 1 >= level.questions) {
            const finalScore = score + monster.reward + (isPerfect ? monster.reward : 0);
            const maxPossibleScore = (level.questions || 3) * 100;
            const percentage = finalScore / maxPossibleScore;
            const stars = percentage >= 0.9 ? 3 : percentage >= 0.7 ? 2 : 1;
            onComplete(stars);
          } else {
            // 生成新怪物
            setPlayerValue(5);
            setCollectedRunes([]);
            generateMonster();
            generateRunes();
          }
        }, 1500);
      } else {
        setMonster({ ...monster, health: newHealth });
      }
      setIsAttacking(false);
    }, 600);
  };

  const triggerConfetti = () => {
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const particles = [];
        for (let j = 0; j < 30; j++) {
          particles.push({
            x: Math.random() * window.innerWidth,
            y: -20,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.5) * 4,
            speedY: Math.random() * 3 + 2,
          });
        }
      }, i * 100);
    }
  };

  if (!monster) return null;

  return (
    <motion.div
      animate={shakeScreen ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="h-full bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 p-6 relative overflow-y-auto"
      style={{ maxHeight: '100vh' }}
    >
      {/* 像素化背景 */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px),
                         repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)`,
      }} />

      {/* 退出按钮 */}
      <div className="relative z-10 mb-4">
        <PixelButton
          onClick={() => {
            if (window.confirm('确定要退出战斗吗？进度将不会保存。')) {
              onGameOver();
            }
          }}
          variant="secondary"
          size="sm"
        >
          ← 退出战斗
        </PixelButton>
      </div>

      {/* 顶部UI */}
      <div className="relative z-10 flex justify-between items-center mb-6 gap-4">
        <PixelPanel variant="primary" className="flex-1">
          <div className="flex items-center gap-3">
            <Shield className="text-cyan-400" size={24} />
            <div>
              <div className="text-xs text-cyan-300" style={{ fontFamily: 'monospace' }}>你的数值</div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
                {playerValue}
              </div>
            </div>
          </div>
        </PixelPanel>

        <PixelPanel variant="dark">
          <div className="text-center px-4">
            <div className="text-xs text-yellow-300" style={{ fontFamily: 'monospace' }}>得分</div>
            <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>
              {score}
            </div>
          </div>
        </PixelPanel>

        <PixelPanel variant="success">
          <div className="text-center px-4">
            <div className="text-xs text-green-300" style={{ fontFamily: 'monospace' }}>击败</div>
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
              {monstersDefeated}/{level.questions}
            </div>
          </div>
        </PixelPanel>
      </div>

      {/* 怪物区域 */}
      <div className="relative z-10 flex justify-center items-center mb-8">
        <motion.div
          animate={isAttacking ? { scale: [1, 0.9, 1], x: [0, -20, 0] } : {}}
          className="relative"
        >
          <PixelPanel variant="danger" className="min-w-[350px]">
            <div className="text-center mb-4">
              <PixelAvatar emoji={monster.emoji} size={96} borderColor="red" className="mx-auto mb-4" />
              <PixelBadge color="red" size="lg">
                {monster.name}
              </PixelBadge>
            </div>

            {/* 血条 */}
            <div className="mb-4">
              <PixelProgressBar
                value={monster.health}
                max={monster.maxHealth}
                color="red"
                height="lg"
                showText
              />
            </div>

            {/* 弱点提示 */}
            <PixelPanel variant="dark" className="text-center">
              <div className="text-yellow-300 text-sm mb-1" style={{ fontFamily: 'monospace' }}>
                弱点数值
              </div>
              <div className="text-4xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>
                {monster.weakness}
              </div>
              <PixelBadge color="yellow" size="sm" className="mt-2">
                匹配弱点可一击必杀！
              </PixelBadge>
            </PixelPanel>
          </PixelPanel>

          {/* 伤害数字 */}
          <AnimatePresence>
            {damageNumber !== null && (
              <motion.div
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: -100, opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl font-bold"
                style={{
                  fontFamily: 'monospace',
                  color: damageNumber === monster.maxHealth ? '#FFD700' : '#FF4444',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
                }}
              >
                -{damageNumber}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 使用说明 - 可折叠 */}
      <div className="relative z-10 mb-4">
        <PixelButton
          onClick={() => setShowHelp(!showHelp)}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <HelpCircle className="inline mr-2" size={16} />
          {showHelp ? '收起说明' : '查看游戏说明'}
        </PixelButton>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PixelPanel variant="dark" className="mt-4 text-center">
                <div className="text-gray-300 text-xs space-y-1" style={{ fontFamily: 'monospace' }}>
                  <p>1. 点击上方符文收集，改变你的数值</p>
                  <p>2. 再次点击下方已使用的符文可取消选择</p>
                  <p>3. 让你的数值等于怪物弱点可一击必杀！</p>
                  <p>4. 准备好了就点击攻击按钮！</p>
                </div>
              </PixelPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 符文收集区 */}
      <div className="relative z-30 mb-6">
        <div className="text-center mb-4">
          <PixelBadge color="purple" size="lg">
            <Sparkles className="inline mr-2" size={16} />
            收集符文改变你的数值
          </PixelBadge>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {availableRunes.map((rune, index) => (
            <motion.div
              key={rune.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => collectRune(rune)}
              className="cursor-pointer relative z-10"
            >
              <PixelPanel variant="primary" className="min-w-[100px] hover:shadow-lg hover:shadow-purple-500/50 text-center pointer-events-auto">
                <div className="text-3xl mb-1">{rune.icon}</div>
                <PixelBadge color="purple" size="md">
                  {rune.operator}{rune.value}
                </PixelBadge>
              </PixelPanel>
            </motion.div>
          ))}
        </div>

        {/* 已收集符文 */}
        {collectedRunes.length > 0 && (
          <div className="flex justify-center gap-2 flex-wrap">
            <PixelBadge color="gray" size="sm">已使用:</PixelBadge>
            {collectedRunes.map((rune, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => uncollectRune(rune)}
                className="cursor-pointer"
              >
                <PixelBadge color="cyan" size="sm" className="hover:bg-cyan-600">
                  {rune.operator}{rune.value}
                  <span className="ml-1 text-xs opacity-70">✕</span>
                </PixelBadge>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 攻击按钮 */}
      <div className="relative z-10 flex justify-center">
        <PixelButton
          onClick={attack}
          disabled={isAttacking}
          variant="danger"
          size="xl"
        >
          <Sword className="inline mr-3" size={32} />
          攻击！
        </PixelButton>
      </div>
    </motion.div>
  );
}
