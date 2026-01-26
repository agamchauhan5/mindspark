'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';

export default function Reaction() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForRestart, setWaitingForRestart] = useState(false);
  const [boxColor, setBoxColor] = useState('bg-gray-900');
  const [message, setMessage] = useState<React.ReactNode>(null);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | null>(null);

  const lightningIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="w-20 h-20 text-yellow-400 mb-6 animate-bounce">
      <path d="M0.719527 59.616L32.8399 2.79148C33.8149 1.06655 35.6429 0 37.6243 0H94.4947C98.9119 0 101.524 4.94729 99.0334 8.59532L71.201 49.357C68.7101 53.0051 71.3225 57.9524 75.7397 57.9524H82.2118C87.3625 57.9524 89.6835 64.4017 85.7139 67.6841L14.34 126.703C9.85287 130.413 3.43339 125.513 5.82845 120.206L25.9709 75.5735C27.6125 71.936 24.9522 67.8166 20.9615 67.8166H5.50391C1.29539 67.8166 -1.35146 63.2798 0.719527 59.616Z" fill="currentColor"/>
    </svg>
  );

  const ellipsisIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-12 h-12 text-white mb-4">
      <path fill="currentColor" d="M0 256a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm168 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm224-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>
    </svg>
  );

  const playIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8 inline-block mr-2">
      <path fill="currentColor" d="M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"></path>
    </svg>
  );

  useEffect(() => {
    animateIntro();
  }, []);

  function animateIntro() {
    setMessage(
      <div className="flex flex-col items-center text-center">
        {lightningIcon}
        <h1 className="text-5xl font-extrabold mb-4">Reaction Speed Test</h1>
        <p className="text-xl">Click anywhere to start</p>
      </div>
    );
  }

  function getRandomDelay() {
    return 1000 + Math.random() * 2000;
  }

  function startTrial() {
    setWaitingForRestart(false);
    setBoxColor('bg-red-600');
    setMessage(
      <div className="flex flex-col items-center">
        {ellipsisIcon}
        <h1 className="text-4xl font-bold">Wait for green...</h1>
      </div>
    );

    const timeout = setTimeout(() => {
      setBoxColor('bg-green-600');
      setMessage(
        <div className="flex flex-col items-center">
          {ellipsisIcon}
          <h1 className="text-4xl font-bold">Click!</h1>
        </div>
      );
      setStartTime(performance.now());
    }, getRandomDelay());

    setTimeoutID(timeout);
  }

  function handleTooSoon() {
    if (timeoutID) clearTimeout(timeoutID);
    setBoxColor('bg-blue-400');
    setMessage(
      <div>
        <h1 className="text-4xl font-bold">Too Soon!</h1>
        <p className="mt-4 text-lg">Click to try again</p>
      </div>
    );
    setTimeoutID(null);
    setWaitingForRestart(true);
  }

  function finishTrial() {
    const reactionTime = performance.now() - startTime;
    let colorClass = 'text-yellow-400';
    if (reactionTime <= 600) colorClass = 'text-green-400';
    else if (reactionTime > 600 && reactionTime <= 800) colorClass = 'text-yellow-400';
    else if (reactionTime > 800) colorClass = 'text-red-500';

    setBoxColor('bg-gray-900');
    setMessage(
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">
          {playIcon} Your Time: <span className={colorClass}>{reactionTime.toFixed(0)} ms</span>
        </h1>
        <p className="mt-4 text-lg">Click to try again</p>
      </div>
    );
    setWaitingForRestart(true);
  }

  function handleBoxClick() {
    if (!gameStarted) {
      setGameStarted(true);
      startTrial();
      return;
    }
    if (waitingForRestart) {
      startTrial();
      return;
    }

    // Game in progress
    if (boxColor === 'bg-red-600') {
      handleTooSoon();
    } else if (boxColor === 'bg-green-600') {
      finishTrial();
    }
  }

  return (
    <>
      <Head>
        <title>Reaction Time Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <Header
        showHowToPlay
        onHowToPlayClick={() => setHowToPlayOpen(true)}
      />

      {/* Main Box - Full Screen */}
      <div
        onClick={handleBoxClick}
        className={`fixed top-16 left-0 right-0 bottom-0 flex items-center justify-center cursor-pointer select-none ${boxColor} transition-colors animate-fadeIn`}
      >
        <div className="text-center">{message}</div>
      </div>

      {/* How to Play Modal */}
      {howToPlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-xl p-6 w-96 text-center shadow-lg relative">
            <button
              onClick={() => setHowToPlayOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <p className="text-gray-300 text-lg">
              Click anywhere to start.<br />
              The screen will turn <span className="text-red-400">red</span>—wait for it to change to <span className="text-green-400">green</span>.<br />
              Click as quickly as possible when it turns green!<br />
              Your reaction time in milliseconds will be shown.<br />
              Too early? You'll need to restart.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
