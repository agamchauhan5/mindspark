'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface ReactionTime {
  time: number;
  timestamp: Date;
}

export default function ClickReflex() {
  const router = useRouter();
  const [gameActive, setGameActive] = useState(true);
  const [circleVisible, setCircleVisible] = useState(false);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 });
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<ReactionTime[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [personalBestAvg, setPersonalBestAvg] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [difficultySelected, setDifficultySelected] = useState(false);

  const spawnTimeRef = useRef<number>(0);
  const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextCircleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Audio context not available');
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (nextCircleTimeoutRef.current) clearTimeout(nextCircleTimeoutRef.current);
    };
  }, []);

  const playClickSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const getRandomPos = () => {
    // Ensure circle spawns in center area, far from edges - 30% margins
    const minX = window.innerWidth * 0.30;
    const maxX = window.innerWidth * 0.70;
    const minY = window.innerHeight * 0.25;
    const maxY = window.innerHeight * 0.75;

    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    return { x, y };
  };

  const spawnCircle = () => {
    if (!gameActive || clickCount >= 10 || gamePaused) {
      if (clickCount >= 10) {
        endGame();
      }
      return;
    }

    let delay: number;
    if (difficulty === 'easy') {
      delay = Math.random() * 1000 + 400; // 0.4 to 1.4 seconds
    } else if (difficulty === 'medium') {
      delay = Math.random() * 1200 + 300; // 0.3 to 1.5 seconds
    } else {
      delay = Math.random() * 800 + 200; // 0.2 to 1 second
    }

    spawnTimeoutRef.current = setTimeout(() => {
      const pos = getRandomPos();
      setCirclePos(pos);
      setCircleVisible(true);
      setReactionTime(null);
      spawnTimeRef.current = Date.now();
    }, delay);
  };

  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!circleVisible || gamePaused) return;

    const clickTime = Date.now() - spawnTimeRef.current;
    setReactionTime(clickTime);
    setLastReactionTime(clickTime);
    setCircleVisible(false);
    playClickSound();

    // Add to reaction times
    const newTime: ReactionTime = {
      time: clickTime,
      timestamp: new Date(),
    };
    setReactionTimes((prev) => [...prev, newTime]);
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 10) {
        // Trigger end game after final click
        setTimeout(() => endGame(), 300);
        return newCount;
      }
      return newCount;
    });

    // Spawn next circle immediately after click
    const delay = Math.random() * 1500 + 300; // Shorter delay for continuous flow
    nextCircleTimeoutRef.current = setTimeout(() => {
      spawnCircle();
    }, delay);
  };

  const getCircleSize = () => {
    if (difficulty === 'easy') return 'w-32 h-32'; // 128px
    if (difficulty === 'medium') return 'w-24 h-24'; // 96px
    return 'w-16 h-16'; // 64px - hard
  };

  const startGame = () => {
    // Load personal best average from localStorage
    const stored = localStorage.getItem('clickReflex_personalBestAvg');
    if (stored) setPersonalBestAvg(parseInt(stored));
    
    setGameStarted(true);
    setGameActive(true);
    setGamePaused(false);
    setReactionTimes([]);
    setReactionTime(null);
    setLastReactionTime(null);
    setClickCount(0);
    setGameEnded(false);
    setCircleVisible(false);
    spawnCircle();
  };

  const endGame = () => {
    setGameActive(false);
    setCircleVisible(false);
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (nextCircleTimeoutRef.current) clearTimeout(nextCircleTimeoutRef.current);
    setGameEnded(true);
    
    // Save personal best average if this is better
    if (reactionTimes.length > 0) {
      const currentAvg = Math.round(reactionTimes.reduce((a, rt) => a + rt.time, 0) / reactionTimes.length);
      if (!personalBestAvg || currentAvg < personalBestAvg) {
        setPersonalBestAvg(currentAvg);
        localStorage.setItem('clickReflex_personalBestAvg', currentAvg.toString());
      }
    }
  };

  const togglePause = () => {
    setGamePaused(!gamePaused);
    if (!gamePaused) {
      // Pausing
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (nextCircleTimeoutRef.current) clearTimeout(nextCircleTimeoutRef.current);
    } else {
      // Resuming
      if (circleVisible) {
        setCircleVisible(false);
        spawnCircle();
      }
    }
  };

  const resetToStart = () => {
    setGameStarted(false);
    setDifficultySelected(false);
    setGameEnded(false);
    setGameActive(true);
    setCircleVisible(false);
    setReactionTimes([]);
    setReactionTime(null);
    setLastReactionTime(null);
    setClickCount(0);
    setGamePaused(false);
  };

  const exitGame = () => {
    resetToStart();
    router.push('/clickreflex');
  };

  const bestTime = reactionTimes.length > 0 ? Math.min(...reactionTimes.map((rt) => rt.time)) : null;
  const avgTime =
    reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, rt) => a + rt.time, 0) / reactionTimes.length) : 0;

  if (!gameStarted && !difficultySelected) {
    return (
      <>
        <Head>
          <title>Click Reflex - MindSpark</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <Header showHowToPlay={true} onHowToPlayClick={() => setHowToPlayOpen(true)} />
        <main className="flex-grow pt-20 px-4 sm:px-6 flex items-center justify-center animate-fadeInUp">
          <div className="text-center max-w-2xl w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              className="w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 text-cyan-400"
            >
              <defs>
                <radialGradient id="circleGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </radialGradient>
              </defs>
              <circle cx="64" cy="64" r="50" fill="url(#circleGrad)" />
              <circle cx="64" cy="64" r="45" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
            </svg>

            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-green-400 text-transparent bg-clip-text">
              Click Reflex
            </h1>
            <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8">
              Click the circle as fast as you can — test your speed and focus!
            </p>
            
            {personalBestAvg && (
              <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30 mb-8">
                <p className="text-cyan-400 text-sm font-semibold mb-1">PERSONAL BEST AVERAGE</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{personalBestAvg}ms</p>
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-4 mb-10 sm:mb-12">
              <p className="text-sm sm:text-base text-gray-400">
                You will have 10 circles to click. Each circle spawns at a random position after a random delay.
              </p>
              <p className="text-sm sm:text-base text-gray-400">
                Your reaction time will be displayed on the side, and your stats will be shown at the end of the round.
              </p>
            </div>

            <div className="mb-10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Select Difficulty</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setDifficulty('easy');
                    setDifficultySelected(true);
                  }}
                  className="px-4 py-3 sm:py-4 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold rounded-lg hover:bg-green-500/30 transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  🟢 Easy
                </button>
                <button
                  onClick={() => {
                    setDifficulty('medium');
                    setDifficultySelected(true);
                  }}
                  className="px-4 py-3 sm:py-4 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold rounded-lg hover:bg-yellow-500/30 transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  🟡 Medium
                </button>
                <button
                  onClick={() => {
                    setDifficulty('hard');
                    setDifficultySelected(true);
                  }}
                  className="px-4 py-3 sm:py-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  🔴 Hard
                </button>
              </div>
            </div>
          </div>

        {/* How to Play Modal */}
        {howToPlayOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-md text-center shadow-lg relative">
              <button
                onClick={() => setHowToPlayOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl sm:text-3xl"
              >
                ×
              </button>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">How to Play</h2>
              <p className="text-gray-300 text-xs sm:text-sm space-y-2 sm:space-y-3">
                <div>1. Choose your difficulty level</div>
                <div>2. A cyan circle will appear at a random location</div>
                <div>3. Click the circle as fast as possible</div>
                <div>4. Your reaction time appears on the left</div>
                <div>5. Complete 10 circles to see your stats</div>
                <div className="text-xs text-gray-500 pt-2"><strong>Difficulty:</strong> Harder = faster & smaller circles</div>
                <div className="text-xs text-gray-500">Your best average score is saved automatically!</div>
              </p>
            </div>
          </div>
        )}
        </main>
      </>
    );
  }

  if (!gameStarted && difficultySelected) {
    return (
      <>
        <Head>
          <title>Click Reflex - MindSpark</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <Header showHowToPlay={true} onHowToPlayClick={() => setHowToPlayOpen(true)} />
        <main className="flex-grow pt-20 px-4 sm:px-6 flex items-center justify-center animate-fadeInUp">
          <div className="text-center max-w-2xl w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              className="w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 text-cyan-400"
            >
              <defs>
                <radialGradient id="circleGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </radialGradient>
              </defs>
              <circle cx="64" cy="64" r="50" fill="url(#circleGrad)" />
              <circle cx="64" cy="64" r="45" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
            </svg>

            <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 to-green-400 text-transparent bg-clip-text">
              Ready to Play?
            </h1>
            <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-cyan-500/30 mb-6 sm:mb-8">
              <p className="text-base sm:text-lg font-semibold text-cyan-400 mb-2">Difficulty: <span className={
                difficulty === 'easy' ? 'text-green-400' : difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }>{difficulty.toUpperCase()}</span></p>
              <p className="text-xs sm:text-sm text-gray-400">
                {difficulty === 'easy' ? 'Slower & larger circles - great for practice!' : 
                 difficulty === 'medium' ? 'Balanced speed & size - standard challenge' : 
                 'Fast & small circles - extreme difficulty!'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  setGameStarted(true);
                  startGame();
                }}
                className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold rounded-lg text-sm sm:text-lg hover:from-cyan-400 hover:to-green-400 transition-all transform hover:scale-105"
              >
                Start Game
              </button>
              <button
                onClick={() => setDifficultySelected(false)}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-700 text-white font-bold rounded-lg text-sm sm:text-base hover:bg-slate-600 transition"
              >
                Change Difficulty
              </button>
            </div>

            {/* How to Play Modal */}
            {howToPlayOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
                <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-md text-center shadow-lg relative">
                  <button
                    onClick={() => setHowToPlayOpen(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl sm:text-3xl"
                  >
                    ×
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">How to Play</h2>
                  <p className="text-gray-300 text-xs sm:text-sm space-y-2 sm:space-y-3">
                    <div>1. Choose your difficulty level</div>
                    <div>2. A cyan circle will appear at a random location</div>
                    <div>3. Click the circle as fast as possible</div>
                    <div>4. Your reaction time appears on the left</div>
                    <div>5. Complete 10 circles to see your stats</div>
                    <div className="text-xs text-gray-500 pt-2"><strong>Difficulty:</strong> Harder = faster & smaller circles</div>
                    <div className="text-xs text-gray-500">Your best average score is saved automatically!</div>
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  if (gameEnded) {
    const maxTime = reactionTimes.length > 0 ? Math.max(...reactionTimes.map((rt) => rt.time)) : 0;

    return (
      <>
        <Head>
          <title>Click Reflex - Results</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <Header showHowToPlay={true} onHowToPlayClick={() => setHowToPlayOpen(true)} />
        <main className="flex-grow pt-20 px-4 sm:px-6 pb-6 flex items-center justify-center animate-fadeInUp">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-cyan-400 to-green-400 text-transparent bg-clip-text">
              Round Complete! 🎉
            </h1>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-slate-800 rounded-lg p-3 sm:p-6 border border-cyan-500/30">
                <p className="text-cyan-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">BEST TIME</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{bestTime}ms</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 sm:p-6 border border-green-500/30">
                <p className="text-green-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">AVERAGE TIME</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{avgTime}ms</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 sm:p-6 border border-purple-500/30">
                <p className="text-purple-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">WORST TIME</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{maxTime}ms</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 sm:p-6 border border-orange-500/30">
                <p className="text-orange-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">PERSONAL BEST AVG</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{personalBestAvg || '—'}ms</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-cyan-500/30 mb-6 sm:mb-8">
              <h3 className="text-cyan-400 font-semibold mb-4 text-base sm:text-lg">All Reaction Times</h3>
              <div className="grid grid-cols-5 gap-2">
                {reactionTimes.map((rt, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-3 text-center">
                    <p className="text-green-400 font-bold">{rt.time}ms</p>
                    <p className="text-gray-500 text-xs"># {idx + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={resetToStart}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold rounded-lg text-sm sm:text-base hover:from-cyan-400 hover:to-green-400 transition-all transform hover:scale-105"
              >
                Play Again
              </button>
              <button
                onClick={exitGame}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-slate-700 text-gray-300 font-bold rounded-lg text-sm sm:text-base hover:bg-slate-600 transition"
              >
                Exit
              </button>
            </div>

          {/* How to Play Modal */}
          {howToPlayOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 px-4">
              <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-md text-center shadow-lg relative">
                <button
                  onClick={() => setHowToPlayOpen(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl sm:text-3xl"
                >
                  ×
                </button>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">How to Play</h2>
                <p className="text-gray-300 text-xs sm:text-sm space-y-2 sm:space-y-3">
                  <div>1. Choose your difficulty level</div>
                  <div>2. A cyan circle will appear at a random location</div>
                  <div>3. Click the circle as fast as possible</div>
                  <div>4. Your reaction time appears on the left</div>
                  <div>5. Complete 10 circles to see your stats</div>
                  <div className="text-xs text-gray-500 pt-2"><strong>Difficulty:</strong> Harder = faster & smaller circles</div>
                  <div className="text-xs text-gray-500">Your best average score is saved automatically!</div>
                </p>
              </div>
            </div>
          )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Click Reflex - MindSpark</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <Header showHowToPlay={false} onHowToPlayClick={() => setHowToPlayOpen(true)} />

      <main className="flex-grow pt-20 px-3 sm:px-6 pb-6 flex flex-col items-center justify-between min-h-screen relative bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Top Progress and Controls - Responsive Layout */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
          {/* Left Side - Last Click Speed (Hidden on mobile, shown on sm+) */}
          <div className="hidden sm:block flex-1 min-w-0">
            {lastReactionTime && (
              <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-green-500/30">
                <p className="text-green-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">LAST CLICK</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{lastReactionTime}ms</p>
              </div>
            )}
          </div>

          {/* Center - Progress (Main on mobile) */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
              <p className="text-cyan-400 text-xs sm:text-sm font-semibold mb-2">PROGRESS</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-1 bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(clickCount / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">{clickCount}/10</p>
              </div>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={togglePause}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition font-semibold text-xs sm:text-sm ${
                gamePaused
                  ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                  : 'bg-blue-500/20 border border-blue-500 text-blue-400'
              }`}
              title={gamePaused ? 'Resume Game' : 'Pause Game'}
            >
              {gamePaused ? '▶️' : '⏸️'}
            </button>
            <button
              onClick={exitGame}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold text-xs sm:text-sm"
              title="Exit Game"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Mobile Last Click Display */}
        {lastReactionTime && (
          <div className="sm:hidden w-full bg-slate-800 rounded-lg p-3 border border-green-500/30 mb-4">
            <p className="text-green-400 text-xs font-semibold mb-1">LAST CLICK</p>
            <p className="text-2xl font-bold text-white">{lastReactionTime}ms</p>
          </div>
        )}

        {/* Game Area */}
        <div className="flex-grow w-full flex items-center justify-center relative">
          {circleVisible && !gamePaused && (
            <div
              className={`absolute rounded-full cursor-pointer transition-all duration-100 hover:scale-110 ${getCircleSize()}`}
              style={{
                left: `${circlePos.x}px`,
                top: `${circlePos.y}px`,
                background: 'radial-gradient(circle, #06b6d4, #10b981)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.9), 0 0 80px rgba(16, 185, 129, 0.6)',
                transform: 'translate(-50%, -50%) scale(1)',
                animation: 'pulse 0.6s ease-out',
              }}
              onClick={handleCircleClick}
            />
          )}

          {gamePaused && (
            <div className="text-center px-4">
              <p className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-3 sm:mb-4">PAUSED</p>
              <p className="text-sm sm:text-base text-gray-400">Click the resume button to continue</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
