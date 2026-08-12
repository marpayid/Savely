import React from 'react';
import { motion } from 'motion/react';

export const DownloadIllustration: React.FC = () => {
  return (
    <div
      className="flex items-center justify-center my-4 select-none pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width="210"
        height="80"
        viewBox="0 0 210 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Connection Track Line */}
        <line
          x1="45"
          y1="40"
          x2="165"
          y2="40"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Moving Document File */}
        <motion.g
          animate={{
            x: [0, 75, 75, 0],
            opacity: [0, 1, 1, 0],
            scale: [0.95, 1, 0.95, 0.95],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.45, 0.82, 1],
          }}
        >
          {/* File Body */}
          <rect
            x="15"
            y="20"
            width="32"
            height="40"
            rx="5"
            fill="#0f172a"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          {/* Folded corner */}
          <path
            d="M 37 20 L 47 30 L 37 30 Z"
            fill="#2563eb"
            opacity="0.6"
          />
          {/* Lines inside file */}
          <line
            x1="22"
            y1="31"
            x2="32"
            y2="31"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="22"
            y1="37"
            x2="40"
            y2="37"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="22"
            y1="43"
            x2="36"
            y2="43"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Destination / Download Tray Target */}
        <g transform="translate(142, 18)">
          {/* Outer Box Container */}
          <rect
            x="0"
            y="10"
            width="44"
            height="34"
            rx="6"
            fill="#020617"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Download Arrow Animation */}
          <motion.g
            animate={{
              y: [0, 3, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M 22 18 L 22 30 M 17 25 L 22 30 L 27 25"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* Success Badge (Triggers when document arrives) */}
          <motion.g
            animate={{
              scale: [0, 0, 1, 1, 0],
              opacity: [0, 0, 1, 1, 0],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'backOut',
              times: [0, 0.42, 0.52, 0.82, 1],
            }}
            style={{ transformOrigin: '36px 8px' }}
          >
            <circle cx="36" cy="8" r="9" fill="#10b981" />
            <path
              d="M 32 8 L 35 11 L 40 5"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </g>
      </svg>
    </div>
  );
};
