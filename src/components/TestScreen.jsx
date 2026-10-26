import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clock, 
  X, 
  ArrowRight, 
  Check, 
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Star
} from 'lucide-react';
import Keypad from './Keypad';
import { checkAnswer } from '../utils/mathGenerator';
import { soundManager } from '../utils/sound';

export default function TestScreen({
  questions,
  config,
  onCompleteTest,
  onCancelTest,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Per-question state
  const [attempts, setAttempts] = useState(0);
  const [feedbackState, setFeedbackState] = useState(null); // null | 'correct' | 'wrong' | 'revealed'
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [shake, setShake] = useState(false);

  // Cumulative results tracking
  const [recordedResults, setRecordedResults] = useState([]);
  const [score, setScore] = useState(0);

  // Quit confirmation modal
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Hidden/Native input reference for mobile numeric keyboard & desktop keyboard support
  const inputRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isImmediate = config.feedbackMode === 'immediate';

  // Stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard listener for desktop & tablet physical keyboards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showQuitModal) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === ',' || e.key === '.') {
        handleDigit(',');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, feedbackState, revealedAnswer, showQuitModal, currentIndex]);

  const handleDigit = (digit) => {
    if (feedbackState === 'correct' || revealedAnswer) return;
    // Limit length to 6 characters
    if (userInput.length >= 6) return;
    // Don't allow multiple commas
    if (digit === ',' && userInput.includes(',')) return;
    setUserInput((prev) => prev + digit);
  };

  const handleBackspace = () => {
    if (feedbackState === 'correct' || revealedAnswer) return;
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (feedbackState === 'correct' || revealedAnswer) return;
    setUserInput('');
  };

  const moveToNextQuestion = (updatedRecorded) => {
    if (isLastQuestion) {
      // Finished all questions!
      const totalScore = updatedRecorded.filter((item) => item.isCorrect).length;
      onCompleteTest({
        questions,
        recordedResults: updatedRecorded,
        score: totalScore,
        questionCount: questions.length,
        timeTakenSeconds: elapsedSeconds,
        feedbackMode: config.feedbackMode,
        config,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setFeedbackState(null);
      setRevealedAnswer(false);
      setAttempts(0);
    }
  };

  const handleSubmitAnswer = () => {
    // If answer already revealed or correct, button acts as "Next"
    if (revealedAnswer || feedbackState === 'correct') {
      moveToNextQuestion(recordedResults);
      return;
    }

    if (!userInput.trim()) return;

    const isCorrect = checkAnswer(userInput, currentQuestion.correctAnswer);
    const newAttemptCount = attempts + 1;
    setAttempts(newAttemptCount);

    if (isImmediate) {
      if (isCorrect) {
        soundManager.playCorrect();
        setFeedbackState('correct');
        const newScore = score + 1;
        setScore(newScore);

        const updatedHistory = [
          ...recordedResults,
          {
            problem: currentQuestion.displayString,
            userAnswer: userInput,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: true,
            attempts: newAttemptCount,
            revealed: false,
          },
        ];
        setRecordedResults(updatedHistory);

        // Auto advance after 1.1s or student can click "Seuraava"
        setTimeout(() => {
          moveToNextQuestion(updatedHistory);
        }, 1100);
      } else {
        // Wrong answer in Immediate mode
        soundManager.playWrong();
        setShake(true);
        setTimeout(() => setShake(false), 500);

        if (config.enableAssistance && newAttemptCount >= config.maxFailedAttempts) {
          // Reveal assistance!
          setRevealedAnswer(true);
          setFeedbackState('revealed');
          const updatedHistory = [
            ...recordedResults,
            {
              problem: currentQuestion.displayString,
              userAnswer: userInput,
              correctAnswer: currentQuestion.correctAnswer,
              isCorrect: false,
              attempts: newAttemptCount,
              revealed: true,
            },
          ];
          setRecordedResults(updatedHistory);
        } else {
          setFeedbackState('wrong');
        }
      }
    } else {
      // "End of test" mode: do not reveal right/wrong immediately.
      // Save result and proceed to next question right away!
      const updatedHistory = [
        ...recordedResults,
        {
          problem: currentQuestion.displayString,
          userAnswer: userInput,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect,
          attempts: 1,
          revealed: false,
        },
      ];
      setRecordedResults(updatedHistory);
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }
      moveToNextQuestion(updatedHistory);
    }
  };

  const progressPercent = Math.round(((currentIndex + (feedbackState === 'correct' || revealedAnswer ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-4 flex flex-col justify-between min-h-[calc(100vh-80px)]">
      {/* Top Header Bar: Progress, Question number, Timer, Quit */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Question counter pill */}
          <div className="px-3 py-1 bg-white border-2 border-slate-200 rounded-full font-black text-slate-700 text-sm sm:text-base shadow-sm">
            Lasku {currentIndex + 1} / {questions.length}
          </div>

          {/* Score tracker (Immediate mode only) */}
          {isImmediate && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border-2 border-amber-300 rounded-full font-black text-amber-800 text-sm sm:text-base shadow-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{score}</span>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-slate-200 rounded-full font-bold text-slate-600 text-sm sm:text-base shadow-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Cancel/Exit button */}
          <button
            type="button"
            onClick={() => setShowQuitModal(true)}
            aria-label="Keskeytä harjoitus"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4 sm:mb-6 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Center Math Problem Display */}
      <div className="my-auto py-2 sm:py-4 text-center">
        {/* Math Question Card */}
        <div
          className={`bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-4 transition-all duration-200 relative overflow-hidden ${
            feedbackState === 'correct'
              ? 'border-emerald-400 bg-emerald-50/50 glow-success scale-105'
              : feedbackState === 'wrong'
              ? 'border-rose-400 bg-rose-50/40 glow-error animate-wiggle'
              : revealedAnswer
              ? 'border-amber-400 bg-amber-50/40'
              : 'border-white'
          }`}
        >
          {/* Question Equation */}
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 font-black text-slate-800 tracking-wide select-none ${
              currentQuestion.num3 !== null && currentQuestion.num3 !== undefined
                ? 'text-3xl sm:text-5xl'
                : 'text-4xl sm:text-6xl'
            }`}
          >
            <span className="font-mono">{currentQuestion.num1}</span>
            <span className="text-blue-500">{currentQuestion.symbol}</span>
            <span className="font-mono">{currentQuestion.num2}</span>
            {currentQuestion.symbol2 && currentQuestion.num3 !== null && currentQuestion.num3 !== undefined && (
              <>
                <span className="text-pink-500">{currentQuestion.symbol2}</span>
                <span className="font-mono">{currentQuestion.num3}</span>
              </>
            )}
            <span className="text-slate-400">=</span>
            
            {/* Answer Display Box */}
            <div
              className={`min-w-[90px] sm:min-w-[120px] h-14 sm:h-20 px-3 flex items-center justify-center rounded-2xl border-4 font-mono text-4xl sm:text-6xl font-black transition-all ${
                shake ? 'animate-wiggle border-rose-500 bg-rose-100 text-rose-700' : ''
              } ${
                feedbackState === 'correct'
                  ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                  : revealedAnswer
                  ? 'border-amber-500 bg-amber-100 text-amber-800'
                  : userInput
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                  : 'border-slate-300 bg-slate-50 text-slate-400 border-dashed'
              }`}
            >
              {revealedAnswer ? (
                currentQuestion.correctAnswer
              ) : userInput ? (
                userInput
              ) : (
                <span className="text-2xl sm:text-4xl text-slate-400 animate-pulse">?</span>
              )}
            </div>
          </div>

          {/* Hidden input for native mobile keypad / accessibility */}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            pattern="[0-9,]*"
            value={userInput}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9,]*$/.test(val)) {
                setUserInput(val);
              }
            }}
            className="opacity-0 absolute pointer-events-none w-1 h-1"
            aria-label="Kirjoita vastauksesi"
          />

          {/* Feedback & Encouragement Banner */}
          <div className="mt-4 min-h-[36px] flex items-center justify-center">
            {feedbackState === 'correct' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-lg animate-pop">
                <span>🌟</span>
                <span>Hienoa! Oikein meni!</span>
              </div>
            )}

            {feedbackState === 'wrong' && !revealedAnswer && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full font-bold text-base animate-pop">
                <span>🤔</span>
                <span>Ei aivan vielä. Yritä uudelleen!</span>
              </div>
            )}

            {revealedAnswer && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-900 rounded-2xl font-bold text-sm sm:text-base border border-amber-300">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Oikea vastaus on <strong>{currentQuestion.correctAnswer}</strong>. Paina "Seuraava" jatkaaksesi!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* On-Screen Keypad */}
      <div className="mt-auto pb-1">
        <Keypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={handleSubmitAnswer}
          isSubmitDisabled={!userInput && !revealedAnswer && feedbackState !== 'correct'}
          isAnswerSubmitted={feedbackState === 'correct'}
          submitLabel={
            revealedAnswer || feedbackState === 'correct'
              ? isLastQuestion
                ? 'Katso tulokset 🎉'
                : 'Seuraava ➔'
              : 'Tarkista'
          }
          submitColor={
            revealedAnswer || feedbackState === 'correct'
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
          }
        />
      </div>

      {/* Quit Confirmation Dialog */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-pop border-4 border-slate-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🛑
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Lopetetaanko harjoitus?
            </h3>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Jos lopetat nyt, tämän kerran tuloksia ei tallenneta.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
              >
                Jatka harjoitusta
              </button>
              <button
                type="button"
                onClick={onCancelTest}
                className="py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base transition-colors shadow-md"
              >
                Kyllä, lopeta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

