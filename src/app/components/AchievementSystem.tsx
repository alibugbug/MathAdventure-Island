import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Flame, Target, Crown, Zap } from 'lucide-react';
import { playAchievementSound } from '../utils/audioManager';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
}

interface GameStats {
  totalScore: number;
  levelsCompleted: number;
  threeStarLevels: number;
  perfectBattles: number;
  puzzlesSolved: number;
  highestStreak: number;
}

interface AchievementSystemProps {
  stats: GameStats;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

export default function AchievementSystem({ stats, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_victory',
      name: '首次胜利',
      description: '完成第一个关卡',
      icon: <Trophy className="text-yellow-500" size={32} />,
      condition: (s) => s.levelsCompleted >= 1,
      unlocked: false,
    },
    {
      id: 'battle_master',
      name: '战斗大师',
      description: '完成5次完美战斗',
      icon: <Crown className="text-purple-500" size={32} />,
      condition: (s) => s.perfectBattles >= 5,
      unlocked: false,
    },
    {
      id: 'puzzle_genius',
      name: '解谜天才',
      description: '完成10个拼图谜题',
      icon: <Award className="text-teal-500" size={32} />,
      condition: (s) => s.puzzlesSolved >= 10,
      unlocked: false,
    },
    {
      id: 'streak_master',
      name: '连击之王',
      description: '达成10连击',
      icon: <Flame className="text-orange-500" size={32} />,
      condition: (s) => s.highestStreak >= 10,
      unlocked: false,
    },
    {
      id: 'perfectionist',
      name: '完美主义者',
      description: '获得5个三星关卡',
      icon: <Target className="text-pink-500" size={32} />,
      condition: (s) => s.threeStarLevels >= 5,
      unlocked: false,
    },
    {
      id: 'legend',
      name: '传奇冒险者',
      description: '总分突破1000',
      icon: <Zap className="text-cyan-500" size={32} />,
      condition: (s) => s.totalScore >= 1000,
      unlocked: false,
    },
  ]);

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    checkAchievements();
  }, [stats]);

  const checkAchievements = () => {
    const updated = achievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        // 新解锁的成就
        const unlocked = { ...achievement, unlocked: true };
        setNewlyUnlocked(unlocked);

        if (onAchievementUnlock) {
          onAchievementUnlock(unlocked);
        }

        // 播放解锁音效
        playUnlockSound();

        // 3秒后隐藏通知
        setTimeout(() => setNewlyUnlocked(null), 3000);

        return unlocked;
      }
      return achievement;
    });

    setAchievements(updated);
  };

  const playUnlockSound = () => {
    playAchievementSound('unlock');
  };

  return (
    <>
      {/* 成就解锁通知 */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-600 rounded-2xl p-6 shadow-2xl min-w-[350px]"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur rounded-full p-3">
                  {newlyUnlocked.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-yellow-900" style={{ fontFamily: 'monospace' }}>
                    🎉 成就解锁！
                  </div>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
                    {newlyUnlocked.name}
                  </div>
                  <div className="text-sm text-yellow-100" style={{ fontFamily: 'monospace' }}>
                    {newlyUnlocked.description}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成就列表（可选显示） */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-xl border-4 ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-500'
                : 'bg-gray-200 border-gray-400 opacity-60'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="text-sm font-bold text-gray-800 mb-1" style={{ fontFamily: 'monospace' }}>
                {achievement.name}
              </div>
              <div className="text-xs text-gray-600" style={{ fontFamily: 'monospace' }}>
                {achievement.description}
              </div>
              {achievement.unlocked && (
                <div className="mt-2 text-xs text-green-600 font-bold" style={{ fontFamily: 'monospace' }}>
                  ✓ 已解锁
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('mathGameStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalScore: 0,
      levelsCompleted: 0,
      threeStarLevels: 0,
      perfectBattles: 0,
      puzzlesSolved: 0,
      highestStreak: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('mathGameStats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (updates: Partial<GameStats>) => {
    setStats(prev => ({
      ...prev,
      ...updates,
    }));
  };

  return { stats, updateStats };
}
