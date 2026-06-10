import React, { useState } from "react";
import { Check, X, ShieldAlert, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { supabaseService } from "../lib/supabaseService";
import { toast } from "sonner";

interface StudentRow {
  id?: string;
  username?: string;
  grade?: string;
  packCurrencies?: any;
}

interface AdminAvatarApprovalsProps {
  students: StudentRow[];
  onRefresh: () => void;
}

export const AdminAvatarApprovals: React.FC<AdminAvatarApprovalsProps> = ({
  students,
  onRefresh
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter students who have a pending picture
  const pendingStudents = students.filter((s) => {
    const meta = s.packCurrencies?._avatar_meta;
    return meta?.status === "pending" && meta?.pendingUrl;
  });

  const handleApprove = async (student: StudentRow) => {
    if (!student.id) {
      toast.error("Error: ID de alumno no válida");
      return;
    }
    setProcessingId(student.id);
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

      // Update in Supabase
      await supabaseService.updateUserStats(student.id!, {
        packCurrencies: newPackCurrencies
      });

      // Send a nice success notification
      await supabaseService.sendNotification(
        student.id!,
        "¡Foto de perfil aprobada!",
        "Tu propuesta de foto de perfil fue aprobada por el administrador y ya está activa en tu cuenta.",
        "success"
      );

      toast.success(`Foto de perfil de @${student.username || "Alumno"} aprobada con éxito.`);
      onRefresh();
    } catch (err) {
      console.error("Error approving avatar:", err);
      toast.error("Error al aprobar la foto de perfil.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (student: StudentRow) => {
    if (!student.id) {
      toast.error("Error: ID de alumno no válida");
      return;
    }
    const confirmReject = window.confirm(
      `¿Estás seguro de que deseas rechazar la foto propuesta por @${student.username || "Alumno"}? No podrá volver a subir una foto por 1 semana.`
    );
    if (!confirmReject) return;

    setProcessingId(student.id);
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

      // Update in Supabase
      await supabaseService.updateUserStats(student.id!, {
        packCurrencies: newPackCurrencies
      });

      // Send notification with 1 week restriction guidance
      await supabaseService.sendNotification(
        student.id!,
        "Foto de perfil rechazada",
        "Tu propuesta de foto de perfil fue rechazada por no cumplir con las normas de convivencia. Podrás volver a proponer otra en 1 semana.",
        "warning"
      );

      toast.warning(`Foto de perfil de @${student.username || "Alumno"} rechazada. Se aplicó bloqueo de 1 semana.`);
      onRefresh();
    } catch (err) {
      console.error("Error rejecting avatar:", err);
      toast.error("Error al rechazar la foto de perfil.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-wider flex items-center gap-2">
            <Clock className="text-amber-400 w-5 h-5" />
            Revisiones de Foto de Perfil
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Revisa las peticiones de los alumnos. Si las rechazas, se les aplicará un bloqueo de 7 días.
          </p>
        </div>
        <div className="bg-slate-900 px-4 py-2 border border-slate-800 rounded-2xl inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            {pendingStudents.length} pendientes
          </span>
        </div>
      </div>

      {pendingStudents.length === 0 ? (
        <div className="bg-slate-950/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
            <CheckCircle2 size={32} className="text-slate-500" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-300 uppercase tracking-wider text-sm">¡Todo al día!</p>
            <p className="text-slate-500 text-xs max-w-sm">
              No hay solicitudes pendientes de fotos de perfil. Los estudiantes que cambien su avatar aparecerán aquí para revisión.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingStudents.map((student, index) => {
            const pendingUrl = student.packCurrencies?._avatar_meta?.pendingUrl;
            const currentAvatar = student.packCurrencies?._avatar_meta?.approvedUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username || student.id || "alumno"}`;
            const isProcessing = !!student.id && processingId === student.id;

            return (
              <div
                key={student.id || `student-key-${student.username || index}`}
                className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-5 flex flex-col space-y-5 hover:border-indigo-500/30 transition-all shadow-xl shadow-black/10 relative overflow-hidden group"
              >
                {/* Visual gradient accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />

                {/* Student Info Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 p-0.5">
                    <img
                      src={currentAvatar}
                      alt={student.username || "Alumno"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-200 tracking-tight">@{student.username || "Alumno"}</h4>
                    <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mt-0.5">
                      Grupo: {student.grade || "S/G"}
                    </p>
                  </div>
                </div>

                {/* Comparison preview area */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/40">
                  {/* Current */}
                  <div className="flex flex-col items-center space-y-1.5 text-center">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">FOTO ACTUAL</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center overflow-hidden p-0.5 grayscale opacity-60">
                      <img
                        src={currentAvatar}
                        alt="Current"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Proposed */}
                  <div className="flex flex-col items-center space-y-1.5 text-center">
                    <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={8} className="text-amber-400 animate-pulse" /> PROPUESTA
                    </span>
                    <div className="w-16 h-16 rounded-xl bg-indigo-950/30 border-2 border-indigo-500/40 flex items-center justify-center overflow-hidden shadow-inner p-0.5 relative">
                      <img
                        src={pendingUrl}
                        alt="Proposed"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 mt-auto">
                  <button
                    onClick={() => handleReject(student)}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-rose-500/20 hover:border-transparent flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X size={12} />
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleApprove(student)}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-500/20 hover:border-transparent flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md hover:shadow-emerald-500/20"
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
  );
};
