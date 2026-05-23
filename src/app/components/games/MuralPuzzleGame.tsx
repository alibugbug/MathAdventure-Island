import { useEffect, useState, useRef } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
}

interface MuralPuzzleGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
  progress: number;
}

const MURAL_TILES = 16;
const PIXEL_ART = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,2,2,2,0,0,0,0,0,0,0,0,3,3,3,0],
  [0,2,4,2,0,0,0,0,0,0,0,3,3,5,3,3],
  [0,2,2,2,0,0,0,0,0,0,3,3,3,3,5,3],
  [0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3],
  [0,0,0,0,6,6,6,0,0,0,0,3,3,3,0,0],
  [0,0,0,6,6,6,6,6,0,0,0,0,0,0,0,0],
  [0,0,6,6,6,6,6,6,6,0,0,0,7,7,0,0],
  [0,0,0,6,6,6,6,6,0,0,0,7,7,7,7,0],
  [0,0,0,0,6,6,6,0,0,0,7,7,7,7,7,7],
  [0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7],
  [0,0,0,8,8,0,0,0,7,7,7,7,7,7,7,7],
  [0,0,8,8,8,8,0,7,7,7,7,7,7,7,7,0],
  [0,8,8,8,8,8,8,7,7,7,7,7,7,7,0,0],
  [0,0,8,8,8,8,0,0,0,7,7,7,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const COLORS: Record<number, string> = {
  0: '#1a1625',
  2: '#f5d742',
  3: '#4a90d9',
  4: '#ffffff',
  5: '#ff6b6b',
  6: '#7cb342',
  7: '#8d6e63',
  8: '#5d4037',
};

export default function MuralPuzzleGame({ question, disabled, onChoose, streak, progress }: MuralPuzzleGameProps) {
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [showStory, setShowStory] = useState(true);
  const [justRevealed, setJustRevealed] = useState<number | null>(null);

  useEffect(() => {
    setRevealedTiles([]);
    setSelectedTile(null);
    setShowStory(true);
    setJustRevealed(null);
    const timer = setTimeout(() => setShowStory(false), 2000);
    return () => clearTimeout(timer);
  }, [question.prompt]);

  const handleChoose = (option: number | string) => {
    if (disabled || showStory) return;
    setSelectedTile(Number(option));

    if (option === question.answer) {
      playFeedbackSound('coin');
      // Reveal a random unrevealed tile
      const unrevealed: number[] = [];
      for (let i = 0; i < MURAL_TILES; i++) {
        if (!revealedTiles.includes(i)) unrevealed.push(i);
      }
      if (unrevealed.length > 0) {
        const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setJustRevealed(pick);
        setRevealedTiles(prev => [...prev, pick]);
        setTimeout(() => setJustRevealed(null), 600);
      }
      setTimeout(() => onChoose(question.answer), 500);
    } else {
      playUISound('error');
      setTimeout(() => setSelectedTile(null), 400);
    }
  };

  const renderMural = () => {
    const tileSize = 22;
    const cols = 16;
    const rows = 16;

    return (
      <div className="mural-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
        gap: '1px',
      }}>
        {PIXEL_ART.flat().map((colorCode, i) => {
          const colIndex = i % 16;
          const rowIndex = Math.floor(i / 16);
          const tileCol = Math.floor(colIndex / 4);
          const tileRow = Math.floor(rowIndex / 4);
          const tileIndex = tileRow * 4 + tileCol;
          const isRevealed = revealedTiles.includes(tileIndex);
          return (
            <div
              key={i}
              className="mural-pixel"
              style={{
                width: tileSize,
                height: tileSize,
                background: isRevealed ? COLORS[colorCode] || COLORS[0] : COLORS[0],
                transition: 'background 0.3s',
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="game-wrapper mural-puzzle-game">
      {showStory ? (
        <div className="story-card">
          <div className="story-scroll">📜</div>
          <h3>古代壁画记载...</h3>
          <p className="story-text">{question.prompt}</p>
          <div className="story-continue">✨ 点击任意处开始 ✨</div>
          <button className="story-skip" onClick={() => setShowStory(false)}>开始答题</button>
        </div>
      ) : (
        <div className="mural-challenge">
          <div className="mural-area">
            <h4>🏛️ 古代壁画</h4>
            <div className="mural-progress">
              {revealedTiles.length}/{MURAL_TILES} 块已复原
            </div>
            {renderMural()}
            <div className="mural-question">{question.prompt}</div>
          </div>
          <div className="mural-options">
            {question.options.map(option => (
              <button
                key={String(option)}
                className={`mural-answer-btn ${selectedTile === Number(option) ? (option === question.answer ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleChoose(option)}
                disabled={disabled}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="game-instruction">答对问题，逐步复原古代壁画！</div>
    </div>
  );
}
