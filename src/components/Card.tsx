import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { cn } from '../lib/utils';
import { RARITY_COLORS } from '../constants';
import { Trophy, Award, Sparkles, GraduationCap, Palmtree, MapPin, School } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onRedeem?: (e: React.MouseEvent) => void;
  className?: string;
  isNew?: boolean;
  isLocked?: boolean;
  isExpanded?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, onRedeem, className, isNew, isLocked, isExpanded }) => {
  const Icon = {
    Achievement: GraduationCap,
    Reward: Trophy,
    Collectible: Sparkles,
  }[card.category];
  
  const OriginIcon = card.sourcePackId === 'pack_culiacan' ? Palmtree : 
                     card.sourcePackId === 'pack_jacobo' ? School : MapPin;

  const rarityStyles = {
    Common: {
      outerStyle: "bg-gradient-to-b from-slate-700 to-slate-900 p-[3px] border border-slate-600/50 overflow-hidden",
      innerGlow: "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]",
      glow: "shadow-[0_0_15px_rgba(71,85,105,0.2)]",
      overlay: "from-slate-500/5 to-slate-950/40",
      gem: "bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.6)]",
      effect: null
    },
    Rare: {
      outerStyle: "relative p-[4px] border border-blue-400/50 shadow-[inset_0_0_10px_rgba(59,130,246,0.4)] bg-slate-900 group overflow-hidden [mask-image:linear-gradient(white,white)]",
      innerGlow: "shadow-[inset_0_0_0_1px_rgba(96,165,250,0.5)]",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.5),_0_0_40px_rgba(59,130,246,0.2)]",
      overlay: "from-blue-500/10 to-slate-950/40",
      gem: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]",
      effect: (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/60 via-slate-800 to-blue-700/60" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-300/40 to-transparent block anim-shimmer" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.5)_360deg)] anim-rotate opacity-40 mix-blend-screen" />
        </>
      )
    },
    Epic: {
      outerStyle: "relative p-[6px] border-[2px] border-purple-400/60 shadow-[inset_0_0_15px_rgba(168,85,247,0.5)] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-blend-overlay bg-slate-900 overflow-hidden [mask-image:linear-gradient(white,white)]",
      innerGlow: "shadow-[inset_0_0_0_1px_rgba(192,132,252,0.8)]",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.5),_0_0_50px_rgba(168,85,247,0.25)]",
      overlay: "from-purple-500/15 to-slate-950/40",
      gem: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]",
      effect: (
        <>
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_250deg,rgba(192,132,252,0.8)_305deg,transparent_360deg)] anim-rotate opacity-70 mix-blend-screen" />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(232,121,249,0.8)_360deg)] anim-rotate opacity-40 mix-blend-screen" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/80 via-purple-600/50 to-indigo-500/80 pointer-events-none" />
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none anim-pulse-intense" />
        </>
      )
    },
    Legendary: {
      outerStyle: "relative p-[8px] border-[2px] border-amber-300 shadow-[inset_0_0_20px_rgba(251,191,36,0.7)] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay bg-slate-900 overflow-hidden [mask-image:linear-gradient(white,white)]",
      innerGlow: "shadow-[inset_0_0_0_2px_rgba(251,191,36,0.8)]",
      glow: "shadow-[0_0_35px_rgba(251,191,36,0.6),_0_0_70px_rgba(251,191,36,0.3)]",
      overlay: "from-amber-400/20 via-amber-400/5 to-slate-950/40",
      gem: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
      effect: (
        <>
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_120deg,rgba(251,191,36,0.9)_180deg,transparent_240deg)] anim-rotate mix-blend-screen" />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_180deg,transparent_0_120deg,rgba(245,158,11,0.9)_180deg,transparent_240deg)] anim-rotate mix-blend-screen" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_90deg,transparent_0_150deg,rgba(253,230,138,0.8)_180deg,transparent_210deg)] anim-rotate mix-blend-screen" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-200/50 via-amber-600/50 to-amber-800/80 pointer-events-none" />
          <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none anim-pulse-intense" />
        </>
      )
    },
    Secret: {
      outerStyle: "relative p-[10px] border-[3px] border-rose-300/80 shadow-[inset_0_0_25px_rgba(244,63,94,0.7)] bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-blend-overlay bg-slate-950 overflow-hidden [mask-image:linear-gradient(white,white)]",
      innerGlow: "shadow-[inset_0_0_0_2px_rgba(251,113,133,0.8)]",
      glow: "shadow-[0_0_40px_rgba(244,63,94,0.6),_0_0_80px_rgba(244,63,94,0.3)]",
      overlay: "from-rose-500/25 via-rose-500/5 to-slate-950/40",
      gem: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
      effect: (
        <>
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_90deg,rgba(244,63,94,0.9)_180deg,transparent_270deg)] anim-rotate opacity-80 mix-blend-screen" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_180deg,transparent_0_90deg,rgba(255,255,255,1)_180deg,transparent_270deg)] anim-rotate opacity-90 mix-blend-screen" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/60 via-fuchsia-600/40 to-rose-400/60 pointer-events-none anim-glitch" />
        </>
      )
    }
  }[card.rarity];

  if (isLocked) {
    return (
      <div
        className={cn(
          "relative w-full aspect-[2/3] max-w-[240px] rounded-[1.2rem] transition-all overflow-hidden",
          rarityStyles.outerStyle,
          rarityStyles.glow,
          className
        )}
      >
        <div className={cn(
          "relative w-full h-full bg-slate-950 rounded-[0.9rem] overflow-hidden flex flex-col items-center justify-center",
          rarityStyles.innerGlow
        )}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-slate-800/20" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <span className="text-8xl font-black text-slate-800 select-none animate-pulse z-10">?</span>
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 z-10">
            <div className="h-full bg-slate-800 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        rotateY: 8, 
        rotateX: -2,
        z: 50
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      id={`card-${card.id}`}
      style={{ perspective: "1000px" }}
      className={cn(
        "relative w-full aspect-[2/3] max-w-[240px] rounded-[1.2rem] cursor-pointer transition-shadow duration-500 z-10 font-sans @container",
        rarityStyles.outerStyle,
        rarityStyles.glow,
        className
      )}
    >
      {/* Rarity Background Glow */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-40 blur-2xl -z-10",
        RARITY_COLORS[card.rarity]
      )} />

      {/* Animated Edge Effects */}
      {rarityStyles.effect}

      {/* Main Container */}
      <div className={cn(
        "relative w-full h-full bg-slate-950 rounded-[0.9rem] overflow-hidden flex flex-col z-10",
        rarityStyles.innerGlow,
        card.rarity !== 'Common' && "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/10 after:to-transparent after:skew-x-12 after:-translate-x-[150%] hover:after:translate-x-[150%] after:transition-transform after:duration-[1.5s] after:ease-in-out"
      )}>
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="w-full h-[50%] bg-indigo-500/5 blur-3xl animate-scanline opacity-30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/3px-tile.png')] opacity-[0.03]" />
        </div>

        {/* Image Container */}
        <div className={cn(
          "relative overflow-hidden z-20 w-full",
          (card.rarity === 'Legendary' || card.rarity === 'Secret') ? "absolute inset-0 h-full" : "h-[70%]"
        )}>
          <img
            src={card.imageUrl || `https://placehold.co/400x600/1e293b/818cf8?text=${encodeURIComponent(card.name)}`}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://placehold.co/400x600/1e293b/818cf8?text=${encodeURIComponent(card.name.split(' ').join('+'))}`;
            }}
          />
          
          {/* HUD Brackets */}
          <div className="absolute top-8 left-2 w-4 h-4 border-t-2 border-l-2 border-white/20" />
          <div className="absolute top-8 right-2 w-4 h-4 border-t-2 border-r-2 border-white/20" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/20" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/20" />

          {/* Gradients to blend with text section */}
          <div className={cn("absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent", (card.rarity === 'Legendary' || card.rarity === 'Secret') ? "opacity-90" : "opacity-100 h-1/2 bottom-0 top-auto")} />
          <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20", rarityStyles.overlay)} />
        </div>

        {/* Content - 35% (or 45% expanded) for normal, absolute bottom for legendary/secret */}
        <div className={cn(
          "text-white flex flex-col z-30 transition-all",
           (card.rarity === 'Legendary' || card.rarity === 'Secret') 
             ? cn("absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent", isExpanded ? "p-[6cqw] pt-[18cqw]" : "p-[5cqw] pt-[15cqw]")
             : cn("bg-slate-950 border-t border-white/10", isExpanded ? "h-[45%] px-[6cqw] pb-[5cqw]" : "h-[35%] px-[5cqw] pb-[4cqw]")
        )}>
          <div className="space-y-[0.5cqw]">
            <h3 
              className={cn(
                "font-display font-black leading-[1.1] uppercase tracking-tighter text-balance",
                (card.rarity === 'Legendary' || card.rarity === 'Secret') ? "text-[8cqw]" : "text-[7.5cqw]",
                card.rarity === 'Legendary' && "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-[length:200%_auto] anim-bg-shimmer drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
                card.rarity === 'Secret' && "text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-rose-400 bg-[length:200%_auto] anim-bg-shimmer drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]"
              )}
              data-text={card.name}
            >
              {card.name}
            </h3>
            {card.subject && (
              <div className="flex items-center gap-[1.5cqw]">
                <div className="h-[1px] flex-1 bg-indigo-500/30" />
                <p className="text-[3.5cqw] uppercase font-black text-indigo-400 tracking-[0.2em] whitespace-nowrap">
                  {card.subject}
                </p>
              </div>
            )}
          </div>

          <div className={cn("flex-1 relative mt-[2cqw] flex flex-col", isExpanded ? "justify-start" : "justify-end")}>
            <p className={cn(
              "text-slate-300 font-medium italic mix-blend-screen leading-[1.3]",
              isExpanded ? "text-[5cqw] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-500/50 [&::-webkit-scrollbar-thumb]:rounded-full" : "overflow-hidden text-[4cqw] line-clamp-3 text-ellipsis",
              (card.rarity === 'Legendary' || card.rarity === 'Secret') && !isExpanded && "text-[4.5cqw] mb-[2cqw]"
            )}>
              {card.description}
            </p>
            {/* Bottom HUD including gem and origin icon */}
            <div className={cn("flex items-center gap-[2cqw] mt-auto pt-[1cqw]", (card.rarity === 'Legendary' || card.rarity === 'Secret') ? "mt-[2cqw]" : "")}>
              <div className="flex items-center gap-[1cqw] opacity-60">
                <div className="p-[0.5cqw] rounded bg-white/5 border border-white/10">
                  <OriginIcon className="text-slate-300 w-[3cqw] h-[3cqw]" />
                </div>
              </div>
              
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              
              <div className="flex items-center justify-center">
                <div className={cn("w-[2.5cqw] h-[2.5cqw] rotate-45 animate-pulse", rarityStyles.gem)} />
              </div>
            </div>
          </div>

          {card.isRedeemable && onRedeem && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRedeem(e);
              }}
              className="relative mt-[2cqw] w-full py-[2.5cqw] bg-indigo-500 hover:bg-indigo-400 text-white text-[3.5cqw] font-black uppercase tracking-[0.2em] rounded-[1.5cqw] shadow-lg transition-all overflow-hidden group/btn"
            >
              <span className="relative z-10">Canjear</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
            </button>
          )}
        </div>
      </div>

      {/* New Label - Glitch Style */}
      {isNew && (
        <div className="absolute -top-1 -right-1 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest -rotate-2 shadow-[0_0_20px_rgba(244,63,94,0.6)] z-40 border-2 border-white animate-glitch uppercase">
          NUEVA DATA
        </div>
      )}
    </motion.div>
  );
};
