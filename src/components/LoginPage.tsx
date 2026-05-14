import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, Users, Zap, Sparkles, Lock, ArrowRight, User, BookOpen } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { UserRole, Grade } from '../types';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (role: UserRole, username: string, grade?: Grade) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('2A');

  // Demo roles
  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(role, role === 'Admin' ? 'Admin Demo' : role === 'Teacher' ? 'Profe Demo' : 'Alumno Demo', role === 'Student' ? '2A' : undefined);
      setIsLoading(false);
    }, 800);
  };

  const handleAuth = async (action: 'signin' | 'signup') => {
    if (action === 'signup' && !isSignupMode) {
      setIsSignupMode(true);
      setErrorMsg('');
      setSuccessMsg('');
      return;
    }
    if (action === 'signin' && isSignupMode) {
      setIsSignupMode(false);
      setErrorMsg('');
      setSuccessMsg('');
      return;
    }

    if (!username || !password) {
      setErrorMsg('Por favor ingresa usuario y contraseña');
      return;
    }

    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!import.meta.env.VITE_SUPABASE_URL || !supabaseKey) {
      setErrorMsg('Error de configuración: Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY). Por favor configúralas en los Secretos.');
      return;
    }

    try {
      const cleanUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');
      new URL(cleanUrl);
    } catch {
      setErrorMsg(`Error de configuración: VITE_SUPABASE_URL es inválida. Debe ser una URL completa como "https://tu-proyecto.supabase.co", pero recibimos: "${import.meta.env.VITE_SUPABASE_URL}".`);
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const supabaseEmail = `${username.trim().toLowerCase()}@cardacademy.demo.app`;

    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: supabaseEmail,
          password,
        });
        if (error) throw error;
        
        let role = 'Student';
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser === 'admin') role = 'Admin';
        else if (cleanUser === 'profesor' || cleanUser === 'maestro') role = 'Teacher';
        
        // Let's sign the user in directly after signup for a better UX
        onLogin(role as UserRole, username.trim() || 'Nuevo Usuario', role === 'Student' ? selectedGrade : undefined);
        
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
        
        // Right now, when signing in, we don't know their grade unless we fetch it. 
        // For the sake of this demo without a proper db profile, we'll assign they grade selected
        onLogin(role as UserRole, username.trim() || 'Nuevo Usuario', role === 'Student' ? selectedGrade : undefined);
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
          className={cn(
            "backdrop-blur-xl rounded-[2rem] p-5 lg:p-8 shadow-2xl relative w-full transition-all duration-500",
            isSignupMode 
              ? "bg-slate-800/80 border border-indigo-500/30 shadow-indigo-500/10" 
              : "bg-slate-900/50 border border-slate-800"
          )}
        >
          <div className="relative z-10 space-y-4 lg:space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                {isSignupMode ? 'Crea tu nueva cuenta' : 'Ingresa a tu cuenta'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{successMsg}</p>
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

              {isSignupMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="relative"
                >
                  <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as Grade)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 lg:py-4 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="1A">1ro A</option>
                    <option value="1B">1ro B</option>
                    <option value="1C">1ro C</option>
                    <option value="1D">1ro D</option>
                    <option value="2A">2do A</option>
                    <option value="2B">2do B</option>
                    <option value="2C">2do C</option>
                    <option value="2D">2do D</option>
                    <option value="3A">3ro A</option>
                    <option value="3B">3ro B</option>
                    <option value="3C">3ro C</option>
                    <option value="3D">3ro D</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                     <span className="text-slate-500 text-xs">▼</span>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                {isSignupMode ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => handleAuth('signup')}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3 lg:py-4 rounded-[2rem] font-black text-sm lg:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl",
                        isLoading ? "bg-slate-800 text-slate-500 border border-slate-700" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs">Creando...</span>
                        </div>
                      ) : (
                        <span>Completar Registro</span>
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => handleAuth('signin')}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3 lg:py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                        "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      )}
                    >
                      <span>Volver al Login</span>
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

