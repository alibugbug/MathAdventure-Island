import { useEffect, useState, useRef } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
}

interface PotionLabGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

const BOTTLE_COLORS = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];

export default function PotionLabGame({ question, disabled, onChoose, streak }: PotionLabGameProps) {
  const [cauldronBubbles, setCauldronBubbles] = useState<{ id: number; size: number; left: number; delay: number }[]>([]);
  const [boiling, setBoiling] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const nextBubbleId = useRef(0);
  const answer = Number(question.answer);

  useEffect(() => {
    setResult(null);
    setBoiling(false);
    const bubbles = [];
    for (let i = 0; i < 8; i++) {
      bubbles.push({
        id: nextBubbleId.current++,
        size: 6 + Math.random() * 14,
        left: 20 + Math.random() * 60,
        delay: Math.random() * 2,
      });
    }
    setCauldronBubbles(bubbles);
  }, [question.prompt]);

  const handleBottleClick = (value: number) => {
    if (disabled || result) return;

    if (value === answer) {
      setResult('correct');
      setBoiling(true);
      playFeedbackSound('coin');
      setTimeout(() => {
        onChoose(question.answer);
      }, 1200);
    } else {
      setResult('wrong');
      playBattleSound('damage');
      setTimeout(() => {
        setResult(null);
      }, 600);
    }
  };

  const coloredLiquid = (value: number) => {
    const hue = (value * 37) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <div className="game-wrapper potion-lab-game">
      <div className="lab-scene">
        {/* Cauldron */}
        <div className={`cauldron ${boiling ? 'boiling' : ''}`}>
          <div className="cauldron-rim" />
          <div className={`cauldron-liquid ${result === 'correct' ? 'glow' : ''}`}
            style={{ background: coloredLiquid(answer) }}
          />
          <div className="cauldron-body" />
          <div className="cauldron-legs">
            <div className="leg" />
            <div className="leg" />
          </div>
          {cauldronBubbles.map(bubble => (
            <div
              key={bubble.id}
              className={`cauldron-bubble ${boiling ? 'pop' : ''}`}
              style={{
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.left}%`,
                animationDelay: `${bubble.delay}s`,
                background: coloredLiquid(answer),
              }}
            />
          ))}
          {boiling && (
            <div className="steam-clouds">
              {[0, 1, 2].map(i => (
                <div key={i} className="steam" style={{ left: `${30 + i * 20}%`, animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Potion bottles rack */}
        <div className="potion-rack">
          {question.options.map((option, i) => {
            const val = Number(option);
            return (
              <button
                key={i}
                className={`potion-bottle ${result === 'wrong' ? '' : ''}`}
                style={{
                  '--bottle-color': BOTTLE_COLORS[i % BOTTLE_COLORS.length],
                  animationDelay: `${i * 0.1}s`,
                } as React.CSSProperties}
                onClick={() => handleBottleClick(val)}
                disabled={disabled || result !== null}
              >
                <div className="bottle-neck" />
                <div className="bottle-body" style={{ background: coloredLiquid(val) }}>
                  <span className="bottle-value">{val}</span>
                </div>
                <div className="bottle-label">药剂 {i + 1}</div>
              </button>
            );
          })}
        </div>
      </div>

      {result === 'correct' && (
        <div className="result-flash success">✨ 药水调和成功！✨</div>
      )}
      {result === 'wrong' && (
        <div className="result-flash fail">💥 药剂不对！</div>
      )}

      <div className="game-instruction">点击正确剂量的药剂瓶，倒入大锅调和</div>
    </div>
  );
}
