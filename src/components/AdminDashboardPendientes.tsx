import React, { useState, useMemo } from "react";
import { CheckCircle2, Clock, X, Check, MessageSquare, AlertCircle, Sparkles, UserCheck, Bell, ChevronRight, GraduationCap } from "lucide-react";
import { supabaseService } from "../lib/supabaseService";
import { toast } from "sonner";

interface StudentRow {
  id?: string;
  username?: string;
  grade?: any;
  tokens: number;
  collection: string[];
  pendingTasks?: string[];
  completedTasks: string[];
  packCurrencies?: any;
}

interface AdminDashboardPendientesProps {
  rawStudents: StudentRow[];
  onRefresh: () => Promise<void>;
  lookupTaskDetails: (taskId: string) => { task: any; subject: any; topicName: string } | null;
  notifications: any[];
  onMarkNotificationAsRead?: (notifId: string) => Promise<void>;
}

export const AdminDashboardPendientes: React.FC<AdminDashboardPendientesProps> = ({
  rawStudents,
  onRefresh,
  lookupTaskDetails,
  notifications,
  onMarkNotificationAsRead
}) => {
  const [subTab, setSubTab] = useState<"tasks" | "avatars" | "new_accounts">("tasks");
  const [taskFeedback, setTaskFeedback] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Gather all pending tasks from all students
  const pendingTasksList = useMemo(() => {
    const list: Array<{ student: StudentRow; taskId: string; details: any }> = [];
    rawStudents.forEach(student => {
      if (student.pendingTasks && student.pendingTasks.length > 0) {
        student.pendingTasks.forEach(taskId => {
          const details = lookupTaskDetails(taskId);
          if (details) {
            list.push({ student, taskId, details });
          }
        });
      }
    });
    return list;
  }, [rawStudents, lookupTaskDetails]);

  // 2. Gather all pending avatars
  const pendingAvatarsList = useMemo(() => {
    return rawStudents.filter((s) => {
      const meta = s.packCurrencies?._avatar_meta;
      return meta?.status === "pending" && meta?.pendingUrl;
    });
  }, [rawStudents]);

  // 3. Filter registration notifications for admins
  const registrationNotifications = useMemo(() => {
    return notifications.filter(n => 
      n.title?.includes("Nuevo Registro") || 
      n.title?.includes("Registro") || 
      n.message?.includes("cuenta") ||
      n.message?.includes("creó")
    );
  }, [notifications]);

  // --- HANDLERS ---

  // Approved a Task submission
  const handleTaskApprove = async (student: StudentRow, taskId: string) => {
    if (!student.id) {
      toast.error("Alumno no válido.");
      return;
    }
    const key = `${student.id}-${taskId}`;
    const comment = taskFeedback[key] || "";
    setProcessingId(key);

    try {
      const taskDetails = lookupTaskDetails(taskId)?.task;
      const updatedStats = { ...student };
      updatedStats.pendingTasks = updatedStats.pendingTasks?.filter(id => id !== taskId);
      updatedStats.completedTasks = [...(updatedStats.completedTasks || []), taskId];

      if (taskDetails?.reward.tokens) {
        updatedStats.tokens += taskDetails.reward.tokens;
      }
      if (taskDetails?.reward.cardId && !updatedStats.collection.includes(taskDetails.reward.cardId)) {
        updatedStats.collection.push(taskDetails.reward.cardId);
      }

      await supabaseService.updateUserStats(student.id, updatedStats);
      await supabaseService.sendNotification(
        student.id,
        "¡Actividad Aprobada! 🌟",
        `Tu actividad "${taskDetails?.title || 'Desafío'}" ha sido aprobada por el administrador. ${
          comment ? "Comentario: " + comment : "¡Has recibido tus recompensas!"
        }`,
        "success"
      );

      toast.success(`Actividad de @${student.username} aprobada.`);
      setTaskFeedback(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      await onRefresh();
    } catch (err) {
      console.error("Error task approval admin:", err);
      toast.error("Ocurrió un error al aprobar la actividad.");
    } finally {
      setProcessingId(null);
    }
  };

  // Rejects a Task submission
  const handleTaskReject = async (student: StudentRow, taskId: string) => {
    if (!student.id) {
      toast.error("Alumno no válido.");
      return;
    }
    const key = `${student.id}-${taskId}`;
    const comment = taskFeedback[key] || "";
    if (!comment.trim()) {
      toast.error("Debe escribir una retroalimentación / motivo de rechazo.");
      return;
    }
    setProcessingId(key);

    try {
      const taskDetails = lookupTaskDetails(taskId)?.task;
      const updatedStats = { ...student };
      updatedStats.pendingTasks = updatedStats.pendingTasks?.filter(id => id !== taskId);

      await supabaseService.updateUserStats(student.id, updatedStats);
      await supabaseService.sendNotification(
        student.id,
        "Misión para Corregir 📝",
        `Tu actividad "${taskDetails?.title || 'Desafío'}" requiere corrección. Observación: ${comment}`,
        "warning"
      );

      toast.warning(`Actividad de @${student.username} enviada a corrección.`);
      setTaskFeedback(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      await onRefresh();
    } catch (err) {
      console.error("Error task rejection admin:", err);
      toast.error("Ocurrió un error al rechazar la actividad.");
    } finally {
      setProcessingId(null);
    }
  };

  // Approve Profile Avatar
  const handleAvatarApprove = async (student: StudentRow) => {
    if (!student.id) return;
    setProcessingId(`avatar-${student.id}`);
    try {
      const origMeta = student.packCurrencies?._avatar_meta || {};
      const newMeta = {
        ...origMeta,
        status: "approved",
        approvedUrl: origMeta.pendingUrl,
        pendingUrl: ""
      };

      const newPackCurrencies = {
        ...student.packCurrencies,
        _avatar_meta: newMeta
      };

      await supabaseService.updateUserStats(student.id, {
        packCurrencies: newPackCurrencies
      });

      await supabaseService.sendNotification(
        student.id,
        "¡Foto de perfil aprobada!",
        "Tu propuesta de foto de perfil fue aprobada por el administrador y ya está activa en tu cuenta.",
        "success"
      );

      toast.success(`Foto de @${student.username} aprobada.`);
      await onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Error al aprobar foto.");
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Profile Avatar
  const handleAvatarReject = async (student: StudentRow) => {
    if (!student.id) return;
    const confirmReject = window.confirm(
      `¿Deseas rechazar la foto propuesta por @${student.username}? No podrá subir otra foto por 7 días.`
    );
    if (!confirmReject) return;

    setProcessingId(`avatar-${student.id}`);
    try {
      const origMeta = student.packCurrencies?._avatar_meta || {};
      const newMeta = {
        ...origMeta,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        pendingUrl: ""
      };

      const newPackCurrencies = {
        ...student.packCurrencies,
        _avatar_meta: newMeta
      };

      await supabaseService.updateUserStats(student.id, {
        packCurrencies: newPackCurrencies
      });

      await supabaseService.sendNotification(
        student.id,
        "Foto de perfil rechazada",
        "Tu propuesta de foto de perfil fue rechazada por no cumplir con las normas de convivencia. Podrás volver a proponer otra en 1 semana.",
        "warning"
      );

      toast.warning(`Foto de perfil de @${student.username} rechazada.`);
      await onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Error al rechazar foto.");
    } finally {
      setProcessingId(null);
    }
  };

  // Clear registration alert item
  const handleMarkAsRead = async (id: string) => {
    if (onMarkNotificationAsRead) {
      try {
        await onMarkNotificationAsRead(id);
        toast.success("Notificación de registro marcada como vista.");
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await supabaseService.markNotificationAsRead(id);
        toast.success("Notificación de registro archivada.");
        await onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" id="admin-pending-dashboard">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl" />
        <div className="space-y-1.5 relative z-10 text-left">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-[9px] bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 w-fit mb-2">
            <Bell size={11} className="animate-bounce" />
            <span>Mesa de Auditoría</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-wide">
            Buzón de Revisión Escolar
          </h3>
          <p className="text-slate-400 text-xs font-semibold max-w-xl">
            Como Administrador Central, tienes la autoridad absoluta para validar actividades, aprobar fotos de perfil subidas desde celulares y confirmar nuevos ingresos a la academia.
          </p>
        </div>

        {/* Floating statistics counter pill */}
        <div className="grid grid-cols-3 gap-2 shrink-0 relative z-10 w-full md:w-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="block text-lg font-black text-indigo-400">{pendingTasksList.length}</span>
            <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider">Tareas</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="block text-lg font-black text-amber-400">{pendingAvatarsList.length}</span>
            <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider">Fotos</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <span className="block text-lg font-black text-rose-400">{registrationNotifications.length}</span>
            <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider">Ingresos</span>
          </div>
        </div>
      </div>

      {/* Internal Menu Toggles */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 gap-1.5 w-full md:w-fit" id="admin-pending-tabs">
        <button
          onClick={() => setSubTab("tasks")}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            subTab === "tasks"
              ? "bg-indigo-650 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Clock size={14} />
          Misiones ({pendingTasksList.length})
        </button>

        <button
          onClick={() => setSubTab("avatars")}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            subTab === "avatars"
              ? "bg-indigo-650 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Sparkles size={14} className="text-amber-400" />
          Avatares ({pendingAvatarsList.length})
        </button>

        <button
          onClick={() => setSubTab("new_accounts")}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            subTab === "new_accounts"
              ? "bg-indigo-650 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <UserCheck size={14} />
          Nuevos Alumnos/Docentes ({registrationNotifications.length})
        </button>
      </div>

      {/* SUB-VIEW PANELS */}
      <div className="space-y-4">
        
        {/* TAB 1: SUBMISSIONS REVIEW */}
        {subTab === "tasks" && (
          <div className="space-y-4">
            {pendingTasksList.length === 0 ? (
              <div className="bg-slate-950/20 border-2 border-dashed border-slate-800/80 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-3.5" id="no-pending-tasks">
                <CheckCircle2 size={36} className="text-emerald-500/80" />
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-slate-300 uppercase tracking-widest text-xs">Aulas al día</h4>
                  <p className="text-slate-500 text-xs max-w-sm">No existen misiones ni actividades de alumnos esperando evaluación en este momento.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pendingTasksList.map(({ student, taskId, details }, index) => {
                  const key = `${student.id}-${taskId}`;
                  const feedbackVal = taskFeedback[key] || "";
                  const isProcessing = processingId === key;

                  return (
                    <div
                      key={`${student.id}-${taskId}-${index}`}
                      className="bg-slate-900/60 border border-slate-850 p-6 rounded-[2rem] flex flex-col justify-between space-y-6 hover:border-indigo-500/20 transition-all relative overflow-hidden text-left shadow-lg"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-550/5 to-transparent rounded-bl-3xl pointer-events-none" />

                      <div className="space-y-4">
                        {/* Header Student Info Row */}
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 p-0.5 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs uppercase tracking-wider">
                              {student.grade || "S/G"}
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs font-black text-slate-100 italic tracking-wider">@{student.username}</h4>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mt-0.5">
                                Alumno de {student.grade || "sin grupo asignado"}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-black bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                            <span>+{details.task.reward.tokens}</span>
                            <span>🪙</span>
                          </div>
                        </div>

                        {/* Task Metadata details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-505/10 px-2 py-0.5 rounded border border-indigo-500/25">
                              {details.subject?.name || "Actividad"}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                              {details.topicName || "Matrícula"}
                            </span>
                          </div>

                          <h5 className="font-black text-slate-100 uppercase tracking-wide text-[13px]">
                            {details.task.title}
                          </h5>
                          <p className="text-[11px] text-slate-405 leading-relaxed italic pr-2">
                            {details.task.description}
                          </p>
                        </div>

                        {/* Task Evidence Delivered */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">
                            Evidencia de Entrega
                          </span>
                          {student.packCurrencies?._task_evidences?.[taskId] ? (
                            <div className="space-y-2">
                              <div className="relative border border-slate-800 bg-slate-950 p-2 rounded-2xl overflow-hidden group max-w-full flex justify-center">
                                <img
                                  src={student.packCurrencies._task_evidences[taskId]}
                                  alt="Evidencia enviada"
                                  className="max-h-48 w-auto object-contain rounded-xl"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-300 leading-relaxed font-semibold italic bg-slate-950 border border-slate-850 p-3.5 rounded-2xl border-l-[3px] border-l-indigo-500 text-left">
                              "Desafío completado. Respuestas subidas y justificadas de acuerdo a las indicaciones. Solicitud enviada para revisión."
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Control Panel Actions */}
                      <div className="space-y-3 pt-3 border-t border-slate-855">
                        <div className="flex gap-2.5 items-center">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={feedbackVal}
                              onChange={(e) => setTaskFeedback(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder="Felicita al alumno o escribe motivos de corrección..."
                              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none transition-all placeholder:text-slate-650"
                            />
                            <MessageSquare size={13} className="text-slate-600 absolute right-3 top-3.5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTaskReject(student, taskId)}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-500/20 hover:border-transparent flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <X size={11} />
                            Desaprobar
                          </button>
                          
                          <button
                            onClick={() => handleTaskApprove(student, taskId)}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-500/20 hover:border-transparent flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <Check size={11} />
                            Aprobar y Premiar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PORTRAIT PICTURES SUBMISSIONS */}
        {subTab === "avatars" && (
          <div className="space-y-4">
            {pendingAvatarsList.length === 0 ? (
              <div className="bg-slate-950/20 border-2 border-dashed border-slate-800/80 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-3.5" id="no-pending-avatars">
                <CheckCircle2 size={36} className="text-emerald-500/80" />
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-slate-300 uppercase tracking-widest text-xs">Fotos aprobadas</h4>
                  <p className="text-slate-500 text-xs max-w-sm">No hay solicitudes pendientes de imágenes de perfil. Las fotos de tus alumnos están reguladas y aprobadas.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAvatarsList.map((student, index) => {
                  const pendingUrl = student.packCurrencies?._avatar_meta?.pendingUrl;
                  const currentAvatar = student.packCurrencies?._avatar_meta?.approvedUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username || "student"}`;
                  const isProcessing = processingId === `avatar-${student.id}`;

                  return (
                    <div
                      key={student.id || `student-avatar-${index}`}
                      className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-5 flex flex-col space-y-5 hover:border-indigo-500/20 transition-all shadow-md text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

                      {/* student identification card header */}
                      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800/80">
                          <img
                            src={currentAvatar}
                            alt={student.username}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-slate-100">@{student.username}</h4>
                          <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">
                            Grupo {student.grade || "S/G"}
                          </span>
                        </div>
                      </div>

                      {/* Display before and after comparisons */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                        {/* Old approved profile image */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Imagen Actual</span>
                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden grayscale opacity-40 p-0.5">
                            <img
                              src={currentAvatar}
                              alt="Current"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* New cellphone photo submission */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 block">
                            <Sparkles size={8} className="text-amber-400" /> Nueva Propuesta
                          </span>
                          <div className="w-16 h-16 rounded-xl bg-indigo-950/20 border-2 border-indigo-500/40 flex items-center justify-center overflow-hidden shadow-inner p-0.5 animate-pulse-slow">
                            <img
                              src={pendingUrl}
                              alt="Proposed"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2.5 mt-auto">
                        <button
                          onClick={() => handleAvatarReject(student)}
                          disabled={isProcessing}
                          className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-450 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-500/15 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <X size={12} />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAvatarApprove(student)}
                          disabled={isProcessing}
                          className="flex-1 py-3 bg-emerald-500/15 hover:bg-emerald-550 hover:text-slate-950 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-500/15 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Check size={12} />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NEW USER ACCOUNT REGISTRATION ALERTS */}
        {subTab === "new_accounts" && (
          <div className="space-y-4">
            {registrationNotifications.length === 0 ? (
              <div className="bg-slate-950/20 border-2 border-dashed border-slate-800/80 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-3.5" id="no-registration-noitfs">
                <CheckCircle2 size={36} className="text-emerald-500/80" />
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-slate-300 uppercase tracking-widest text-xs">Matrícula Auditada</h4>
                  <p className="text-slate-500 text-xs max-w-sm">No existen alertas de registro nuevas esperando lectura. El ingreso de docentes y alumnos está al corriente.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Historial de Alertas de Ingreso</span>
                  <span className="text-[9px] font-bold text-indigo-400 italic">Lista de confirmación rápida</span>
                </div>

                {registrationNotifications.map((notif, index) => (
                  <div
                    key={notif.id || `reg-notif-${index}`}
                    className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500/15 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-800 shrink-0 mt-0.5 sm:mt-0">
                        {notif.message?.includes("profesor") ? (
                          <GraduationCap size={18} className="text-indigo-400 animate-pulse" />
                        ) : (
                          <UserCheck size={18} className="text-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-sans font-extrabold text-xs text-white uppercase tracking-wider">
                            {notif.title || "Nuevo Registro"}
                          </h5>
                          {!notif.isRead && (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse-slow">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">
                          {notif.message}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500 flex items-center gap-1 uppercase">
                          <Clock size={9} />
                          {notif.created_at ? new Date(notif.created_at).toLocaleString() : "Recientemente"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-805 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Marcar Aceptado
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
