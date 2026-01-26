'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const box = 20; // grid size
    let snake = [
      { x: 9 * box, y: 10 * box },
      { x: 8 * box, y: 10 * box },
      { x: 7 * box, y: 10 * box },
    ];

    let direction: string | null = null;
    let gameScore = 0;

    let food = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };

    function setDirection(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
        direction = 'LEFT';
      } else if (event.key === 'ArrowUp' && direction !== 'DOWN') {
        direction = 'UP';
      } else if (event.key === 'ArrowRight' && direction !== 'LEFT') {
        direction = 'RIGHT';
      } else if (event.key === 'ArrowDown' && direction !== 'UP') {
        direction = 'DOWN';
      }
    }

    function draw() {
      if (!canvas) return;
      // background
      ctx!.fillStyle = '#111';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // draw snake
      for (let i = 0; i < snake.length; i++) {
        ctx!.fillStyle = i % 2 === 0 ? '#22c55e' : '#15803d';
        ctx!.fillRect(snake[i].x, snake[i].y, box, box);
        ctx!.strokeStyle = '#111';
        ctx!.strokeRect(snake[i].x, snake[i].y, box, box);
      }

      // draw apple
      ctx!.fillStyle = 'red';
      ctx!.beginPath();
      ctx!.arc(food.x + box / 2, food.y + box / 2, box / 2.2, 0, Math.PI * 2);
      ctx!.fill();

      // old head
      let snakeX = snake[0].x;
      let snakeY = snake[0].y;

      if (direction === 'LEFT') snakeX -= box;
      if (direction === 'UP') snakeY -= box;
      if (direction === 'RIGHT') snakeX += box;
      if (direction === 'DOWN') snakeY += box;

      // check collision with food
      if (snakeX === food.x && snakeY === food.y) {
        gameScore++;
        setScore(gameScore);
        food = {
          x: Math.floor(Math.random() * (canvas.width / box)) * box,
          y: Math.floor(Math.random() * (canvas.height / box)) * box,
        };
      } else {
        snake.pop();
      }

      // new head
      const newHead = { x: snakeX, y: snakeY };

      // check collision with walls
      if (
        snakeX < 0 ||
        snakeY < 0 ||
        snakeX >= canvas.width ||
        snakeY >= canvas.height ||
        collision(newHead, snake)
      ) {
        resetGame();
        return;
      }

      snake.unshift(newHead);
    }

    function collision(head: { x: number; y: number }, array: { x: number; y: number }[]) {
      for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
          return true;
        }
      }
      return false;
    }

    function resetGame() {
      if (!canvas) return;
      alert('Game Over! Your score: ' + gameScore);
      snake = [
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box },
        { x: 7 * box, y: 10 * box },
      ];
      direction = null;
      gameScore = 0;
      setScore(0);
      food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box,
      };
    }

    document.addEventListener('keydown', setDirection);
    const interval = setInterval(draw, 100);

    return () => {
      document.removeEventListener('keydown', setDirection);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Snake Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <Header showHowToPlay onHowToPlayClick={() => setHowToPlayOpen(true)} />

      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center pt-20">

        {/* Score Display */}
        <div className="absolute top-24 left-6 bg-gray-800 rounded-lg p-4 border border-green-500/30">
          <p className="text-green-400 text-sm font-semibold mb-1">SCORE</p>
          <p className="text-3xl font-bold text-white">{score}</p>
        </div>

        {/* Game Canvas */}
        <div className="flex-grow flex items-center justify-center w-full">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="border-4 border-gray-700 rounded-lg bg-black shadow-lg"
          />
        </div>

        {/* How to Play Modal */}
        {howToPlayOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-96 text-center shadow-lg relative">
              <button
                onClick={() => setHowToPlayOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">How to Play</h2>
              <p className="text-gray-300 text-sm space-y-2">
                <div>Use arrow keys to move the snake</div>
                <div>Eat the red apples to grow longer</div>
                <div>Avoid hitting walls and yourself</div>
                <div>Each apple eaten increases your score</div>
                <div className="text-xs text-gray-500 pt-2">Game ends if you collide with walls or yourself</div>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
