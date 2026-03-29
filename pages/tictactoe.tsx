'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';

export default function TicTacToe() {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState<{ X: number; O: number; ties: number }>({ X: 0, O: 0, ties: 0 });
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const calculateWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, ties: 0 });
  };

  useEffect(() => {
    const win = calculateWinner(board);
    if (win) {
      setWinner(win);
      setScores(prev => ({ ...prev, [win as 'X' | 'O']: prev[win as 'X' | 'O'] + 1 }));
    } else if (board.every(square => square)) {
      setWinner('tie');
      setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
    }
  }, [board]);

  const renderSquare = (i: number) => (
    <button
      className="w-16 h-16 bg-gray-700 border-2 border-gray-600 text-3xl font-bold hover:bg-gray-600 transition-colors shadow-lg rounded"
      style={{ color: board[i] === 'X' ? '#3b82f6' : board[i] === 'O' ? '#ef4444' : 'white' }}
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </button>
  );

  return (
    <>
      <Head>
        <title>Tic-Tac-Toe - MindSpark</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <Header showHowToPlay onHowToPlayClick={() => setShowHowToPlay(true)} />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4 pt-20">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold mb-2">Tic-Tac-Toe</h1>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-lg">Next:</span>
            <div className="w-10 h-10 bg-gray-700 border-2 border-gray-500 flex items-center justify-center text-2xl font-bold shadow rounded" style={{ color: isXNext ? '#3b82f6' : '#ef4444' }}>
              {isXNext ? 'X' : 'O'}
            </div>
          </div>
          {winner && (
            <div className="text-xl mb-2">
              {winner === 'tie' ? 'It\'s a tie!' : (
                <span>
                  Winner: <span style={{ color: winner === 'X' ? '#3b82f6' : '#ef4444' }}>{winner}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 mb-4 shadow-lg">
          {Array(9).fill(null).map((_, i) => renderSquare(i))}
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold shadow"
          >
            New Game
          </button>
          <button
            onClick={resetScores}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-bold shadow"
          >
            Reset Scores
          </button>
        </div>

        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold mb-2">Scores</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-700 p-2 rounded shadow">
              <h3 className="text-lg font-bold text-blue-400">X</h3>
              <p className="text-2xl font-bold">{scores.X}</p>
            </div>
            <div className="bg-gray-700 p-2 rounded shadow">
              <h3 className="text-lg font-bold text-red-400">O</h3>
              <p className="text-2xl font-bold">{scores.O}</p>
            </div>
            <div className="bg-gray-700 p-2 rounded shadow">
              <h3 className="text-lg font-bold text-yellow-400">Ties</h3>
              <p className="text-3xl font-bold">{scores.ties}</p>
            </div>
          </div>
        </div>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <div className="bg-gray-800 rounded-xl p-8 w-96 text-center shadow-lg relative">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">How to Play Tic-Tac-Toe</h2>
              <p className="mb-4 text-gray-300">
                Take turns placing X's and O's on the grid. Get three in a row (horizontally, vertically, or diagonally) to win!
              </p>
              <p className="mb-4 text-gray-300">
                X goes first. Click on an empty square to make your move.
              </p>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}