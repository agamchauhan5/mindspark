import Link from 'next/link';
import { useRouter } from 'next/router';

interface HeaderProps {
  showDonate?: boolean;
  showAbout?: boolean;
  showHowToPlay?: boolean;
  onDonateClick?: () => void;
  onAboutClick?: () => void;
  onHowToPlayClick?: () => void;
}

export default function Header({
  showDonate = false,
  showAbout = false,
  showHowToPlay = false,
  onDonateClick,
  onAboutClick,
  onHowToPlayClick,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header id="header" className="w-full h-16 bg-gray-800 flex items-center justify-between px-3 sm:px-6 shadow fixed top-0 left-0 z-50">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition min-w-0"
      >
        {/* Lightning Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="w-8 sm:w-10 h-8 sm:h-10 drop-shadow-lg flex-shrink-0"
        >
          <defs>
            <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path
            d="M280 40L120 296h112l-24 176 184-272H280z"
            fill="url(#boltGrad)"
          />
        </svg>
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text hidden sm:inline">
          MindSpark
        </span>
      </button>

      <div className="flex gap-2 sm:gap-4">
        {showHowToPlay && (
          <button
            onClick={onHowToPlayClick}
            className="px-4 py-1 border border-indigo-500 text-indigo-400 rounded hover:bg-indigo-500 hover:text-white transition"
          >
            How to Play
          </button>
        )}
        {showDonate && (
          <button
            onClick={onDonateClick}
            className="px-4 py-1 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Donate
          </button>
        )}
        {showAbout && (
          <button
            onClick={onAboutClick}
            className="px-4 py-1 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            About
          </button>
        )}
        {(showHowToPlay || router.pathname !== '/') && (
          <Link
            href="/"
            className="px-4 py-1 bg-indigo-600 rounded hover:bg-indigo-700 transition"
          >
            More Brain Games
          </Link>
        )}
      </div>
    </header>
  );
}
