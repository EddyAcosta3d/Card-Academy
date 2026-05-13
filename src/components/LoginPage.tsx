import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, Users, Zap, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedRole) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onLogin(selectedRole);
      setIsLoading(false);
    }, 1500);
  };

  const roles = [
    {
      id: 'Student' as UserRole,
      title: 'Estudiante',
      desc: 'Accede a tus misiones y álbum de cartas.',
      icon: GraduationCap,
      color: 'from-emerald-400 to-cyan-600',
      border: 'border-emerald-500/30'
    },
    {
      id: 'Teacher' as UserRole,
      title: 'Docente',
      desc: 'Gestiona grupos y valida misiones académicas.',
      icon: Users,
      color: 'from-indigo-400 to-purple-600',
      border: 'border-indigo-500/30'
    },
    {
      id: 'Admin' as UserRole,
      title: 'Administrador',
      desc: 'Control total del sistema y bases de datos.',
      icon: ShieldCheck,
      color: 'from-amber-400 to-rose-600',
      border: 'border-amber-500/30'
    }
  ];

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-2 relative z-10">
        {/* Top: Branding */}
        <div className="space-y-2 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
          >
            <Zap className="text-indigo-400" size={14} />
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em]">Protocolo v2.0 Iniciado</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <Logo 
              size="lg" 
            />
          </motion.div>
        </div>

        {/* Bottom: Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-5 lg:p-8 shadow-2xl relative w-full"
        >

          <div className="relative z-10 space-y-4 lg:space-y-6">
            <div className="text-center hidden sm:block">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Selecciona tu perfil de acceso</p>
            </div>

            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl lg:rounded-3xl border transition-all relative overflow-hidden group text-left",
                    selectedRole === role.id 
                      ? cn("bg-slate-800", role.border) 
                      : "border-transparent bg-slate-800/40 hover:bg-slate-800/60"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg relative z-10",
                    role.color
                  )}>
                    <role.icon size={24} />
                  </div>
                  <div className="relative z-10">
                    <p className={cn(
                      "font-black uppercase tracking-tight italic transition-colors",
                      selectedRole === role.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}>{role.title}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{role.desc}</p>
                  </div>
                  {selectedRole === role.id && (
                    <motion.div 
                      layoutId="role-indicator"
                      className="absolute right-6"
                    >
                      <Sparkles className="text-indigo-400" size={16} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3 lg:space-y-4 pt-1 lg:pt-2">
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  placeholder="CONTRASEÑA DE ACCESO"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 lg:py-4 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                />
              </div>

              <button 
                onClick={handleLogin}
                disabled={!selectedRole || isLoading}
                className={cn(
                  "w-full py-3 lg:py-4 rounded-[2rem] font-black text-base lg:text-lg uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group",
                  selectedRole 
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Iniciando...</span>
                  </div>
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] pointer-events-none">
        Card Academy • 2026
      </div>
    </div>
  );
};
