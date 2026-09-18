import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import matethVideo from './mateth.mp4';
import {
  Play,
  Upload,
  Trophy,
  Flame,
  Award,
  ArrowRight,
  BrainCircuit,
  Crown,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  Target,
  Rocket,
  CheckCircle2,
} from 'lucide-react';

const featureCards = [
  {
    icon: Flame,
    iconClass:
      'bg-[#2F5E34]/20 border-[#2F5E34]/45 text-[#9CDEA1]',
    title: 'Build streaks',
    body: 'Keep your daily momentum alive by answering questions consistently.',
    to: '/play',
    cta: 'Keep going',
  },
  {
    icon: Award,
    iconClass:
      'bg-[#FFAF03]/20 border-[#FFAF03]/45 text-[#FFAF03]',
    title: 'Unlock badges',
    body: 'Earn achievements as you master topics and hold onto your streak.',
    to: '/profile',
    cta: 'View badges',
  },
  {
    icon: BrainCircuit,
    iconClass:
      'bg-[#C23F13]/20 border-[#C23F13]/45 text-[#FF9A78]',
    title: 'Learn from your notes',
    body: 'Upload handouts or PDFs and turn your own study material into practice.',
    to: '/upload',
    cta: 'Upload a PDF',
  },
  {
    icon: Trophy,
    iconClass:
      'bg-[#A61707]/20 border-[#A61707]/45 text-[#FF8A79]',
    title: 'Climb higher',
    body: 'Earn points, compete with friends, and rise through the leaderboard.',
    to: '/leaderboard',
    cta: 'View leaderboard',
  },
];

const subjects = [
  {
    symbol: 'π',
    accent: '#FFAF03',
    title: 'Mathematics',
    body: 'Algebra, geometry, trigonometry, and problem-solving.',
  },
  {
    symbol: 'Aa',
    accent: '#9CDEA1',
    title: 'English',
    body: 'Grammar, vocabulary, comprehension, and communication.',
  },
  {
    symbol: '⚛',
    accent: '#FF9A78',
    title: 'Physics',
    body: 'Motion, forces, electricity, energy, and formulas.',
  },
  {
    symbol: '?',
    accent: '#FFAF03',
    title: 'Random challenge',
    body: 'Test your versatility with a mixed-topic challenge.',
  },
];

function TiltCard({ children, className = '', maxTilt = 8 }) {
  const ref = useRef(null);
  const [cardStyle, setCardStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch') return;

    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * maxTilt * 2;
    const rotateY = (x - 0.5) * maxTilt * 2;

    setCardStyle({
      transform: `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(10px)
      `,
    });

    setGlareStyle({
      opacity: 0.18,
      background: `
        radial-gradient(
          circle at ${x * 100}% ${y * 100}%,
          rgba(255, 240, 209, 0.85),
          transparent 48%
        )
      `,
    });
  };

  const resetCard = () => {
    setCardStyle({
      transform:
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    });

    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      style={{
        ...cardStyle,
        transformStyle: 'preserve-3d',
        transition: 'transform 180ms ease-out',
      }}
      className={`relative ${className}`}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-200"
        style={glareStyle}
        aria-hidden="true"
      />
    </div>
  );
}

function SymbolCube() {
  const faces = [
    { symbol: '÷', transform: 'translateZ(72px)' },
    { symbol: 'π', transform: 'rotateY(180deg) translateZ(72px)' },
    { symbol: '∑', transform: 'rotateY(90deg) translateZ(72px)' },
    { symbol: '√', transform: 'rotateY(-90deg) translateZ(72px)' },
    { symbol: '×', transform: 'rotateX(90deg) translateZ(72px)' },
    { symbol: '∞', transform: 'rotateX(-90deg) translateZ(72px)' },
  ];

  return (
    <div
      className="mateth-cube-scene"
      role="img"
      aria-label="Three-dimensional mathematics symbol cube"
    >
      <div className="mateth-cube">
        {faces.map((face, index) => (
          <div
            key={index}
            className="mateth-cube-face"
            style={{ transform: face.transform }}
          >
            {face.symbol}
          </div>
        ))}
      </div>
    </div>
  );
}

