'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';

interface GridCell {
  letter: string;
  state: 'empty' | 'correct' | 'wrong-position' | 'not-in-word';
}

export default function Wordle() {
  const [targetWord, setTargetWord] = useState('');
  const [grid, setGrid] = useState<GridCell[][]>(
    Array(6).fill(null).map(() => Array(5).fill({ letter: '', state: 'empty' }))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  useEffect(() => {
    fetchWord();
  }, []);

  async function fetchWord() {
    try {
      const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await res.json();
      setTargetWord(data[0].toUpperCase());
    } catch {
      setTargetWord('APPLE');
    }
  }

  function handleKeyClick(key: string) {
    setError('');
    if (/^[A-Z]$/.test(key)) {
      if (currentCol < 5) {
        const newGrid = grid.map((row) => [...row]);
        newGrid[currentRow][currentCol] = { letter: key, state: 'empty' };
        setGrid(newGrid);
        setCurrentWord(currentWord + key);
        setCurrentCol(currentCol + 1);
      }
    } else if (key === 'DEL') {
      if (currentCol > 0) {
        const newCol = currentCol - 1;
        const newGrid = grid.map((row) => [...row]);
        newGrid[currentRow][newCol] = { letter: '', state: 'empty' };
        setGrid(newGrid);
        setCurrentWord(currentWord.slice(0, -1));
        setCurrentCol(newCol);
      }
    } else if (key === 'ENTER') {
      if (currentWord.length < 5) {
        setError('Please enter 5 letters.');
        return;
      }
      validateWord(currentWord);
    }
  }

  async function validateWord(word: string) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );
      if (!res.ok) {
        setError('Not a real word.');
        return;
      }
      checkWord(word);
    } catch {
      setError('Word check failed.');
    }
  }

  function checkWord(word: string) {
    const newGrid = grid.map((row) => [...row]);
    const targetLetters = targetWord.split('');
    const guessLetters = word.split('');
    const states: ('correct' | 'wrong-position' | 'not-in-word')[] = [];

    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        states[i] = 'correct';
        targetLetters[i] = '*';
      } else {
        states[i] = 'not-in-word';
      }
    }

    // Second pass: mark wrong position
    for (let i = 0; i < 5; i++) {
      if (states[i] === 'not-in-word' && targetLetters.includes(guessLetters[i])) {
        states[i] = 'wrong-position';
        const idx = targetLetters.indexOf(guessLetters[i]);
        targetLetters[idx] = '*';
      }
    }

    // Update grid
    for (let i = 0; i < 5; i++) {
      newGrid[currentRow][i] = { letter: guessLetters[i], state: states[i] };
    }
    setGrid(newGrid);

    if (word === targetWord) {
      setGameWon(true);
      setGameOver(true);
    } else if (currentRow === 5) {
      setGameOver(true);
    } else {
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
      setCurrentWord('');
    }
  }

  function getStateColor(state: string) {
    switch (state) {
      case 'correct':
        return 'bg-green-500 border-green-500';
      case 'wrong-position':
        return 'bg-yellow-500 border-yellow-500';
      case 'not-in-word':
        return 'bg-gray-700 border-gray-700';
      default:
        return 'border-gray-500';
    }
  }

  function resetGame() {
    setGrid(Array(6).fill(null).map(() => Array(5).fill({ letter: '', state: 'empty' })));
    setCurrentRow(0);
    setCurrentCol(0);
    setCurrentWord('');
    setError('');
    setGameOver(false);
    setGameWon(false);
    fetchWord();
  }

  return (
    <>
      <Head>
        <title>MindSpark Wordle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <Header showHowToPlay onHowToPlayClick={() => setHowToPlayOpen(true)} />

      <main className="flex-grow flex flex-col items-center pt-20 px-4">
        <h1 className="text-4xl font-bold mb-6">Wordle</h1>
        {error && <p className="text-red-500 h-6 mb-2">{error}</p>}

        {/* Guess Grid */}
        <div className="grid grid-rows-6 gap-3 mb-6">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-12 h-12 flex items-center justify-center border-2 font-bold text-2xl uppercase ${getStateColor(
                    cell.state
                  )}`}
                >
                  {cell.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div className="flex flex-col gap-2">
          {rows.map((rowLetters, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1">
              {rowLetters.split('').map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleKeyClick(letter)}
                  className="w-10 h-12 border-2 border-gray-500 text-white font-bold rounded hover:bg-gray-700 transition"
                >
                  {letter}
                </button>
              ))}
              {rowIdx === 2 && (
                <>
                  <button
                    onClick={() => handleKeyClick('ENTER')}
                    className="px-4 h-12 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
                  >
                    ENTER
                  </button>
                  <button
                    onClick={() => handleKeyClick('DEL')}
                    className="px-4 h-12 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                  >
                    ⌫
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="mt-8 text-center">
            {gameWon ? (
              <div>
                <h2 className="text-4xl font-bold text-green-400 mb-4">You Won!</h2>
                <p className="text-xl text-gray-300 mb-4">The word was: {targetWord}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-bold text-red-400 mb-4">Game Over!</h2>
                <p className="text-xl text-gray-300 mb-4">The word was: {targetWord}</p>
              </div>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {howToPlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-96 p-6 relative">
            <button
              onClick={() => setHowToPlayOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <p className="text-sm leading-relaxed">
              Guess the hidden 5-letter word in 6 tries.<br />
              <br />
              - Type or click letters to form a word.<br />
              - Green = correct letter in correct spot.<br />
              - Yellow = correct letter, wrong spot.<br />
              - Gray = not in the word.<br />
              <br />
              Press ENTER to submit and DELETE to erase.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
