import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Sparkles, AlertCircle } from "lucide-react";
import { Card as CardType, Pack } from "../types";
import { Card as CardComponent } from "./Card";
import { cn } from "../lib/utils";

interface StickerAlbumProps {
  collection: string[];
  animatingCards: string[];
  cards: CardType[];
  packs: Pack[];
  onAnimationsComplete: () => void;
  onRedeemReward?: (card: CardType) => void;
  role: string | undefined;
}

export const StickerAlbum: React.FC<StickerAlbumProps> = ({
  collection,
  animatingCards = [],
  cards,
  packs,
  onAnimationsComplete,
  onRedeemReward,
  role,
}) => {
  const [activePackId, setActivePackId] = useState<string>(packs[0]?.id || "");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"Collectible" | "Achievement" | "Reward">("Collectible");
  const [sortByRarity, setSortByRarity] = useState<boolean>(false);

  const [currentlyDroppingCardId, setCurrentlyDroppingCardId] = useState<string | null>(null);

  React.useEffect(() => {
    if (animatingCards.length > 0) {
      let isMounted = true;

      const sequence = async () => {
        // Find if we need to change active pack based on first card
        const firstCard = cards.find((c) => animatingCards[0] === c.id);
        let currentPackId = firstCard?.sourcePackId;
        let currentTab: "Collectible" | "Achievement" | "Reward" = firstCard?.category || "Collectible";
        
        if (currentPackId) {
          setActivePackId(currentPackId);
        }
        setActiveTab(currentTab);

        // Wait a bit for album to be visible
        await new Promise((r) => setTimeout(r, 800));

        for (let i = 0; i < animatingCards.length; i++) {
          if (!isMounted) return;
          const cardId = animatingCards[i];
          const card = cards.find(c => c.id === cardId);

          if (card) {
            let changed = false;
            
            if (card.category && card.category !== currentTab) {
              currentTab = card.category;
              setActiveTab(currentTab);
              changed = true;
            }

            if (card.sourcePackId && card.sourcePackId !== currentPackId) {
              currentPackId = card.sourcePackId;
              setActivePackId(currentPackId);
              changed = true;
            }
            
            if (changed) {
              // Wait for DOM to render the pack cards
              await new Promise((r) => setTimeout(r, 200));
            }
          }

          // Scroll to the slot
          const slotElement = document.getElementById(`slot-${cardId}`);
          if (slotElement) {
            slotElement.scrollIntoView({ behavior: "smooth", block: "center" });
            await new Promise((r) => setTimeout(r, 500)); // wait for scroll to finish
          }

          setCurrentlyDroppingCardId(cardId);
          
          // wait for drop animation
          await new Promise((r) => setTimeout(r, 1200));
        }

        // small delay before exiting animation sequence
        await new Promise((r) => setTimeout(r, 600));
        
        if (isMounted) {
          setCurrentlyDroppingCardId(null);
          onAnimationsComplete();
        }
      };

      sequence();

      return () => {
        isMounted = false;
      };
    }
  }, [animatingCards, cards, onAnimationsComplete]);

  const packCards = cards.filter((c) => c.sourcePackId === activePackId && c.category === "Collectible");
  const achievements = cards.filter((c) => c.category === "Achievement");
  const rewards = cards.filter((c) => c.category === "Reward");

  const getCardsToDisplay = () => {
    let list = packCards;
    if (activeTab === "Achievement") list = achievements;
    else if (activeTab === "Reward") list = rewards;

    if (sortByRarity) {
      const rarityRank: Record<string, number> = {
        Secret: 5,
        Legendary: 4,
        Epic: 3,
        Rare: 2,
        Common: 1,
      };
      return [...list].sort((a, b) => {
        const rarityDiff = (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
        if (rarityDiff !== 0) return rarityDiff;
        const aOwned = collection.includes(a.id) ? 1 : 0;
        const bOwned = collection.includes(b.id) ? 1 : 0;
        if (bOwned !== aOwned) return bOwned - aOwned;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  };

  const displayCards = getCardsToDisplay();

  const totalCards = displayCards.length;
  const ownedCards = displayCards.filter((c) => collection.includes(c.id)).length;
  const progressPercent = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;

  const getProgressBarColor = (percent: number) => {
    if (percent < 30) return "bg-rose-500";
    if (percent < 70) return "bg-amber-500";
    if (percent < 100) return "bg-indigo-500";
    return "bg-emerald-500";
  };

  const handleCardClick = (cardId: string) => {
    // If it's still animating, don't let it open detail view
    if (animatingCards.includes(cardId)) return;

    if (collection.includes(cardId) || role === "Teacher") {
      setSelectedCardId(cardId);
    }
  };

  const selectedCardContent = cards.find(c => c.id === selectedCardId);

  return (
    <div className="space-y-4 md:space-y-6 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Tab Selection */}
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-slate-900 border border-slate-800 rounded-[1.25rem] p-1 gap-1 shadow-xl block-shrink-0">
          {[
            { label: "Colección", value: "Collectible", color: "text-indigo-400 bg-indigo-500/15" },
            { label: "Logros", value: "Achievement", color: "text-emerald-400 bg-emerald-500/15" },
            { label: "Canjeables", value: "Reward", color: "text-amber-400 bg-amber-500/15" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex-1 md:flex-none whitespace-nowrap",
                activeTab === tab.value
                  ? tab.color + " shadow-sm"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pages selector for Collection */}
        {activeTab === "Collectible" && (
          <div className="w-full md:w-auto flex-1 bg-slate-900 rounded-[2rem] border border-slate-800 p-2 shadow-xl overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {packs.map((pack) => {
                // Determine colors based on pack ID
                let activeColors = "bg-slate-800 text-white border-slate-600 shadow-md transform scale-105";
                let inactiveColors = "text-slate-500 hover:bg-slate-800/50 border-transparent";
                let gradient = "from-slate-500/20 to-slate-400/20";
                
                if (pack.id === "pack_culiacan") {
                  activeColors = "bg-indigo-900 text-white border-indigo-500 shadow-indigo-900/50 transform scale-105";
                  inactiveColors = "text-indigo-500 hover:bg-indigo-900/20 border-transparent hover:text-indigo-400";
                  gradient = "from-indigo-500/30 to-purple-500/30";
                } else if (pack.id !== "pack_jacobo") {
                  // assume amber for pack_six_seven
                  activeColors = "bg-amber-900 text-white border-amber-500 shadow-amber-900/50 transform scale-105";
                  inactiveColors = "text-amber-500 hover:bg-amber-900/20 border-transparent hover:text-amber-400";
                  gradient = "from-amber-500/30 to-orange-500/30";
                }

                return (
                <button
                  key={pack.id}
                  onClick={() => setActivePackId(pack.id)}
                  className={cn(
                    "flex-1 md:flex-none min-w-0 md:min-w-[120px] px-2 md:px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-xs transition-all relative overflow-hidden border",
                    activePackId === pack.id ? activeColors : inactiveColors
                  )}
                >
                  {activePackId === pack.id && (
                    <div className={cn("absolute inset-0 bg-gradient-to-r mix-blend-overlay", gradient)}></div>
                  )}
                  <span className="relative z-10 break-words line-clamp-2 md:line-clamp-none">{pack.name.replace(/^Sobrecitos (de )?/i, "")}</span>
                </button>
              )})}
            </div>
          </div>
        )}
      </div>

      {/* Album Page Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-4 sm:p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px]">
        {/* Book spine simulation */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-slate-950 to-transparent z-0 opacity-50 flex flex-col justify-evenly">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-full h-px bg-slate-800/50"></div>
          ))}
        </div>
        
        <div className="absolute top-0 right-0 p-6 pointer-events-none z-0">
          <BookOpen size={120} className="text-slate-800/20 opacity-20" />
        </div>

        <div className="relative z-10 space-y-4 ml-4 md:ml-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Left side empty or we can just float the controls */}
            <div className="flex-1"></div>

            <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end">
              <button
                onClick={() => setSortByRarity(!sortByRarity)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                  sortByRarity 
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                )}
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">{sortByRarity ? "Ordenar Normal" : "Ordenar por Rareza"}</span>
                <span className="inline sm:hidden">{sortByRarity ? "Normal" : "Rareza"}</span>
              </button>

              <div className="flex flex-col gap-1 w-32 sm:w-48">
                <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Progreso</span>
                  <span className="text-white">{ownedCards}/{totalCards}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full transition-colors duration-500", getProgressBarColor(progressPercent))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
            <AnimatePresence mode="popLayout">
              {displayCards.map((card, idx) => {
                const isOwned = collection.includes(card.id) || role === "Teacher";
                const isAnimatingIdInArray = animatingCards.includes(card.id);
                // The card should only drop if currentlyDroppingCardId is this card or it has already dropped in previous iterations
                // Actually, if it's in the animatingCards array, we consider it animating (invisible at first, then drops)
                const isWaitingToDrop = isAnimatingIdInArray && animatingCards.indexOf(card.id) > animatingCards.indexOf(currentlyDroppingCardId || "");
                const isCurrentlyDropping = currentlyDroppingCardId === card.id;
                const hasDropped = isAnimatingIdInArray && animatingCards.indexOf(card.id) < animatingCards.indexOf(currentlyDroppingCardId || "");
                
                if (card.rarity === "Secret" && !isOwned && !isAnimatingIdInArray) return null;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    key={`slot-${card.id}`} 
                    id={`slot-${card.id}`} 
                    className={cn("w-full relative group", isAnimatingIdInArray ? "z-50" : "z-10")}
                  >
                    {/* Placeholder space indicating it's an album slot */}
                    <div className="absolute inset-0 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center opacity-50 z-0 overflow-hidden">
                      <span className="text-slate-700 font-black text-4xl opacity-20 italic">#{idx + 1}</span>
                      <p className="text-[8px] font-bold text-slate-600 tracking-widest uppercase mt-2 px-4 text-center">
                        {card.rarity}
                      </p>
                    </div>

                    <motion.div
                      layoutId={`card-${card.id}`}
                      initial={isAnimatingIdInArray ? { opacity: 0, scale: 2, y: -400, rotateZ: 10 } : { opacity: 0, y: 20 }}
                      animate={
                        isAnimatingIdInArray 
                          ? (isCurrentlyDropping || hasDropped ? { opacity: 1, scale: 1, y: 0, rotateZ: 0 } : { opacity: 0, scale: 2, y: -400, rotateZ: 10 }) 
                          : { opacity: 1, y: 0 }
                      }
                      transition={
                        isAnimatingIdInArray
                          ? { type: "spring", stiffness: 100, damping: 15 } 
                          : { delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }
                      }
                      className="relative z-10 w-full"
                    >
                      <div 
                        className={cn(
                          "relative z-10 transition-all duration-300",
                          !isOwned ? "opacity-20 grayscale" : "",
                          isOwned && !isAnimatingIdInArray ? "cursor-pointer hover:scale-105" : ""
                        )}
                        onClick={() => handleCardClick(card.id)}
                      >
                        {(isCurrentlyDropping || hasDropped) && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-3 -right-3 z-30 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300 animate-pulse"
                          >
                            ¡Nueva!
                          </motion.div>
                        )}
                          
                          <CardComponent
                            card={card}
                            isLocked={!isOwned}
                            onClick={() => {}}
                            onRedeem={() => {
                              if (card.category === "Reward" && role === "Student" && onRedeemReward) {
                                onRedeemReward(card);
                              }
                            }}
                          />
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {displayCards.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <AlertCircle size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-[0.3em]">
                  Aún no hay cartas para esta sección
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCardId && selectedCardContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedCardId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center justify-center"
            >
              <div className="w-full flex justify-center items-center">
                <CardComponent card={selectedCardContent} isLocked={false} isExpanded={true} className="max-w-[280px] sm:max-w-[320px] w-full" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