function Podium3D({
  rank,
  name,
  points,
  height,
  colorRgb,
  crown = false,
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      {crown && (
        <Crown
          className="mb-2 h-6 w-6 text-[#FFAF03] drop-shadow-[0_3px_8px_rgba(255,175,3,0.8)]"
          aria-hidden="true"
        />
      )}

      <div
        className="mb-2 flex h-11 w-11 items-center justify-center rounded-full font-black text-[#102B42] shadow-xl"
        style={{
          background: `linear-gradient(
            145deg,
            rgb(${colorRgb}),
            rgba(${colorRgb}, 0.55)
          )`,
          boxShadow: `
            0 3px 0 rgba(${colorRgb}, 0.55),
            0 8px 18px rgba(0, 0, 0, 0.42)
          `,
        }}
      >
        {name.charAt(0)}
      </div>

      <p className="max-w-[80px] truncate text-center text-xs font-bold text-[#FFF0D1] sm:max-w-none sm:text-sm">
        {name}
      </p>

      <p className="mb-3 text-[10px] text-[#FFF0D1]/55 sm:text-xs">
        {points.toLocaleString()} pts
      </p>

      <div
        className="flex w-16 items-start justify-center rounded-t-xl pt-2 text-base font-black text-[#102B42] sm:w-24 sm:text-lg"
        style={{
          height,
          background: `linear-gradient(
            160deg,
            rgb(${colorRgb}),
            rgba(${colorRgb}, 0.72)
          )`,
          boxShadow: `
            0 3px 0 rgba(${colorRgb}, 0.75),
            0 6px 0 rgba(${colorRgb}, 0.42),
            0 9px 0 rgba(${colorRgb}, 0.26),
            0 22px 30px rgba(0, 0, 0, 0.36)
          `,
        }}
      >
        {rank}
      </div>
    </div>
  );
}

