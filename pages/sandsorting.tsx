'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Bottle {
  id: number;
  layers: string[]; // Array of colors from bottom to top
  capacity: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#ec4899', '#8b5cf6'];
const CAPACITY = 4;
const INITIAL_BOTTLES = 4;

export default function SandSorting() {
  const router = useRouter();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [pourAnimation, setPourAnimation] = useState<{
    from: number;
    to: number;
    amount: number;
  } | null>(null);
  const [shakeBottle, setShakeBottle] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<{ from: number; to: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Check win condition
  useEffect(() => {
    if (bottles.length > 0 && checkWin(bottles)) {
      setGameWon(true);
    }
  }, [bottles]);

  const generateRandomBottles = (): Bottle[] => {
    const newBottles: Bottle[] = [];
    const usedColors = COLORS.slice(0, INITIAL_BOTTLES);

    for (let i = 0; i < INITIAL_BOTTLES; i++) {
      const layers = new Array(CAPACITY).fill(usedColors[i]);
      newBottles.push({ id: i, layers, capacity: CAPACITY });
    }

    // Add one empty bottle for working space
    newBottles.push({ id: INITIAL_BOTTLES, layers: [], capacity: CAPACITY });

    // Shuffle bottles using Fisher-Yates
    for (let i = newBottles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBottles[i], newBottles[j]] = [newBottles[j], newBottles[i]];
    }

    // Scramble by doing random valid moves (more moves = harder puzzle)
    let tempBottles = newBottles.map(b => ({ ...b, layers: [...b.layers] }));
    let scrambleAttempts = 0;
    
    while (scrambleAttempts < 60) {
      const validMoves = [];
      for (let from = 0; from < tempBottles.length; from++) {
        if (tempBottles[from].layers.length === 0) continue;
        for (let to = 0; to < tempBottles.length; to++) {
          if (from === to) continue;
          if (canPour(tempBottles, from, to)) {
            validMoves.push({ from, to });
          }
        }
      }
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        tempBottles = doMoveInternal(tempBottles, randomMove.from, randomMove.to);
        scrambleAttempts++;
      } else {
        break;
      }
    }

    // Ensure puzzle is not solved - if it is, move pieces until it's not
    let safetyCount = 0;
    while (checkWin(tempBottles) && safetyCount < 10) {
      const nonEmptyBottles = [];
      for (let i = 0; i < tempBottles.length; i++) {
        if (tempBottles[i].layers.length > 0) {
          nonEmptyBottles.push(i);
        }
      }
      
      if (nonEmptyBottles.length > 0) {
        // Move from first non-empty to another bottle (or empty)
        const fromIdx = nonEmptyBottles[0];
        let moved = false;
        
        for (let toIdx = 0; toIdx < tempBottles.length; toIdx++) {
          if (fromIdx !== toIdx && canPour(tempBottles, fromIdx, toIdx)) {
            tempBottles = doMoveInternal(tempBottles, fromIdx, toIdx);
            moved = true;
            break;
          }
        }
        
        if (!moved) break;
      }
      safetyCount++;
    }

    return tempBottles;
  };

  const initializeGame = () => {
    const newBottles = generateRandomBottles();
    setBottles(newBottles);
    setSelectedBottle(null);
    setMoves(0);
    setGameWon(false);
    setMoveHistory([]);
  };

  const canPour = (bottleState: Bottle[], from: number, to: number): boolean => {
    if (from === to) return false;
    if (bottleState[from].layers.length === 0) return false;
    if (bottleState[to].layers.length >= bottleState[to].capacity) return false;

    const fromTopColor = bottleState[from].layers[bottleState[from].layers.length - 1];
    if (bottleState[to].layers.length === 0) return true;

    const toTopColor = bottleState[to].layers[bottleState[to].layers.length - 1];
    return fromTopColor === toTopColor;
  };

  const getTopColorStack = (bottle: Bottle): { color: string; count: number } | null => {
    if (bottle.layers.length === 0) return null;
    const topColor = bottle.layers[bottle.layers.length - 1];
    let count = 1;
    for (let i = bottle.layers.length - 2; i >= 0; i--) {
      if (bottle.layers[i] === topColor) count++;
      else break;
    }
    return { color: topColor, count };
  };

  const doMoveInternal = (bottleState: Bottle[], from: number, to: number): Bottle[] => {
    const newState = bottleState.map(b => ({ ...b, layers: [...b.layers] }));
    const stack = getTopColorStack(newState[from]);
    if (!stack) return newState;

    const amountToPour = Math.min(
      stack.count,
      newState[to].capacity - newState[to].layers.length
    );

    for (let i = 0; i < amountToPour; i++) {
      newState[to].layers.push(newState[from].layers.pop()!);
    }

    return newState;
  };

  const handleBottleClick = (bottleId: number) => {
    if (gameWon) return;

    if (selectedBottle === null) {
      // Select first bottle
      if (bottles[bottleId].layers.length > 0) {
        setSelectedBottle(bottleId);
      }
    } else if (selectedBottle === bottleId) {
      // Deselect
      setSelectedBottle(null);
    } else {
      // Try to pour
      if (canPour(bottles, selectedBottle, bottleId)) {
        // Valid move
        setPourAnimation({
          from: selectedBottle,
          to: bottleId,
          amount: getTopColorStack(bottles[selectedBottle])?.count || 1,
        });

        // Animate the pour
        setTimeout(() => {
          const newBottles = doMoveInternal(bottles, selectedBottle, bottleId);
          setBottles(newBottles);
          setMoveHistory([...moveHistory, { from: selectedBottle, to: bottleId }]);
          setMoves(moves + 1);
          setSelectedBottle(null);
          setPourAnimation(null);
        }, 600);
      } else {
        // Invalid move - shake the target bottle
        setShakeBottle(bottleId);
        setTimeout(() => setShakeBottle(null), 300);
        setSelectedBottle(null);
      }
    }
  };

  const checkWin = (bottleState: Bottle[]): boolean => {
    return bottleState.every(
      (bottle) =>
        bottle.layers.length === 0 ||
        (bottle.layers.length === bottle.capacity &&
          bottle.layers.every((color) => color === bottle.layers[0]))
    );
  };

  const resetGame = () => {
    initializeGame();
  };

  const undo = () => {
    if (moveHistory.length === 0) return;
    const newHistory = moveHistory.slice(0, -1);
    setMoveHistory(newHistory);
    setMoves(Math.max(0, moves - 1));

    // Regenerate game state by replaying moves
    const baseBottles = generateRandomBottles();
    let currentState = baseBottles;
    for (const move of newHistory) {
      currentState = doMoveInternal(currentState, move.from, move.to);
    }
    setBottles(currentState);
  };

  return (
    <>
      <Head>
        <title>Sand Sorting - MindSpark</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <Header />

      <main className="flex-grow pt-20 px-3 sm:px-6 pb-6 flex flex-col items-center justify-between min-h-screen relative bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-blue-500/30">
              <p className="text-blue-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">MOVES</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{moves}</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={undo}
              disabled={moveHistory.length === 0}
              className="px-4 py-2 sm:py-3 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-xs sm:text-sm"
              title="Undo last move"
            >
              ↶ Undo
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 sm:py-3 bg-blue-500/20 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/30 transition font-semibold text-xs sm:text-sm"
              title="Start new game"
            >
              🔄 Reset
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 sm:py-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold text-xs sm:text-sm"
              title="Exit game"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-grow w-full flex items-center justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {bottles.map((bottle) => (
              <div
                key={bottle.id}
                className={`relative transition-all ${
                  selectedBottle === bottle.id ? 'scale-110' : ''
                } ${shakeBottle === bottle.id ? 'animate-shake' : ''}`}
                onClick={() => handleBottleClick(bottle.id)}
              >
                {/* Bottle container */}
                <div
                  className={`w-20 sm:w-24 h-32 sm:h-40 rounded-b-3xl rounded-t-2xl border-2 relative cursor-pointer transition-all ${
                    selectedBottle === bottle.id
                      ? 'border-yellow-400 bg-slate-800/60'
                      : 'border-slate-600 bg-slate-800/40'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.6))`,
                    boxShadow:
                      selectedBottle === bottle.id
                        ? '0 0 20px rgba(250, 204, 21, 0.3), inset 0 1px 3px rgba(255,255,255,0.1)'
                        : 'inset 0 1px 3px rgba(255,255,255,0.05)',
                    transform:
                      pourAnimation?.from === bottle.id ? 'rotateZ(-15deg)' : 'rotateZ(0deg)',
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  {/* Sand layers */}
                  <div className="absolute bottom-0 w-full h-full rounded-b-3xl rounded-t-2xl overflow-hidden flex flex-col-reverse">
                    {bottle.layers.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 transition-all duration-500"
                        style={{
                          background: color,
                          boxShadow: `inset -1px 0px 2px rgba(0,0,0,0.3), inset 1px 0px 2px rgba(255,255,255,0.1)`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Bottle highlight/glass effect */}
                  <div
                    className="absolute top-0 left-1 w-1/3 h-1/2 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
                    }}
                  />
                </div>

                {/* Bottle cap */}
                <div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-14 sm:w-16 h-3 sm:h-4 bg-slate-700 rounded-full border border-slate-600"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
                  }}
                />

                {/* Click hint */}
                {bottle.layers.length > 0 && selectedBottle !== bottle.id && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap pointer-events-none">
                    Click
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Win Screen */}
        {gameWon && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), rgba(0, 0, 0, 0.8))',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div
              className="bg-slate-800 rounded-2xl p-6 sm:p-10 text-center max-w-md w-full border border-green-500/30"
              style={{
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.2), 0 0 20px rgba(34, 197, 94, 0.1)',
                animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p className="text-4xl sm:text-5xl mb-4">🎉</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 text-transparent bg-clip-text">
                Puzzle Complete!
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl mb-2">Great job!</p>
              <p className="text-gray-400 text-base sm:text-lg mb-6">
                Solved in <span className="font-bold text-green-400">{moves}</span> moves
              </p>
              <div className="flex gap-3 flex-col sm:flex-row justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition"
                >
                  Play Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-slate-700 text-gray-300 rounded-lg font-semibold hover:bg-slate-600 transition"
                >
                  More Games
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </main>
    </>
  );
}
