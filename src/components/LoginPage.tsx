import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, Users, Zap, Sparkles, Lock, ArrowRight, User, BookOpen, Eye, EyeOff, Check, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { Grade, UserRole, Year } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { ACADEMIC_CONTENT } from '../constants';

interface LoginPageProps {
  onLogin: (role: UserRole, username: string, grade?: Grade, stats?: any) => void;
  masterTeacherKey?: string;
  schoolGroups?: Grade[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, masterTeacherKey, schoolGroups = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>('Student');
  const [selectedGrade, setSelectedGrade] = useState<Grade>('2A');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showTeacherVerifyKey, setShowTeacherVerifyKey] = useState(false);
  
  // Teacher specific signup fields
  const [teacherVerifyKey, setTeacherVerifyKey] = useState('');
  const [teacherSignupStep, setTeacherSignupStep] = useState(1);
  const [teacherSelectedGroups, setTeacherSelectedGroups] = useState<Grade[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<Record<string, Grade[]>>({});
  
  // Forgot password flow states
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotMasterKey, setForgotMasterKey] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  
  // Flatten all subjects for easy selection with year context
  const allSubjects = [
    ...(ACADEMIC_CONTENT['1'] || []).map(s => ({ ...s, year: '1' as Year })),
    ...(ACADEMIC_CONTENT['2'] || []).map(s => ({ ...s, year: '2' as Year })),
    ...(ACADEMIC_CONTENT['3'] || []).map(s => ({ ...s, year: '3' as Year }))
  ];

