import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  textClassName?: string;
  showGlow?: boolean;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  withText = false,
  textClassName = '',
  showGlow = false,
  alt = 'Techno Otoparts Logo'
}) => {
  // Height sizing for the SVG emblem (aspect ratio is 2:1)
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-9 sm:h-10 w-auto',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-32 w-auto'
  };

  const glowStyle = showGlow 
    ? 'drop-shadow-[0_0_20px_rgba(220,38,38,0.45)] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' 
    : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] ${glowStyle}`}>
        <svg 
          viewBox="0 0 600 300" 
          className={`${sizeClasses[size]} select-none`}
          aria-label={alt}
          role="img"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Chrome Bevel Linear Gradient */}
            <linearGradient id="chromeGradientOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="15%" stopColor="#e2e8f0" />
              <stop offset="35%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="68%" stopColor="#64748b" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Inner Metallic Rim Gradient */}
            <linearGradient id="chromeGradientInner" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="25%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Candy Apple Deep Red Face Gradient */}
            <linearGradient id="candyRedFace" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#cc2222" />
              <stop offset="25%" stopColor="#b31818" />
              <stop offset="65%" stopColor="#8c0d0d" />
              <stop offset="100%" stopColor="#570505" />
            </linearGradient>

            {/* Upper Gloss Curved Highlight */}
            <linearGradient id="upperGlossHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Lens Sparkle Soft Radial Glow */}
            <radialGradient id="sparkleRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#ffe4e4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Outer Chrome Metallic Bezel */}
          <path 
            d="M 300 16 
               L 570 78 
               A 10 10 0 0 1 576 86 
               L 576 214 
               A 10 10 0 0 1 570 222 
               L 300 284 
               A 8 8 0 0 1 296 284 
               L 26 222 
               A 10 10 0 0 1 20 214 
               L 20 86 
               A 10 10 0 0 1 26 78 
               L 296 16 
               A 8 8 0 0 1 300 16 Z" 
            fill="url(#chromeGradientOuter)" 
            stroke="#1e293b" 
            strokeWidth="1.5"
          />

          {/* 2. Middle Chrome Step Bevel */}
          <path 
            d="M 300 23 
               L 561 83 
               A 8 8 0 0 1 566 90 
               L 566 210 
               A 8 8 0 0 1 561 217 
               L 300 277 
               A 7 7 0 0 1 297 277 
               L 35 217 
               A 8 8 0 0 1 30 210 
               L 30 90 
               A 8 8 0 0 1 35 83 
               L 297 23 
               A 7 7 0 0 1 300 23 Z" 
            fill="url(#chromeGradientInner)" 
          />

          {/* 3. Deep Inset Bevel Separation Groove */}
          <path 
            d="M 300 28 
               L 553 87 
               A 6 6 0 0 1 557 93 
               L 557 207 
               A 6 6 0 0 1 553 213 
               L 300 272 
               A 6 6 0 0 1 297 272 
               L 43 213 
               A 6 6 0 0 1 39 207 
               L 39 93 
               A 6 6 0 0 1 43 87 
               L 297 28 
               A 6 6 0 0 1 300 28 Z" 
            fill="#220000" 
            stroke="#110000" 
            strokeWidth="1"
          />

          {/* 4. Candy Apple Red Plate Face */}
          <path 
            d="M 300 31 
               L 550 89 
               L 554 206 
               L 300 269 
               L 42 206 
               L 46 89 Z" 
            fill="url(#candyRedFace)" 
          />

          {/* 5. Top Specular Gloss Curved Arc */}
          <path 
            d="M 300 31 
               L 550 89 
               L 552 145 
               Q 300 175 44 145 
               L 46 89 Z" 
            fill="url(#upperGlossHighlight)" 
          />

          {/* 6. Subtle Lower Rim Highlight Stroke */}
          <path 
            d="M 46 204 L 300 266 L 550 204" 
            fill="none" 
            stroke="#ff8787" 
            strokeWidth="1.2" 
            opacity="0.35"
          />

          {/* 7. Typography: TECHNO (3D Embossed) */}
          {/* Deep Under Shadow */}
          <text 
            x="300" 
            y="170" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Arial Black', Impact, sans-serif" 
            fontSize="112" 
            fontWeight="900" 
            letterSpacing="2"
            fill="#2b0000"
          >
            TECHNO
          </text>
          {/* 3D Extrusion Side Bevel */}
          <text 
            x="300" 
            y="166" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Arial Black', Impact, sans-serif" 
            fontSize="112" 
            fontWeight="900" 
            letterSpacing="2"
            fill="#94a3b8"
          >
            TECHNO
          </text>
          <text 
            x="300" 
            y="164" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Arial Black', Impact, sans-serif" 
            fontSize="112" 
            fontWeight="900" 
            letterSpacing="2"
            fill="#cbd5e1"
          >
            TECHNO
          </text>
          {/* Front Pure White Face */}
          <text 
            x="300" 
            y="162" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Arial Black', Impact, sans-serif" 
            fontSize="112" 
            fontWeight="900" 
            letterSpacing="2"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            TECHNO
          </text>

          {/* 8. Typography: OTOPARTS */}
          {/* Shadow */}
          <text 
            x="300" 
            y="228" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Arial Black', sans-serif" 
            fontSize="34" 
            fontWeight="900" 
            letterSpacing="12"
            fill="#200000"
          >
            OTOPARTS
          </text>
          {/* Front White Text */}
          <text 
            x="300" 
            y="226" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Arial Black', sans-serif" 
            fontSize="34" 
            fontWeight="900" 
            letterSpacing="12"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="0.8"
          >
            OTOPARTS
          </text>

          {/* 9. Star Glint Lens Sparkle on Top-Right Corner of 'O' */}
          <g transform="translate(497, 88)">
            <circle cx="0" cy="0" r="16" fill="url(#sparkleRadial)" />
            <polygon points="-26,0 0,-1.5 26,0 0,1.5" fill="#ffffff" />
            <polygon points="0,-26 -1.5,0 0,26 1.5,0" fill="#ffffff" />
            <polygon points="-12,-12 0,-0.8 12,12 0,0.8" fill="#ffffff" opacity="0.8" />
            <polygon points="12,-12 0.8,0 -12,12 -0.8,0" fill="#ffffff" opacity="0.8" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {withText && (
        <div className={`flex flex-col text-left leading-tight ${textClassName}`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-white tracking-wider text-base sm:text-lg drop-shadow-sm">
              TECHNO
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 tracking-widest uppercase">
              OTOPARTS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
            Inventory System
          </span>
        </div>
      )}
    </div>
  );
};
