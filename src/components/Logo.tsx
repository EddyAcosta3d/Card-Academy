import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: React.ReactNode;
}

export const Logo: React.FC<LogoProps & { hideTextOnMobile?: boolean }> = ({ className, size = 'md', showText = true, subtitle, hideTextOnMobile }) => {
  const sizes = {
    xs: { icon: 16, container: 'w-6 h-6', text: 'text-base' },
    sm: { icon: 20, container: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 26, container: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 32, container: 'w-16 h-16', text: 'text-3xl' },
    xl: { icon: 48, container: 'w-32 h-32', text: 'text-5xl md:text-6xl' },
  };

  const current = sizes[size];

  return (
    <div className={cn("flex items-center gap-3 md:gap-4", className)}>
      <div className={cn("relative group shrink-0", current.container)}>
        
        {/* Core floating icon container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.08 }}
            className="relative z-20 w-full h-full"
          >
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
            >
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan 400 */}
                  <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia 500 */}
                </linearGradient>
                <linearGradient id="neonGradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#d946ef" stopOpacity="0.3"/>
                </linearGradient>
              </defs>

              {/* Background ambient glow behind the logo */}
              <circle cx="50" cy="50" r="30" fill="url(#neonGradientFill)" className="blur-[12px]" />

              {/* Card Background */}
              <rect x="22" y="10" width="56" height="80" rx="8" fill="url(#neonGradientFill)" opacity="0.5" />

              {/* Card Outline */}
              <rect x="22" y="10" width="56" height="80" rx="8" stroke="url(#neonGradient)" strokeWidth="6" />

              {/* Inner 'A' */}
              <path 
                d="M 50 28 L 35 68 M 50 28 L 65 68 M 41 53 L 59 53" 
                stroke="white" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Sparkles */}
              <path d="M 10 35 L 11.5 39.5 L 16 41 L 11.5 42.5 L 10 47 L 8.5 42.5 L 4 41 L 8.5 39.5 Z" className="fill-cyan-300" opacity="0.9" />
              <path d="M 90 60 L 91 63 L 94 64 L 91 65 L 90 68 L 89 65 L 86 64 L 89 63 Z" className="fill-fuchsia-300" opacity="0.9" />
              <path d="M 80 15 L 81 18 L 84 19 L 81 20 L 80 23 L 79 20 L 76 19 L 79 18 Z" className="fill-white" opacity="0.8" />
            </svg>
          </motion.div>
        </div>
      </div>

      {showText && (
        <div className={cn("flex flex-col relative z-20", hideTextOnMobile && "hidden sm:flex")}>
          <h1 className={cn("font-black tracking-tighter leading-none uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-sm", current.text)}>
            Card <span className="font-black text-white">Academy</span>
          </h1>
          {subtitle && (
            <div className="absolute top-[90%] left-[2px] mt-1 whitespace-nowrap font-medium text-slate-300">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
