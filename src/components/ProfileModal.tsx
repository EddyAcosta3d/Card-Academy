import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Clock, AlertTriangle, Image as ImageIcon, Sparkles, UploadCloud, Trash2, Link } from "lucide-react";
import { UserStats } from "../types";
import { supabaseService } from "../lib/supabaseService";
import { toast } from "sonner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onUpdateSuccess?: () => void;
}

const PRESET_AVATARS = [
  { name: "Guerrero", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hero1" },
  { name: "Maga", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hero2" },
  { name: "Exploradora", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hero3" },
  { name: "Astronauta", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky" },
  { name: "Robot Turbo", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Bot1" },
  { name: "Cypher", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Bot2" },
  { name: "Bit", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Bot3" },
  { name: "Gatito", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel1" },
  { name: "Perrito", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel2" },
  { name: "Zorrito", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel3" },
  { name: "Dragón", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Dragon" },
  { name: "Fénix", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix" }
];

// Utility function to load and compress an image file to Base64 (max 800x800, optimized JPEG quality)
const compressImage = (file: File): Promise<{ dataUrl: string; aspect: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const aspect = img.width / img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve({ dataUrl, aspect });
        } else {
          resolve({ dataUrl: event.target?.result as string, aspect });
        }
      };
      img.onerror = () => reject(new Error("Error al procesar la imagen cargada."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
};

const cropImage = (
  imageSrc: string,
  offset: { x: number; y: number },
  zoom: number,
  previewSize: number = 128
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const cropSize = 256;
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cropSize, cropSize);

      const imgAspect = img.width / img.height;
      let drawWidth = 0;
      let drawHeight = 0;

      if (imgAspect > 1) {
        drawHeight = cropSize;
        drawWidth = cropSize * imgAspect;
      } else {
        drawWidth = cropSize;
        drawHeight = cropSize / imgAspect;
      }

      drawWidth *= zoom;
      drawHeight *= zoom;

      const scaleFactor = cropSize / previewSize;
      const scaledOffsetX = offset.x * scaleFactor;
      const scaledOffsetY = offset.y * scaleFactor;

      const defaultX = (cropSize - drawWidth) / 2;
      const defaultY = (cropSize - drawHeight) / 2;

      const finalX = defaultX + scaledOffsetX;
      const finalY = defaultY + scaledOffsetY;

      ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Error al cropear la imagen."));
    img.src = imageSrc;
  });
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  stats,
  setStats,
  onUpdateSuccess
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "preset" | "url">("upload");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [zoom, setZoom] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffsetStart = useRef({ x: 0, y: 0 });

  const handlePositionMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPosition(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffsetStart.current = { ...offset };
  };

  const handlePositionMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPosition) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({
      x: dragOffsetStart.current.x + dx,
      y: dragOffsetStart.current.y + dy
    });
  };

  const handlePositionMouseUpOrLeave = () => {
    setIsDraggingPosition(false);
  };

  const handlePositionTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDraggingPosition(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragOffsetStart.current = { ...offset };
    }
  };

  const handlePositionTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingPosition || e.touches.length !== 1) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setOffset({
      x: dragOffsetStart.current.x + dx,
      y: dragOffsetStart.current.y + dy
    });
  };

  const handlePositionTouchEnd = () => {
    setIsDraggingPosition(false);
  };

  const [customUrl, setCustomUrl] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Retrieve current avatar metadata
  const packCurrencies = stats.packCurrencies || { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 };
  const avatarMeta = (packCurrencies as any)._avatar_meta || {
    status: "none",
    approvedUrl: "",
    pendingUrl: "",
    rejectedAt: ""
  };

  const isStudent = stats.role === "Student";
  const isTeacher = stats.role === "Teacher" || stats.role === "Admin";

  // Check if student is banned/locked from attempting image update due to a rejection within the last week
  let isBanned = false;
  let unlockDate: Date | null = null;
  let timeRemainingFormatted = "";

  if (isStudent && avatarMeta.status === "rejected" && avatarMeta.rejectedAt) {
    const rejectionTime = new Date(avatarMeta.rejectedAt).getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diff = now - rejectionTime;

    if (diff < oneWeekMs) {
      isBanned = true;
      unlockDate = new Date(rejectionTime + oneWeekMs);
      
      const remainingMs = oneWeekMs - diff;
      const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      if (days > 0) {
        timeRemainingFormatted = `${days}d y ${hours}h`;
      } else {
        timeRemainingFormatted = `${hours}h`;
      }
    }
  }

  // Determine current active display image
  const currentActiveAvatar = avatarMeta.status === "approved" && avatarMeta.approvedUrl
    ? avatarMeta.approvedUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.username || "user"}`;

  const handleSelectPreset = (url: string) => {
    if (isBanned) return;
    setSelectedPreset(url);
    setCustomUrl("");
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBanned) return;
    setCustomUrl(e.target.value);
    setSelectedPreset(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isBanned) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBanned) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    
    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. Elige una de menos de 15MB.");
      return;
    }

    const toastId = toast.loading("Procesando y optimizando imagen...");
    try {
      const { dataUrl, aspect } = await compressImage(file);
      setUploadedFileBase64(dataUrl);
      setImgAspect(aspect);
      setZoom(1.0);
      setOffset({ x: 0, y: 0 });
      toast.dismiss(toastId);
      toast.success("¡Imagen cargada exitosamente!");
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error("No se pudo procesar la foto elegida.");
    }
  };

  const handleRemoveUploaded = () => {
    setUploadedFileBase64(null);
    setImgAspect(1.0);
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    let chosenUrl = "";
    if (activeTab === "upload") {
      if (uploadedFileBase64) {
        setIsSubmitting(true);
        const toastId = toast.loading("Aplicando encuadre y optimizando tu foto...");
        try {
          chosenUrl = await cropImage(uploadedFileBase64, offset, zoom, 128);
          toast.dismiss(toastId);
        } catch (cropErr) {
          console.error("Error cropping photo:", cropErr);
          toast.dismiss(toastId);
          chosenUrl = uploadedFileBase64; // fallback
        }
      } else {
        chosenUrl = "";
      }
    } else if (activeTab === "preset") {
      chosenUrl = selectedPreset || "";
    } else if (activeTab === "url") {
      chosenUrl = customUrl.trim();
    }

    if (!chosenUrl) {
      toast.error("Por favor selecciona, sube o escribe una imagen de perfil.");
      setIsSubmitting(false);
      return;
    }

    // Basic URL validation
    if (activeTab === "url" && !customUrl.startsWith("http://") && !customUrl.startsWith("https://") && !customUrl.startsWith("data:image/")) {
      toast.error("El enlace de imagen debe comenzar con http:// o https://");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedMeta = { ...avatarMeta };

      if (isTeacher) {
        // Teachers get automatic approval
        updatedMeta.approvedUrl = chosenUrl;
        updatedMeta.status = "approved";
        updatedMeta.pendingUrl = "";
        toast.success("¡Imagen de perfil actualizada exitosamente!");
      } else {
        // Students require approval
        updatedMeta.pendingUrl = chosenUrl;
        updatedMeta.status = "pending";
        toast.info("¡Propuesta enviada! Tu imagen está en espera de aprobación por un administrador.");
        
        // Notify admin about the pending avatar!
        try {
          supabaseService.notifyAdmins(
            "Aprobación de Foto Pendiente 📸",
            `El alumno @${stats.username} (Grupo ${stats.grade || "S/G"}) ha propuesto una nueva foto de perfil y espera tu aprobación.`,
            "warning"
          );
        } catch (notifErr) {
          console.error("[ProfileModal] Error notifying admins of proposed avatar:", notifErr);
        }
      }

      // Update in local state structure
      const newPackCurrencies = {
        ...packCurrencies,
        _avatar_meta: updatedMeta
      };

      setStats((prev) => ({
        ...prev,
        packCurrencies: newPackCurrencies
      }));

      // Call Supabase update
      if (stats.id) {
        await supabaseService.updateUserStats(stats.id, {
          packCurrencies: newPackCurrencies
        });
      }

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Error saving avatar:", err);
      toast.error("Ocurrió un error al guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="profile-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          id="profile-modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-wider flex items-center gap-2">
                <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
                Actualizar Foto de Perfil
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {isStudent ? "Las imágenes de alumnos requieren aprobación del Admin" : "Tus cambios se aplicarán inmediatamente"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Current State Indicator */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/30 p-5 rounded-3xl border border-slate-800/60">
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/10 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img
                    src={currentActiveAvatar}
                    alt={stats.username || "Avatar"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {avatarMeta.status === "pending" && (
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl border-2 border-slate-900 shadow-lg animate-bounce" title="Pendiente de aprobación">
                    <Clock size={14} className="animate-spin" />
                  </div>
                )}
                {avatarMeta.status === "approved" && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl border-2 border-slate-900 shadow-lg" title="Aprobado">
                    <Check size={14} />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="text-lg font-black text-slate-200">@{stats.username}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Grado: <span className="text-indigo-400">{stats.grade || "S/G"}</span> • Rol: <span className="text-purple-400">{stats.role}</span>
                </div>

                {/* Pendings and warnings */}
                {avatarMeta.status === "pending" && (
                  <div className="mt-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <Clock size={12} className="shrink-0 animate-spin" />
                    <span>Tienes una foto pendiente de aprobación por el Admin.</span>
                  </div>
                )}

                {avatarMeta.status === "approved" && (
                  <div className="mt-2 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl flex items-center gap-2 inline-flex">
                    <Check size={12} className="shrink-0" />
                    <span>Tu foto de perfil personalizada está activa.</span>
                  </div>
                )}
              </div>
            </div>

            {/* If banned / rejected warning */}
            {isBanned && unlockDate && (
              <div id="ban-warning" className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-black text-rose-400 uppercase tracking-widest text-xs">
                  <AlertTriangle size={16} />
                  <span>Acceso Bloqueado Temporalmente</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Tu última foto de perfil propuesta fue rechazada por el administrador. Como regla de convivencia, no puedes volver a intentar cambiar tu foto por una semana.
                </p>
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-xl inline-block mt-1">
                  Desbloqueo en: {timeRemainingFormatted} ({unlockDate.toLocaleDateString()})
                </div>
              </div>
            )}

            {/* Input Selection form if not banned */}
            {!isBanned && (
              <div className="space-y-6">
                {/* Custom Tab Selector */}
                <div className="flex bg-slate-950 p-1.5 rounded-[1.25rem] border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "upload"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <UploadCloud size={14} />
                    Subir Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preset")}
                    className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "preset"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Sparkles size={14} />
                    Elegir Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "url"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Link size={14} />
                    Enlace de Internet
                  </button>
                </div>

                {/* Tab Content: Upload File */}
                {activeTab === "upload" && (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {!uploadedFileBase64 ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[180px] ${
                          isDragging
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <UploadCloud size={24} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Arrastra tu foto o haz clic para subir
                          </p>
                          <p className="text-[10px] font-medium text-slate-500">
                            Cualquier imagen en formato JPG, PNG o WEBP. Redimensionamiento automático.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-slate-950/30 p-6 rounded-3xl border border-slate-800/60 space-y-4">
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider animate-pulse flex items-center gap-1.5">
                          <Sparkles size={11} className="text-amber-400" /> Arrastra dentro del círculo para encuadrar tu foto
                        </span>

                        <div 
                          className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-black/30 cursor-grab active:cursor-grabbing select-none group"
                          onMouseDown={handlePositionMouseDown}
                          onMouseMove={handlePositionMouseMove}
                          onMouseUp={handlePositionMouseUpOrLeave}
                          onMouseLeave={handlePositionMouseUpOrLeave}
                          onTouchStart={handlePositionTouchStart}
                          onTouchMove={handlePositionTouchMove}
                          onTouchEnd={handlePositionTouchEnd}
                        >
                          <div className="w-full h-full bg-slate-950 rounded-full overflow-hidden flex items-center justify-center relative">
                            <img
                              src={uploadedFileBase64}
                              alt="Archivo subido"
                              className={`absolute top-1/2 left-1/2 pointer-events-none select-none transition-transform duration-75 max-w-none max-h-none ${
                                imgAspect > 1 ? "h-full w-auto" : "w-full h-auto"
                              }`}
                              style={{
                                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transformOrigin: "center",
                              }}
                              referrerPolicy="no-referrer"
                            />

                            {/* Subtle circular indicator helper on hover */}
                            <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none group-hover:border-white/30 transition-all flex items-center justify-center">
                              <div className="w-16 h-16 border border-white/5 rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Interactive Zoom Slider */}
                        <div className="w-full max-w-xs space-y-1.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850/60 flex flex-col items-center">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider w-full px-1">
                            <span>Zoom: {zoom.toFixed(2)}x</span>
                            <button 
                              type="button"
                              onClick={() => { setZoom(1.0); setOffset({ x: 0, y: 0 }); }}
                              className="text-indigo-400 hover:text-indigo-300 text-[8.5px] tracking-widest uppercase transition-all font-black cursor-pointer"
                            >
                              Centrar / Restaurar
                            </button>
                          </div>
                          <input
                            type="range"
                            min="0.3"
                            max="3.0"
                            step="0.02"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Elegir Otra
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveUploaded}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                          >
                            <Trash2 size={12} />
                            Quitar Imagen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: Presets */}
                {activeTab === "preset" && (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Aventureros & Mascotas Academia
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {PRESET_AVATARS.map((avatar) => {
                        const isSelected = selectedPreset === avatar.url;
                        return (
                          <button
                            key={avatar.name}
                            type="button"
                            onClick={() => handleSelectPreset(avatar.url)}
                            className={`relative aspect-square bg-slate-950 p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5 scale-95"
                                : "border-slate-800/80 hover:border-slate-700"
                            }`}
                          >
                            <img
                              src={avatar.url}
                              alt={avatar.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider truncate max-w-full mt-1">
                              {avatar.name}
                            </span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                                <Check size={10} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab Content: URL Link */}
                {activeTab === "url" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Enlace de Imagen de Internet (URL directa)
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                          <ImageIcon size={18} />
                        </div>
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/tu-foto.jpg"
                          value={customUrl}
                          onChange={handleCustomUrlChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                        />
                      </div>
                      <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                        Introduce la dirección URL directa que termine en .jpg, .png o .webp para usar otra foto de la web.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            {!isBanned && (
              <button
                onClick={handleSave}
                disabled={
                  isSubmitting ||
                  (activeTab === "upload" && !uploadedFileBase64) ||
                  (activeTab === "preset" && !selectedPreset) ||
                  (activeTab === "url" && !customUrl.trim())
                }
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? "Guardando..." : isStudent ? "Solicitar Aprobación" : "Guardar Foto"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
