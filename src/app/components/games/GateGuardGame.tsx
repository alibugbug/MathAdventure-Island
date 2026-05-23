import { useEffect, useState, useRef } from 'react';
import { playUISound, playFeedbackSound, playBattleSound } from '../../utils/audioManager';

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  hint: string;
}

interface GateGuardGameProps {
  question: Question;
  disabled: boolean;
  onChoose: (answer: number | string) => void;
  streak: number;
}

export default function GateGuardGame({ question, disabled, onChoose, streak }: GateGuardGameProps) {
  const [timeLeft, setTimeLeft] = useState(100);
  const [guardState, setGuardState] = useState<'idle' | 'speaking' | 'happy' | 'angry'>('idle');
  const [selected, setSelected] = useState<number | string | null>(null);
  const timerRef = useRef<number>(0);
  const startedRef = useRef(false);

  useEffect(() => {
    setTimeLeft(100);
    setGuardState('speaking');
    setSelected(null);
    startedRef.current = false;

    // Initial guard speech
    const speechTimer = setTimeout(() => {
      setGuardState('idle');
      startedRef.current = true;
    }, 1500);

    return () => {
      clearTimeout(speechTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.prompt]);

  useEffect(() => {
    if (!startedRef.current || disabled) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 2) {
          clearInterval(timerRef.current);
          // Time's up - auto fail
          setGuardState('angry');
          playBattleSound('damage');
          const wrong = question.options.find(o => o !== question.answer) ?? '__wrong__';
          setTimeout(() => onChoose(wrong), 400);
          return 0;
        }
        return prev - 1;
      });
    }, 45);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startedRef.current, disabled]);

  const handleChoose = (option: number | string) => {
    if (disabled || selected !== null) return;
    setSelected(option);
    if (timerRef.current) clearInterval(timerRef.current);

    if (option === question.answer) {
      setGuardState('happy');
      playFeedbackSound('coin');
      setTimeout(() => onChoose(question.answer), 600);
    } else {
      setGuardState('angry');
      playBattleSound('damage');
      setTimeout(() => {
        const wrong = question.options.find(o => o !== question.answer) ?? '__wrong__';
        onChoose(wrong);
      }, 600);
    }
  };

  const guardEmoji = guardState === 'happy' ? '😊' : guardState === 'angry' ? '😠' : guardState === 'speaking' ? '🗣️' : '🧌';
  const guardMessage = guardState === 'speaking'
    ? '回答我的问题，才能通过此门！'
    : guardState === 'happy'
    ? '正确！门开了...'
    : guardState === 'angry'
    ? '错误！力量反噬...'
    : '说出你的答案！';

  return (
    <div className="game-wrapper gate-guard-game">
      <div className="gate-scene">
        {/* Stone Gate */}
        <div className="stone-gate">
          <div className="gate-arch">
            <div className="gate-keystone" />
          </div>
        </div>

        {/* Guard character */}
        <div className={`gate-guard ${guardState}`}>
          <div className="guard-face">{guardEmoji}</div>
          <div className="guard-body" />
          <div className="guard-speech">{guardMessage}</div>
        </div>

        {/* Timer bar */}
        <div className="gate-timer-container">
          <div className="gate-timer-label">
            <span>⏱️</span>
            <span>{Math.ceil(timeLeft / 10)}s</span>
          </div>
          <div className="gate-timer-bar">
            <div
              className={`gate-timer-fill ${timeLeft < 30 ? 'danger' : timeLeft < 60 ? 'warning' : ''}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="gate-question-box">
          <p>{question.prompt}</p>
        </div>

        {/* Answer buttons in stone tablet style */}
        <div className="gate-answers">
          {question.options.map(option => {
            const isSelected = selected === option;
            const isCorrect = option === question.answer;
            return (
              <button
                key={String(option)}
                className={`gate-answer-btn ${isSelected ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleChoose(option)}
                disabled={disabled || selected !== null}
              >
                <span className="tablet-icon">📜</span>
                <span className="tablet-text">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-instruction">在时间耗尽前回答石门守卫的问题！</div>
    </div>
  );
}