  const handleAuth = async (action: 'signin' | 'signup') => {
    // Basic normalization as requested
    const normUser = username.trim().toUpperCase();
    const rawPass = password;
    const normKey = teacherVerifyKey.trim().toUpperCase();
    const normMasterKey = (masterTeacherKey || "").trim().toUpperCase();

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

    if (!normUser || !rawPass) {
      setErrorMsg('Por favor ingresa usuario y contraseña');
      return;
    }

    if (action === 'signup') {
      if (signupRole === 'Teacher') {
        if (!normKey) {
          setErrorMsg('Se requiere la Llave de Verificación para docentes');
          return;
        }
        if (normKey !== normMasterKey) {
          setErrorMsg('Llave de Verificación incorrecta. Solicítala al Admin.');
          return;
        }
        
        const hasAssignments = Object.values(teacherAssignments).some(grps => grps.length > 0);
        if (!hasAssignments) {
          setErrorMsg('Selecciona al menos una materia y sus grupos');
          return;
        }
      }
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (action === 'signup') {
        let role: UserRole = signupRole;
        const cleanUser = normUser.toLowerCase();
        
        if (cleanUser === 'admin') role = 'Admin';

        // Extract assignments
        const assignedSubjects: string[] = [];
        const assignedGroups = new Set<Grade>();

        Object.entries(teacherAssignments).forEach(([sid, grps]) => {
          grps.forEach(grp => {
            assignedSubjects.push(`${sid}:${grp}`);
            assignedGroups.add(grp);
          });
        });

        const { stats } = await supabaseService.signUp(
          normUser, 
          rawPass, 
          role, 
          role === 'Student' ? selectedGrade : undefined,
          role === 'Teacher' ? {
            assignedSubjects,
            assignedGroups: Array.from(assignedGroups) as Grade[]
          } : undefined
        );
        onLogin(role, stats.username, role === 'Student' ? selectedGrade : undefined, stats);
      } else {
        try {
          // Attempt login with raw password
          const { stats } = await supabaseService.signIn(normUser, rawPass);
          onLogin(stats.role, stats.username, stats.grade, stats);
        } catch (error: any) {
          // Fallback: try uppercase password if raw failed (to support users created with the previous bug)
          const upperPass = rawPass.toUpperCase();
          if (upperPass !== rawPass) {
            try {
              const { stats: upperStats } = await supabaseService.signIn(normUser, upperPass);
              onLogin(upperStats.role, upperStats.username, upperStats.grade, upperStats);
              return;
            } catch (fallbackError) {
              // Ignore fallback error
            }
          }
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let msg = error.message || 'Ocurrió un error en la autenticación';
      if (msg.includes('Email not confirmed')) {
        msg = '⚠️ Email no confirmado. Debes desactivar "Confirm Email" en la configuración de Auth en Supabase.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const normUser = forgotUsername.trim().toUpperCase();
    const rawPass = forgotNewPassword;
    const normKey = forgotMasterKey.trim().toUpperCase();

    if (!normUser || !rawPass || !normKey) {
      setErrorMsg('Por favor completa todos los campos');
      return;
    }

    if (rawPass.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await supabaseService.resetPasswordDirectly(normUser, rawPass, normKey);
      setSuccessMsg('¡Contraseña cambiada con éxito! Ya puedes iniciar sesión.');
      setIsForgotPasswordMode(false);
      // Pre-fill user with updated credentials
      setUsername(normUser);
      setPassword('');
      setForgotUsername('');
      setForgotNewPassword('');
      setForgotMasterKey('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Error al cambiar la contraseña. Verifica la Llave de Verificación o Usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherNext = () => {
    const normUser = username.trim().toUpperCase();
    const rawPass = password;
    const normKey = teacherVerifyKey.trim().toUpperCase();
    const normMasterKey = (masterTeacherKey || "").trim().toUpperCase();

    if (teacherSignupStep === 1) {
      if (!normUser || !rawPass || !normKey) {
        setErrorMsg('Completa todos los campos');
        return;
      }
      if (normKey !== normMasterKey) {
        setErrorMsg('Llave de Verificación incorrecta');
        return;
      }
      setTeacherSignupStep(2);
      setErrorMsg('');
    } else if (teacherSignupStep === 2) {
      if (teacherSelectedGroups.length === 0) {
        setErrorMsg('Selecciona al menos un grupo');
        return;
      }
      setTeacherSignupStep(3);
      setErrorMsg('');
    } else {
      // we are in the assignment steps
      const currentGrpIdx = teacherSignupStep - 3;
      const currentGroup = teacherSelectedGroups[currentGrpIdx];
      
      // Check if this group has at least one subject
      const hasSubject = Object.values(teacherAssignments).some(grps => grps.includes(currentGroup));
      
      if (!hasSubject) {
        setErrorMsg('Selecciona al menos una materia para este grupo');
        return;
      }

      if (currentGrpIdx < teacherSelectedGroups.length - 1) {
        setTeacherSignupStep(prev => prev + 1);
        setErrorMsg('');
      } else {
        // Final step, handleAuth will be called by the component button
        handleAuth('signup');
      }
    }
  };

  const handleTeacherBack = () => {
    setTeacherSignupStep(prev => Math.max(1, prev - 1));
    setErrorMsg('');
  };

  const toggleSelectedGroup = (group: Grade) => {
    setTeacherSelectedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const toggleAssignment = (subjectId: string, group: Grade) => {
    setTeacherAssignments(prev => {
      const currentGroups = prev[subjectId] || [];
      if (currentGroups.includes(group)) {
        const nextGroups = currentGroups.filter(g => g !== group);
        const next = { ...prev };
        if (nextGroups.length === 0) {
          delete next[subjectId];
        } else {
          next[subjectId] = nextGroups;
        }
        return next;
      } else {
        return {
          ...prev,
          [subjectId]: [...currentGroups, group]
        };
      }
    });
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-2 relative z-10 my-auto">
        {/* Top: Branding */}
        <div className="space-y-1 flex flex-col items-center text-center shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden sm:inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"
          >
            <Zap className="text-cyan-400" size={10} />
            <span className="text-[8px] font-black text-cyan-300 uppercase tracking-[0.2em]">Conexión Segura</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <Logo size="sm" />
          </motion.div>
        </div>

        {/* Bottom: Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "backdrop-blur-xl rounded-[1.5rem] p-4 lg:p-6 shadow-2xl relative w-full transition-all duration-500 max-h-[85dvh] flex flex-col",
            isSignupMode 
              ? "bg-slate-800/80 border border-indigo-500/30 shadow-indigo-500/10" 
              : "bg-slate-900/50 border border-slate-800"
          )}
        >
          <div className="relative z-10 space-y-3 lg:space-y-4 flex flex-col h-full overflow-hidden">
            <div className="text-center space-y-2 shrink-0">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                {isForgotPasswordMode ? 'Restablecer Contraseña' : isSignupMode ? 'Crea tu nueva cuenta' : 'Ingresa a tu cuenta'}
              </p>

              {!isForgotPasswordMode && isSignupMode && (
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupRole('Student');
                      setTeacherSignupStep(1);
                      setTeacherSelectedGroups([]);
                      setTeacherAssignments({});
                      setTeacherVerifyKey('');
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                      signupRole === 'Student' 
                        ? "bg-slate-800 text-white shadow-lg lg:text-sm scale-105 z-10" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Users size={14} /> Alumno
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupRole('Teacher');
                      setTeacherSignupStep(1);
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                      signupRole === 'Teacher' 
                        ? "bg-slate-800 text-white shadow-lg lg:text-sm scale-105 z-10" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <GraduationCap size={14} /> Maestro
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center">
                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest leading-relaxed">{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest leading-relaxed">{successMsg}</p>
              </div>
            )}

            <div className="space-y-3 lg:space-y-4 overflow-y-auto no-scrollbar px-1 flex-1">
              {isForgotPasswordMode ? (
                <div className="space-y-3 lg:space-y-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-semibold bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                    Escribe tu usuario, tu nueva contraseña y la <span className="text-indigo-400 font-black">Llave de Verificación</span> global del sistema para actualizarla de forma directa.
                  </p>
                  
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="USUARIO"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-14 pr-6 text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type={showForgotNewPassword ? "text" : "password"} 
                      placeholder="NUEVA CONTRASEÑA"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-black tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative pt-1">
                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                    <input 
                      type="password" 
                      placeholder="LLAVE DE VERIFICACIÓN"
                      value={forgotMasterKey}
                      onChange={(e) => setForgotMasterKey(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-indigo-500/30 rounded-2xl py-4 lg:py-5 pl-14 pr-6 text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 shadow-lg shadow-indigo-500/5 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Common Fields & Student Registration */}
                  {(!isSignupMode || signupRole === 'Student' || (signupRole === 'Teacher' && teacherSignupStep === 1)) && (
                    <div className="space-y-3 lg:space-y-4">
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          placeholder={signupRole === 'Teacher' && isSignupMode ? "NOMBRE COMPLETO" : "USUARIO"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleAuth(isSignupMode ? 'signup' : 'signin')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-14 pr-6 text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="CONTRASEÑA"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAuth(isSignupMode ? 'signup' : 'signin')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-black tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                  {isSignupMode && signupRole === 'Teacher' && (
                    <div className="relative pt-1">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-violet-400" size={16} />
                      <input 
                        type={showTeacherVerifyKey ? "text" : "password"} 
                        placeholder="LLAVE DE VERIFICACIÓN"
                        value={teacherVerifyKey}
                        onChange={(e) => setTeacherVerifyKey(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-violet-500/30 rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-700 shadow-lg shadow-violet-500/5"
                        style={{ textTransform: 'uppercase' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherVerifyKey(!showTeacherVerifyKey)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        {showTeacherVerifyKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}

                  {isSignupMode && signupRole === 'Student' && (
                    <div className="relative">
                      <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value as Grade)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-14 pr-6 text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        {schoolGroups.map(grp => (
                          <option key={grp} value={grp}>{grp}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Teacher Dynamic Steps */}
              {isSignupMode && signupRole === 'Teacher' && (
                <div className="space-y-4">
                  {/* Step 2: Select Groups */}
                  {teacherSignupStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col gap-1 px-1">
                        <p className="text-base font-black text-white uppercase tracking-widest">¿Qué grupos tienes?</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 max-h-[300px] lg:max-h-[400px] overflow-y-auto no-scrollbar transform-gpu pr-1">
                        {schoolGroups.map(group => {
                          const isActive = teacherSelectedGroups.includes(group);
                          return (
                            <button
                              key={group}
                              type="button"
                              onClick={() => toggleSelectedGroup(group)}
                              className={cn(
                                "py-4 rounded-2xl text-xl font-black border transition-all flex items-center justify-center relative",
                                isActive 
                                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" 
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                              )}
                            >
                              {group}
                              {isActive && (
                                <motion.div layoutId="check_grp" className="absolute top-1 right-1 text-emerald-300">
                                  <CheckCircle2 size={14} />
                                </motion.div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3+: Subject Assignment per Group */}
                  {teacherSignupStep >= 3 && (
                    <motion.div 
                      key={`step${teacherSignupStep}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      {(() => {
                        const currentGrpIdx = teacherSignupStep - 3;
                        const group = teacherSelectedGroups[currentGrpIdx];
                        const year = group?.charAt(0) as Year;
                        const subjectsForYear = ACADEMIC_CONTENT[year] || [];
                        
                        if (!group) return <div className="text-white">Error: Grupo no encontrado</div>;

                        return (
                          <>
                            <div className="flex flex-col gap-0.5 px-1">
                              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">Grupo {currentGrpIdx + 1} de {teacherSelectedGroups.length}</p>
                              <p className="text-lg lg:text-xl font-black text-white uppercase tracking-tight leading-tight">
                                ¿Qué materias das en el grupo <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-500/50">{group}</span>?
                              </p>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar transform-gpu">
                              {subjectsForYear.map(subject => {
                                const isActive = (teacherAssignments[subject.id] || []).includes(group);
                                return (
                                  <button
                                    key={subject.id}
                                    type="button"
                                    onClick={() => toggleAssignment(subject.id, group)}
                                    className={cn(
                                      "w-full py-3 px-4 rounded-xl text-xs font-black uppercase border transition-all flex items-center justify-between gap-3 text-left",
                                      isActive 
                                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-[1.01]" 
                                        : "bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500"
                                    )}
                                  >
                                    <span>{subject.name}</span>
                                    {isActive && <Check size={16} />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>
              )}
              </>
            )}
            </div>

            <div className="flex flex-col gap-3 pt-2 flex-shrink-0 border-t border-slate-800/50 mt-auto">
                {isForgotPasswordMode ? (
                  <>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3 lg:py-4 rounded-[2rem] font-black text-sm lg:text-base uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group",
                        isLoading ? "bg-slate-800 text-slate-500 border border-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs">Actualizando...</span>
                        </div>
                      ) : (
                        <>
                          <span>Cambiar Contraseña</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordMode(false);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      disabled={isLoading}
                      className="w-full py-3 lg:py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-transparent text-slate-500 hover:text-slate-300"
                    >
                      Volver al Inicio de Sesión
                    </button>
                  </>
                ) : isSignupMode ? (
                  <>
                    <div className="flex gap-3 pt-2">
                      {signupRole === 'Teacher' && teacherSignupStep > 1 && (
                        <button 
                          type="button"
                          onClick={handleTeacherBack}
                          disabled={isLoading}
                          className="flex-1 py-3 lg:py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all bg-slate-800/50 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                        >
                          Atrás
                        </button>
                      )}
                      
                      <button 
                        type="button"
                        onClick={() => {
                          const isFinalAssignmentStep = signupRole === 'Teacher' && teacherSignupStep === (teacherSelectedGroups.length + 2);
                          if (signupRole === 'Teacher' && !isFinalAssignmentStep) {
                            handleTeacherNext();
                          } else {
                            handleAuth('signup');
                          }
                        }}
                        disabled={isLoading}
                        className={cn(
                          "flex-[2] py-4 lg:py-5 rounded-[2rem] font-black text-base lg:text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl",
                          isLoading 
                            ? "bg-slate-800 text-slate-500 border border-slate-700" 
                            : signupRole === 'Teacher' && teacherSignupStep < (teacherSelectedGroups.length + 2)
                              ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_40px_rgba(79,70,229,0.4)]"
                              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.4)]"
                        )}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-4">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-xs">Procesando...</span>
                          </div>
                        ) : (
                          <>
                            <span>
                              {(() => {
                                const isFinalAssignmentStep = signupRole === 'Teacher' && teacherSignupStep === (teacherSelectedGroups.length + 2);
                                if (signupRole === 'Teacher') {
                                  return isFinalAssignmentStep ? 'Finalizar Registro' : 'Siguiente';
                                }
                                return 'Completar Registro';
                              })()}
                            </span>
                            {signupRole === 'Teacher' && teacherSignupStep < (teacherSelectedGroups.length + 2) && <ChevronRight size={22} />}
                          </>
                        )}
                      </button>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setIsSignupMode(false);
                        setTeacherSignupStep(1); 
                        setErrorMsg('');
                      }}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3 lg:py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                        "bg-transparent text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <span>¿Ya tienes cuenta? Iniciar Sesión</span>
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
                          <span className="text-xs">Autenticando...</span>
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
                      onClick={() => {
                        setIsForgotPasswordMode(true);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-indigo-400 transition-colors py-1.5 underline underline-offset-4 mx-auto font-black uppercase tracking-widest"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
    
                    <div className="relative flex items-center gap-4 py-2">
                      <div className="flex-1 h-[1px] bg-slate-800" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">o</span>
                      <div className="flex-1 h-[1px] bg-slate-800" />
                    </div>
 
                    <button 
                      type="button"
                      onClick={() => {
                        setIsSignupMode(true);
                        setTeacherSignupStep(1);
                        setTeacherSelectedGroups([]);
                        setTeacherAssignments({});
                        setTeacherVerifyKey('');
                      }}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-3 lg:py-4 rounded-[2rem] font-black text-sm lg:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                        isLoading ? "bg-slate-900 text-slate-600 border border-slate-800" : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                      )}
                    >
                      <span>Crear Cuenta Nueva</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

