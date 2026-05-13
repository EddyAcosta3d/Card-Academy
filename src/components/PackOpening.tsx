import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './Card';
import { Card as CardType, Pack } from '../types';
import confeti from 'canvas-confetti';
import { PackageOpen, Sparkles, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { playTearSound, playSuccessSound } from '../lib/sounds';

interface PackOpeningProps {
  pack: Pack;
  onCardsDrawn: (cards: CardType[], packId: string) => void;
  availableCards: CardType[];
  onClose: () => void;
  ownedCardIds: string[];
}

// Move this inside the PackOpening file but outside the main component, or just define it as a helper component.
const PackContent: React.FC<{ pack: Pack }> = ({ pack }) => {
  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-8 sm:h-12 bg-black/20 border-b border-white/20 z-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)",
        }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-full h-8 sm:h-12 bg-black/20 border-t border-white/20 z-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)",
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-70 z-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3),transparent_60%)] z-10 pointer-events-none mix-blend-overlay"></div>

      <img
        src={
          pack.id === "pack_jacobo"
            ? "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop"
            : pack.id === "pack_culiacan"
              ? "https://upload.wikimedia.org/wikipedia/commons/4/4e/Vista_panor%C3%A1mica_de_Culiac%C3%A1n.jpg"
              : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop"
        }
        alt={pack.name}
        draggable={false}
        className="absolute inset-[10px] sm:inset-4 top-[40px] sm:top-[60px] bottom-[40px] sm:bottom-[60px] w-[calc(100%-20px)] sm:w-[calc(100%-32px)] h-[calc(100%-80px)] sm:h-[calc(100%-120px)] object-cover rounded-md opacity-90 border border-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"
      />

      <div className="absolute inset-[10px] sm:inset-4 top-[40px] sm:top-[60px] bottom-[40px] sm:bottom-[60px] bg-gradient-to-t from-black/90 via-black/20 to-black/30 rounded-md pointer-events-none" />

      <div className="absolute top-[60px] sm:top-[80px] left-1/2 -translate-x-1/2 w-full text-center z-20 px-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pointer-events-none">
        <span
          className={cn(
            "text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none block",
            pack.id === "pack_jacobo"
              ? "text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
              : pack.id === "pack_culiacan"
                ? "text-indigo-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                : "text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]",
          )}
        >
          {pack.name.replace(
            /^Sobrecitos (de )?/i,
            "",
          )}
        </span>
      </div>
    </>
  );
};

