import { useEffect, useRef, useState } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
  visual?: { a?: number; b?: number; total?: number; label?: string };
}

interface BookshelfSortGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

export default function BookshelfSortGame({ question, disabled, onChoose, streak }: BookshelfSortGameProps) {
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [showExpression, setShowExpression] = useState(true);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; id: number }[]>([]);
  const nextParticleId = useRef(0);

  const answer = Number(question.answer);
  const visualA = question.visual?.a || 2;
  const visualB = question.visual?.b || 2;
  const targetTotal = question.visual?.total || answer;

  // Generate book expression based on the multiplication question
  const bookExpression = Array(visualB).fill(`${visualA}`).join(' + ');
  const shelfOptions = question.options.map(Number).filter(n => n > 0);

  const handleShelfClick = (shelfValue: number) => {
    if (disabled) return;
    setSelectedShelf(shelfValue);

    if (shelfValue === answer) {
      playFeedbackSound('coin');
      // spawn particles
      const newParticles = [];
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          x: 200 + Math.random() * 200,
          y: 300 + Math.random() * 100,
          color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][i % 4],
          id: nextParticleId.current++,
        });
      }
      setParticles(newParticles);
      setTimeout(() => {
        setParticles([]);
        onChoose(question.answer);
      }, 600);
    } else {
      playUISound('error');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelectedShelf(null);
      }, 500);
    }
  };

  const getShelfLabel = (value: number) => {
    if (targetTotal === value) return `${visualB} × ${visualA}`;
    // Generate alternative shelf labels
    for (let i = 2; i <= 6; i++) {
      for (let j = 2; j <= 6; j++) {
        if (i * j === value) return `${i} × ${j}`;
      }
    }
    return `${value}`;
  };

  return (
    <div className="game-wrapper bookshelf-game">
      <div className="bookshelf-scene">
        {/* Book display */}
        <div className={`book-display ${shake ? 'shake' : ''}`}>
          <div className="book-icon">📚</div>
          <div className="book-expression">{bookExpression}</div>
          <div className="book-hint">= ? (几个几?)</div>
        </div>

        {/* Arrow */}
        <div className="bookshelf-arrow">⬇ 放到正确的书架上 ⬇</div>

        {/* Shelves */}
        <div className="shelf-container">
          {shelfOptions.slice(0, 4).map((value, i) => (
            <button
              key={value}
              className={`shelf-btn ${selectedShelf === value ? (value === answer ? 'correct' : 'wrong') : ''} shelf-color-${i}`}
              onClick={() => handleShelfClick(value)}
              disabled={disabled}
            >
              <span className="shelf-label">{getShelfLabel(value)}</span>
              <span className="shelf-value">{value}</span>
              <div className="shelf-rack" />
            </button>
          ))}
        </div>
      </div>

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle-fly"
          style={{
            left: p.x,
            top: p.y,
            background: p.color,
          }}
        />
      ))}

      <div className="game-instruction">把算式书放到正确乘法书架里</div>
    </div>
  );
}
