'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';

declare global {
  const anime: any;
}

export default function Home() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  useEffect(() => {
    // Run animations immediately - don't wait for window load
    const runAnimations = () => {
      if (typeof window !== 'undefined' && (window as any).anime) {
        anime({
          targets: '#header',
          opacity: [0, 1],
          translateY: [-40, 0],
          easing: 'easeOutExpo',
          duration: 800,
        });

        anime({
          targets: '#mainTitle',
          opacity: [0, 1],
          translateY: [20, 0],
          easing: 'easeOutExpo',
          duration: 1000,
          delay: 300,
        });

        anime({
          targets: '.gameCard',
          opacity: [0, 1],
          scale: [0.75, 1],
          easing: 'easeOutBack',
          duration: 800,
          delay: anime.stagger(200, { start: 600 }),
        });

        anime({
          targets: '#gameGrid',
          opacity: [0, 1],
          easing: 'easeOutQuad',
          duration: 500,
          delay: 500,
        });
      }
    };

    // Fire animations immediately with a small delay for DOM to settle
    setTimeout(() => {
      runAnimations();
    }, 50);
  }, []);

  return (
    <>
      <Head>
        <title>MindSpark Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
      </Head>

      <Header 
        showDonate 
        showAbout 
        onDonateClick={() => setDonateModalOpen(true)}
        onAboutClick={() => setAboutModalOpen(true)}
      />

      <main className="flex-grow pt-20 px-6">
        <h1 id="mainTitle" className="text-3xl font-bold text-center mb-8 opacity-0">
          Choose a Game
        </h1>

        {/* Game Grid */}
        <div id="gameGrid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-0">
          {/* Reaction Speed Test */}
          <Link
            href="/reaction"
            className="gameCard bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 transform transition-all duration-300 flex flex-col items-center text-center space-y-3 opacity-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              className="w-16 h-16 text-yellow-400"
            >
              <path
                d="M0.719527 59.616L32.8399 2.79148C33.8149 1.06655 35.6429 0 37.6243 0H94.4947C98.9119 0 101.524 4.94729 99.0334 8.59532L71.201 49.357C68.7101 53.0051 71.3225 57.9524 75.7397 57.9524H82.2118C87.3625 57.9524 89.6835 64.4017 85.7139 67.6841L14.34 126.703C9.85287 130.413 3.43339 125.513 5.82845 120.206L25.9709 75.5735C27.6125 71.936 24.9522 67.8166 20.9615 67.8166H5.50391C1.29539 67.8166 -1.35146 63.2798 0.719527 59.616Z"
                fill="currentColor"
              />
            </svg>
            <h2 className="text-xl font-semibold">Reaction Speed Test</h2>
            <p className="text-gray-400">
              Test your reflexes and see how fast you can react.
            </p>
          </Link>

          {/* Click Reflex Game */}
          <Link
            href="/clickreflex"
            className="gameCard bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 transform transition-all duration-300 flex flex-col items-center text-center space-y-3 opacity-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              className="w-16 h-16 text-cyan-400"
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
            <h2 className="text-xl font-semibold">Click Reflex</h2>
            <p className="text-gray-400">
              Click the circle as fast as you can — test your speed and focus!
            </p>
          </Link>

          {/* Sand Sorting Game */}
          <Link
            href="/sandsorting"
            className="gameCard bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 transform transition-all duration-300 flex flex-col items-center text-center space-y-3 opacity-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="w-16 h-16"
            >
              <defs>
                <linearGradient id="bottleMulti" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="65%" stopColor="#22c55e" />
                  <stop offset="85%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              
              {/* Tilted pouring bottle at top - angled 45 degrees */}
              <g transform="translate(140, 20) rotate(-45)">
                {/* Bottle body */}
                <rect x="-12" y="0" width="24" height="50" fill="#f5f5dc" stroke="#c9a961" strokeWidth="1.5" rx="3" />
                {/* Sand pouring out - gradient effect */}
                <path d="M -12 45 Q -15 50 -18 60 L -12 60 Q -10 55 -8 50 Z" fill="url(#bottleMulti)" opacity="0.9" />
                {/* Bottle cap */}
                <rect x="-10" y="-5" width="20" height="6" fill="#8b7355" rx="1" />
              </g>
              
              {/* First bottle - left side with multiple colors */}
              <rect x="10" y="70" width="28" height="80" fill="#f5f5dc" stroke="#c9a961" strokeWidth="1.5" rx="4" />
              {/* Layered sand in first bottle */}
              <rect x="12" y="130" width="24" height="18" fill="#ef4444" />
              <rect x="12" y="112" width="24" height="18" fill="#f97316" />
              <rect x="12" y="94" width="24" height="18" fill="#eab308" />
              <rect x="12" y="76" width="24" height="18" fill="#22c55e" />
              {/* Cap */}
              <rect x="14" y="65" width="20" height="6" fill="#8b7355" rx="1" />
              
              {/* Second bottle - center with gradient mix */}
              <rect x="58" y="65" width="28" height="85" fill="#f5f5dc" stroke="#c9a961" strokeWidth="1.5" rx="4" />
              {/* Layered sand */}
              <rect x="60" y="130" width="24" height="20" fill="#06b6d4" />
              <rect x="60" y="107" width="24" height="23" fill="#22c55e" />
              <rect x="60" y="75" width="24" height="32" fill="#eab308" />
              {/* Cap */}
              <rect x="62" y="60" width="20" height="6" fill="#8b7355" rx="1" />
              
              {/* Third bottle - right side partial */}
              <rect x="106" y="80" width="28" height="70" fill="#f5f5dc" stroke="#c9a961" strokeWidth="1.5" rx="4" />
              {/* Layered sand */}
              <rect x="108" y="130" width="24" height="20" fill="#ec4899" />
              <rect x="108" y="105" width="24" height="25" fill="#8b5cf6" />
              <rect x="108" y="90" width="24" height="15" fill="#06b6d4" />
              {/* Cap */}
              <rect x="110" y="75" width="20" height="6" fill="#8b7355" rx="1" />
            </svg>
            <h2 className="text-xl font-semibold">Sand Sorting</h2>
            <p className="text-gray-400">
              Sort colored sand into bottles — a relaxing puzzle game
            </p>
          </Link>

          {/* Tic-Tac-Toe Game */}
          <Link
            href="/tictactoe"
            className="gameCard bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 transform transition-all duration-300 flex flex-col items-center text-center space-y-3 opacity-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 128 128"
              className="w-16 h-16 text-green-400"
            >
              <rect x="20" y="20" width="88" height="88" fill="none" stroke="currentColor" strokeWidth="4" rx="8" />
              <line x1="44" y1="44" x2="84" y2="84" stroke="currentColor" strokeWidth="4" />
              <line x1="84" y1="44" x2="44" y2="84" stroke="currentColor" strokeWidth="4" />
            </svg>
            <h2 className="text-xl font-semibold">Tic-Tac-Toe</h2>
            <p className="text-gray-400">
              Classic strategy game — get three in a row to win!
            </p>
          </Link>

          {/* More Games Placeholder */}
          <div className="gameCard bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center space-y-3 opacity-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <h2 className="text-xl font-semibold">More Games Coming Soon</h2>
            <p className="text-gray-500">Stay tuned for new challenges!</p>
          </div>
        </div>
      </main>

      {/* Donate Modal */}
      {donateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-xl p-8 w-96 text-center shadow-lg relative">
            <button
              onClick={() => setDonateModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Support MindSpark</h2>
            <p className="mb-4">
              If you enjoy these games, consider donating to help us grow—just like
              Wikipedia survives on community support 💙.
            </p>
            <button className="px-6 py-2 bg-yellow-500 rounded hover:bg-yellow-600 text-black font-bold">
              Donate Now
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-xl p-8 w-[40rem] max-w-full text-center shadow-lg relative">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-14 h-14 drop-shadow-lg"
              >
                <defs>
                  <linearGradient id="boltGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <path
                  d="M280 40L120 296h112l-24 176 184-272H280z"
                  fill="url(#boltGrad2)"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">About MindSpark</h2>
            <p className="mb-4 text-gray-300">
              MindSpark is a growing collection of fun, challenging games to play.
              It's a place where you can test your skills, train your brain, and
              have fun at the same time. New games are added regularly, so there's
              always something fresh to try — from quick reaction tests to tricky
              puzzles and skill challenges.
            </p>
            <p className="mb-4 text-gray-300">
              Whether you want to beat your best score, challenge your friends, or
              just take a fun break, MindSpark has something for you.
            </p>
            <ul className="text-left space-y-2 text-gray-300 max-w-lg mx-auto">
              <li>🎮 Many games — reaction, logic, memory, puzzles, and more</li>
              <li>➕ Always growing — new games keep being added</li>
              <li>
                🧠 Skill-building — test focus, speed, memory, and problem solving
              </li>
              <li>
                🏆 Competitive & fun — track high scores and aim higher each time
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
