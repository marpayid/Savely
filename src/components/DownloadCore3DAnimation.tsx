import React from 'react';
import { motion } from 'motion/react';

export const DownloadCore3DAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex items-center justify-center my-6 py-2 overflow-hidden pointer-events-none select-none"
    >
      <div className="relative w-80 h-64 sm:w-96 sm:h-72 flex items-center justify-center">
        <svg
          viewBox="0 0 380 280"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Core Prism Glass Gradients */}
            <linearGradient id="coreFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="coreSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="70%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="coreTopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Core Inner Energy Nucleus */}
            <radialGradient id="coreEnergyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>

            {/* File Objects 3D Glass & Metal Gradients */}
            {/* 1. Video (Cyan/Blue Glass) */}
            <linearGradient id="videoObjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* 2. Audio (Purple Glass) */}
            <linearGradient id="audioObjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* 3. Image (Emerald/Indigo Glass) */}
            <linearGradient id="imageObjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* 4. Document (Blue/Slate Metallic) */}
            <linearGradient id="docObjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* 5. Archive (Violet Metallic) */}
            <linearGradient id="archiveObjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Laser Energy Beam Gradient */}
            <linearGradient id="laserLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>

            {/* Drop Shadows */}
            <filter id="core3DShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#020617" floodOpacity="0.8" />
            </filter>

            <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Floor Radial Shadow */}
          <motion.ellipse
            cx="190"
            cy="245"
            rx="75"
            ry="12"
            fill="#020617"
            opacity="0.75"
            animate={{
              rx: [68, 82, 68],
              opacity: [0.6, 0.85, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Orbit Guide Line 3D Perspective Ellipse */}
          <ellipse
            cx="190"
            cy="140"
            rx="125"
            ry="45"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.45"
          />

          {/* THIN ENERGY BEAM LINES CONNECTING OBJECTS TO CORE */}
          <g opacity="0.6">
            {/* Beam to Video */}
            <line x1="190" y1="135" x2="80" y2="120" stroke="url(#laserLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Beam to Audio */}
            <line x1="190" y1="135" x2="125" y2="175" stroke="url(#laserLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Beam to Image */}
            <line x1="190" y1="135" x2="265" y2="170" stroke="url(#laserLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Beam to Doc */}
            <line x1="190" y1="135" x2="305" y2="115" stroke="url(#laserLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Beam to Archive */}
            <line x1="190" y1="135" x2="190" y2="90" stroke="url(#laserLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* ==================== 1. ORBITING FILE OBJECTS ==================== */}

          {/* OBJECT 1: VIDEO (3D Film Prism Block - Top Left Orbit) */}
          <motion.g
            animate={{
              x: [-12, 10, -12],
              y: [-8, 6, -8],
              scale: [0.9, 0.98, 0.9],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g transform="translate(62, 100)" filter="url(#core3DShadow)">
              {/* 3D Glass Block Base */}
              <polygon points="18,0 36,9 36,32 18,23" fill="#1e293b" />
              <polygon points="0,9 18,0 18,23 0,32" fill="url(#videoObjGrad)" stroke="#38bdf8" strokeWidth="1" />
              <polygon points="0,9 18,0 36,9 18,18" fill="#38bdf8" opacity="0.6" />
              {/* Play Symbol Lens Cutout */}
              <polygon points="10,13 10,21 17,17" fill="#ffffff" opacity="0.9" />
              {/* Film Sprocket Detailing */}
              <line x1="2" y1="12" x2="4" y2="11" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="2" y1="22" x2="4" y2="21" stroke="#38bdf8" strokeWidth="1.5" />
            </g>
          </motion.g>

          {/* OBJECT 2: AUDIO (3D Sound Wave Capsule Prism - Bottom Left Orbit) */}
          <motion.g
            animate={{
              x: [6, -10, 6],
              y: [8, -6, 8],
              scale: [1, 0.92, 1],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g transform="translate(108, 158)" filter="url(#core3DShadow)">
              <polygon points="16,0 32,8 32,30 16,22" fill="#0f172a" />
              <polygon points="0,8 16,0 16,22 0,30" fill="url(#audioObjGrad)" stroke="#c084fc" strokeWidth="1" />
              <polygon points="0,8 16,0 32,8 16,16" fill="#a855f7" opacity="0.6" />
              {/* 3D Equalizer Bars inside Glass */}
              <line x1="5" y1="21" x2="5" y2="13" stroke="#e9d5ff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="22" x2="8" y2="10" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="11" y1="20" x2="11" y2="15" stroke="#e9d5ff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </motion.g>

          {/* OBJECT 3: IMAGE (3D Frame Lens Crystal - Bottom Right Orbit) */}
          <motion.g
            animate={{
              x: [-8, 8, -8],
              y: [-6, 8, -6],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g transform="translate(250, 152)" filter="url(#core3DShadow)">
              <polygon points="18,0 36,9 36,32 18,23" fill="#0f172a" />
              <polygon points="0,9 18,0 18,23 0,32" fill="url(#imageObjGrad)" stroke="#2dd4bf" strokeWidth="1" />
              <polygon points="0,9 18,0 36,9 18,18" fill="#2dd4bf" opacity="0.6" />
              {/* Mountain & Sun Vector inside Glass */}
              <circle cx="12" cy="8" r="2.5" fill="#5eead4" />
              <polygon points="3,21 9,14 15,21" fill="#2dd4bf" opacity="0.9" />
            </g>
          </motion.g>

          {/* OBJECT 4: DOCUMENT (3D Layered Metallic Slab - Top Right Orbit) */}
          <motion.g
            animate={{
              x: [10, -8, 10],
              y: [-6, 8, -6],
              scale: [0.92, 1, 0.92],
            }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g transform="translate(290, 98)" filter="url(#core3DShadow)">
              <polygon points="16,0 32,8 32,30 16,22" fill="#0f172a" />
              <polygon points="0,8 16,0 16,22 0,30" fill="url(#docObjGrad)" stroke="#60a5fa" strokeWidth="1" />
              <polygon points="0,8 16,0 32,8 16,16" fill="#60a5fa" opacity="0.7" />
              {/* Document Metallic Grooves */}
              <line x1="4" y1="12" x2="12" y2="8" stroke="#93c5fd" strokeWidth="1.2" />
              <line x1="4" y1="17" x2="12" y2="13" stroke="#93c5fd" strokeWidth="1.2" />
              <line x1="4" y1="22" x2="10" y2="19" stroke="#64748b" strokeWidth="1.2" />
            </g>
          </motion.g>

          {/* OBJECT 5: ARCHIVE (3D Metallic Vault Box - Far Top Orbit) */}
          <motion.g
            animate={{
              x: [-6, 6, -6],
              y: [4, -8, 4],
              scale: [0.88, 0.95, 0.88],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g transform="translate(174, 68)" filter="url(#core3DShadow)">
              <polygon points="16,0 32,8 32,28 16,20" fill="#0f172a" />
              <polygon points="0,8 16,0 16,20 0,28" fill="url(#archiveObjGrad)" stroke="#818cf8" strokeWidth="1" />
              <polygon points="0,8 16,0 32,8 16,16" fill="#818cf8" opacity="0.6" />
              {/* Vault Latch Seam */}
              <line x1="16" y1="0" x2="16" y2="20" stroke="#a5b4fc" strokeWidth="1.5" />
              <rect x="13" y="8" width="6" height="4" rx="1" fill="#e0e7ff" />
            </g>
          </motion.g>

          {/* ==================== 2. ANIMATED ABSORPTION & SCAN CYCLE ==================== */}

          {/* Object Being Drawn into Core (Cyclic Absorption Animation) */}
          <motion.g
            animate={{
              x: [120, 0, 0, 0, 120],
              y: [-40, 0, 0, 45, -40],
              scale: [0.9, 0.4, 0.05, 0.85, 0.9],
              opacity: [0, 1, 0, 1, 0],
            }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.38, 0.5, 0.72, 1],
            }}
            style={{ transformOrigin: '190px 135px' }}
          >
            <g transform="translate(130, 115)" filter="url(#core3DShadow)">
              <polygon points="18,0 36,9 36,32 18,23" fill="#1e1b4b" />
              <polygon points="0,9 18,0 18,23 0,32" fill="url(#coreFrontGrad)" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="0,9 18,0 36,9 18,18" fill="#93c5fd" opacity="0.8" />
              {/* Checkmark ready when emerging */}
              <path d="M 6 18 L 10 22 L 15 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </motion.g>

          {/* Energy Scan Ring Effect around Core when Object Approaches */}
          <motion.ellipse
            cx="190"
            cy="135"
            rx="32"
            ry="18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            filter="url(#laserGlow)"
            animate={{
              rx: [18, 48, 18],
              ry: [10, 26, 10],
              opacity: [0, 0.85, 0],
            }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0.3, 0.48, 0.65],
            }}
          />

          {/* ==================== 3. CENTRAL 3D DOWNLOAD CORE ==================== */}

          <motion.g
            animate={{
              y: [-4, 4, -4],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '190px 135px' }}
          >
            {/* Core Shadow / Base Back Face */}
            <g filter="url(#core3DShadow)">
              {/* Core Floating 3D Octahedral Diamond Engine */}
              {/* Top Roof Face */}
              <polygon points="190,85 228,108 190,122 152,108" fill="url(#coreTopGrad)" />

              {/* Right Side Glass Panel */}
              <polygon points="190,122 228,108 228,155 190,178" fill="url(#coreSideGrad)" stroke="#4338ca" strokeWidth="1" />

              {/* Left Front Glass Panel */}
              <polygon points="152,108 190,122 190,178 152,155" fill="url(#coreFrontGrad)" stroke="#38bdf8" strokeWidth="1" />

              {/* Specular Bevel Highlights */}
              <line x1="190" y1="122" x2="190" y2="178" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <line x1="152" y1="108" x2="190" y2="122" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="190" y1="122" x2="228" y2="108" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />

              {/* Core Pulse Energy Nucleus inside Glass */}
              <ellipse cx="190" cy="138" rx="18" ry="18" fill="url(#coreEnergyGlow)" />
              <motion.circle
                cx="190"
                cy="138"
                r="7"
                fill="#ffffff"
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Inner Diamond Core Core Symbol */}
              <polygon points="190,131 195,138 190,145 185,138" fill="#38bdf8" />
            </g>
          </motion.g>

          {/* ==================== 4. TRAILING PARTICLES ==================== */}
          <motion.circle
            cx="190"
            cy="135"
            r="2"
            fill="#38bdf8"
            animate={{
              y: [-15, -45],
              x: [-20, 20],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.5, 0.2],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
          />

          <motion.circle
            cx="190"
            cy="135"
            r="2.5"
            fill="#a855f7"
            animate={{
              y: [10, 40],
              x: [15, -25],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.4, 0.2],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />

          <motion.circle
            cx="190"
            cy="135"
            r="1.8"
            fill="#5eead4"
            animate={{
              y: [-25, 10],
              x: [35, 50],
              opacity: [0, 0.8, 0],
              scale: [0.4, 1.2, 0.2],
            }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};
