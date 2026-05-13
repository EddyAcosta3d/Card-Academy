import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, Users, Zap, Sparkles, Lock, ArrowRight, User } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Demo roles
  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(role);
      setIsLoading(false);
    }, 800);
  };

  const handleAuth = async (action: 'signin' | 'signup') => {
    if (!username || !password) {
      setErrorMsg('Por favor ingresa usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    const supabaseEmail = `${username.trim().toLowerCase()}@cardacademy.demo.app`;

    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: supabaseEmail,
          password,
        });
        if (error) throw error;
        setErrorMsg('¡Registro exitoso! Ahora puedes iniciar sesión.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: supabaseEmail,
          password,
        });
        if (error) throw error;
        let role = 'Student';
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser === 'admin') role = 'Admin';
        else if (cleanUser === 'profesor' || cleanUser === 'maestro') role = 'Teacher';
        
        onLogin(role as UserRole);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-4 relative z-10 my-auto">
        {/* Top: Branding */}
        <div className="space-y-2 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
          >
            <Zap className="text-indigo-400" size={14} />
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em]">Conexión Segura Activada</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <Logo size="lg" />
          </motion.div>
        </div>

        {/* Bottom: Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-5 lg:p-8 shadow-2xl relative w-full"
        >
          <div className="relative z-10 space-y-4 lg:space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Ingresa a tu cuenta o regístrate</p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-3 lg:space-y-4">
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="USUARIO"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 lg:py-4 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  placeholder="CONTRASEÑA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 lg:py-4 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => handleAuth('signin')}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 lg:py-4 rounded-[2rem] font-black text-sm lg:text-base uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group",
                    isLoading ? "bg-slate-800 text-slate-500 border border-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs">Procesando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => handleAuth('signup')}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 lg:py-4 rounded-[2rem] font-black text-sm lg:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                    isLoading ? "bg-slate-900 text-slate-600 border border-slate-800" : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  )}
                >
                  <span>Crear Cuenta</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo Roles Box */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-4 sm:p-6 w-full text-center"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Modo de Pruebas (Acceso Rápido)</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => handleDemoLogin('Student')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl font-bold text-xs flex items-center gap-2 justify-center transition-colors border border-slate-700"
            >
              <GraduationCap size={16} /> Alumno Demo
            </button>
            <button 
              onClick={() => handleDemoLogin('Teacher')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl font-bold text-xs flex items-center gap-2 justify-center transition-colors border border-slate-700"
            >
              <Users size={16} /> Maestro Demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
