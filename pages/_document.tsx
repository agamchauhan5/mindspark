import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`
          /* Hide Netlify badge */
          iframe[src*="netlify"] {
            display: none !important;
          }

          /* Loading animations */
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
              transform: scale(0.75);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          /* Ensure content shows during anime.js animations */
          #header, #mainTitle, #gameGrid, .gameCard {
            will-change: opacity, transform;
          }
        `}</style>
      </Head>
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
