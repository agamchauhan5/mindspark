'use client';

import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';

export default function CPS() {
  const [chosenTime, setChosenTime] = useState<number | null>(null);
  const [clicks, setClicks] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [cpsResult, setCpsResult] = useState(0);
  const [grade, setGrade] = useState('');
  const [colorClass, setColorClass] = useState('');
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const timeButtons = [1, 5, 10, 15, 20, 30, 45, 60];

  function handleTimeButtonClick(time: number) {
    setChosenTime(time);
    setErrorMsg('');
  }

  function handleCpsBoxClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!chosenTime) {
      setErrorMsg('⚠️ Please choose a time first to start!');
      return;
    }
    if (!timer) {
      startGame(e);
    } else {
      setClicks((prev) => prev + 1);
      createRipple(e);
    }
  }

  function startGame(e: React.MouseEvent<HTMLDivElement>) {
    setClicks(1);
    setTimeLeft(chosenTime || 1);
    createRipple(e);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          endGame(chosenTime || 1, clicks);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    setTimer(interval);
  }

  function endGame(time: number, finalClicks: number) {
    setTimer(null);
    const cps = (finalClicks / time).toFixed(1);
    const cpsNum = parseFloat(cps);
    setCpsResult(cpsNum);
    displayResult(cpsNum);
    setClicks(0);
  }

  function createRipple(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-animation 0.6s linear';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    ripple.style.pointerEvents = 'none';
    ripple.style.width = ripple.style.height = '100px';
    ripple.style.left = `${x - 50}px`;
    ripple.style.top = `${y - 50}px`;

    const cpsBox = e.currentTarget;
    cpsBox.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  function displayResult(cps: number) {
    let gradeText = '';
    let color = '';

    if (cps < 2) {
      gradeText = '🦥 Sloth (Very Slow)';
      color = 'text-red-500';
    } else if (cps < 4) {
      gradeText = '🐼 Panda (Slow)';
      color = 'text-yellow-500';
    } else if (cps < 7) {
      gradeText = '🦏 Rhino (Average)';
      color = 'text-orange-500';
    } else if (cps < 11) {
      gradeText = '🐱 Cat (Good)';
      color = 'text-green-500';
    } else if (cps < 16) {
      gradeText = '🐆 Cheetah (Very Fast)';
      color = 'text-green-400';
    } else if (cps < 21) {
      gradeText = '🌪️ Wind (Fast as the Wind)';
      color = 'text-blue-400';
    } else {
      gradeText = '💡⚡ Speed of Light (Insane)';
      color = 'text-blue-600';
    }

    setGrade(gradeText);
    setColorClass(color);
    setShowResult(true);
  }

  function handleTryAgain() {
    setShowResult(false);
    setCpsResult(0);
    setClicks(0);
    setTimeLeft(0);
  }

  return (
    <>
      <Head>
        <title>Clicks Per Second Test - MindSpark</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            background-color: rgba(255, 255, 255, 0.4);
            pointer-events: none;
          }
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}</style>
      </Head>

      <Header showHowToPlay onHowToPlayClick={() => setHowToPlayOpen(true)} />

      <main className="flex-grow flex flex-col items-center justify-center pt-20 px-4">
        <h1 className="text-3xl font-bold mb-6">Clicks Per Second Test</h1>

        {/* Time Buttons */}
        <div className="flex gap-3 mb-4 flex-wrap justify-center">
          {timeButtons.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeButtonClick(time)}
              className={`px-4 py-2 rounded transition ${
                chosenTime === time ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-indigo-600'
              }`}
            >
              {time}s
            </button>
          ))}
        </div>

        {/* Error */}
        {errorMsg && <p className="text-red-500 font-semibold mb-2">{errorMsg}</p>}

        {/* CPS Box */}
        <div
          onClick={handleCpsBoxClick}
          className="relative w-full max-w-xl h-64 bg-gray-800 rounded-xl flex items-center justify-center text-center text-xl font-semibold cursor-pointer select-none overflow-hidden"
        >
          {!timer && !showResult && 'Select a time above and click here to test your CPS'}
          {timer && `Click as fast as you can! ⏱️ Time Left: ${timeLeft}s`}
        </div>

        {/* Countdown */}
        {timer && <p className="mt-4 text-2xl font-bold">⏱️ Time Left: {timeLeft}s</p>}
      </main>

      {/* Result Popup */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-xl p-8 w-96 text-center shadow-lg relative">
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className={`text-3xl font-bold mb-2 ${colorClass}`}>
              {cpsResult} CPS
            </h2>
            <p className="mb-4">{grade}</p>
            <button
              onClick={handleTryAgain}
              className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {howToPlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-xl p-6 w-[90%] max-w-lg text-white shadow-lg relative">
            <button
              onClick={() => setHowToPlayOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <p className="mb-2">1. Select a time duration from the buttons (1s, 5s, 10s, etc.).</p>
            <p className="mb-2">2. Click inside the big box as fast as possible before the timer runs out.</p>
            <p className="mb-2">3. At the end, your CPS (Clicks Per Second) score will be shown along with a rank.</p>
            <p>4. Try again to improve your speed and challenge your friends!</p>
          </div>
        </div>
      )}
    </>
  );
}
