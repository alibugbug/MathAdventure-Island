import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Square, CheckCircle, RotateCw, Lightbulb } from 'lucide-react';
import { PixelButton, PixelPanel, PixelBadge } from './PixelUI';
import { playPuzzleSound, playUISound, playBackgroundMusic, stopBackgroundMusic } from '../utils/audioManager';

interface Block {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface PuzzleLevelProps {
  level: {
    range: { min: number; max: number };
    questions: number;
  };
  onComplete: (score: number) => void;
  onGameOver: () => void;
}

export default function PuzzleLevel({ level, onComplete, onGameOver }: PuzzleLevelProps) {
  const [gridSize] = useState(10);
  const [targetArea, setTargetArea] = useState(0);
  const [currentArea, setCurrentArea] = useState(0);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [score, setScore] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [puzzleType, setPuzzleType] = useState<'area' | 'perimeter' | 'symmetry'>('area');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const blockColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  useEffect(() => {
    playBackgroundMusic('puzzle');
    generatePuzzle();

    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const generatePuzzle = () => {
    const types: ('area' | 'perimeter' | 'symmetry')[] = ['area', 'perimeter', 'symmetry'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    setPuzzleType(selectedType);

    const { min, max } = level.range;
    
    // 周长谜题需要特殊处理，因为周长必须是4或≥6的偶数
    let target: number;
    if (selectedType === 'perimeter') {
      // 生成有效的周长值：4或6-20之间的偶数
      const possiblePerimeters = [4, 6, 8, 10, 12, 14, 16, 18, 20];
      const filtered = possiblePerimeters.filter(p => p >= min && p <= max);
      target = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : 8;
    } else {
      target = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    setTargetArea(target);
    setCurrentArea(0);
    setPlacedBlocks([]);
    setShowHint(false);
  };

  const placeBlock = (x: number, y: number) => {
    // 检查位置是否已被占用
    const isOccupied = placedBlocks.some(block => block.x === x && block.y === y);

    if (isOccupied) {
      // 移除方块
      setPlacedBlocks(placedBlocks.filter(block => !(block.x === x && block.y === y)));
      setCurrentArea(currentArea - 1);
      playPuzzleSound('remove');
    } else {
      // 放置方块
      if (currentArea < targetArea * 2) { // 允许放置更多方块进行尝试
        const newBlock: Block = {
          id: `${x}-${y}-${Date.now()}`,
          x,
          y,
          color: blockColors[Math.floor(Math.random() * blockColors.length)],
        };
        setPlacedBlocks([...placedBlocks, newBlock]);
        setCurrentArea(currentArea + 1);
        playPuzzleSound('place');
      }
    }
  };

  const checkSolution = () => {
    setErrorMessage(null);
    
    if (puzzleType === 'area') {
      if (currentArea === targetArea) {
        handleSuccess();
      } else {
        setErrorMessage(`当前面积: ${currentArea}, 目标面积: ${targetArea}`);
        playUISound('error');
      }
    } else if (puzzleType === 'perimeter') {
      const perimeter = calculatePerimeter();
      if (perimeter === targetArea) {
        handleSuccess();
      } else {
        setErrorMessage(`当前周长: ${perimeter}, 目标周长: ${targetArea}`);
        playUISound('error');
      }
    } else if (puzzleType === 'symmetry') {
      const isSymmetric = checkSymmetry();
      if (isSymmetric && currentArea === targetArea) {
        handleSuccess();
      } else if (currentArea !== targetArea) {
        setErrorMessage(`当前面积: ${currentArea}, 目标面积: ${targetArea}`);
        playUISound('error');
      } else if (!isSymmetric) {
        setErrorMessage('图形不对称！检查对称轴两边');
        playUISound('error');
      }
    }
  };

  const handleSuccess = () => {
    const points = targetArea * 20;
    setScore(score + points);
    setPuzzlesSolved(puzzlesSolved + 1);

    playPuzzleSound('complete');
    triggerParticles();

    setTimeout(() => {
      if (puzzlesSolved + 1 >= level.questions) {
        // 根据得分计算星级
        const totalPossiblePoints = (puzzlesSolved + 1) * (level.range.max || 20) * 20;
        const finalScore = score + points;
        const percentage = finalScore / totalPossiblePoints;
        const stars = percentage >= 0.9 ? 3 : percentage >= 0.7 ? 2 : 1;
        onComplete(stars);
      } else {
        generatePuzzle();
      }
    }, 2000);
  };

  const calculatePerimeter = (): number => {
    let perimeter = 0;
    placedBlocks.forEach(block => {
      const neighbors = [
        { x: block.x - 1, y: block.y },
        { x: block.x + 1, y: block.y },
        { x: block.x, y: block.y - 1 },
        { x: block.x, y: block.y + 1 },
      ];

      neighbors.forEach(neighbor => {
        const hasNeighbor = placedBlocks.some(b => b.x === neighbor.x && b.y === neighbor.y);
        if (!hasNeighbor) perimeter++;
      });
    });
    return perimeter;
  };

  const checkSymmetry = (): boolean => {
    // 检查左右对称
    const centerX = gridSize / 2;
    return placedBlocks.every(block => {
      const mirrorX = centerX * 2 - block.x - 1;
      return placedBlocks.some(b => b.x === mirrorX && b.y === block.y);
    });
  };

  const reset = () => {
    setPlacedBlocks([]);
    setCurrentArea(0);
    playUISound('click');
  };

  const triggerParticles = () => {
    // 使用简单的粒子效果
    placedBlocks.forEach((block, i) => {
      setTimeout(() => {
        playPuzzleSound('place');
      }, i * 50);
    });
  };

  const getPuzzleDescription = () => {
    switch (puzzleType) {
      case 'area':
        return `用方块拼出面积为 ${targetArea} 的图形`;
      case 'perimeter':
        return `拼出周长为 ${targetArea} 的图形`;
      case 'symmetry':
        return `拼出面积为 ${targetArea} 的左右对称图形`;
      default:
        return '';
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-teal-900 via-green-800 to-emerald-900 p-6 overflow-auto">
      {/* 退出按钮 */}
      <div className="mb-4">
        <PixelButton
          onClick={() => {
            if (window.confirm('确定要退出解谜吗？进度将不会保存。')) {
              onGameOver();
            }
          }}
          variant="secondary"
          size="sm"
        >
          ← 退出解谜
        </PixelButton>
      </div>

      {/* 顶部信息 */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <PixelPanel variant="primary">
          <div className="text-center px-4">
            <div className="text-xs text-teal-300" style={{ fontFamily: 'monospace' }}>得分</div>
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
              {score}
            </div>
          </div>
        </PixelPanel>

        <PixelPanel variant="dark">
          <div className="text-center px-4">
            <div className="text-xs text-yellow-300" style={{ fontFamily: 'monospace' }}>完成</div>
            <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>
              {puzzlesSolved}/{level.questions}
            </div>
          </div>
        </PixelPanel>

        <PixelButton
          onClick={reset}
          variant="warning"
          size="md"
        >
          <RotateCw className="inline mr-2" size={20} />
          重置
        </PixelButton>
      </div>

      {/* 题目描述 */}
      <div className="max-w-2xl mx-auto mb-6">
        <PixelPanel variant="primary">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'monospace' }}>
                {getPuzzleDescription()}
              </div>
              <div className="flex gap-2">
                <PixelBadge color="blue" size="md">
                  当前: {puzzleType === 'perimeter' ? calculatePerimeter() : currentArea}
                </PixelBadge>
                <PixelBadge color="yellow" size="md">
                  目标: {targetArea}
                </PixelBadge>
              </div>
            </div>
            <PixelButton
              onClick={() => setShowHint(!showHint)}
              variant="warning"
              size="sm"
            >
              <Lightbulb size={20} />
            </PixelButton>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <PixelPanel variant="dark">
                  <div className="text-yellow-200 text-sm" style={{ fontFamily: 'monospace' }}>
                    💡 提示：
                    {puzzleType === 'area' && ` 面积 = 方块的数量。你需要放置 ${targetArea} 个方块。`}
                    {puzzleType === 'perimeter' && ` 周长 = 图形边缘的总长度。试试不同的排列方式！`}
                    {puzzleType === 'symmetry' && ` 对称 = 左右两边完全一样。从中心线开始拼！`}
                  </div>
                </PixelPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </PixelPanel>
      </div>

      {/* 拼图网格 */}
      <div className="flex justify-center">
        <PixelPanel variant="success" className="inline-block">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              imageRendering: 'pixelated',
            }}
          >
            {[...Array(gridSize)].map((_, y) =>
              [...Array(gridSize)].map((_, x) => {
                const block = placedBlocks.find(b => b.x === x && b.y === y);
                const isSymmetryLine = puzzleType === 'symmetry' && x === gridSize / 2 - 0.5;

                return (
                  <motion.button
                    key={`${x}-${y}`}
                    onClick={() => placeBlock(x, y)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 border-2 ${
                      block
                        ? 'border-white shadow-lg'
                        : isSymmetryLine
                        ? 'border-yellow-400 bg-yellow-900/30'
                        : 'border-gray-600 bg-gray-800/50'
                    } rounded transition-all`}
                    style={{
                      backgroundColor: block ? block.color : undefined,
                      imageRendering: 'pixelated',
                    }}
                  >
                    {block && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <Square size={20} className="text-white/50" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>

          {/* 对称辅助线提示 */}
          {puzzleType === 'symmetry' && (
            <div className="text-center mt-4">
              <PixelBadge color="yellow" size="sm">
                黄色线为对称轴
              </PixelBadge>
            </div>
          )}
        </PixelPanel>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            <PixelPanel variant="warning">
              <div className="text-red-400 text-center font-bold" style={{ fontFamily: 'monospace' }}>
                ❌ {errorMessage}
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 确认按钮 */}
      <div className="mt-6 flex justify-center">
        <PixelButton
          onClick={() => checkSolution()}
          disabled={currentArea === 0}
          variant="success"
          size="xl"
        >
          <CheckCircle className="inline mr-2" size={32} />
          确认答案
        </PixelButton>
      </div>
    </div>
  );
}