function VideoShowcase() {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  const startVideo = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      video.muted = false;
      await video.play();
      setStarted(true);
    } catch (error) {
      console.error('Video could not start:', error);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFAF03]/35 bg-[#FFAF03]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#FFAF03]">
            The Mateth experience
          </div>

          <h2 className="max-w-xl text-3xl font-black leading-tight text-[#FFF0D1] sm:text-5xl">
            A smarter way to prepare, practice, and perform.
          </h2>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#FFF0D1]/65 sm:text-lg">
            See how Mateth turns revision into an interactive learning
            experience.
          </p>

          {!started && (
            <button
              type="button"
              onClick={startVideo}
              className="mateth-btn-primary mateth-focus mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl px-7 py-4 font-black"
            >
              <Play
                className="mr-2 h-5 w-5 fill-[#102B42]"
                aria-hidden="true"
              />
              Watch with sound
            </button>
          )}
        </div>

        <div className="mateth-video-shell group">
          <div className="mateth-video-glow" />

          <div className="relative overflow-hidden rounded-[2rem] border border-[#FFAF03]/35 bg-[#102B42]/80 p-2 shadow-[0_30px_80px_rgba(16,43,66,0.55)] sm:rounded-[2.5rem] sm:p-3">
            <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-[#102B42] sm:rounded-[2rem]">
              <video
                ref={videoRef}
                className="block h-full w-full object-cover"
                controls
                loop
                playsInline
                preload="metadata"
                poster="/IMAGE/Mateth-logo.jpg"
              >
                <source
                  src={matethVideo}
                  type="video/mp4"
                />

                Your browser does not support the video element.
              </video>

              {!started && (
                <button
                  type="button"
                  onClick={startVideo}
                  className="mateth-focus absolute inset-0 flex items-center justify-center bg-[#102B42]/45 transition-colors hover:bg-[#102B42]/30"
                  aria-label="Play Mateth video with sound"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFAF03] text-[#102B42] shadow-[0_8px_30px_rgba(255,175,3,0.4)] transition-transform hover:scale-110">
                    <Play
                      className="ml-1 h-7 w-7 fill-[#102B42]"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              )}

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#102B42]/50 via-transparent to-[#FFAF03]/10"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const backgroundSymbols = ['+', '×', '÷', '√', 'π', '∑', '−', '∞'];

  return (
    <div className="mateth-page relative min-h-screen overflow-hidden">
      <style>{`
        @keyframes matethFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(0, -24px, 0) rotate(8deg);
          }
        }

        @keyframes matethSpin {
          from {
            transform: rotateX(-18deg) rotateY(0deg);
          }

          to {
            transform: rotateX(-18deg) rotateY(360deg);
          }
        }

        @keyframes matethPulse {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.04);
          }
        }

        .mateth-page {
          color: #FFF0D1;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(255, 175, 3, 0.16),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #102B42 0%,
              #193B42 34%,
              #2F5E34 66%,
              #A61707 100%
            );
        }

        .mateth-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255, 240, 209, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 240, 209, 0.05) 1px,
              transparent 1px
            );
          background-size: 44px 44px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 70%
          );
        }

        .mateth-cube-scene {
          width: 144px;
          height: 144px;
          margin: 0 auto;
          perspective: 850px;
          filter: drop-shadow(
            0 28px 30px rgba(16, 43, 66, 0.5)
          );
        }

        .mateth-cube {
          position: relative;
          width: 144px;
          height: 144px;
          transform-style: preserve-3d;
          animation: matethSpin 16s linear infinite;
        }

        .mateth-cube-face {
          position: absolute;
          inset: 0;
          display: flex;
          width: 144px;
          height: 144px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 175, 3, 0.65);
          border-radius: 22px;
          color: #FFF0D1;
          background:
            linear-gradient(
              145deg,
              rgba(47, 94, 52, 0.98),
              rgba(16, 43, 66, 0.98)
            );
          box-shadow:
            inset 0 0 32px rgba(255, 175, 3, 0.18),
            inset 0 -18px 30px rgba(10, 20, 30, 0.25),
            0 0 24px rgba(255, 175, 3, 0.13);
          font-size: 2.8rem;
          font-weight: 900;
          backface-visibility: hidden;
        }

        .mateth-cube-face::after {
          content: "";
          position: absolute;
          inset: 1px;
          border: 1px solid rgba(255, 240, 209, 0.08);
          border-radius: 20px;
        }

        .mateth-video-shell {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 300ms ease;
        }

        .mateth-video-shell:hover {
          transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
        }

        .mateth-video-glow {
          position: absolute;
          inset: 12% 12% -10%;
          border-radius: 50%;
          background: rgba(255, 175, 3, 0.25);
          filter: blur(55px);
          animation: matethPulse 5s ease-in-out infinite;
        }

        .mateth-btn-primary,
        .mateth-btn-secondary,
        .mateth-link {
          -webkit-tap-highlight-color: transparent;
        }

        .mateth-btn-primary {
          background:
            linear-gradient(
              145deg,
              #FFAF03 0%,
              #F48A08 45%,
              #C23F13 100%
            );
          color: #102B42;
          box-shadow:
            0 4px 0 #A61707,
            0 12px 24px rgba(255, 175, 3, 0.24);
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            filter 160ms ease;
        }

        .mateth-btn-primary:hover {
          transform: translateY(-3px);
          filter: saturate(1.1);
          box-shadow:
            0 7px 0 #A61707,
            0 18px 30px rgba(255, 175, 3, 0.32);
        }

        .mateth-btn-primary:active {
          transform: translateY(1px);
          box-shadow:
            0 2px 0 #A61707,
            0 7px 15px rgba(255, 175, 3, 0.22);
        }

        .mateth-btn-secondary {
          border: 1px solid rgba(255, 240, 209, 0.24);
          color: #FFF0D1;
          background: rgba(16, 43, 66, 0.7);
          box-shadow:
            0 4px 0 rgba(5, 19, 31, 0.8),
            0 12px 24px rgba(16, 43, 66, 0.28);
          backdrop-filter: blur(12px);
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .mateth-btn-secondary:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 175, 3, 0.75);
          background: rgba(47, 94, 52, 0.68);
          box-shadow:
            0 7px 0 rgba(5, 19, 31, 0.8),
            0 18px 30px rgba(16, 43, 66, 0.3);
        }

        .mateth-btn-secondary:active {
          transform: translateY(1px);
        }

        .mateth-link {
          transition:
            color 160ms ease,
            transform 160ms ease;
        }

        .mateth-link:hover {
          transform: translateX(3px);
        }

        .mateth-focus:focus-visible {
          outline: 3px solid #FFAF03;
          outline-offset: 4px;
        }

        @media (max-width: 640px) {
          .mateth-cube-scene,
          .mateth-cube,
          .mateth-cube-face {
            width: 116px;
            height: 116px;
          }

          .mateth-cube-face {
            font-size: 2.2rem;
          }

          .mateth-cube-face:nth-child(1) {
            transform: translateZ(58px) !important;
          }

          .mateth-cube-face:nth-child(2) {
            transform: rotateY(180deg) translateZ(58px) !important;
          }

          .mateth-cube-face:nth-child(3) {
            transform: rotateY(90deg) translateZ(58px) !important;
          }

          .mateth-cube-face:nth-child(4) {
            transform: rotateY(-90deg) translateZ(58px) !important;
          }

          .mateth-cube-face:nth-child(5) {
            transform: rotateX(90deg) translateZ(58px) !important;
          }

          .mateth-cube-face:nth-child(6) {
            transform: rotateX(-90deg) translateZ(58px) !important;
          }

          .mateth-video-shell:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }

          .mateth-video-shell:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Decorative mathematics background */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {backgroundSymbols.map((symbol, index) => (
          <span
            key={`${symbol}-${index}`}
            className="absolute font-mono font-black text-[#FFAF03]/10"
            style={{
              left: `${(index * 13) % 100}%`,
              top: `${(index * 31) % 100}%`,
              fontSize: index % 2 === 0 ? '5rem' : '3rem',
              filter: index % 2 === 0 ? 'blur(0px)' : 'blur(1px)',
              animation: `matethFloat ${8 + index}s ease-in-out infinite`,
              animationDelay: `${index * 0.4}s`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto flex min-h-[760px] w-full max-w-7xl flex-col items-center justify-center px-5 pb-20 pt-24 text-center sm:px-8 lg:pb-28 lg:pt-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#FFAF03]/40 bg-[#102B42]/55 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#FFAF03] shadow-[0_8px_30px_rgba(16,43,66,0.25)] backdrop-blur-md sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Play · Learn · Succeed
          </div>

          <SymbolCube />

          <h1 className="mt-12 max-w-5xl text-4xl font-black leading-[0.98] tracking-tight text-[#FFF0D1] sm:text-6xl lg:text-8xl">
            Turn matric revision into a game you actually want to play.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#FFF0D1]/70 sm:text-lg lg:text-xl">
            Answer quiz questions, protect your streak, unlock badges, and
            understand exactly why every answer is right or wrong.
          </p>

          <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              to="/play"
              className="mateth-btn-primary mateth-focus inline-flex min-h-14 items-center justify-center rounded-2xl px-8 py-4 font-black"
            >
              <Play
                className="mr-2 h-5 w-5 fill-[#102B42]"
                aria-hidden="true"
              />
              Start playing
            </Link>

            <Link
              to="/upload"
              className="mateth-btn-secondary mateth-focus inline-flex min-h-14 items-center justify-center rounded-2xl px-8 py-4 font-bold"
            >
              <Upload
                className="mr-2 h-5 w-5 text-[#FFAF03]"
                aria-hidden="true"
              />
              Upload a PDF
            </Link>
          </div>

          <div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-3 rounded-3xl border border-[#FFF0D1]/10 bg-[#102B42]/35 p-5 shadow-2xl backdrop-blur-md sm:gap-8 sm:p-8">
            <div>
              <p className="text-2xl font-black text-[#FFF0D1] sm:text-4xl">
                10+
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[#FFF0D1]/50 sm:text-xs">
                Core subjects
              </p>
            </div>

            <div className="border-x border-[#FFF0D1]/10">
              <p className="text-2xl font-black text-[#FFAF03] sm:text-4xl">
                A–D
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[#FFF0D1]/50 sm:text-xs">
                Quiz choices
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-[#FFF0D1] sm:text-4xl">
                ∞
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[#FFF0D1]/50 sm:text-xs">
                Practice runs
              </p>
            </div>
          </div>
        </section>

        {/* Video */}

        <VideoShowcase />

        {/* Features */}
        <section className="relative border-y border-[#FFF0D1]/10 bg-[#102B42]/40 px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FFAF03] sm:text-sm">
                Why Mateth?
              </p>

              <h2 className="text-3xl font-black text-[#FFF0D1] sm:text-5xl">
                Serious preparation. Game-like motivation.
              </h2>

              <p className="mt-5 text-base leading-relaxed text-[#FFF0D1]/60 sm:text-lg">
                Everything is designed to help you revise more consistently,
                understand difficult ideas, and keep moving forward.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(
                ({ icon: Icon, iconClass, title, body, to, cta }) => (
                  <TiltCard
                    key={title}
                    className="rounded-[1.75rem]"
                    maxTilt={7}
                  >
                    <div className="flex h-full flex-col rounded-[1.75rem] border border-[#FFF0D1]/15 bg-[#FFF0D1]/95 p-7 text-[#102B42] shadow-[0_20px_50px_rgba(16,43,66,0.2)]">
                      <div
                        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border ${iconClass}`}
                      >
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </div>

                      <h3 className="text-xl font-black">{title}</h3>

                      <p className="mt-3 text-sm leading-relaxed text-[#38546D]">
                        {body}
                      </p>

                      <Link
                        to={to}
                        className="mateth-link mateth-focus mt-auto inline-flex items-center pt-7 text-sm font-black text-[#2F5E34] hover:text-[#C23F13]"
                      >
                        {cta}
                        <ArrowRight
                          className="ml-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </TiltCard>
                )
              )}
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FFAF03] sm:text-sm">
                Explore
              </p>

              <h2 className="max-w-2xl text-3xl font-black text-[#FFF0D1] sm:text-5xl">
                Choose a subject. Start your mission.
              </h2>
            </div>

            <Link
              to="/subjects"
              className="mateth-link mateth-focus inline-flex items-center self-start text-sm font-black text-[#FFAF03] hover:text-[#FFF0D1] md:self-auto"
            >
              Explore all subjects
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map(({ symbol, accent, title, body }) => (
              <TiltCard
                key={title}
                className="rounded-[1.75rem]"
                maxTilt={7}
              >
                <Link
                  to="/play"
                  className="mateth-focus block h-full rounded-[1.75rem] border border-[#FFF0D1]/15 bg-[#102B42]/65 p-7 shadow-[0_20px_50px_rgba(16,43,66,0.24)] backdrop-blur-md transition-colors hover:border-[#FFAF03]/60"
                >
                  <span
                    className="mb-7 block font-mono text-5xl font-black"
                    style={{ color: accent }}
                  >
                    {symbol}
                  </span>

                  <h3 className="text-xl font-black text-[#FFF0D1]">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#FFF0D1]/60">
                    {body}
                  </p>

                  <span className="mt-7 inline-flex items-center text-sm font-black text-[#FFAF03]">
                    Explore
                    <ArrowRight
                      className="ml-1 h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FFAF03] sm:text-sm">
                Friendly competition
              </p>

              <h2 className="text-3xl font-black text-[#FFF0D1] sm:text-5xl">
                Earn your place at the top.
              </h2>

              <p className="mt-4 max-w-xl leading-relaxed text-[#FFF0D1]/60">
                Practice, earn points, and watch your progress rise alongside
                other ambitious learners.
              </p>
            </div>

            <Link
              to="/leaderboard"
              className="mateth-btn-secondary mateth-focus inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 font-bold"
            >
              View full leaderboard
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#FFAF03]/25 bg-[#102B42]/65 px-4 py-14 shadow-[0_25px_70px_rgba(16,43,66,0.4)] backdrop-blur-md sm:px-8 sm:py-20">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFAF03]/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex items-end justify-center gap-4 sm:gap-10">
              <Podium3D
                rank={2}
                name="Meron"
                points={2450}
                height="90px"
                colorRgb="47,94,52"
              />

              <Podium3D
                rank={1}
                name="Samuel"
                points={2840}
                height="140px"
                colorRgb="255,175,3"
                crown
              />

              <Podium3D
                rank={3}
                name="Hana"
                points={2190}
                height="68px"
                colorRgb="194,63,19"
              />
            </div>
          </div>
        </section>

        {/* AI explanation */}
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#FFAF03] sm:text-sm">
              Learn the idea
            </p>

            <h2 className="max-w-xl text-3xl font-black leading-tight text-[#FFF0D1] sm:text-5xl">
              AI explanations, not AI cheating.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#FFF0D1]/65 sm:text-lg">
              After you submit an answer, Mateth explains why it was correct or
              incorrect, helping you understand the concept before your next
              question.
            </p>

            <Link
              to="/play"
              className="mateth-btn-secondary mateth-focus mt-8 inline-flex min-h-12 items-center rounded-2xl px-6 py-3 font-bold"
            >
              <Lightbulb
                className="mr-2 h-5 w-5 text-[#FFAF03]"
                aria-hidden="true"
              />
              Try a practice question
            </Link>
          </div>

          <TiltCard className="rounded-[2rem]" maxTilt={5}>
            <div className="rounded-[2rem] border border-[#FFAF03]/35 bg-[#FFF0D1]/95 p-7 text-[#102B42] shadow-[0_25px_70px_rgba(16,43,66,0.28)] sm:p-9">
              <div className="mb-7 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C23F13]">
                  Answer review
                </p>

                <CheckCircle2
                  className="h-6 w-6 text-[#2F5E34]"
                  aria-hidden="true"
                />
              </div>

              <h3 className="text-2xl font-black">
                Why is B correct?
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-[#38546D]">
                Mateth gives you a short, clear explanation that connects the
                answer to the underlying concept.
              </p>

              <div className="mt-7 rounded-2xl border border-[#2F5E34]/20 bg-[#2F5E34]/10 p-4">
                <div className="flex items-center gap-3 text-sm font-bold text-[#2F5E34]">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                  Explanation unlocked
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#38546D]">
                  Learn the method, not just the answer.
                </p>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* CTA */}
        <section className="mx-auto mb-20 w-full max-w-6xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#FFAF03]/40 bg-gradient-to-br from-[#2F5E34] via-[#102B42] to-[#A61707] px-6 py-16 text-center shadow-[0_30px_80px_rgba(16,43,66,0.5)] sm:px-14 sm:py-24">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFAF03]/20 blur-3xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#C23F13]/30 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative">
              <Rocket
                className="mx-auto mb-6 h-10 w-10 text-[#FFAF03]"
                aria-hidden="true"
              />

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFAF03] sm:text-sm">
                Your next level starts here
              </p>

              <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-tight text-[#FFF0D1] sm:text-6xl">
                Make revision your unfair advantage.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[#FFF0D1]/70">
                Play as a guest today. Create an account when you are ready to
                save your points, badges, streak, and leaderboard position.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/play"
                  className="mateth-btn-primary mateth-focus inline-flex min-h-14 items-center justify-center rounded-2xl px-8 py-4 font-black"
                >
                  Start playing now
                  <ArrowRight
                    className="ml-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to="/register"
                  className="mateth-btn-secondary mateth-focus inline-flex min-h-14 items-center justify-center rounded-2xl px-8 py-4 font-bold"
                >
                  Create a free account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#FFF0D1]/10 bg-[#102B42]/85 px-5 py-10 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <img
              src="/ICONS/Mateth-logo.jpg"
              alt="Mateth"
              className="h-14 w-14 rounded-2xl object-cover shadow-lg"
            />

            <div>
              <h3 className="text-lg font-black text-[#FFF0D1]">Mateth</h3>
              <p className="mt-1 text-sm text-[#FFF0D1]/55">
                Prepare. Practice. Perform.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#FFF0D1]/45 sm:text-sm">
            © 2026 Mateth. Learn smarter. Play harder.
          </p>
        </div>
      </footer>
    </div>
  );
}