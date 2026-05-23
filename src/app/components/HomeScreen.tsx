import { motion } from 'motion/react';
import { Award } from 'lucide-react';
import { PixelButton, PixelBadge } from './PixelUI';
import { playUISound } from '../utils/audioManager';

interface HomeScreenProps {
  onStart: () => void;
  onAchievements: () => void;
  enableCRT: boolean;
  onCRTChange: (enabled: boolean) => void;
}

export function HomeScreen({ onStart, onAchievements, enableCRT, onCRTChange }: HomeScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 简洁渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900" />

      {/* 主内容 */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-2xl w-full"
        >
          {/* 标题区域 */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mb-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{
              textShadow: '6px 6px 0px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.4)',
              fontFamily: 'monospace',
              letterSpacing: '4px'
            }}>
              数学冒险岛
            </h1>
            <p className="text-2xl md:text-3xl text-yellow-300 font-bold" style={{ fontFamily: 'monospace' }}>
              一年级数学游乐场
            </p>
          </motion.div>

          {/* 按钮区域 */}
          <div className="flex flex-col gap-5 items-center">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-xs"
            >
              <PixelButton
                onClick={() => {
                  playUISound('click');
                  onStart();
                }}
                variant="warning"
                size="xl"
                className="w-full text-2xl"
              >
                🎮 开始冒险 →
              </PixelButton>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-xs"
            >
              <PixelButton
                onClick={() => {
                  playUISound('click');
                  onAchievements();
                }}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Award className="inline mr-2" size={24} />
                成就系统
              </PixelButton>
            </motion.div>

            {/* CRT开关 */}
            <div className="flex items-center justify-center gap-3 mt-8 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <PixelBadge color="gray" size="md">
                复古CRT效果
              </PixelBadge>
              <button
                onClick={() => {
                  playUISound('click');
                  onCRTChange(!enableCRT);
                }}
                className={`w-16 h-8 border-3 transition-all ${
                  enableCRT ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-600 border-gray-800'
                }`}
                style={{ clipPath: 'polygon(0 3px, 3px 3px, 3px 0, calc(100% - 3px) 0, calc(100% - 3px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 3px), 0 calc(100% - 3px))' }}
              >
                <motion.div
                  animate={{ x: enableCRT ? 32 : 0 }}
                  className="w-7 h-7 bg-white"
                  style={{ clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))' }}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
