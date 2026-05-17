import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Challenge } from '../types';
import { CheckCircle2, XCircle, Timer, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

interface DailyChallengeProps {
  challenge: Challenge;
  onComplete: (correct: boolean) => void;
  isCompleted?: boolean;
  userRole?: string;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ challenge, onComplete, isCompleted, userRole }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [challenge.id]);

  const handleSubmit = () => {
    if (selectedOption === null || isCompleted) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete(selectedOption === challenge.correctAnswer);
    }, 1500);
  };

  const effectivelySubmitted = isSubmitted || isCompleted;

  return (
    <div className="w-full relative group">
      <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 text-indigo-500">
        <Brain size={120} className="sm:w-[160px] sm:h-[160px]" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 px-4 py-6 sm:p-4">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 bg-indigo-500/10 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-indigo-500/20">
            <Brain className="text-indigo-400" size={14} />
            <span className="text-[10px] sm:text-xs font-black text-cyan-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{challenge.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] sm:text-xs tracking-widest uppercase">
             {isCompleted ? (
               <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={12} /> Misión Cumplida</span>
             ) : (
               <>
                 <Timer size={12} />
                 <span>Ciclo Diario</span>
               </>
             )}
          </div>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-slate-100 mb-6 sm:mb-10 leading-tight italic tracking-tighter">
          {challenge.question}
        </h2>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
          {challenge.options.map((option, idx) => {
            const isSelected = selectedOption === idx || (isCompleted && idx === challenge.correctAnswer);
            const isCorrect = idx === challenge.correctAnswer;
            
            return (
              <motion.button
                key={idx}
                disabled={effectivelySubmitted}
                whileHover={!effectivelySubmitted ? { scale: 1.01, x: 4 } : {}}
                whileTap={!effectivelySubmitted ? { scale: 0.99 } : {}}
                onClick={() => setSelectedOption(idx)}
                className={cn(
                  "w-full text-left p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between group/opt shadow-lg",
                  !effectivelySubmitted && !isSelected && "border-slate-800 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800",
                  !effectivelySubmitted && isSelected && "border-indigo-500 bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]",
                  effectivelySubmitted && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold",
                  effectivelySubmitted && isSelected && !isCorrect && "border-red-500 bg-red-500/10 text-red-400",
                  effectivelySubmitted && !isCorrect && !isSelected && "opacity-20 grayscale scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-3 sm:gap-5">
                  <span className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm",
                    !isSelected ? "bg-slate-700/50 text-slate-400" : "bg-white/20 text-white"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-lg font-medium leading-tight">{option}</span>
                </div>
                
                <AnimatePresence>
                  {isSubmitted && isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="text-emerald-500 w-4 h-4 sm:w-auto sm:h-auto" />
                    </motion.div>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <XCircle className="text-red-500 w-4 h-4 sm:w-auto sm:h-auto" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>


        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 1 }}
          onClick={handleSubmit}
          disabled={selectedOption === null || effectivelySubmitted}
          className={cn(
            "w-full py-4 sm:py-5 rounded-xl sm:rounded-[2rem] font-black text-lg sm:text-xl uppercase tracking-widest transition-all shadow-2xl mt-4",
            selectedOption !== null && !effectivelySubmitted
              ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.4)]"
              : isCompleted 
                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
          )}
        >
          {isCompleted ? 'OBJETIVO FINALIZADO' : isSubmitted ? 'Sincronizando...' : 'Verificar Datos'}
        </motion.button>

        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-6 text-center"
          >
            <p className="text-[10px] sm:text-sm font-bold text-slate-400 mb-2 sm:mb-4 uppercase tracking-widest leading-relaxed">
              Vuelve mañana para una nueva misión.<br/>
              <span className="text-[8px] sm:text-[10px] opacity-70">Los datos del Nexo se actualizan en 24h.</span>
            </p>
          </motion.div>
        )}

        {userRole === 'Student' && (
          <div className="mt-6 sm:mt-8 text-center pb-4 sm:pb-0">
            <p className="text-[8px] sm:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Recompensa de Sector: <span className="text-amber-500">+{challenge.tokenReward} Medallas</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
