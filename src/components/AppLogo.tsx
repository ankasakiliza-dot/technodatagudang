import React, { useState } from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'transparent' | 'icon' | 'full';
  className?: string;
  withText?: boolean;
  textClassName?: string;
  showGlow?: boolean;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  variant = 'transparent',
  className = '',
  withText = false,
  textClassName = '',
  showGlow = false,
  alt = 'Techno Otoparts Logo'
}) => {
  const [imageError, setImageError] = useState(false);

  // Source selection based on variant
  const src = variant === 'transparent' 
    ? '/logo-transparent-sm.png'
    : variant === 'badge'
      ? '/logo-badge.jpg'
      : variant === 'icon'
        ? '/logo-icon.png'
        : '/logo.jpg';

  // Dimension mapping
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-9 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-32 w-auto'
  };

  const glowColors = 'shadow-[0_0_25px_rgba(220,38,38,0.35)]';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${showGlow ? glowColors : ''}`}>
        {!imageError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className={`${sizeClasses[size]} object-contain drop-shadow-md transition-transform duration-200 select-none`}
            onError={() => {
              // If transparent fails, fallback to badge jpg
              if (variant === 'transparent') {
                setImageError(true);
              }
            }}
          />
        ) : (
          <img
            src="/logo-badge.jpg"
            alt={alt}
            referrerPolicy="no-referrer"
            className={`${sizeClasses[size]} object-contain rounded-xl border border-red-500/30 shadow-md select-none`}
          />
        )}
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
