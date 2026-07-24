import React from 'react';

export default function ColdChainLogo({ className = "w-10 h-10", size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Outer Hex Shield Gradient */}
        <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Cryo Core Glowing Gradient */}
        <linearGradient id="cryoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Neon Glow Filter */}
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Outer Hexagon Shield */}
      <path
        d="M60 6 L106 32.5 V87.5 L60 114 L14 87.5 V32.5 Z"
        fill="url(#nexusGradient)"
        fillOpacity="0.15"
        stroke="url(#nexusGradient)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Telematics Hexagon Ring */}
      <path
        d="M60 18 L94 38 V82 L60 102 L26 82 V38 Z"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeOpacity="0.6"
      />

      {/* Snowflake / Cold-Chain Central Emblem */}
      <g filter="url(#neonGlow)">
        {/* Vertical & Horizontal Axes */}
        <line x1="60" y1="28" x2="60" y2="92" stroke="url(#cryoGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="60" x2="92" y2="60" stroke="url(#cryoGradient)" strokeWidth="4" strokeLinecap="round" />

        {/* Diagonal Cross Arms */}
        <line x1="37" y1="37" x2="83" y2="83" stroke="url(#cryoGradient)" strokeWidth="3" strokeLinecap="round" />
        <line x1="83" y1="37" x2="37" y2="83" stroke="url(#cryoGradient)" strokeWidth="3" strokeLinecap="round" />

        {/* Cryo Branches (Chevrons) */}
        <path d="M52 38 L60 46 L68 38" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M52 82 L60 74 L68 82" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M38 52 L46 60 L38 68" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M82 52 L74 60 L82 68" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Central Thermal Core Hub */}
      <circle cx="60" cy="60" r="9" fill="#0f172a" stroke="url(#cryoGradient)" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="3.5" fill="#34d399" />

      {/* Corner Telematics Data Nodes */}
      <circle cx="60" cy="6" r="3.5" fill="#3b82f6" />
      <circle cx="106" cy="32.5" r="3.5" fill="#06b6d4" />
      <circle cx="106" cy="87.5" r="3.5" fill="#10b981" />
      <circle cx="60" cy="114" r="3.5" fill="#3b82f6" />
      <circle cx="14" cy="87.5" r="3.5" fill="#06b6d4" />
      <circle cx="14" cy="32.5" r="3.5" fill="#10b981" />
    </svg>
  );
}