export const PackOpening: React.FC<PackOpeningProps> = ({ pack, onCardsDrawn, availableCards, onClose, ownedCardIds }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [drawnCards, setDrawnCards] = useState<CardType[]>([]);
  const [currentStep, setCurrentStep] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (currentStep === 'revealed' && drawnCards.length > 0 && drawnCards[activeCardIndex]) {
      const rarity = drawnCards[activeCardIndex].rarity;
      if (rarity === 'Secret' || rarity === 'Legendary' || rarity === 'Epic' || rarity === 'Rare') {
        import('../lib/sounds').then(m => m.playSuccessSound());
        
        if (rarity === 'Secret') {
          confeti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#e11d48', '#ffffff', '#fb7185']
          });
        } else if (rarity === 'Legendary') {
          confeti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#ffffff']
          });
        } else if (rarity === 'Epic') {
          confeti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#7e22ce', '#ffffff']
          });
        }
      }
    }
  }, [activeCardIndex, currentStep, drawnCards]);

  const advanceCard = (swipeDir: number) => {
    if (activeCardIndex < drawnCards.length - 1) {
      const nextIndex = activeCardIndex + 1;
      setDirection(swipeDir);
      setActiveCardIndex(nextIndex);
    }
  };

  const openPack = () => {
    setIsOpening(true);
    setCurrentStep('opening');

    // Inicializar el contexto de audio en el evento síncrono del click
    // para que no haya problemas de autoplay en navegadores en el timeout
    import('../lib/sounds').then(m => m.playTearSound(true));

    // Reproducir sonido de rasgar sobre sintetizado exactamente cuando se rompe
    setTimeout(() => {
      import('../lib/sounds').then(m => m.playTearSound());
    }, 500);

    // Simulate opening delay
    setTimeout(() => {
      const newCards: CardType[] = [];
      const { rarities, cardsCount } = pack;

      for (let i = 0; i < cardsCount; i++) {
        const rand = Math.random() * 100;
        let selectedRarity: CardType['rarity'] = 'Common';
        
        const secretProb = rarities.secret || 0;
        const legendaryProb = rarities.legendary;
        const epicProb = rarities.epic;
        const rareProb = rarities.rare;

        if (rand < secretProb) {
          selectedRarity = 'Secret';
        } else if (rand < secretProb + legendaryProb) {
          selectedRarity = 'Legendary';
        } else if (rand < secretProb + legendaryProb + epicProb) {
          selectedRarity = 'Epic';
        } else if (rand < secretProb + legendaryProb + epicProb + rareProb) {
          selectedRarity = 'Rare';
        } else {
          selectedRarity = 'Common';
        }

        const packCards = availableCards.filter(c => c.sourcePackId === pack.id || (!c.sourcePackId && c.category === 'Collectible'));
        const filteredPool = packCards.filter(c => c.rarity === selectedRarity);
        if (filteredPool.length > 0) {
           newCards.push(filteredPool[Math.floor(Math.random() * filteredPool.length)]);
        } else {
           // Fallback to any card of same rarity if pack-specific pool is empty
           const genericPool = availableCards.filter(c => c.rarity === selectedRarity);
           if (genericPool.length > 0) {
             newCards.push(genericPool[Math.floor(Math.random() * genericPool.length)]);
           } else {
             const betterFallback = availableCards.filter(c => c.rarity !== 'Secret');
             newCards.push(betterFallback[Math.floor(Math.random() * betterFallback.length)]);
           }
        }
      }

      setDrawnCards(newCards);
      setCurrentStep('revealed');

      // We DO NOT call onCardsDrawn here, we call it when they collect the cards
    }, 1500);
  };

  const getPackClassPrefix = (packId: string) => {
    if (packId === "pack_jacobo") return "bg-gradient-to-b from-slate-400 via-slate-600 to-slate-900 border-2 sm:border-4 border-slate-400/50";
    if (packId === "pack_culiacan") return "bg-gradient-to-b from-indigo-400 via-indigo-600 to-indigo-900 border-2 sm:border-4 border-indigo-400/50";
    return "bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 border-2 sm:border-4 border-amber-400/50";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl">
      <AnimatePresence mode="wait">
        {currentStep === 'idle' && (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="flex flex-col items-center justify-center w-full max-w-sm px-6"
          >
            <div className="relative group cursor-pointer" onClick={openPack}>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -1, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className={cn(
                  "w-56 h-[320px] sm:w-[320px] sm:h-[460px] rounded-2xl sm:rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center relative overflow-hidden bg-slate-800 transition-transform duration-500 hover:scale-105",
                  getPackClassPrefix(pack.id)
                )}
              >
                <PackContent pack={pack} />

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-30" />
              </motion.div>
              <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <p className="mt-12 text-slate-500 font-bold animate-pulse uppercase tracking-[0.4em] text-[10px]">
              Toca para descifrar suministros
            </p>
          </motion.div>
        )}

        {currentStep === 'opening' && (
          <motion.div
            key="opening"
            className="flex flex-col items-center justify-center relative w-full h-full"
          >
            <div className="relative w-56 h-[320px] sm:w-[320px] sm:h-[460px] flex justify-center">
              {/* The cards sliding out */}
              {drawnCards[0] && (
                <motion.div
                   initial={{ y: 0, opacity: 0, scale: 0.8 }}
                   animate={{ y: -300, opacity: [0, 1, 1, 0], scale: 1 }}
                   transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                   className="absolute z-10 w-48 sm:w-64 top-0"
                >
                   <CardComponent card={drawnCards[0]} />
                </motion.div>
              )}

              {/* Cut line flash */}
              <motion.div
                 initial={{ scaleX: 0, opacity: 0 }}
                 animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                 transition={{ delay: 0.5, duration: 0.3 }}
                 className="absolute top-[18%] -mt-[3px] w-[150%] h-1.5 bg-white blur-[2px] shadow-[0_0_20px_rgba(255,255,255,1)] z-40 transform origin-center"
              />

              {/* Top part of pack (Cut off) */}
              <motion.div
                 initial={{ y: 0, x: 0, rotate: 0 }}
                 animate={{ y: -200, x: 100, rotate: 45, opacity: 0 }}
                 transition={{ delay: 0.8, duration: 0.6, ease: "easeIn" }}
                 className={cn("absolute inset-0 z-30 w-full h-full rounded-2xl sm:rounded-3xl shadow-[0_0_120px_rgba(79,70,229,0.8)] overflow-hidden", getPackClassPrefix(pack.id))}
                 style={{ clipPath: "polygon(0 0, 100% 0, 100% 18%, 0 18%)" }}
              >
                 <PackContent pack={pack} />
              </motion.div>
              
              {/* Bottom part of pack */}
              <motion.div
                 initial={{ y: 0, opacity: 1, scale: 1 }}
                 animate={{ y: [0, 10, 0, 50], opacity: [1, 1, 1, 0], scale: [1, 0.95, 1, 0.9] }}
                 transition={{ delay: 0.8, duration: 1.5, times: [0, 0.2, 0.5, 1] }}
                 className={cn("absolute inset-0 z-20 w-full h-full rounded-2xl sm:rounded-3xl shadow-[0_0_120px_rgba(79,70,229,0.8)] overflow-hidden", getPackClassPrefix(pack.id))}
                 style={{ clipPath: "polygon(0 18%, 100% 18%, 100% 100%, 0 100%)" }}
              >
                 <PackContent pack={pack} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentStep === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden py-10"
          >
            {/* Background Stack - Removed since swipe now only shows one card at a time with the next behind in AnimatePresence logic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
               {/* No stack */}
            </div>

            {/* Rarity Reveal Flash / Glow */}
            <AnimatePresence>
              {(drawnCards[activeCardIndex].rarity !== 'Common') && (
                <motion.div
                  key={`glow-${activeCardIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0, 1, 0.5],
                    scale: [0.8, 1.2, 1],
                  }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                >
                  <div 
                    className="w-full max-w-[500px] aspect-square rounded-full blur-[120px] mix-blend-screen animate-pulse"
                    style={{ 
                      backgroundColor: drawnCards[activeCardIndex].rarity === 'Secret' ? 'rgba(244, 63, 94, 0.4)' :
                                      drawnCards[activeCardIndex].rarity === 'Legendary' ? 'rgba(234, 179, 8, 0.4)' :
                                      drawnCards[activeCardIndex].rarity === 'Epic' ? 'rgba(168, 85, 247, 0.3)' :
                                      'rgba(56, 189, 248, 0.2)' 
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Status */}
            <div className="absolute top-10 left-0 w-full px-6 sm:px-10 flex justify-between items-center z-20">
               <div className="space-y-1">
                 <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Revelando Activos</p>
                 <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
                   {activeCardIndex + 1} <span className="text-slate-600 italic">/</span> {drawnCards.length}
                 </h2>
               </div>
               <div className="flex gap-1.5">
                 {drawnCards.map((_, i) => (
                   <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === activeCardIndex ? "w-6 sm:w-8 bg-indigo-500" : i < activeCardIndex ? "w-3 sm:w-4 bg-indigo-900" : "w-1 bg-slate-800")} />
                 ))}
               </div>
            </div>

            <div className="relative w-full flex-1 max-h-[65vh] min-h-[380px] sm:max-h-[none] sm:h-[600px] md:h-[700px] flex items-center justify-center mt-12 sm:mt-0 perspective-1000">

               {/* Next Card underneath */}
               {activeCardIndex < drawnCards.length - 1 && (
                 <div className="absolute w-full h-full flex items-center justify-center pointer-events-none z-10 px-4">
                   <div className="w-full h-full max-h-full max-w-[calc(65vh*0.66)] sm:max-w-[400px] md:max-w-[480px] relative flex items-center justify-center brightness-[0.7] transform scale-[0.95]">
                     <CardComponent card={drawnCards[activeCardIndex + 1]} isNew={!ownedCardIds.includes(drawnCards[activeCardIndex + 1].id) && drawnCards.findIndex(c => c.id === drawnCards[activeCardIndex + 1].id) === activeCardIndex + 1} />
                   </div>
                 </div>
               )}

              <AnimatePresence initial={false} custom={direction}>
                 <motion.div
                    key={activeCardIndex}
                    custom={direction}
                    variants={{
                      enter: { opacity: 1, scale: 0.95, y: 0, x: 0, filter: "brightness(0.7)", zIndex: 10 },
                      center: { opacity: 1, scale: 1, y: 0, x: 0, filter: "brightness(1)", zIndex: 20 },
                      exit: (dir: number) => ({
                        opacity: 0,
                        scale: 1,
                        x: dir === 1 ? -800 : 800,
                        rotateZ: dir === 1 ? -20 : 20,
                        zIndex: 20
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ 
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.3 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, info) => {
                      const swipe = info.offset.x;
                      if ((swipe < -70 || swipe > 70) && activeCardIndex < drawnCards.length - 1) {
                         advanceCard(swipe < 0 ? 1 : -1);
                      }
                    }}
                    className="cursor-grab active:cursor-grabbing touch-none px-4 flex justify-center w-full h-full absolute items-center z-20"
                  >
                    <div className="w-full h-full max-h-full max-w-[calc(65vh*0.66)] sm:max-w-[400px] md:max-w-[480px] relative flex items-center justify-center">
                      {/* Interactive shine overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-white/20 blur-xl rounded-[2rem] z-20 pointer-events-none mix-blend-overlay"
                        style={{ opacity: 0.3 }}
                      />
                      <CardComponent 
                        card={drawnCards[activeCardIndex]} 
                        isNew={!ownedCardIds.includes(drawnCards[activeCardIndex].id) && drawnCards.findIndex(c => c.id === drawnCards[activeCardIndex].id) === activeCardIndex} 
                      />
                    </div>
                  </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8 px-6">
              <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px] flex items-center gap-2 text-center">
                {activeCardIndex < drawnCards.length - 1 ? (
                  <>Desliza para continuar <Sparkles size={12} className="text-indigo-500" /></>
                ) : (
                  <>Suministros extraídos con éxito <ShoppingBag size={12} className="text-emerald-500" /></>
                )}
              </p>

              <motion.button
                initial={false}
                animate={{ 
                  scale: activeCardIndex < drawnCards.length - 1 ? 0.9 : 1,
                  opacity: activeCardIndex < drawnCards.length - 1 ? 0.4 : 1
                }}
                disabled={activeCardIndex < drawnCards.length - 1}
                onClick={() => {
                  onCardsDrawn(drawnCards, pack.id);
                  onClose();
                }}
                className={cn(
                  "px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black text-xl sm:text-2xl transition-all shadow-2xl uppercase tracking-tighter italic border-b-4",
                  activeCardIndex < drawnCards.length - 1 
                    ? "bg-slate-800 text-slate-500 border-slate-900 pointer-events-none" 
                    : "bg-white text-indigo-950 border-slate-300 hover:bg-slate-100 hover:scale-[1.02] active:scale-95"
                )}
              >
                Coleccionar Todo
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
