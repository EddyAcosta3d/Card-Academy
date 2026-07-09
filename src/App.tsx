/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Sparkles,
  Coins,
  Flame,
  BookOpen,
  Book,
  LayoutDashboard,
  Library,
  ShoppingBag,
  Bell,
  Eye,
  EyeOff,
  User as UserIcon,
  ChevronRight,
  GraduationCap,
  ArrowLeft,
  FileUp,
  Download,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  Globe,
  Rocket,
  Beaker,
  Languages,
  Palette,
  Activity,
  Church,
  Briefcase,
  Divide,
  Calculator,
  PenTool,
  Map as MapIcon,
  Atom,
  MessageSquare,
  Heart,
  Film,
  Dumbbell,
  Cross,
  Code,
  Cpu,
  Music,
  Shield,
  Binary,
  Star,
  X,
  Loader2,
  TrendingUp,
  AlertCircle,
  FileCheck,
  BookOpenCheck,
  BarChart3,
  Users,
  Filter,
  Settings,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  UserCog,
  UserPlus,
  ChevronDown,
  Camera,
  Brain,
  History,
  Repeat,
  Check,
  Key,
  Clock,
  Search,
} from "lucide-react";

import { GoogleGenAI, Type } from "@google/genai";
import { Card as CardComponent } from "./components/Card";
import { StickerAlbum } from "./components/StickerAlbum";
import { PackOpening } from "./components/PackOpening";
import { DailyChallenge } from "./components/DailyChallenge";
import { LoginPage } from "./components/LoginPage";
import { Logo } from "./components/Logo";
import { ProfileModal } from "./components/ProfileModal";
import { AdminAvatarApprovals } from "./components/AdminAvatarApprovals";
import { AdminDashboardPendientes } from "./components/AdminDashboardPendientes";
import {
  UserStats,
  Card as CardType,
  Grade,
  Task,
  UserRole,
  Pack,
  Year,
  AppNotification,
} from "./types";
import {
  INITIAL_CARDS,
  INITIAL_CHALLENGE,
  ACADEMIC_CONTENT,
  SCHOOL_GROUPS,
  INITIAL_PACKS,
} from "./constants";
import { cn, compressImage, downloadBase64File } from "./lib/utils";
import { playCoinSound } from "./lib/sounds";
import { Toaster, toast } from "sonner";
import { supabase } from "./lib/supabase";
import { supabaseService } from "./lib/supabaseService";

export type Student = {
  id: string;
  name: string;
  username: string;
  grade: Grade;
  avatar?: string;
  collection: string[];
  completedTasks: string[];
  pendingTasks?: string[];
  streak: number;
  tokens: number;
  lastActive?: string;
  packCurrencies?: any;
};

export type TeacherModel = {
  id: string;
  name: string;
  subjects: string[];
  groups: string[];
  students: number;
  status: string;
  lastActive?: string;
};

const SubjectIcon = ({ name, size = 28 }: { name: string; size?: number }) => {
  const icons: Record<string, any> = {
    Numbers: Binary,
    BookOpen: BookOpen,
    Book: Book,
    Globe: Globe,
    Beaker: Beaker,
    Languages: Languages,
    Users: Users,
    Palette: Palette,
    Activity: Activity,
    Church: Church,
    Briefcase: Briefcase,
    Divide: Divide,
    Calculator: Calculator,
    SquareRoot: Calculator,
    PenTool: PenTool,
    Map: MapIcon,
    Atom: Atom,
    MessageSquare: MessageSquare,
    Heart: Heart,
    Film: Film,
    Running: Dumbbell,
    Cross: Cross,
    Code: Code,
    Cpu: Cpu,
    Zap: Zap,
    Music: Music,
    Trophy: Trophy,
    Shield: Shield,
  };
  const Icon = icons[name] || BookOpen;
  return <Icon size={size} />;
};

const AnimatedTokens = ({
  tokens,
  className,
}: {
  tokens: number;
  className?: string;
}) => {
  const [prevTokens, setPrevTokens] = useState(tokens);
  const [animations, setAnimations] = useState<{ id: number; diff: number }[]>(
    [],
  );
  const nextId = useRef(0);

  useEffect(() => {
    if (tokens > prevTokens) {
      const diff = tokens - prevTokens;
      const id = nextId.current++;
      setAnimations((a) => [...a, { id, diff }]);

      // Trigger coin sound
      playCoinSound();

      setTimeout(() => {
        setAnimations((a) => a.filter((anim) => anim.id !== id));
      }, 2000);
    }
    setPrevTokens(tokens);
  }, [tokens, prevTokens]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <span className="truncate">{tokens}</span>
      <AnimatePresence>
        {animations.map((anim) => (
          <motion.div
            key={anim.id}
            initial={{ opacity: 0, y: 30, scale: 0.5 }}
            animate={{ opacity: 1, y: 15, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none text-emerald-400 font-black text-xs sm:text-sm  z-50 flex items-center justify-center whitespace-nowrap"
          >
            +{anim.diff} <Coins size={10} className="ml-0.5" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const renderCompactSubjects = (assigned: string[]) => {
  if (!assigned || assigned.length === 0)
    return (
      <span className="text-[9px] font-black text-slate-600 uppercase italic">
        Sin asignar
      </span>
    );

  // Group by base subject ID
  const groupsBySubject = new Map<string, Set<string>>();

  assigned.forEach((sid) => {
    const parts = sid.includes(":") ? sid.split(":") : [sid];
    const subId = parts[0];
    const groupId = parts.slice(1).join(":");

    if (!groupsBySubject.has(subId)) groupsBySubject.set(subId, new Set());
    if (groupId) groupsBySubject.get(subId)!.add(groupId);
  });

  return Array.from(groupsBySubject.entries()).map(([sid, groups]) => {
    let prettyName = sid.replace("_", " ").toUpperCase();
    let year = sid.split("_")[1] || "";

    for (const y in ACADEMIC_CONTENT) {
      const sub = (ACADEMIC_CONTENT[y as Year] || []).find((s) => s.id === sid);
      if (sub) {
        prettyName = sub.name;
        year = y;
        break;
      }
    }

    // Identificación especial para Integración Curricular
    if (
      prettyName.toLowerCase().includes("integración") ||
      prettyName.toLowerCase().includes("int.")
    ) {
      prettyName = "INT";
    } else if (prettyName.toLowerCase().includes("tecnología")) {
      prettyName = "TEC";
    }

    const groupList = Array.from(groups).sort().join(",");
    const groupLabel = groupList ? ` (${groupList})` : "";

    return (
      <div
        key={sid}
        className="px-2 py-0.5 bg-cyan-900/40 border border-cyan-500/40 text-cyan-200 rounded text-[9px] font-black uppercase whitespace-nowrap shadow-sm"
      >
        {prettyName}
        {groupLabel}
      </div>
    );
  });
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedTeacherGroup, setSelectedTeacherGroup] = useState<
    string | null
  >(null);
  const [activeGroupStudentId, setActiveGroupStudentId] = useState<
    string | null
  >(null);
  const [groupDirectFeedback, setGroupDirectFeedback] = useState<string>("");
  const [groupStudentSearch, setGroupStudentSearch] = useState<string>("");
  const [activeStudentFilter, setActiveStudentFilter] = useState<
    "all" | "pending" | "online"
  >("all");
  const [customMotivationText, setCustomMotivationText] = useState<string>("");
  const defaultStats: UserStats = {
    grade: "2A",
    role: "Student",
    originalRole: "Student",
    username: "Alumno",
    assignedSubjects: ["math_2"],
    assignedGroups: ["2A"],
    tokens: 5000,
    streak: 15,
    collection: [
      "coll_A1_01",
      "coll_A1_03",
      "coll_A1_05",
      "coll_A1_07",
      "coll_A1_12",
      "coll_A2_02",
      "coll_A2_04",
      "coll_A2_06",
      "coll_A3_01",
      "coll_A3_04",
      "coll_A3_08",
      "achiev_1",
      "achiev_2",
      "achiev_3",
      "achiev_5",
      "achiev_17",
      "reward_1",
      "reward_3",
      "reward_4",
    ],
    unstickedCards: [
      "coll_A1_02",
      "coll_A2_01",
      "coll_A3_02",
      "achiev_4",
      "reward_2",
    ],
    completedTasks: [],
    dailyLimits: {
      lastResetDate: new Date().toDateString(),
      easyCompleted: 0,
      mediumCompleted: 0,
      hardCompleted: 0,
    },
    packCurrencies: {
      pack_jacobo: 1000,
      pack_culiacan: 1000,
      pack_six_seven: 1000,
    },
  };

  const [stats, setStats] = useState<UserStats>(defaultStats);
  const lastLocalUpdateRef = useRef<number>(0);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Heartbeat for real-time status
  useEffect(() => {
    if (!currentUserId) return;

    // Initial heartbeat
    supabaseService.heartbeat(currentUserId);

    // Periodic heartbeat every 60 seconds
    const interval = setInterval(() => {
      supabaseService.heartbeat(currentUserId);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadNotifications = React.useCallback(async () => {
    if (!currentUserId) return;
    try {
      const realTimeNotifs =
        await supabaseService.fetchNotifications(currentUserId);
      setNotifications(realTimeNotifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !isAuthenticated) return;

    // Load immediately
    loadNotifications();

    // Set up interval to reload notifications every 15 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUserId, isAuthenticated, loadNotifications]);

  const [teachers, setTeachers] = useState<TeacherModel[]>([]);
  const [globalStudents, setGlobalStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<{
    teacherId: string | null;
    isOpen: boolean;
    selectedGroups: string[];
    selectedSubjects: string[];
    activeYear: Year;
  }>({
    teacherId: null,
    isOpen: false,
    selectedGroups: [],
    selectedSubjects: [],
    activeYear: "1",
  });

  const [adminDashboardTab, setAdminDashboardTab] = useState<
    "stats" | "teachers" | "students" | "avatars" | "pendientes"
  >("stats");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState<{
    isOpen: boolean;
    role: "Teacher" | "Student";
  }>({ isOpen: false, role: "Teacher" });
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    grade: "",
  });
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // States for custom & AI challenge creation
  const [customTasks, setCustomTasks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("cardacademy_custom_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showCreateChallengeModal, setShowCreateChallengeModal] =
    useState(false);
  const [createChallengeType, setCreateChallengeType] = useState<
    "AI" | "Manual"
  >("AI");
  const [isGeneratingAIChallenge, setIsGeneratingAIChallenge] = useState(false);

  // AI fields
  const [aiChallengeForm, setAiChallengeForm] = useState({
    subjectId: "",
    topicName: "",
    idea: "",
  });

  // Manual fields
  const [manualChallengeForm, setManualChallengeForm] = useState({
    subjectId: "",
    grade: "1", // 1, 2, 3
    group: "A", // A, B, C, D
    topicName: "",
    title: "",
    description: "",
    instructions: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    type: "Exercise" as "Quiz" | "Exercise",
    quizOptions: ["", "", "", ""],
    quizAnswer: 0,
    evidenceRequired: true,
  });

  const addCustomTask = (newTask: any) => {
    setCustomTasks((prev) => {
      const updated = [...prev, newTask];
      try {
        localStorage.setItem(
          "cardacademy_custom_tasks",
          JSON.stringify(updated),
        );
      } catch (e) {
        console.error("Error saving custom tasks", e);
      }
      return updated;
    });
  };

  const handleGenerateAIChallenge = async () => {
    if (!aiChallengeForm.subjectId || !aiChallengeForm.topicName) {
      toast.error(
        "Por favor completa la materia y el tema para que la IA pueda crear el desafío.",
      );
      return;
    }

    setIsGeneratingAIChallenge(true);
    toast.info("Conectando con el Cerebro de IA para diseñar tu desafío...");

    try {
      const response = await fetch("/api/challenges/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: aiChallengeForm.subjectId,
          topicName: aiChallengeForm.topicName,
          idea: aiChallengeForm.idea,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al conectar con el servidor.");
      }

      const generated = data.challenge;

      // Map to CustomTask structure
      const selectedSubForAI = getSubjectListHelper().find(
        (s) => s.id === aiChallengeForm.subjectId,
      );
      const yearChar = selectedSubForAI ? selectedSubForAI.grade : "1";
      const targetGradeGroup = `${yearChar}A`; // Will assign to active group of that year

      const newchallenge = {
        id: `custom_task_ai_${Date.now()}`,
        title: generated.title,
        description: generated.description,
        instructions: generated.instructions,
        difficulty: generated.difficulty || "Medium",
        type: generated.type || "Exercise",
        quizOptions: generated.quizOptions || [],
        quizAnswer:
          generated.quizAnswer !== undefined ? generated.quizAnswer : -1,
        isAIQuiz: generated.type === "Quiz",
        reward: {
          tokens: generated.tokensReward || 50,
          pack: Math.random() > 0.6,
        },
        evidenceRequired: generated.evidenceRequired || false,
        subjectId: aiChallengeForm.subjectId,
        gradeGroup: targetGradeGroup,
        topicName: aiChallengeForm.topicName,
        topicId: `t_custom_${aiChallengeForm.subjectId}_${aiChallengeForm.topicName.trim().replace(/\s+/g, "_").toLowerCase()}`,
      };

      addCustomTask(newchallenge);
      toast.success(
        `🎉 Desafío "${generated.title}" diseñado con IA y asignado!`,
      );
      setShowCreateChallengeModal(false);
      setAiChallengeForm({
        subjectId: stats.assignedSubjects?.[0]?.split(":")?.[0] || "mat_1",
        topicName: "",
        idea: "",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al conectar con la API de IA.");
    } finally {
      setIsGeneratingAIChallenge(false);
    }
  };

  const handleSaveManualChallenge = () => {
    const {
      subjectId,
      group,
      topicName,
      title,
      description,
      instructions,
      difficulty,
      type,
      quizOptions,
      quizAnswer,
      evidenceRequired,
    } = manualChallengeForm;

    if (!subjectId || !topicName || !title || !description || !instructions) {
      toast.error(
        "Por favor completa todos los campos requeridos para el desafío.",
      );
      return;
    }

    if (type === "Quiz" && quizOptions.some((o) => !o.trim())) {
      toast.error("Por favor escribe las 4 opciones para el Quiz.");
      return;
    }

    // Automatically detect grade from chosen subject
    const selectedSub = getSubjectListHelper().find((s) => s.id === subjectId);
    const resolvedGrade = selectedSub ? selectedSub.grade : "1";

    const customId = `custom_task_manual_${Date.now()}`;
    const targetGradeGroup = `${resolvedGrade}${group}`;

    const newchallenge = {
      id: customId,
      title,
      description,
      instructions,
      difficulty,
      type,
      quizOptions: type === "Quiz" ? quizOptions : [],
      quizAnswer: type === "Quiz" ? quizAnswer : -1,
      isAIQuiz: type === "Quiz",
      reward: {
        tokens: difficulty === "Easy" ? 25 : difficulty === "Medium" ? 50 : 150,
        pack: difficulty === "Hard",
      },
      evidenceRequired: type === "Exercise" ? evidenceRequired : false,
      subjectId,
      gradeGroup: targetGradeGroup,
      topicName,
      topicId: `t_custom_${subjectId}_${topicName.trim().replace(/\s+/g, "_").toLowerCase()}`,
    };

    addCustomTask(newchallenge);
    toast.success(
      `✅ Desafío "${title}" creado manualmente y asignado al grupo ${targetGradeGroup}!`,
    );
    setShowCreateChallengeModal(false);
    setManualChallengeForm({
      subjectId: stats.assignedSubjects?.[0]?.split(":")?.[0] || "mat_1",
      grade: "1",
      group: "A",
      topicName: "",
      title: "",
      description: "",
      instructions: "",
      difficulty: "Medium",
      type: "Exercise",
      quizOptions: ["", "", "", ""],
      quizAnswer: 0,
      evidenceRequired: true,
    });
  };

  // Helper subjects mapped list
  const getSubjectListHelper = () => {
    const list: { id: string; name: string; grade: string }[] = [];
    Object.entries(ACADEMIC_CONTENT).forEach(([grade, subjects]: any) => {
      subjects.forEach((s: any) => {
        list.push({ id: s.id, name: s.name, grade });
      });
    });
    return list;
  };

  // Compute Enriched Academic Content
  const enrichedAcademicContent: Record<string, any[]> = (() => {
    // Deep clone static content
    const content = JSON.parse(JSON.stringify(ACADEMIC_CONTENT)) as Record<
      string,
      any[]
    >;

    // Merge customTasks
    customTasks.forEach((ct) => {
      const year = ct.gradeGroup ? ct.gradeGroup.charAt(0) : "1";
      if (!content[year]) return;

      const subject = content[year].find((s) => s.id === ct.subjectId);
      if (!subject) return;

      // Find or create topic
      let topic = subject.topics.find(
        (t: any) => t.name.toLowerCase() === ct.topicName.toLowerCase(),
      );
      if (!topic) {
        topic = {
          id:
            ct.topicId ||
            `t_custom_${ct.subjectId}_${ct.topicName.replace(/\s+/g, "_").toLowerCase()}`,
          name: ct.topicName,
          tasks: [],
        };
        subject.topics.push(topic);
      }

      // Add task if not there
      if (!topic.tasks.some((t: any) => t.id === ct.id)) {
        topic.tasks.push({
          id: ct.id,
          title: ct.title,
          description: ct.description,
          instructions: ct.instructions || "",
          difficulty: ct.difficulty,
          type: ct.type,
          quizOptions: ct.quizOptions || [],
          quizAnswer: ct.quizAnswer !== undefined ? ct.quizAnswer : -1,
          isAIQuiz: ct.isAIQuiz || false,
          reward: ct.reward || { tokens: 50 },
          evidenceRequired: ct.evidenceRequired || false,
        });
      }
    });

    return content;
  })();

  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    studentId: string;
    taskId: string;
  } | null>(null);
  const [teacherFeedbackComment, setTeacherFeedbackComment] = useState("");

  const [activeTab, setActiveTab] = useState<
    "home" | "collection" | "shop" | "challenges" | "profile"
  >("home");

  // Reset internal navigation when changing tabs
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedTask(null);
  }, [activeTab]);

  // Select first student automatically when a group is selected
  useEffect(() => {
    if (selectedTeacherGroup) {
      const studentsInGroup = globalStudents.filter(
        (s) => s.grade === selectedTeacherGroup,
      );
      if (studentsInGroup.length > 0) {
        setActiveGroupStudentId(studentsInGroup[0].id);
      } else {
        setActiveGroupStudentId(null);
      }
    } else {
      setActiveGroupStudentId(null);
    }
  }, [selectedTeacherGroup, globalStudents]);

  // Lookup details for any task by its ID
  const lookupTaskDetails = (taskId: string) => {
    for (const yearKey in enrichedAcademicContent) {
      const subjects = enrichedAcademicContent[yearKey];
      if (subjects) {
        for (const sub of subjects) {
          if (sub.topics) {
            for (const topic of sub.topics) {
              const found = topic.tasks.find((t: any) => t.id === taskId);
              if (found) {
                return {
                  task: found,
                  subject: sub,
                  topicName: topic.name,
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Directly approve a student's pending activity from the group's detailed screen
  const handleDirectApprove = async (studentId: string, taskId: string) => {
    const targetUserStats = rawStudents.find((u) => u.id === studentId);
    if (!targetUserStats) {
      toast.error("No se encontró el alumno original.");
      return;
    }

    const taskDetails = lookupTaskDetails(taskId)?.task;

    const updatedStats = { ...targetUserStats };
    updatedStats.pendingTasks = updatedStats.pendingTasks?.filter(
      (id) => id !== taskId,
    );
    updatedStats.completedTasks = [
      ...(updatedStats.completedTasks || []),
      taskId,
    ];

    if (taskDetails?.reward.tokens) {
      updatedStats.tokens += taskDetails.reward.tokens;
    }
    if (
      taskDetails?.reward.cardId &&
      !updatedStats.collection.includes(taskDetails.reward.cardId)
    ) {
      updatedStats.collection.push(taskDetails.reward.cardId);
    }

    try {
      await supabaseService.updateUserStats(targetUserStats.id!, updatedStats);
      await supabaseService.sendNotification(
        targetUserStats.id!,
        "Tarea Aprobada",
        `Tu tarea "${taskDetails?.title}" ha sido aprobada. ${groupDirectFeedback ? "Retroalimentación: " + groupDirectFeedback : "¡Recibiste tus recompensas!"}`,
        "success",
      );
      await loadUsers();
      setGroupDirectFeedback("");
      toast.success(
        `Actividad "${taskDetails?.title || "Desafío"}" aprobada con éxito.`,
      );
    } catch (err: any) {
      console.error("Error direct approval:", err);
      toast.error("Ocurrió un error al aprobar la actividad.");
    }
  };

  // Enviar mensaje motivacional o reconocimiento con fichas extra
  const handleSendEncouragement = async (
    studentId: string,
    customMessage?: string,
  ) => {
    const targetUserStats = rawStudents.find((u) => u.id === studentId);
    if (!targetUserStats) {
      toast.error("No se encontró el alumno original.");
      return;
    }
    const messageToSend =
      customMessage ||
      "¡Sigue así! Tu profesor reconoce tu dedicación y gran desempeño en clase. 🚀";

    const updatedStats = { ...targetUserStats };
    updatedStats.tokens = (updatedStats.tokens || 0) + 10;

    try {
      await supabaseService.updateUserStats(targetUserStats.id!, updatedStats);
      await supabaseService.sendNotification(
        targetUserStats.id!,
        "🎓 Reconocimiento del Profesor",
        `${messageToSend} (+10 🪙 de regalo de motivación)`,
        "success",
      );
      playCoinSound();
      await loadUsers();
      toast.success(
        `¡Mensaje enviado a ${targetUserStats.username || "el alumno"}! Recibió +10🪙.`,
      );
    } catch (err: any) {
      console.error("Error sending motivation:", err);
      toast.error("Error al enviar motivación.");
    }
  };

  // Integration of global configuration from Supabase
  useEffect(() => {
    const fetchGlobalConfig = async () => {
      const key = await supabaseService.getGlobalMasterKey();
      if (key) {
        setMasterTeacherKey(key);
        localStorage.setItem("masterTeacherKey", key);
      }
    };
    fetchGlobalConfig();
  }, []);

  // NEW admin state
  const [rawStudents, setRawStudents] = useState<UserStats[]>([]);

  const pendingAvatarsCount = React.useMemo(() => {
    return rawStudents.filter((s) => {
      const meta = (s.packCurrencies as any)?._avatar_meta;
      return meta?.status === "pending" && meta?.pendingUrl;
    }).length;
  }, [rawStudents]);

  const pendingTasksCount = React.useMemo(() => {
    return rawStudents.reduce(
      (acc, curr) => acc + (curr.pendingTasks?.length || 0),
      0,
    );
  }, [rawStudents]);

  const totalPendingsCount = pendingAvatarsCount + pendingTasksCount;

  const [masterTeacherKey, setMasterTeacherKey] = useState(() => {
    return localStorage.getItem("masterTeacherKey") || "DOCENTE-2026";
  });
  const [showMasterKeyInProfile, setShowMasterKeyInProfile] = useState(false);
  const [isEditingMasterKey, setIsEditingMasterKey] = useState(false);
  const [tempMasterKey, setTempMasterKey] = useState(masterTeacherKey);

  // Persistence for master key
  useEffect(() => {
    localStorage.setItem("masterTeacherKey", masterTeacherKey);
    setTempMasterKey(masterTeacherKey);
  }, [masterTeacherKey]);

  const loadUsers = React.useCallback(async () => {
    try {
      const users = await supabaseService.fetchAllUsers();

      setRawStudents(users.filter((u) => u.role === "Student"));

      const computeStudents: Student[] = users
        .filter((u) => u.role === "Student")
        .map((s) => {
          const meta = (s.packCurrencies as any)?._avatar_meta;
          const finalAvatar =
            meta?.status === "approved" && meta?.approvedUrl
              ? meta.approvedUrl
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`;
          return {
            id: s.id || s.username || "",
            name: s.username || "Alumno",
            username: s.username || "Alumno",
            grade: s.grade || "2A",
            collection: s.collection || [],
            completedTasks: s.completedTasks || [],
            pendingTasks: s.pendingTasks || [],
            streak: s.streak || 0,
            tokens: s.tokens || 0,
            lastActive: s.lastActive,
            avatar: finalAvatar,
            packCurrencies: s.packCurrencies,
          };
        });
      setGlobalStudents(computeStudents);

      const computeTeachers: TeacherModel[] = users
        .filter((u) => u.role === "Teacher")
        .map((t) => ({
          id: t.id || t.username || "",
          name: t.username || "Profesor",
          subjects: t.assignedSubjects || [],
          groups: t.assignedGroups || [],
          students: users.filter(
            (u) =>
              u.role === "Student" &&
              (t.assignedGroups || []).includes(u.grade),
          ).length,
          status: "Active",
          lastActive: t.lastActive,
        }));

      setTeachers(computeTeachers);
    } catch (e) {
      console.error("Error loading all users from Supabase:", e);
    }
  }, [stats.role, stats.username, currentUser]);

  useEffect(() => {
    // Solo cargar usuarios si está autenticado y tiene permisos
    if (
      isAuthenticated &&
      (stats.role === "Admin" || stats.role === "Teacher")
    ) {
      loadUsers();
    }
  }, [loadUsers, adminDashboardTab, isAuthenticated, stats.role]);

  const allStudents = React.useMemo(() => {
    const map = new Map<string, Student>();
    // Always include current real students from Supabase
    globalStudents.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [globalStudents, currentUser, stats.username]);

  const adjustStudentTokens = async (student: Student, amount: number) => {
    if (!student.id) return;
    const newTokens = Math.max(0, student.tokens + amount);
    try {
      await supabaseService.updateUserStats(student.id, { tokens: newTokens });
      await supabaseService.sendNotification(
        student.id,
        amount > 0 ? "🪙 ¡Fichas Recibidas!" : "🪙 Ajuste de Saldo",
        amount > 0
          ? `El Administrador te ha otorgado +${amount} medallas.`
          : `El Administrador ha retirado ${Math.abs(amount)} medallas de tu saldo.`,
        amount > 0 ? "success" : "info"
      );
      await loadUsers();
      toast.success(
        amount > 0
          ? `Se otorgaron +${amount} puntos a ${student.username}.`
          : `Se retiraron ${Math.abs(amount)} puntos a ${student.username}.`
      );
    } catch (e) {
      console.error("Error adjusting student tokens:", e);
      toast.error("Error al actualizar los puntos.");
    }
  };

  const [selectedAdminCard, setSelectedAdminCard] = useState<CardType | null>(
    null,
  );
  const [collectionSubTab, setCollectionSubTab] = useState<
    "Collectible" | "Achievement"
  >("Collectible");
  const [rankingSubTab, setRankingSubTab] = useState<
    "Collectible" | "Achievement"
  >("Collectible");
  const [showPackOpener, setShowPackOpener] = useState(false);
  const [exchangePackId, setExchangePackId] = useState<string | null>(null);
  const [packs, setPacks] = useState<Pack[]>(INITIAL_PACKS);
  const [activePack, setActivePack] = useState<Pack | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState(INITIAL_CHALLENGE);
  const [hasCompletedDaily, setHasCompletedDaily] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [sessionCompletedChallenges, setSessionCompletedChallenges] = useState<
    Set<string>
  >(new Set());
  const [animatingCards, setAnimatingCards] = useState<string[]>([]);
  const [dbCards, setDbCards] = useState<CardType[]>([]);

  // Fetch all cards from database
  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from("cards").select("*");
      if (error) {
        console.error("Error fetching cards from DB:", error);
        return;
      }
      if (data && data.length > 0) {
        const mappedCards: CardType[] = data.map((c) => ({
          id: c.id,
          name: c.name,
          rarity: c.rarity as any,
          sourcePackId: c.pack_type,
          description: c.description || "",
          imageUrl:
            c.image_url ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${c.id}`,
          category: (c.category as any) || "Collectible",
        }));
        setDbCards(mappedCards);
      }
    };
    fetchCards();
  }, []);

  // Compute total cards (DB + Constants as fallback)
  const allAvailableCards = React.useMemo(() => {
    const cardMap = new Map<string, CardType>();
    INITIAL_CARDS.forEach((c) => cardMap.set(c.id, c));
    dbCards.forEach((c) => cardMap.set(c.id, c));
    return Array.from(cardMap.values());
  }, [dbCards]);

  const generateDailyChallenge = async () => {
    setIsGeneratingChallenge(true);
    try {
      const response = await fetch("/api/challenges/generate-daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al consultar el desafío diario al servidor");
      }
      const result = await response.json();
      if (result.success && result.challenge) {
        const data = result.challenge;
        setCurrentChallenge({
          id: `daily_${Date.now()}`,
          subject: "Cultura General",
          question: data.question,
          options: data.options,
          correctAnswer: data.answer,
          difficulty: "Medium",
          tokenReward: hasCompletedDaily ? 0 : 25,
        });
      } else {
        throw new Error(result.error || "Respuesta inválida del servidor");
      }
    } catch (e) {
      console.error("Error generating daily challenge:", e);
      // Fallback amigable si falla la IA o la conexión
      setCurrentChallenge({
        id: `daily_fallback_${Date.now()}`,
        subject: "Cultura General",
        question: "¿Qué color se obtiene al mezclar pintura de color azul con amarillo?",
        options: ["Rojo", "Verde", "Morado", "Naranja"],
        correctAnswer: 1,
        difficulty: "Easy",
        tokenReward: hasCompletedDaily ? 0 : 25,
      });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && stats.role === "Student") {
      if (currentChallenge.id === "daily_1") {
        generateDailyChallenge();
      }
    }
  }, [isAuthenticated, stats.role, currentChallenge.id]);

  // Navigation for challenges
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Reset scroll to top when switching between sections
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, selectedSubject, selectedTopic]);

  // AI Quiz State
  const [aiQuiz, setAiQuiz] = useState<{
    question: string;
    options: string[];
    answer: number;
  } | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const packsScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingPack, setIsDraggingPack] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDraggingPack(true);
    setDragStartX(e.pageX - e.currentTarget.offsetLeft);
    setDragScrollLeft(e.currentTarget.scrollLeft);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !isDraggingPack) return;
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - dragStartX) * 2;
    if (packsScrollRef.current) {
      packsScrollRef.current.scrollLeft = dragScrollLeft - walk;
    }
  };
  const handlePointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    setIsDraggingPack(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const generateAIQuiz = async (subjectName: string, topicName: string) => {
    setIsGeneratingQuiz(true);
    setAiQuiz(null);

    try {
      const response = await fetch("/api/challenges/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectName,
          topicName,
          grade: stats.grade || "1",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al consultar el quiz con IA al servidor");
      }

      const result = await response.json();
      if (result.success && result.quiz) {
        setAiQuiz(result.quiz);
      } else {
        throw new Error(result.error || "Respuesta de quiz inválida");
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      const errorMessage = error?.message || "Error de red o servidor";
      toast.error(
        `Hubo un problema al generar el quiz con la IA: ${errorMessage}. Cargando una pregunta de respaldo...`,
      );
      // Fallback amigable adaptado para la materia actual
      setAiQuiz({
        question: `Pregunta de repaso de ${subjectName} sobre el tema "${topicName}": ¿Cuál de las siguientes palabras describe la idea de aprender sobre este tema?`,
        options: [
          "Una idea importante para conocer nuestro mundo",
          "Algo que no tiene relación",
          "Un concepto muy misterioso",
          "Una palabra al azar"
        ],
        answer: 0
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Load from Supabase or local storage on mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const fetchedStats = await supabaseService.getProfile(
            session.user.id,
            session.user.user_metadata,
          );
          setStats(fetchedStats);
          setCurrentUserId(session.user.id);
          setCurrentUser(fetchedStats.username || "Usuario");
          setIsAuthenticated(true);
        } catch (e: any) {
          if (e.message === "Tu perfil de usuario no fue encontrado.") {
            // Silently clean up orphan session
            await handleLogout();
          } else {
            console.error("Error fetching user stats on mount:", e);
          }
        }
      } else {
        const savedUser = localStorage.getItem("cardacademy_current_user");
        if (savedUser) {
          setCurrentUser(savedUser);
          const saved = localStorage.getItem(`cardacademy_stats_${savedUser}`);
          if (saved) {
            const parsedStats: UserStats = JSON.parse(saved);
            const today = new Date().toDateString();
            if (
              !parsedStats.dailyLimits ||
              parsedStats.dailyLimits.lastResetDate !== today
            ) {
              parsedStats.dailyLimits = {
                lastResetDate: today,
                easyCompleted: 0,
                mediumCompleted: 0,
                hardCompleted: 0,
              };
            }
            setStats(parsedStats);
          }
        }
        const authStatus = localStorage.getItem("cardacademy_is_authenticated");
        if (authStatus === "true") setIsAuthenticated(true);
      }

      const completed = localStorage.getItem("cardacademy_challenge_completed");
      if (completed === new Date().toDateString()) setHasCompletedDaily(true);
    };
    checkSession();
  }, []);

  // Save to Supabase and local storage
  useEffect(() => {
    if (currentUserId && stats.username) {
      // Mark the last local update timestamp
      lastLocalUpdateRef.current = Date.now();

      // Sync with Supabase (fire and forget for now, but in production consider debouncing)
      supabaseService
        .updateUserStats(currentUserId, stats)
        .catch(console.error);
    }
    if (currentUser) {
      localStorage.setItem(
        `cardacademy_stats_${currentUser}`,
        JSON.stringify(stats),
      );
    }
  }, [stats, currentUserId, currentUser]);

  // Periodic sync of student's profile from Supabase to prevent clobbering teacher approvals
  useEffect(() => {
    if (!currentUserId || stats.role !== "Student" || !isAuthenticated) return;

    let isSubscribed = true;

    const syncStudentProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !isSubscribed) return;

        // Skip sync if the student recently updated their local stats (allow 10 seconds to persist to db)
        if (Date.now() - lastLocalUpdateRef.current < 10000) {
          console.log("[Stats Sync] Skipped periodic sync to prevent clobbering recent local updates");
          return;
        }
        
        const fetchedStats = await supabaseService.getProfile(
          session.user.id,
          session.user.user_metadata,
        );

        if (!isSubscribed) return;

        setStats((prev) => {
          // Double check ref within state setter
          if (Date.now() - lastLocalUpdateRef.current < 10000) {
            return prev;
          }

          // Check if key fields have been updated by teacher (tokens, pendingTasks, completedTasks, packCurrencies, collection)
          const tokensChanged = fetchedStats.tokens !== prev.tokens;
          const streakChanged = fetchedStats.streak !== prev.streak;
          const pendingChanged = JSON.stringify(fetchedStats.pendingTasks) !== JSON.stringify(prev.pendingTasks);
          const completedChanged = JSON.stringify(fetchedStats.completedTasks) !== JSON.stringify(prev.completedTasks);
          const collectionChanged = JSON.stringify(fetchedStats.collection) !== JSON.stringify(prev.collection);
          
          // Check nested evidences safely
          const prevEvidences = prev.packCurrencies?._task_evidences || {};
          const fetchedEvidences = fetchedStats.packCurrencies?._task_evidences || {};
          const evidencesChanged = JSON.stringify(prevEvidences) !== JSON.stringify(fetchedEvidences);

          if (tokensChanged || streakChanged || pendingChanged || completedChanged || collectionChanged || evidencesChanged) {
            console.log("[Stats Sync] Merging updated student profile from database (Teacher review or reward detected!)");
            return {
              ...prev,
              tokens: fetchedStats.tokens,
              streak: fetchedStats.streak,
              pendingTasks: fetchedStats.pendingTasks,
              completedTasks: fetchedStats.completedTasks,
              collection: fetchedStats.collection,
              packCurrencies: fetchedStats.packCurrencies,
              dailyLimits: fetchedStats.dailyLimits || prev.dailyLimits,
            };
          }
          return prev;
        });
      } catch (err) {
        console.error("Error in periodic stats sync:", err);
      }
    };

    // Run every 12 seconds
    const interval = setInterval(syncStudentProfile, 12000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [currentUserId, stats.role, isAuthenticated]);

  // Periodic sync of user list for teachers and admins to see new submissions automatically
  useEffect(() => {
    if (!isAuthenticated || (stats.role !== "Admin" && stats.role !== "Teacher")) return;

    const interval = setInterval(() => {
      console.log("[Users Sync] Periodically reloading student list for teacher/admin dashboard");
      loadUsers();
    }, 15000); // Reload every 15 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, stats.role, loadUsers]);

  const handleLogin = (
    role: UserRole,
    username: string,
    grade?: string,
    initialStats?: UserStats,
  ) => {
    const freshUser = username || "Alumno";
    setCurrentUser(freshUser);
    localStorage.setItem("cardacademy_current_user", freshUser);

    if (initialStats) {
      setStats(initialStats);
      if (initialStats.id) setCurrentUserId(initialStats.id);
    } else {
      const savedStats = localStorage.getItem(`cardacademy_stats_${freshUser}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      } else {
        const freshStats: UserStats = {
          ...defaultStats,
          tokens: 0,
          streak: 0,
          collection: [],
          unstickedCards: [],
          completedTasks: [],
          packCurrencies: {
            pack_jacobo: 0,
            pack_culiacan: 0,
            pack_six_seven: 0,
          },
        };

        setStats({
          ...freshStats,
          role: role,
          originalRole: role,
          username: freshUser,
          grade: (grade as any) || (role === "Student" ? "2A" : "2D"),
          assignedSubjects:
            role === "Teacher" ? [] : role === "Admin" ? [] : ["math_2"],
          assignedGroups:
            role === "Teacher"
              ? []
              : role === "Admin"
                ? []
                : [(grade as any) || "2A"],
        });
      }
    }

    setIsAuthenticated(true);
    localStorage.setItem("cardacademy_is_authenticated", "true");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentUserId(null);
    setStats(defaultStats); // Reset stats on logout
    localStorage.removeItem("cardacademy_is_authenticated");
    localStorage.removeItem("cardacademy_current_user");
  };

  const handleChallengeComplete = (correctResult: boolean) => {
    if (correctResult) {
      setStats((prev) => ({
        ...prev,
        tokens: prev.tokens + currentChallenge.tokenReward,
        streak: prev.streak + 1,
      }));
    }
    setHasCompletedDaily(true);
    setSessionCompletedChallenges((prev) => {
      const next = new Set(prev);
      next.add(currentChallenge.id);
      return next;
    });
    localStorage.setItem(
      "cardacademy_challenge_completed",
      new Date().toDateString(),
    );
  };

  const handleCardsDrawn = (newCards: CardType[], packId: string) => {
    const collectionSet = new Set(stats.collection);
    const currentDrawnSet = new Set<string>();
    const trulyNewCardIds: string[] = [];
    let duplicatePoints = 0;
    let duplicateCount = 0;

    newCards.forEach((c) => {
      if (collectionSet.has(c.id) || currentDrawnSet.has(c.id)) {
        duplicateCount++;
        const points =
          c.rarity === "Legendary" || c.rarity === "Secret"
            ? 200
            : c.rarity === "Epic"
              ? 50
              : c.rarity === "Rare"
                ? 15
                : 5;
        duplicatePoints += points;
      } else {
        trulyNewCardIds.push(c.id);
      }
      currentDrawnSet.add(c.id);
    });

    setStats((prev) => {
      const prevCollectionSet = new Set(prev.collection);
      currentDrawnSet.forEach((cId) => prevCollectionSet.add(cId));

      const newPackCurrencies = prev.packCurrencies
        ? { ...prev.packCurrencies }
        : { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 };
      if (duplicatePoints > 0) {
        newPackCurrencies[packId] =
          (newPackCurrencies[packId] || 0) + duplicatePoints;
      }

      return {
        ...prev,
        collection: Array.from(prevCollectionSet),
        packCurrencies: newPackCurrencies,
      };
    });

    if (duplicatePoints > 0) {
      toast.info(
        `¡Obtuviste ${duplicateCount} carta(s) repetida(s)! Ganaste ${duplicatePoints} moneda(s) para la tienda.`,
      );
    }

    setAnimatingCards(trulyNewCardIds);
  };

  const buyPack = (pack: Pack) => {
    if (stats.tokens >= pack.price) {
      setStats((prev) => ({ ...prev, tokens: prev.tokens - pack.price }));
      setActivePack(pack);
      setShowPackOpener(true);
    } else {
      toast.error(`Medallas insuficientes para adquirir ${pack.name}.`);
    }
  };

  const completeTask = (task: Task) => {
    setStats((prev) => {
      const newStats = { ...prev };

      // Tokens
      if (task.reward.tokens) newStats.tokens += task.reward.tokens;

      // Card
      if (
        task.reward.cardId &&
        !newStats.collection.includes(task.reward.cardId)
      ) {
        newStats.collection = [...newStats.collection, task.reward.cardId];
      }

      // Task status
      if (!newStats.completedTasks.includes(task.id)) {
        newStats.completedTasks = [...newStats.completedTasks, task.id];
      }

      // Update Daily Limits
      if (newStats.dailyLimits) {
        if (task.difficulty === "Easy") newStats.dailyLimits.easyCompleted++;
        else if (task.difficulty === "Medium")
          newStats.dailyLimits.mediumCompleted++;
        else if (task.difficulty === "Hard")
          newStats.dailyLimits.hardCompleted++;
      }

      // If pack rewarded
      if (task.reward.pack) {
        setShowPackOpener(true);
      } else if (task.reward.cardId || task.reward.tokens) {
        toast.success(
          `¡Misión Cumplida! Has ganado: ${task.reward.tokens ? `${task.reward.tokens} Medallas` : ""} ${task.reward.cardId ? " y una Nueva Tarjeta" : ""}`,
        );
      }

      return newStats;
    });
  };

  const submitTaskForReview = async (task: Task, evidenceUrl?: string) => {
    // Record direct interaction time to skip sync race condition
    lastLocalUpdateRef.current = Date.now();

    setStats((prev) => {
      const pendingTasks = prev.pendingTasks || [];
      const updatedPendingTasks = (pendingTasks.includes(task.id) || (prev.completedTasks || []).includes(task.id))
        ? pendingTasks
        : [...pendingTasks, task.id];

      // Clone packCurrencies and its nested _task_evidences safely
      const packCurrencies = prev.packCurrencies
        ? { ...prev.packCurrencies }
        : { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 };

      if (evidenceUrl) {
        const _task_evidences = packCurrencies._task_evidences
          ? { ...packCurrencies._task_evidences }
          : {};
        _task_evidences[task.id] = evidenceUrl;
        packCurrencies._task_evidences = _task_evidences;
      }

      return {
        ...prev,
        pendingTasks: updatedPendingTasks,
        packCurrencies,
      };
    });

    try {
      const studentName = stats.username || "Un estudiante";
      const studentGrade = stats.grade || "S/G";
      const hasEvidenceText = evidenceUrl ? " con evidencia adjunta" : "";

      await supabaseService.notifyTeachersAndAdminsForStudent(
        currentUserId,
        studentName,
        studentGrade,
        "📤 Nueva Evidencia Entregada",
        `El alumno ${studentName} (${studentGrade}) ha enviado la tarea "${task.title}"${hasEvidenceText} para tu revisión.`,
        "info"
      );
    } catch (err) {
      console.error("Error sending submission notification to teachers:", err);
    }
  };

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = allAvailableCards.find((c) => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-indigo-500/30">
      <Toaster position="top-center" richColors theme="dark" />
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage
              onLogin={handleLogin}
              masterTeacherKey={masterTeacherKey}
              schoolGroups={SCHOOL_GROUPS}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence>
              {selectedCardId && selectedCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 "
                  onClick={() => setSelectedCardId(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center gap-8"
                  >
                    <CardComponent
                      card={selectedCard}
                      isExpanded={true}
                      className="w-[280px] sm:w-[320px] aspect-[2/3] max-w-full shadow-lg"
                    />
                    <button
                      onClick={() => setSelectedCardId(null)}
                      className="bg-slate-800 text-white px-10 py-3 rounded-full font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-colors shadow-md"
                    >
                      Regresar
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Header */}
            <nav className="h-16 md:h-20 bg-slate-900/80 border-b border-indigo-500/30 sticky top-0 z-30 px-3 md:px-6 flex items-center justify-center">
              <div className="absolute inset-0 -z-10  pointer-events-none"></div>
              <div className="w-full max-w-6xl flex justify-between items-center gap-2 relative">
                {/* Mobile Center Logo */}
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none z-10">
                  <Logo
                    size="xs"
                    className="scale-[1.4] origin-center pointer-events-auto"
                    hideTextOnMobile={true}
                  />
                </div>

                <div className="flex items-center gap-1 sm:gap-3 shrink-0 min-w-0">
                  {/* Desktop Left Logo */}
                  <div className="hidden md:block shrink-0">
                    <Logo
                      size="xs"
                      className="md:scale-110 origin-left"
                      subtitle={
                        <p className="hidden md:flex text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] items-center gap-2 font-mono leading-none">
                          <span>
                            {stats.role === "Admin"
                              ? "Admin"
                              : stats.role === "Teacher"
                                ? "Docente"
                                : "Estudiante"}
                          </span>
                        </p>
                      }
                    />
                  </div>

                  {/* Mobile Left Coins/Streak */}
                  {stats.role === "Student" && (
                    <div className="flex md:hidden items-center gap-1 sm:gap-3 shrink min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 px-1.5 py-1 rounded-full border border-slate-700 shrink min-w-0">
                        <AnimatedTokens
                          tokens={stats.tokens}
                          className="text-amber-400 font-bold text-xs"
                        />
                        <Coins className="text-amber-500 shrink-0" size={12} />
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-1.5 py-1 rounded-full border border-rose-500/30 shadow-lg shrink min-w-0">
                        <Flame
                          className="text-rose-500 animate-pulse  shrink-0"
                          size={14}
                        />
                        <span className="text-rose-400 font-black font-mono text-xs tracking-tighter drop-shadow-md truncate">
                          {stats.streak}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Mobile Left Teacher Students Online */}
                  {stats.role === "Teacher" && (
                    <div className="flex md:hidden items-center gap-1 sm:gap-3 shrink min-w-0">
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/30 shrink min-w-0 shadow-lg">
                        <span className="text-[10px] uppercase text-cyan-400 font-black tracking-widest hidden sm:inline-block">
                          Alumnos
                        </span>
                        <span className="text-[10px] uppercase text-cyan-400 font-black tracking-widest sm:hidden">
                          Alum.
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg"></div>
                        <span className="text-indigo-400 font-black font-mono text-xs tracking-tighter truncate">
                          {
                            globalStudents.filter((s) => {
                              const isAssigned = stats.assignedGroups.includes(
                                s.grade,
                              );
                              if (!isAssigned) return false;
                              if (!s.lastActive) return false;
                              const lastSeen = new Date(s.lastActive).getTime();
                              const now = Date.now();
                              return now - lastSeen < 300000; // 5 minutes
                            }).length
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 sm:gap-3 md:gap-6 min-w-0">
                  {/* Desktop Right Coins/Streak */}
                  {stats.role === "Student" && (
                    <div className="hidden md:flex items-center gap-3 shrink min-w-0">
                      <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 shrink min-w-0">
                        <AnimatedTokens
                          tokens={stats.tokens}
                          className="text-amber-400 font-bold text-sm"
                        />
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">
                          Medallas
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/30 shadow-lg shrink min-w-0">
                        <Flame
                          className="text-rose-500 animate-pulse  shrink-0"
                          size={14}
                        />
                        <span className="text-rose-400 font-black font-mono text-base tracking-tighter drop-shadow-md truncate">
                          {stats.streak}
                        </span>
                        <span className="text-[11px] uppercase text-rose-300/80 font-black tracking-widest">
                          Racha
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Desktop Right Teacher Students Online */}
                  {stats.role === "Teacher" && (
                    <div className="hidden md:flex items-center gap-3 shrink min-w-0">
                      <div className="flex items-center gap-2.5 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30 shadow-lg shrink min-w-0">
                        <span className="text-[11px] uppercase text-cyan-400 font-black tracking-widest">
                          Alumnos
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg"></div>
                        <span className="text-indigo-400 font-black font-mono text-base tracking-tighter truncate">
                          {
                            globalStudents.filter((s) => {
                              const isAssigned = stats.assignedGroups.includes(
                                s.grade,
                              );
                              if (!isAssigned) return false;
                              if (!s.lastActive) return false;
                              const lastSeen = new Date(s.lastActive).getTime();
                              const now = Date.now();
                              return now - lastSeen < 300000; // 5 minutes
                            }).length
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                    >
                      <Bell size={20} />
                      {notifications.filter((n) => !n.isRead).length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="fixed inset-0 bg-slate-950/60  z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ originX: 1, originY: 0 }}
                            className={cn(
                              "fixed top-[72px] inset-x-4 mx-auto w-auto max-w-[320px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 sm:max-w-none bg-slate-900 border-2 rounded-3xl shadow-lg overflow-hidden z-50 flex flex-col",
                              stats.role === "Admin"
                                ? "border-amber-500/50 shadow-amber-500/20"
                                : stats.role === "Teacher"
                                  ? "border-indigo-500/50 shadow-indigo-500/20"
                                  : "border-emerald-500/50 shadow-emerald-500/20",
                            )}
                          >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
                              <h3 className="font-black text-slate-100 uppercase tracking-widest text-[10px]">
                                Notificaciones
                              </h3>
                              {notifications.filter((n) => !n.isRead).length >
                                0 && (
                                <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest">
                                  {
                                    notifications.filter((n) => !n.isRead)
                                      .length
                                  }{" "}
                                  NUEVAS
                                </span>
                              )}
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto transform-gpu no-scrollbar bg-slate-900 min-h-[100px]">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                  <Bell
                                    size={32}
                                    className="mx-auto text-slate-700 mb-3 opacity-20"
                                  />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    No tienes notificaciones
                                  </p>
                                </div>
                              ) : (
                                notifications.map((n) => (
                                  <div
                                    key={n.id}
                                    onClick={async () => {
                                      if (!n.isRead) {
                                        try {
                                          await supabaseService.markNotificationAsRead(
                                            n.id,
                                          );
                                          loadNotifications();
                                        } catch (e) {
                                          console.error(
                                            "Error marking as read:",
                                            e,
                                          );
                                        }
                                      }
                                    }}
                                    className={cn(
                                      "p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden",
                                      !n.isRead && "bg-indigo-500/5",
                                    )}
                                  >
                                    {!n.isRead && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                      <p
                                        className={cn(
                                          "text-[9px] font-black uppercase tracking-widest",
                                          n.type === "success"
                                            ? "text-emerald-400"
                                            : n.type === "warning"
                                              ? "text-amber-400"
                                              : n.type === "error"
                                                ? "text-rose-400"
                                                : "text-indigo-400",
                                        )}
                                      >
                                        [{n.title.toUpperCase()}]
                                      </p>
                                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-400">
                                        {new Date(
                                          n.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                      {n.message}
                                    </p>
                                  </div>
                                ))
                              )}
                              <div className="p-3 text-center bg-slate-900 sticky bottom-0 border-t border-slate-800">
                                <button
                                  onClick={async () => {
                                    if (currentUserId) {
                                      await supabaseService.markAllNotificationsAsRead(
                                        currentUserId,
                                      );
                                      loadNotifications();
                                    }
                                  }}
                                  className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors py-2"
                                >
                                  Marcar todas como leídas
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={cn(
                        "flex items-center gap-0.5 sm:gap-2 p-1 rounded-full transition-all border-2",
                        stats.role === "Admin"
                          ? "border-amber-500"
                          : stats.role === "Teacher"
                            ? "border-indigo-500"
                            : "border-emerald-500",
                        isProfileOpen
                          ? "bg-slate-800"
                          : "hover:bg-slate-800/50",
                      )}
                    >
                      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                        {(stats.packCurrencies as any)?._avatar_meta?.status ===
                          "approved" &&
                        (stats.packCurrencies as any)?._avatar_meta
                          ?.approvedUrl ? (
                          <img
                            src={
                              (stats.packCurrencies as any)._avatar_meta
                                .approvedUrl
                            }
                            alt={stats.username}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-gradient-to-tr transition-all flex items-center justify-center text-white font-black text-xs uppercase",
                              stats.role === "Admin"
                                ? "from-amber-400 to-rose-600"
                                : stats.role === "Teacher"
                                  ? "from-indigo-400 to-purple-600"
                                  : "from-emerald-400 to-cyan-600",
                            )}
                          >
                            {stats.username
                              ? stats.username.charAt(0)
                              : stats.role.charAt(0)}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "hidden sm:block text-slate-400 transition-transform",
                          isProfileOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProfileOpen(false)}
                            className="fixed inset-0 bg-slate-950/60  z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ originX: 1, originY: 0 }}
                            className={cn(
                              "fixed top-[72px] inset-x-4 mx-auto w-auto max-w-[280px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-64 sm:max-w-none bg-slate-900 border-2 rounded-3xl shadow-lg overflow-hidden z-50 p-2",
                              stats.role === "Admin"
                                ? "border-amber-500/50 shadow-amber-500/20"
                                : stats.role === "Teacher"
                                  ? "border-indigo-500/50 shadow-indigo-500/20"
                                  : "border-emerald-500/50 shadow-emerald-500/20",
                            )}
                          >
                            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                                {(stats.packCurrencies as any)?._avatar_meta
                                  ?.status === "approved" &&
                                (stats.packCurrencies as any)?._avatar_meta
                                  ?.approvedUrl ? (
                                  <img
                                    src={
                                      (stats.packCurrencies as any)._avatar_meta
                                        .approvedUrl
                                    }
                                    alt={stats.username}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div
                                    className={cn(
                                      "w-full h-full flex items-center justify-center text-white font-black uppercase text-sm",
                                      stats.role === "Admin"
                                        ? "bg-amber-500"
                                        : stats.role === "Teacher"
                                          ? "bg-indigo-500"
                                          : "bg-emerald-500",
                                    )}
                                  >
                                    {stats.username
                                      ? stats.username.charAt(0)
                                      : stats.role.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-100 uppercase tracking-tight truncate">
                                  {stats.username}
                                </p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                                  ID: #48292-X
                                </p>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <button
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  setShowProfileModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                              >
                                <Camera
                                  size={16}
                                  className="group-hover:text-indigo-400 animate-pulse"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  Cambiar Foto
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  const newName = window.prompt(
                                    "Ingresa nuevo nombre de usuario:",
                                    stats.username,
                                  );
                                  if (newName?.trim()) {
                                    const upperName = newName
                                      .trim()
                                      .toUpperCase();
                                    setStats((s) => ({
                                      ...s,
                                      username: upperName,
                                    }));
                                    supabaseService.updateUserStats(stats.id, {
                                      username: upperName,
                                    });
                                    toast.success(
                                      "Nombre actualizado exitosamente.",
                                    );
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                              >
                                <Pencil
                                  size={16}
                                  className="group-hover:text-indigo-400"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  Cambiar Nombre
                                </span>
                              </button>

                              {stats.originalRole === "Admin" && (
                                <div className="py-2 border-t border-slate-800 my-1">
                                  <p className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">
                                    Simular Rol (Demo)
                                  </p>
                                  <div className="flex flex-col gap-1">
                                    {(
                                      ["Student", "Teacher", "Admin"] as const
                                    ).map((r) => (
                                      <button
                                        key={r}
                                        onClick={() => {
                                          setStats((prev) => ({
                                            ...prev,
                                            role: r,
                                            assignedSubjects:
                                              r === "Teacher"
                                                ? ["tec_2", "art_3"]
                                                : r === "Admin"
                                                  ? []
                                                  : ["math_2"],
                                            assignedGroups:
                                              r === "Teacher"
                                                ? ["2D", "3A", "3B", "3C", "3D"]
                                                : r === "Admin"
                                                  ? []
                                                  : ["2A"],
                                          }));
                                          setIsProfileOpen(false);
                                        }}
                                        className={cn(
                                          "flex items-center justify-between px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                          stats.role === r
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "text-slate-500 hover:bg-slate-800 hover:text-slate-300",
                                        )}
                                      >
                                        {r === "Student"
                                          ? "Alumno"
                                          : r === "Teacher"
                                            ? "Profesor"
                                            : "Admin"}
                                        {stats.role === r && (
                                          <CheckCircle2 size={12} />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group"
                              >
                                <LogOut size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">
                                  Cerrar Sesión
                                </span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </nav>

            <main className="max-w-6xl mx-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6 md:space-y-8 pb-6"
                  >
                    {/* Profile Header Hero */}
                    <div className="bg-slate-900/50 border border-indigo-500/10 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-md relative">
                      <div className="absolute top-0 inset-x-0 h-24 md:h-32 bg-gradient-to-r from-indigo-900/40 to-slate-900 z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                      </div>

                      <div className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                          <div
                            onClick={() => setShowProfileModal(true)}
                            className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[1.5rem] bg-slate-950 border-4 border-indigo-600 p-1 shadow-lg relative group overflow-hidden cursor-pointer active:scale-95 transition-all"
                            title="Cambiar foto de perfil"
                          >
                            {(stats.packCurrencies as any)?._avatar_meta
                              ?.status === "approved" &&
                            (stats.packCurrencies as any)?._avatar_meta
                              ?.approvedUrl ? (
                              <img
                                src={
                                  (stats.packCurrencies as any)._avatar_meta
                                    .approvedUrl
                                }
                                alt={stats.username}
                                className="w-full h-full rounded-xl md:rounded-2xl object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-inner uppercase animate-fade-in">
                                {stats.username
                                  ? stats.username.charAt(0)
                                  : stats.role.charAt(0)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white border border-indigo-400 shadow-md transform scale-90 group-hover:scale-100 transition-all duration-200">
                                <Camera size={14} className="md:w-5 md:h-5" />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 text-center md:text-left min-w-0 mt-2 md:mt-0">
                            <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                              <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight pr-2">
                                {stats.username}
                              </h2>
                            </div>
                            <p className="text-slate-400 font-bold tracking-widest uppercase text-[9px] md:text-xs">
                              Status:{" "}
                              <span className="text-emerald-400 animate-pulse">
                                ONLINE
                              </span>{" "}
                              •{" "}
                              {stats.role === "Student"
                                ? `Grupo ${stats.grade}`
                                : "Cuerpo Académico"}
                            </p>
                          </div>
                          <div className="flex gap-3 mt-4 md:mt-0">
                            <button
                              onClick={() => {
                                const newName = window.prompt(
                                  "Ingresa nuevo nombre de usuario:",
                                  stats.username,
                                );
                                if (newName?.trim()) {
                                  const upperName = newName
                                    .trim()
                                    .toUpperCase();
                                  setStats((s) => ({
                                    ...s,
                                    username: upperName,
                                  }));
                                  supabaseService.updateUserStats(stats.id, {
                                    username: upperName,
                                  });
                                  toast.success(
                                    "Nombre actualizado exitosamente.",
                                  );
                                }
                              }}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
                            >
                              <Pencil size={14} /> Cambiar Nombre
                            </button>
                            {stats.role === "Teacher" && (
                              <button
                                onClick={() =>
                                  setAssignmentModal({
                                    teacherId: currentUserId || stats.id || "",
                                    isOpen: true,
                                    selectedGroups: stats.assignedGroups || [],
                                    selectedSubjects:
                                      stats.assignedSubjects || [],
                                    activeYear: "1",
                                  })
                                }
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-1.5 border border-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95"
                              >
                                <UserCog size={14} /> Configurar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                      <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        {/* STATISTICS CARD */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 shadow-lg relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                          <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5 md:mb-6 flex items-center gap-3">
                            <Zap className="text-indigo-400" size={20} />{" "}
                            Atributos de Cuenta
                          </h3>
                          <div className="space-y-5 md:space-y-6">
                            {(stats.role === "Teacher"
                              ? [
                                  {
                                    label: "Desafíos por revisar",
                                    val: globalStudents
                                      .filter((s) =>
                                        stats.assignedGroups.includes(s.grade),
                                      )
                                      .reduce(
                                        (acc, curr) =>
                                          acc + curr.completedTasks.length,
                                        0,
                                      ), // Simulating pending reviews for now
                                    color: "text-emerald-400",
                                  },
                                  {
                                    label: "Medallas de alumnos",
                                    val: globalStudents
                                      .filter((s) =>
                                        stats.assignedGroups.includes(s.grade),
                                      )
                                      .reduce(
                                        (acc, curr) => acc + curr.tokens,
                                        0,
                                      ),
                                    color: "text-amber-400",
                                  },
                                  {
                                    label: "Racha global",
                                    val: `${globalStudents.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.streak, 0)} Días`,
                                    color: "text-rose-400",
                                  },
                                ]
                              : [
                                  {
                                    label: "Medallas",
                                    val: stats.tokens,
                                    color: "text-amber-400",
                                  },
                                  {
                                    label: "Racha",
                                    val: `${stats.streak} Días`,
                                    color: "text-rose-400",
                                  },
                                  ...(stats.role === "Student"
                                    ? [
                                        {
                                          label: "Album completado",
                                          val: `${Math.round((stats.collection.length / allAvailableCards.length) * 100)}%`,
                                          color: "text-indigo-400",
                                          bar: "bg-indigo-400",
                                          max: 100,
                                        },
                                      ]
                                    : []),
                                ]
                            ).map((idx) => (
                              <div key={idx.label}>
                                <div
                                  className={cn(
                                    "flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500",
                                    idx.bar ? "mb-1.5" : "mb-0",
                                  )}
                                >
                                  <span>{idx.label}</span>
                                  <span className={idx.color}>{idx.val}</span>
                                </div>
                                {idx.bar && (
                                  <div className="h-2.5 bg-slate-800/50 rounded-full border border-slate-800 p-0.5 shadow-inner">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${Math.min(100, ((typeof idx.val === "number" ? idx.val : parseInt(idx.val.toString())) / idx.max!) * 100)}%`,
                                      }}
                                      className={cn(
                                        "h-full rounded-full shadow-lg",
                                        idx.bar,
                                      )}
                                    ></motion.div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ADMIN MASTER KEY CARD */}
                        {stats.role === "Admin" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5 flex items-center gap-3">
                              <Lock className="text-violet-400" size={20} />{" "}
                              Seguridad
                            </h3>
                            <div className="space-y-4">
                              <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group/key">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                    Llave Registro Docentes
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {isEditingMasterKey ? (
                                      <input
                                        type="text"
                                        value={tempMasterKey}
                                        onChange={(e) =>
                                          setTempMasterKey(
                                            e.target.value.toUpperCase(),
                                          )
                                        }
                                        className="bg-slate-950 border border-indigo-500/50 text-white px-2 py-1 rounded-lg text-sm font-black w-32 outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="text-sm font-black text-white uppercase tracking-[0.1em]">
                                        {showMasterKeyInProfile
                                          ? masterTeacherKey
                                          : "••••••••"}
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        setShowMasterKeyInProfile(
                                          !showMasterKeyInProfile,
                                        )
                                      }
                                      className="text-slate-600 hover:text-slate-400 p-1"
                                    >
                                      {showMasterKeyInProfile ? (
                                        <EyeOff size={12} />
                                      ) : (
                                        <Eye size={12} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {isEditingMasterKey ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          if (tempMasterKey.trim()) {
                                            const newKey = tempMasterKey
                                              .trim()
                                              .toUpperCase();
                                            setMasterTeacherKey(
                                              (normKey) => newKey,
                                            );
                                            setIsEditingMasterKey(false);
                                            // Persist to Supabase
                                            supabaseService
                                              .setGlobalMasterKey(newKey)
                                              .then(() => {
                                                toast.success(
                                                  "Llave maestra actualizada globalmente (MAYÚSCULAS).",
                                                );
                                              })
                                              .catch(() => {
                                                toast.success(
                                                  "Llave maestra actualizada (local).",
                                                );
                                              });
                                          }
                                        }}
                                        className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md active:scale-95"
                                      >
                                        <CheckCircle2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setIsEditingMasterKey(false);
                                          setTempMasterKey(masterTeacherKey);
                                        }}
                                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all shadow-md active:scale-95"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setIsEditingMasterKey(true);
                                        setShowMasterKeyInProfile(true);
                                      }}
                                      className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500 transition-all shadow-md active:scale-95"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Esta llave es necesaria para que nuevos maestros
                                puedan crear una cuenta.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* QUICK MENU */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 md:p-3 shadow-md">
                          <button
                            onClick={() => setShowProfileModal(true)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-indigo-500/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Camera
                                size={18}
                                className="group-hover:text-indigo-400"
                              />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Cambiar Foto de Perfil
                              </span>
                            </div>
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-cyan-500/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Key
                                size={18}
                                className="group-hover:text-cyan-400"
                              />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Cambiar Contraseña
                              </span>
                            </div>
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <LogOut size={18} />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Cerrar Sesión
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-8 space-y-4 md:space-y-6">
                        {stats.role === "Student" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg">
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5 md:mb-6">
                              Bitácora de Desafíos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {stats.completedTasks.length > 0 ? (
                                Array.from(new Set(stats.completedTasks)).map((id) => {
                                  const taskDetails = Object.values(
                                    enrichedAcademicContent,
                                  )
                                    .flat()
                                    .flatMap((s) => s.topics)
                                    .flatMap((t) => t.tasks)
                                    .find((t) => t.id === id);
                                  const taskTitle =
                                    taskDetails?.title ||
                                    `MISIÓN_${id.slice(-4)}`;
                                  return (
                                    <div
                                      key={id}
                                      className="bg-slate-800/40 border border-slate-700/50 p-4 md:p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-all"
                                    >
                                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 size={20} />
                                      </div>
                                      <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-100 block">
                                          {taskTitle}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase">
                                          Validada por Sistema Central
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="col-span-1 sm:col-span-2 py-12 md:py-16 text-center border-2 border-dashed border-slate-800 rounded-[1.5rem]">
                                  <p className="text-slate-600 font-black uppercase tracking-[0.3em]">
                                    Sin registros históricos
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {stats.role === "Teacher" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg space-y-6 md:space-y-8">
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5 md:mb-6">
                              Administración Académica
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="bg-indigo-600 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-md shadow-indigo-600/20 border-b-8 border-indigo-800">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 italic">
                                  Alumnos en Radar
                                </h4>
                                <p className="text-5xl md:text-6xl font-black italic leading-none">
                                  {
                                    globalStudents.filter((s) =>
                                      stats.assignedGroups.includes(s.grade),
                                    ).length
                                  }
                                </p>
                              </div>
                              <div className="bg-slate-800 border border-slate-700 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 space-y-4 border-b-8 border-slate-950">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
                                  Misiones por Validar
                                </h4>
                                <p className="text-6xl font-black italic text-white leading-none">
                                  {globalStudents
                                    .filter((s) =>
                                      stats.assignedGroups.includes(s.grade),
                                    )
                                    .reduce(
                                      (acc, curr) =>
                                        acc + (curr.pendingTasks?.length || 0),
                                      0,
                                    )}
                                </p>
                              </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 md:mb-6 italic">
                                Materias Asignadas
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {Array.from(new Set(stats.assignedSubjects)).map((sid) => {
                                  const baseId = sid.includes(":")
                                    ? sid.split(":")[0]
                                    : sid;
                                  const group = sid.includes(":")
                                    ? sid.split(":")[1]
                                    : null;

                                  let prettyName = baseId
                                    .replace("_", " ")
                                    .toUpperCase();
                                  for (const year in enrichedAcademicContent) {
                                    const sub = (
                                      enrichedAcademicContent[year as Year] ||
                                      []
                                    ).find((s) => s.id === baseId);
                                    if (sub) {
                                      prettyName = sub.name;
                                      break;
                                    }
                                  }

                                  return (
                                    <span
                                      key={sid}
                                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-tight text-white mb-1"
                                    >
                                      {prettyName}{" "}
                                      {group ? (
                                        <span className="text-cyan-400 ml-1">
                                          [{group}]
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "challenges" && (
                  <motion.div
                    key="challenges"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6 pb-6"
                  >
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 lg:gap-6 text-center lg:text-left">
                        <div className="px-1 lg:px-0">
                          <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 pb-1 pr-2">
                            {stats.role === "Admin" ? "Asignación" : "Desafíos"}
                          </h2>
                          <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mt-1">
                            {stats.role === "Admin"
                              ? "Control maestro de grupos"
                              : `Sincronización de Retos: Grupo ${stats.grade}`}
                          </p>
                        </div>

                        {stats.role === "Admin" && (
                          <div className="flex flex-col gap-2 w-full lg:w-auto items-center lg:items-end">
                            {/* Selector de Año */}
                            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 gap-1 w-full lg:w-96">
                              {(["1", "2", "3"] as Year[]).map((y) => (
                                <button
                                  key={y}
                                  onClick={() => {
                                    if (stats.grade?.[0] !== y) {
                                      setStats((prev) => ({
                                        ...prev,
                                        grade: (y + "A") as Grade,
                                      }));
                                      setSelectedSubject(null);
                                      setSelectedTopic(null);
                                      setSelectedTask(null);
                                    }
                                  }}
                                  className={cn(
                                    "flex-1 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] transition-all flex items-center justify-center gap-2",
                                    (stats.grade?.[0] || "1") === y
                                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                                  )}
                                >
                                  <GraduationCap
                                    size={14}
                                    className={cn(
                                      (stats.grade?.[0] || "1") === y
                                        ? "text-white"
                                        : "text-slate-600",
                                    )}
                                  />
                                  <span>{y}º Año</span>
                                </button>
                              ))}
                            </div>

                            {/* Selector de Grupo */}
                            <div className="flex bg-slate-900/30 p-1 rounded-2xl border border-slate-800/50 gap-1 w-full lg:w-96">
                              {["A", "B", "C", "D"].map((letter) => {
                                const currentYear = stats.grade?.[0] || "1";
                                const fullGrade = (currentYear +
                                  letter) as Grade;
                                return (
                                  <button
                                    key={fullGrade}
                                    onClick={() => {
                                      setStats((prev) => ({
                                        ...prev,
                                        grade: fullGrade,
                                      }));
                                      setSelectedSubject(null);
                                      setSelectedTopic(null);
                                      setSelectedTask(null);
                                    }}
                                    className={cn(
                                      "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center",
                                      stats.grade === fullGrade
                                        ? "bg-slate-700 text-white shadow-inner border border-slate-600"
                                        : "text-slate-600 hover:text-slate-400 hover:bg-slate-800/50",
                                    )}
                                  >
                                    <span>{letter}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {(stats.role === "Teacher" ||
                          stats.role === "Admin") && (
                          <button
                            onClick={() => {
                              // Auto-fill some fields based on assigned subjects in teacher profile
                              const defaultSubId =
                                stats.assignedSubjects &&
                                stats.assignedSubjects.length > 0
                                  ? stats.assignedSubjects[0].includes(":")
                                    ? stats.assignedSubjects[0].split(":")[0]
                                    : stats.assignedSubjects[0]
                                  : "mat_1";
                              setAiChallengeForm({
                                subjectId: defaultSubId,
                                topicName: "",
                                idea: "",
                              });
                              setManualChallengeForm((prev) => ({
                                ...prev,
                                subjectId: defaultSubId,
                              }));
                              setShowCreateChallengeModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 shadow-cyan-600/20 hover:shadow-cyan-500/30"
                          >
                            <Plus size={18} /> Nuevo Desafío
                          </button>
                        )}
                      </div>

                      {!selectedSubject ? (
                        /* SUBJECT SELECTION */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(enrichedAcademicContent).flatMap(
                            ([grade, subjects]) =>
                              (subjects || [])
                                .filter((s) => {
                                  if (stats.role === "Admin") {
                                    return (stats.grade?.[0] || "1") === grade;
                                  }
                                  if (stats.role === "Teacher") {
                                    const hasIntegrationThisYear =
                                      stats.assignedSubjects.some((s) => {
                                        const baseId = s.includes(":")
                                          ? s.split(":")[0]
                                          : s;
                                        return baseId === `int_cur_${grade}`;
                                      });
                                    if (hasIntegrationThisYear) return true;
                                    return stats.assignedSubjects.some(
                                      (subj) => {
                                        const baseId = subj.includes(":")
                                          ? subj.split(":")[0]
                                          : subj;
                                        return baseId === s.id;
                                      },
                                    );
                                  }
                                  return (stats.grade?.[0] || "1") === grade;
                                })
                                .map((subject) => (
                                  <motion.button
                                    key={`${grade}-${subject.id}`}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      setSelectedSubject(subject.id)
                                    }
                                    className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-left hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-md"
                                  >
                                    <div className="absolute -top-10 -right-10 opacity-5 text-indigo-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                                      <GraduationCap size={240} />
                                    </div>
                                    <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                                          <SubjectIcon name={subject.icon} />
                                        </div>
                                        {stats.role !== "Student" && (
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                            {grade}
                                          </span>
                                        )}
                                      </div>
                                      <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">
                                        {subject.name}
                                      </h3>
                                      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                                        {subject.topics.length} Módulos de
                                        Entrenamiento
                                      </p>
                                    </div>
                                  </motion.button>
                                )),
                          )}
                        </div>
                      ) : !selectedTopic ? (
                        /* TOPIC SELECTION */
                        <div className="space-y-8">
                          <button
                            onClick={() => setSelectedSubject(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] transition-all group/back"
                          >
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover/back:bg-indigo-500/10 transition-colors">
                              <ArrowLeft size={16} />
                            </div>
                            Volver a Materias
                          </button>
                          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 md:p-8">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100 mb-8">
                              Sectores:{" "}
                              <span className="text-indigo-400">
                                {(() => {
                                  for (const year in enrichedAcademicContent) {
                                    const sub = (
                                      enrichedAcademicContent[year as Year] ||
                                      []
                                    ).find((s) => s.id === selectedSubject);
                                    if (sub) return sub.name;
                                  }
                                  return "Materia no encontrada";
                                })()}
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              {(() => {
                                let subject = null;
                                for (const year in enrichedAcademicContent) {
                                  subject = (
                                    enrichedAcademicContent[year as Year] || []
                                  ).find((s) => s.id === selectedSubject);
                                  if (subject) break;
                                }
                                return subject?.topics.map((topic) => (
                                  <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
                                  >
                                    <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors border border-slate-800">
                                        <Target size={22} />
                                      </div>
                                      <div className="text-left">
                                        <h4 className="text-lg font-black uppercase italic text-slate-200 tracking-tight">
                                          {topic.name}
                                        </h4>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                          {topic.tasks.length} Objetivos
                                          Localizados
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronRight className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                  </button>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* TASK LIST */
                        <div className="space-y-8">
                          <button
                            onClick={() => setSelectedTopic(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] transition-all group/back"
                          >
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover/back:bg-indigo-500/10 transition-colors">
                              <ArrowLeft size={16} />
                            </div>
                            Volver a Sectores
                          </button>

                          <div className="space-y-6">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100 flex items-center gap-4">
                              <Zap className="text-indigo-400" size={32} />
                              {(() => {
                                for (const year in enrichedAcademicContent) {
                                  const sub = (
                                    enrichedAcademicContent[year as Year] || []
                                  ).find((s) => s.id === selectedSubject);
                                  if (sub) {
                                    const topic = sub.topics.find(
                                      (t) => t.id === selectedTopic,
                                    );
                                    if (topic) return topic.name;
                                  }
                                }
                                return "Tema no encontrado";
                              })()}
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                              {(() => {
                                let topic = null;
                                for (const year in enrichedAcademicContent) {
                                  const sub = (
                                    enrichedAcademicContent[year as Year] || []
                                  ).find((s) => s.id === selectedSubject);
                                  if (sub) {
                                    topic = sub.topics.find(
                                      (t) => t.id === selectedTopic,
                                    );
                                    if (topic) break;
                                  }
                                }
                                return topic?.tasks.map((task) => {
                                  const isCompleted =
                                    stats.completedTasks.includes(task.id);
                                  const isPending =
                                    stats.pendingTasks?.includes(task.id) ||
                                    false;
                                  const isTaskActive = selectedTask === task.id;
                                  const diffConfig = {
                                    Easy: {
                                      color: "text-emerald-400",
                                      border: "border-emerald-500/30",
                                      bg: "bg-emerald-500/5",
                                      label: "Básico",
                                    },
                                    Medium: {
                                      color: "text-amber-400",
                                      border: "border-amber-500/30",
                                      bg: "bg-amber-500/5",
                                      label: "Intermedio",
                                    },
                                    Hard: {
                                      color: "text-rose-400",
                                      border: "border-rose-500/30",
                                      bg: "bg-rose-500/5",
                                      label: "Avanzado",
                                    },
                                  };
                                  const config = diffConfig[task.difficulty];

                                  return (
                                    <div
                                      key={task.id}
                                      className={cn(
                                        "bg-slate-900 border p-6 rounded-[2.5rem] transition-all relative overflow-hidden shadow-md",
                                        isCompleted
                                          ? "border-emerald-500/20 opacity-60"
                                          : isPending
                                            ? "border-amber-500/40 opacity-80"
                                            : "border-slate-800 hover:border-indigo-500/30",
                                        isTaskActive &&
                                          "border-indigo-500 ring-1 ring-indigo-500/50",
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 pointer-events-none rotate-45 transform translate-x-12 -translate-y-12",
                                          isCompleted
                                            ? "from-emerald-500 to-transparent"
                                            : isPending
                                              ? "from-amber-500 to-transparent"
                                              : "from-indigo-500 to-transparent",
                                        )}
                                      />

                                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                          <div className="flex flex-wrap items-center gap-4">
                                            <span
                                              className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm",
                                                config.color,
                                                config.border,
                                                config.bg,
                                              )}
                                            >
                                              {config.label}
                                            </span>
                                            {isCompleted && (
                                              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                                                <CheckCircle2 size={12} />{" "}
                                                Completado
                                              </span>
                                            )}
                                            {isPending && (
                                              <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/30 flex items-center gap-1.5">
                                                <Flame size={12} /> En Revisión
                                              </span>
                                            )}
                                          </div>

                                          <div>
                                            <h4 className="text-2xl font-black italic uppercase text-slate-100 tracking-tight mb-3">
                                              {task.title}
                                            </h4>
                                            <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-2xl">
                                              {task.description}
                                            </p>

                                            {isTaskActive && (
                                              <motion.div
                                                initial={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                                animate={{
                                                  height: "auto",
                                                  opacity: 1,
                                                }}
                                                className="mt-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4"
                                              >
                                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                  Protocolo de Desafío:
                                                </h5>
                                                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                                                  {task.instructions ||
                                                    task.description ||
                                                    "Sigue las indicaciones del profesor para completar este reto."}
                                                </div>
                                              </motion.div>
                                            )}
                                          </div>

                                          <div className="flex flex-wrap gap-3 pt-2">
                                            {task.reward.tokens && (
                                              <div className="flex items-center gap-2.5 text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/20">
                                                <Coins size={14} /> +
                                                {task.reward.tokens} Medallas
                                              </div>
                                            )}
                                            {task.reward.cardId && (
                                              <div className="flex items-center gap-2.5 text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/20">
                                                <Trophy size={14} /> Logro
                                                Especial
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {!isCompleted && !isPending && (
                                          <div className="flex flex-col gap-3">
                                            {!isTaskActive ? (
                                              <button
                                                onClick={() => {
                                                  if (stats.dailyLimits) {
                                                    if (
                                                      task.difficulty ===
                                                        "Easy" &&
                                                      (stats.dailyLimits
                                                        .easyCompleted || 0) >=
                                                        4
                                                    ) {
                                                      toast.warning(
                                                        "Has alcanzado el límite diario de 4 desafíos básicos. ¡Vuelve mañana!",
                                                      );
                                                      return;
                                                    }
                                                    if (
                                                      task.difficulty ===
                                                        "Medium" &&
                                                      (stats.dailyLimits
                                                        .mediumCompleted ||
                                                        0) >= 2
                                                    ) {
                                                      toast.warning(
                                                        "Has alcanzado el límite diario de 2 desafíos intermedios. ¡Vuelve mañana!",
                                                      );
                                                      return;
                                                    }
                                                    if (
                                                      task.difficulty ===
                                                        "Hard" &&
                                                      (stats.dailyLimits
                                                        .hardCompleted || 0) >=
                                                        1
                                                    ) {
                                                      toast.warning(
                                                        "Has alcanzado el límite diario de 1 desafío difícil. ¡Vuelve mañana!",
                                                      );
                                                      return;
                                                    }
                                                  }

                                                  setSelectedTask(task.id);
                                                  if (task.isAIQuiz) {
                                                    let subjectName = "";
                                                    let topicName = "";

                                                    for (const year in enrichedAcademicContent) {
                                                      const sub = (
                                                        enrichedAcademicContent[
                                                          year as Year
                                                        ] || []
                                                      ).find(
                                                        (s) =>
                                                          s.id ===
                                                          selectedSubject,
                                                      );
                                                      if (sub) {
                                                        subjectName = sub.name;
                                                        const topic =
                                                          sub.topics.find(
                                                            (t) =>
                                                              t.id ===
                                                              selectedTopic,
                                                          );
                                                        if (topic) {
                                                          topicName =
                                                            topic.name;
                                                          break;
                                                        }
                                                      }
                                                    }

                                                    generateAIQuiz(
                                                      subjectName,
                                                      topicName,
                                                    );
                                                  }
                                                }}
                                                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-700 text-xs"
                                              >
                                                {task.difficulty === "Easy"
                                                  ? task.isAIQuiz
                                                    ? "Generar Quiz IA"
                                                    : "Iniciar Quiz"
                                                  : "Ver Instrucciones"}
                                              </button>
                                            ) : (
                                              <div className="flex flex-col gap-3">
                                                {task.type === "Quiz" ? (
                                                  <div className="space-y-4">
                                                    {task.isAIQuiz ? (
                                                      isGeneratingQuiz ? (
                                                        <div className="flex flex-col items-center py-6 gap-4 animate-pulse">
                                                          <Loader2
                                                            className="animate-spin text-indigo-400"
                                                            size={32}
                                                          />
                                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            Invocando
                                                            Inteligencia...
                                                          </p>
                                                        </div>
                                                      ) : aiQuiz ? (
                                                        <div className="space-y-6">
                                                          <p className="text-sm font-bold text-white mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                                            {aiQuiz.question}
                                                          </p>
                                                          <div className="grid grid-cols-1 gap-2">
                                                            {aiQuiz.options.map(
                                                              (opt, i) => (
                                                                <button
                                                                  key={i}
                                                                  onClick={() => {
                                                                    if (
                                                                      i ===
                                                                      aiQuiz.answer
                                                                    ) {
                                                                      toast.success(
                                                                        "¡Correcto! Desafío completado por IA.",
                                                                      );
                                                                      completeTask(
                                                                        task,
                                                                      );
                                                                      setSelectedTask(
                                                                        null,
                                                                      );
                                                                      setAiQuiz(
                                                                        null,
                                                                      );
                                                                    } else {
                                                                      toast.error(
                                                                        "Intento fallido. Analiza de nuevo.",
                                                                      );
                                                                    }
                                                                  }}
                                                                  className="w-full text-left p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 text-xs font-bold transition-all"
                                                                >
                                                                  {opt}
                                                                </button>
                                                              ),
                                                            )}
                                                          </div>
                                                        </div>
                                                      ) : null
                                                    ) : (
                                                      <div className="grid grid-cols-1 gap-2">
                                                        {task.quizOptions?.map(
                                                          (opt, i) => (
                                                            <button
                                                              key={i}
                                                              onClick={() => {
                                                                if (
                                                                  i ===
                                                                  task.quizAnswer
                                                                ) {
                                                                  toast.success(
                                                                    "¡Correcto! Desafío completado.",
                                                                  );
                                                                  completeTask(
                                                                    task,
                                                                  );
                                                                  setSelectedTask(
                                                                    null,
                                                                  );
                                                                } else {
                                                                  toast.error(
                                                                    "Intento fallido. Analiza de nuevo.",
                                                                  );
                                                                }
                                                              }}
                                                              className="w-full text-left p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 text-xs font-bold transition-all"
                                                            >
                                                              {opt}
                                                            </button>
                                                          ),
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <button
                                                    onClick={() => {
                                                      const input =
                                                        document.createElement(
                                                          "input",
                                                        );
                                                      input.type = "file";
                                                      input.accept = "image/*";
                                                      input.onchange = async (
                                                        e: any,
                                                      ) => {
                                                        if (
                                                          e.target.files &&
                                                          e.target.files.length > 0
                                                        ) {
                                                          const file = e.target.files[0];
                                                          const loadingToast = toast.loading("Procesando y comprimiendo evidencia...");
                                                          try {
                                                            let evidenceUrl = "";
                                                            if (file.type.startsWith("image/")) {
                                                              evidenceUrl = await compressImage(file);
                                                            } else {
                                                              evidenceUrl = await new Promise<string>((resolve, reject) => {
                                                                const reader = new FileReader();
                                                                reader.onload = () => resolve(reader.result as string);
                                                                reader.onerror = reject;
                                                                reader.readAsDataURL(file);
                                                              });
                                                            }
                                                            toast.dismiss(loadingToast);
                                                            toast.success("¡Evidencia procesada correctamente! El profesor la validará.");
                                                            submitTaskForReview(
                                                              task,
                                                              evidenceUrl,
                                                            );
                                                            setSelectedTask(null);
                                                          } catch (err) {
                                                            toast.dismiss(loadingToast);
                                                            toast.error("Error al procesar la evidencia. Inténtalo de nuevo.");
                                                            console.error(err);
                                                          }
                                                        }
                                                      };
                                                      input.click();
                                                    }}
                                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-3 border-b-4 border-cyan-800"
                                                  >
                                                    <FileUp size={20} /> Subir
                                                    Evidencia
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => {
                                                    setSelectedTask(null);
                                                    setAiQuiz(null);
                                                  }}
                                                  className="text-slate-500 font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors"
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6 md:space-y-8 pb-6"
                  >
                    {stats.role === "Admin" ? (
                      /* ADMIN ASIGNACIÓN (HOME) */
                      <div className="space-y-6 md:space-y-8">
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 text-left">
                          <div>
                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-600 pb-2 px-1">
                              Control Central
                            </h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                              Gestión Maestro de Docentes y Grupos
                            </p>
                          </div>

                          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 gap-1 w-full md:w-auto">
                            <button
                              onClick={() => setAdminDashboardTab("stats")}
                              className={cn(
                                "flex-1 md:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all",
                                adminDashboardTab === "stats"
                                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                              )}
                            >
                              Estadística
                            </button>
                            <button
                              onClick={() => setAdminDashboardTab("teachers")}
                              className={cn(
                                "flex-1 md:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all",
                                adminDashboardTab === "teachers"
                                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                              )}
                            >
                              Docentes
                            </button>
                            <button
                              onClick={() => setAdminDashboardTab("students")}
                              className={cn(
                                "flex-1 md:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all",
                                adminDashboardTab === "students"
                                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                              )}
                            >
                              Alumnos
                            </button>
                            <button
                              onClick={() => setAdminDashboardTab("avatars")}
                              className={cn(
                                "flex-1 md:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1",
                                adminDashboardTab === "avatars"
                                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                              )}
                            >
                              Fotos Perfil
                              {pendingAvatarsCount > 0 && (
                                <span className="bg-amber-500 text-slate-900 font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                                  {pendingAvatarsCount}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => setAdminDashboardTab("pendientes")}
                              className={cn(
                                "flex-1 md:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                adminDashboardTab === "pendientes"
                                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
                              )}
                            >
                              <span className="relative flex h-2 w-2">
                                {totalPendingsCount > 0 && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                                )}
                                <span
                                  className={cn(
                                    "relative inline-flex rounded-full h-2 w-2",
                                    totalPendingsCount > 0
                                      ? "bg-rose-500"
                                      : "bg-slate-500",
                                  )}
                                ></span>
                              </span>
                              Pendientes
                              {totalPendingsCount > 0 && (
                                <span className="bg-rose-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                                  {totalPendingsCount}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {adminDashboardTab === "stats" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                              {
                                label: "Plaza Docente",
                                val: teachers.length.toString(),
                                icon: (
                                  <UserCog
                                    size={24}
                                    className="text-indigo-400"
                                  />
                                ),
                              },
                              {
                                label: "Matrícula Activa",
                                val: globalStudents.length.toString(),
                                icon: (
                                  <Users
                                    size={24}
                                    className="text-emerald-400"
                                  />
                                ),
                              },
                              {
                                label: "Grupos Asignados",
                                val: SCHOOL_GROUPS.length.toString(),
                                icon: (
                                  <BookOpen
                                    size={24}
                                    className="text-rose-400"
                                  />
                                ),
                              },
                              {
                                label: "Misiones Resueltas",
                                val: globalStudents
                                  .reduce(
                                    (acc, curr) =>
                                      acc + curr.completedTasks.length,
                                    0,
                                  )
                                  .toString(),
                                icon: (
                                  <TrendingUp
                                    size={24}
                                    className="text-amber-400"
                                  />
                                ),
                              },
                              {
                                label: "Llave de Docente",
                                val: masterTeacherKey,
                                icon: (
                                  <Lock size={24} className="text-violet-400" />
                                ),
                                isEditable: true,
                              },
                            ].map((stat, i) => (
                              <div
                                key={i}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-4 hover:border-slate-700 transition-all shadow-lg relative group overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-[4rem]"></div>
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center relative z-10">
                                    {stat.icon}
                                  </div>
                                  {(stat as any).isEditable && (
                                    <div className="absolute top-4 right-4 flex gap-2">
                                      {isEditingMasterKey ? (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              if (tempMasterKey.trim()) {
                                                const newKey =
                                                  tempMasterKey.trim();
                                                setMasterTeacherKey(newKey);
                                                setIsEditingMasterKey(false);
                                                // Persist to Supabase
                                                supabaseService
                                                  .setGlobalMasterKey(newKey)
                                                  .then(() => {
                                                    toast.success(
                                                      "Llave actualizada globalmente.",
                                                    );
                                                  })
                                                  .catch(() => {
                                                    toast.success(
                                                      "Llave actualizada.",
                                                    );
                                                  });
                                              }
                                            }}
                                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                                          >
                                            <CheckCircle2 size={12} />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setIsEditingMasterKey(false);
                                              setTempMasterKey(
                                                masterTeacherKey,
                                              );
                                            }}
                                            className="p-2 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 hover:text-white transition-all"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            setIsEditingMasterKey(true)
                                          }
                                          className="p-2 bg-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 hover:text-indigo-400 shadow-sm"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="relative z-10">
                                  {/* Value Display or Edit Input */}
                                  {(stat as any).isEditable &&
                                  isEditingMasterKey ? (
                                    <input
                                      type="text"
                                      value={tempMasterKey}
                                      onChange={(e) =>
                                        setTempMasterKey(
                                          e.target.value.toUpperCase(),
                                        )
                                      }
                                      className="bg-slate-950 border border-indigo-500/50 text-indigo-400 text-xl font-black italic rounded-lg px-2 py-1 w-full outline-none ring-4 ring-indigo-500/10 mb-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="text-2xl font-black italic text-slate-100 mb-1 truncate">
                                      {stat.val}
                                    </div>
                                  )}
                                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {stat.label}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : adminDashboardTab === "teachers" ? (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  setShowCreateUserModal({
                                    isOpen: true,
                                    role: "Teacher",
                                  })
                                }
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
                              >
                                <Plus size={18} /> Nuevo Docente
                              </button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-md">
                              <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                                  Plantilla Docente
                                </h4>
                              </div>

                              {/* Desktop Table View */}
                              <div className="hidden md:block overflow-x-auto transform-gpu">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-800/50 border-b border-slate-700">
                                    <tr>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Docente
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Materias & Grupos
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                        Estado
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                                        Acciones
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {teachers.map((teacher) => (
                                      <tr
                                        key={teacher.id}
                                        className="hover:bg-slate-800/30 transition-colors group"
                                      >
                                        <td className="px-8 py-6">
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-indigo-900 flex items-center justify-center font-black text-xs text-white">
                                              {teacher.name
                                                .split(" ")[1]
                                                ?.charAt(0) || "T"}
                                            </div>
                                            <div>
                                              <div className="font-bold text-slate-100">
                                                {teacher.name}
                                              </div>
                                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                {teacher.students} Alumnos
                                                totales
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-8 py-6">
                                          <div className="flex flex-wrap gap-1 items-center">
                                            {renderCompactSubjects(
                                              teacher.subjects,
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                          {(() => {
                                            const isOnline =
                                              teacher.lastActive &&
                                              new Date().getTime() -
                                                new Date(
                                                  teacher.lastActive,
                                                ).getTime() <
                                                300000;
                                            return (
                                              <div className="flex flex-col items-center gap-1">
                                                <span
                                                  className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    isOnline
                                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm"
                                                      : "bg-slate-800 text-slate-500 border-slate-700",
                                                  )}
                                                >
                                                  {isOnline
                                                    ? "En Línea"
                                                    : "Desconectado"}
                                                </span>
                                                {teacher.lastActive &&
                                                  !isOnline && (
                                                    <span className="text-[8px] text-slate-600 font-bold uppercase truncate max-w-[80px]">
                                                      {new Date(
                                                        teacher.lastActive,
                                                      ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      })}
                                                    </span>
                                                  )}
                                              </div>
                                            );
                                          })()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <button
                                              onClick={() => {
                                                const newName = prompt(
                                                  "Nuevo nombre:",
                                                  teacher.name,
                                                );
                                                if (newName && newName.trim()) {
                                                  supabaseService
                                                    .updateUserStats(
                                                      teacher.id,
                                                      {
                                                        username:
                                                          newName.trim(),
                                                      },
                                                    )
                                                    .then(() => {
                                                      loadUsers();
                                                      toast.success(
                                                        "Nombre actualizado con éxito.",
                                                      );
                                                    })
                                                    .catch((err) => {
                                                      console.error(err);
                                                      toast.error(
                                                        "Error al actualizar nombre.",
                                                      );
                                                    });
                                                }
                                              }}
                                              className="text-cyan-400 hover:text-cyan-300 font-bold p-2 bg-cyan-500/10 rounded-full transition-all border border-cyan-500/20"
                                            >
                                              <Pencil size={14} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setUserToDelete({
                                                  id: teacher.id,
                                                  name: teacher.name,
                                                  role: "Docente",
                                                });
                                              }}
                                              className="text-rose-400 hover:text-rose-300 font-bold p-2 bg-rose-500/10 rounded-full transition-all border border-rose-500/20"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                setAssignmentModal({
                                                  teacherId: teacher.id,
                                                  isOpen: true,
                                                  selectedGroups:
                                                    teacher.groups || [],
                                                  selectedSubjects:
                                                    teacher.subjects || [],
                                                  activeYear: "1",
                                                })
                                              }
                                              className="inline-flex items-center justify-end gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors border border-transparent hover:border-slate-700"
                                            >
                                              <UserCog size={14} />{" "}
                                              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                                                Asignar
                                              </span>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile List View */}
                              <div className="md:hidden flex flex-col divide-y divide-slate-800">
                                {teachers.map((teacher) => (
                                  <div
                                    key={teacher.id}
                                    className="p-4 flex flex-col gap-4"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-indigo-900 flex items-center justify-center font-black text-sm text-white shrink-0">
                                        {teacher.name
                                          .split(" ")[1]
                                          ?.charAt(0) || "T"}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-100 truncate">
                                          {teacher.name}
                                        </h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                          {teacher.students} Alumnos
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-end gap-1">
                                        {(() => {
                                          const isOnline =
                                            teacher.lastActive &&
                                            new Date().getTime() -
                                              new Date(
                                                teacher.lastActive,
                                              ).getTime() <
                                              300000;
                                          return (
                                            <div className="flex items-center gap-1.5">
                                              <div
                                                className={cn(
                                                  "w-1.5 h-1.5 rounded-full",
                                                  isOnline
                                                    ? "bg-emerald-500 animate-pulse"
                                                    : "bg-slate-700",
                                                )}
                                              />
                                              <span className="text-[8px] font-black uppercase text-slate-500 whitespace-nowrap">
                                                {isOnline
                                                  ? "En Línea"
                                                  : "Offline"}
                                              </span>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pl-15">
                                      {renderCompactSubjects(teacher.subjects)}
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-slate-800/50 mt-2 gap-2">
                                      <button
                                        onClick={() => {
                                          const newName = prompt(
                                            "Nuevo nombre:",
                                            teacher.name,
                                          );
                                          if (newName && newName.trim()) {
                                            supabaseService
                                              .updateUserStats(teacher.id, {
                                                username: newName.trim(),
                                              })
                                              .then(() => {
                                                loadUsers();
                                                toast.success(
                                                  "Nombre actualizado.",
                                                );
                                              })
                                              .catch(console.error);
                                          }
                                        }}
                                        className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setUserToDelete({
                                            id: teacher.id,
                                            name: teacher.name,
                                            role: "Docente",
                                          });
                                        }}
                                        className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setAssignmentModal({
                                            teacherId: teacher.id,
                                            isOpen: true,
                                            selectedGroups:
                                              teacher.groups || [],
                                            selectedSubjects:
                                              teacher.subjects || [],
                                            activeYear: "1",
                                          })
                                        }
                                        className="flex-1 sm:flex-none w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600/10 hover:bg-cyan-600/20 rounded-xl text-cyan-400 transition-colors border border-cyan-500/30"
                                      >
                                        <UserCog size={14} />{" "}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                          Asignar a Grupos
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : adminDashboardTab === "students" ? (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  setShowCreateUserModal({
                                    isOpen: true,
                                    role: "Student",
                                  })
                                }
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
                              >
                                <Plus size={18} /> Nuevo Alumno
                              </button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-md">
                              <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                                  Listado de Alumnos
                                </h4>
                              </div>
                              <div className="overflow-x-auto transform-gpu pb-2">
                                {/* Desktop Table View */}
                                <table className="w-full text-left hidden md:table">
                                  <thead className="bg-slate-800/50 border-b border-slate-700">
                                    <tr>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Alumno
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Grado/Grupo
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Tokens
                                      </th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                                        Acciones
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {allStudents.map((student, i) => (
                                      <tr
                                        key={
                                          student.id ||
                                          `student-desk-${student.username || i}`
                                        }
                                        className="hover:bg-slate-800/30 transition-colors group"
                                      >
                                        <td className="px-8 py-6">
                                          <div className="flex items-center gap-3">
                                            {(() => {
                                              const isOnline =
                                                student.lastActive &&
                                                new Date().getTime() -
                                                  new Date(
                                                    student.lastActive,
                                                  ).getTime() <
                                                  300000;
                                              return (
                                                <div
                                                  className={cn(
                                                    "w-2 h-2 rounded-full shrink-0",
                                                    isOnline
                                                      ? "bg-emerald-500 animate-pulse"
                                                      : "bg-slate-700",
                                                  )}
                                                />
                                              );
                                            })()}
                                            <span className="text-sm font-bold text-slate-200">
                                              {student.username}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-indigo-400 font-bold uppercase">
                                          {student.grade}
                                        </td>
                                        <td className="px-8 py-6 text-sm text-amber-500 font-black">
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <Coins
                                                size={14}
                                                className="text-amber-500"
                                              />{" "}
                                              <span>{student.tokens}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
                                              <button
                                                onClick={() => adjustStudentTokens(student, -50)}
                                                className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black text-[10px] transition-all active:scale-90"
                                                title="Quitar 50 puntos"
                                              >
                                                -50
                                              </button>
                                              <button
                                                onClick={() => adjustStudentTokens(student, -10)}
                                                className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black text-[10px] transition-all active:scale-90"
                                                title="Quitar 10 puntos"
                                              >
                                                -10
                                              </button>
                                              <button
                                                onClick={() => adjustStudentTokens(student, 10)}
                                                className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-[10px] transition-all active:scale-90"
                                                title="Dar 10 puntos"
                                              >
                                                +10
                                              </button>
                                              <button
                                                onClick={() => adjustStudentTokens(student, 50)}
                                                className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-[10px] transition-all active:scale-90"
                                                title="Dar 50 puntos"
                                              >
                                                +50
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const custom = prompt(
                                                    `Ajustar puntos de ${student.username}:\nIngresa la cantidad a sumar (ej. 200) o restar (ej. -200):`,
                                                  );
                                                  if (custom !== null && !isNaN(parseInt(custom))) {
                                                    adjustStudentTokens(student, parseInt(custom));
                                                  }
                                                }}
                                                className="px-2 h-7 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-[8px] uppercase tracking-wider transition-all active:scale-90"
                                                title="Ajuste personalizado"
                                              >
                                                Otro
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <button
                                              onClick={() => {
                                                const action = prompt(
                                                  `Editar datos de ${student.username}:\n1. Editar Nombre\n2. Editar Grupo\n3. Editar Tokens\nIngresa 1, 2 o 3:`,
                                                );
                                                if (action === "1") {
                                                  const newName = prompt(
                                                    "Nuevo nombre:",
                                                    student.username,
                                                  );
                                                  if (
                                                    newName &&
                                                    newName.trim() &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          username:
                                                            newName.trim(),
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Nombre actualizado.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                } else if (action === "2") {
                                                  const newGrp = prompt(
                                                    "Nuevo grupo (ej. 2A):",
                                                    student.grade,
                                                  );
                                                  if (
                                                    newGrp &&
                                                    newGrp.trim() &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          grade:
                                                            newGrp.trim() as any,
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Grupo actualizado.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                } else if (action === "3") {
                                                  const newTokens = prompt(
                                                    "Nuevos tokens:",
                                                    String(student.tokens),
                                                  );
                                                  if (
                                                    newTokens !== null &&
                                                    !isNaN(
                                                      parseInt(newTokens),
                                                    ) &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          tokens:
                                                            parseInt(newTokens),
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Tokens actualizados.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                }
                                              }}
                                              className="text-indigo-400 hover:text-indigo-300 font-bold p-2 bg-indigo-500/10 rounded-full transition-all border border-indigo-500/20"
                                            >
                                              <Pencil size={16} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (student.id) {
                                                  setUserToDelete({
                                                    id: student.id,
                                                    name: student.username,
                                                    role: "Alumno",
                                                  });
                                                }
                                              }}
                                              className="text-rose-400 hover:text-rose-300 font-bold p-2 bg-rose-500/10 rounded-full transition-all border border-rose-500/20"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-slate-800">
                                  {allStudents.map((student, i) => (
                                    <div
                                      key={
                                        student.id ||
                                        `student-mobile-${student.username || i}`
                                      }
                                      className="p-5 space-y-4"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                            Alumno
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-200">
                                              {student.username}
                                            </p>
                                            {(() => {
                                              const isOnline =
                                                student.lastActive &&
                                                new Date().getTime() -
                                                  new Date(
                                                    student.lastActive,
                                                  ).getTime() <
                                                  300000;
                                              return (
                                                <div
                                                  className={cn(
                                                    "w-1.5 h-1.5 rounded-full shrink-0 mt-0.5",
                                                    isOnline
                                                      ? "bg-emerald-500 animate-pulse"
                                                      : "bg-slate-700",
                                                  )}
                                                />
                                              );
                                            })()}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                            Grado/Grupo
                                          </p>
                                          <p className="text-sm text-indigo-400 font-black uppercase">
                                            {student.grade}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-3 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                              <Coins
                                                size={18}
                                                className="text-amber-500"
                                              />
                                            </div>
                                            <div>
                                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                                                Tokens
                                              </p>
                                              <p className="text-lg text-amber-500 font-black leading-none">
                                                {student.tokens}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const action = prompt(
                                                  `Editar datos de ${student.username}:\n1. Editar Nombre\n2. Editar Grupo\n3. Editar Tokens\nIngresa 1, 2 o 3:`,
                                                );
                                                if (action === "1") {
                                                  const newName = prompt(
                                                    "Nuevo nombre:",
                                                    student.username,
                                                  );
                                                  if (
                                                    newName &&
                                                    newName.trim() &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          username:
                                                            newName.trim(),
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Nombre actualizado.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                } else if (action === "2") {
                                                  const newGrp = prompt(
                                                    "Nuevo grupo (ej. 2A):",
                                                    student.grade,
                                                  );
                                                  if (
                                                    newGrp &&
                                                    newGrp.trim() &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          grade:
                                                            newGrp.trim() as any,
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Grupo actualizado.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                } else if (action === "3") {
                                                  const newTokens = prompt(
                                                    "Nuevos tokens:",
                                                    String(student.tokens),
                                                  );
                                                  if (
                                                    newTokens !== null &&
                                                    !isNaN(
                                                      parseInt(newTokens),
                                                    ) &&
                                                    student.id
                                                  ) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        student.id,
                                                        {
                                                          tokens:
                                                            parseInt(newTokens),
                                                        },
                                                      )
                                                      .then(() => {
                                                        loadUsers();
                                                        toast.success(
                                                          "Tokens actualizados.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                }
                                              }}
                                              className="text-indigo-400 hover:text-indigo-300 font-bold p-2.5 bg-indigo-500/10 rounded-xl transition-all border border-indigo-500/20"
                                            >
                                              <Pencil size={18} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (student.id) {
                                                  setUserToDelete({
                                                    id: student.id,
                                                    name: student.username,
                                                    role: "Alumno",
                                                  });
                                                }
                                              }}
                                              className="text-rose-400 hover:text-rose-300 font-bold p-2.5 bg-rose-500/10 rounded-xl transition-all border border-rose-500/20"
                                            >
                                              <Trash2 size={18} />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 w-full bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 justify-center">
                                          <button
                                            onClick={() => adjustStudentTokens(student, -50)}
                                            className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black text-xs transition-all active:scale-95"
                                            title="Quitar 50 puntos"
                                          >
                                            -50
                                          </button>
                                          <button
                                            onClick={() => adjustStudentTokens(student, -10)}
                                            className="flex-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black text-xs transition-all active:scale-95"
                                            title="Quitar 10 puntos"
                                          >
                                            -10
                                          </button>
                                          <button
                                            onClick={() => adjustStudentTokens(student, 10)}
                                            className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xs transition-all active:scale-95"
                                            title="Dar 10 puntos"
                                          >
                                            +10
                                          </button>
                                          <button
                                            onClick={() => adjustStudentTokens(student, 50)}
                                            className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xs transition-all active:scale-95"
                                            title="Dar 50 puntos"
                                          >
                                            +50
                                          </button>
                                          <button
                                            onClick={() => {
                                              const custom = prompt(
                                                `Ajustar puntos de ${student.username}:\nIngresa la cantidad a sumar (ej. 200) o restar (ej. -200):`,
                                              );
                                              if (custom !== null && !isNaN(parseInt(custom))) {
                                                adjustStudentTokens(student, parseInt(custom));
                                              }
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
                                            title="Ajuste personalizado"
                                          >
                                            Otro
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {allStudents.length === 0 && (
                                  <div className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    No hay alumnos registrados aún.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : adminDashboardTab === "avatars" ? (
                          <AdminAvatarApprovals
                            students={rawStudents}
                            onRefresh={loadUsers}
                          />
                        ) : (
                          <AdminDashboardPendientes
                            rawStudents={rawStudents}
                            onRefresh={loadUsers}
                            lookupTaskDetails={lookupTaskDetails}
                            notifications={notifications}
                          />
                        )}
                      </div>
                    ) : stats.role === "Teacher" ? (
                      /* TEACHER DASHBOARD (HOME) */
                      <div className="space-y-6 pb-2">
                        {(() => {
                          // 1. Students under teacher's charge
                          const teacherStudents = globalStudents.filter((s) => {
                            return (
                              (stats.assignedSubjects || []).some(
                                (sub) => sub.split(":")[1] === s.grade,
                              ) ||
                              (stats.assignedGroups || []).includes(s.grade)
                            );
                          });

                          const totalStudentsCount = teacherStudents.length;

                          // 2. Total resolved missions (completed tasks) of assigned students
                          const totalCompletedTasks = teacherStudents.reduce(
                            (acc, curr) =>
                              acc + (curr.completedTasks || []).length,
                            0,
                          );

                          // 3. Accumulated tokens of assigned students
                          const totalStudentTokens = teacherStudents.reduce(
                            (acc, curr) => acc + (curr.tokens || 0),
                            0,
                          );

                          // 4. Activity Review Inbox (Pending submissions)
                          const reviewInboxItems = teacherStudents.flatMap(
                            (student) => {
                              const relevantPendingTasks = (
                                student.pendingTasks || []
                              ).filter((taskId) => {
                                for (const year in enrichedAcademicContent) {
                                  for (const subject of enrichedAcademicContent[
                                    year as Year
                                  ]) {
                                    if (
                                      subject.topics.some((t) =>
                                        t.tasks.some(
                                          (task) => task.id === taskId,
                                        ),
                                      )
                                    ) {
                                      return (
                                        stats.assignedSubjects.includes(
                                          `${subject.id}:${student.grade}`,
                                        ) ||
                                        (stats.assignedSubjects.includes(
                                          subject.id,
                                        ) &&
                                          student.grade.startsWith(year))
                                      );
                                    }
                                  }
                                }
                                return false;
                              });

                              return relevantPendingTasks
                                .map((taskId) => {
                                  const taskDetails = Object.values(
                                    enrichedAcademicContent,
                                  )
                                    .flat()
                                    .flatMap((s) => s.topics)
                                    .flatMap((t) => t.tasks)
                                    .find((t) => t.id === taskId);
                                  return {
                                    student,
                                    taskId,
                                    taskDetails,
                                  };
                                })
                                .filter(
                                  (item) => item.taskDetails !== undefined,
                                );
                            },
                          );

                          const totalPendingReviews = reviewInboxItems.length;

                          // 5. Completion Efficiency Rate
                          const totalMissions =
                            totalCompletedTasks + totalPendingReviews;
                          const groupEfficiency =
                            totalMissions > 0
                              ? Math.round(
                                  (totalCompletedTasks / totalMissions) * 100,
                                )
                              : 100;

                          // 6. Leaderboard (Destacados)
                          // If teacher has assigned students, prioritize them. Else, fall back to global leaderboard as demonstration so it looks gorgeous!
                          const leaderboardSource =
                            teacherStudents.length > 0
                              ? teacherStudents
                              : globalStudents;
                          const topStudents = [...leaderboardSource]
                            .sort((a, b) => b.tokens - a.tokens)
                            .slice(0, 3);

                          // 7. Active Review Item
                          const activeReviewItem =
                            reviewInboxItems.find(
                              (item) =>
                                item.student.id ===
                                  selectedReviewItem?.studentId &&
                                item.taskId === selectedReviewItem?.taskId,
                            ) ||
                            reviewInboxItems[0] ||
                            null;

                          const evidenceUrl = activeReviewItem
                            ? activeReviewItem.student.packCurrencies?._task_evidences?.[activeReviewItem.taskId]
                            : null;

                          return (
                            <div className="space-y-6 md:space-y-8">
                              {/* HEADER AREA */}
                              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-left bg-slate-900/40 border border-slate-800/80 p-5 md:p-6 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
                                <div className="space-y-2 relative z-10 w-full min-w-0">
                                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-400 to-cyan-400 break-words leading-tight">
                                    {stats.username}
                                  </h2>
                                  <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                                    {stats.assignedGroups &&
                                    stats.assignedGroups.length > 0
                                      ? `Grupos asignados: ${stats.assignedGroups.join(", ")}`
                                      : "Grupos asignados: Ninguno"}
                                  </p>
                                </div>
                              </div>

                              {/* COCKPIT GRID: Left (Review Desk) and Right (Metrics & Leaderboard) */}
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Side: Bandeja de Evaluación (Modern Review Desk) */}
                                <div className="lg:col-span-8 space-y-4">
                                  <div className="text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                                    <div>
                                      <h3
                                        id="bandeja-seccion"
                                        className="text-xs font-black uppercase text-indigo-400 tracking-[0.2em] font-sans"
                                      >
                                        Bandeja de Actividades Enviadas
                                      </h3>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] font-black rounded-full shadow-sm shrink-0">
                                      INBOX • {totalPendingReviews} ENTREGAS POR
                                      CALIFICAR
                                    </span>
                                  </div>

                                  {totalPendingReviews === 0 ? (
                                    <div className="bg-slate-900/20 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4 max-w-full relative overflow-hidden">
                                      <div className="absolute inset-0 bg-radial-gradient(circle, rgba(99,102,241,0.03)_10%, transparent_10%) bg-[size:20px_20px] pointer-events-none" />
                                      <div className="p-4 bg-slate-950 rounded-[2rem] border border-slate-800/80 text-slate-600">
                                        <CheckCircle2
                                          size={40}
                                          className="text-emerald-500/60"
                                        />
                                      </div>
                                      <div className="space-y-1 relative z-10 text-center">
                                        <h4 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider">
                                          ¡Todo el trabajo calificado!
                                        </h4>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                                          No tienes evaluaciones pendientes en
                                          este momento. ¡Tus estudiantes están
                                          al día!
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/20 border border-slate-800/80 p-4 lg:p-6 rounded-3xl overflow-hidden text-left">
                                      {/* Left Side: Submissions list */}
                                      <div className="lg:col-span-5 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar border-b lg:border-b-0 lg:border-r border-slate-800/50 pb-4 lg:pb-0 lg:pr-6">
                                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest pl-1">
                                          Entregas Recientes
                                        </span>

                                        {reviewInboxItems.map((item) => {
                                          const isSelected =
                                            activeReviewItem?.student.id ===
                                              item.student.id &&
                                            activeReviewItem?.taskId ===
                                              item.taskId;
                                          const taskDetails = item.taskDetails;

                                          return (
                                            <button
                                              key={`${item.student.id}-${item.taskId}`}
                                              onClick={() => {
                                                setSelectedReviewItem({
                                                  studentId: item.student.id,
                                                  taskId: item.taskId,
                                                });
                                                setTeacherFeedbackComment("");
                                              }}
                                              className={cn(
                                                "w-full p-4 rounded-2xl flex items-start gap-3 transition-all duration-300 border text-left",
                                                isSelected
                                                  ? "bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                                                  : "bg-slate-955 bg-slate-950/80 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700",
                                              )}
                                            >
                                              <img
                                                src={item.student.avatar}
                                                alt={item.student.name}
                                                className="w-9 h-9 rounded-full border border-slate-800 bg-slate-900 p-0.5 shrink-0"
                                                referrerPolicy="no-referrer"
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                  <span className="font-bold text-slate-200 text-xs truncate uppercase tracking-wider">
                                                    {item.student.name}
                                                  </span>
                                                  <span className="shrink-0 px-2 py-0.5 bg-slate-900 text-slate-400 font-mono text-[8.5px] font-black rounded-lg uppercase border border-slate-800">
                                                    {item.student.grade}
                                                  </span>
                                                </div>

                                                <p className="text-[11px] text-slate-300 font-bold truncate italic mt-1 pb-1">
                                                  {taskDetails?.title}
                                                </p>

                                                <div className="flex items-center gap-1.5 mt-1">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                  <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest leading-none">
                                                    Espera revisión
                                                  </span>
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Right Side: Active Workspace */}
                                      <div className="lg:col-span-7 flex flex-col justify-between min-h-[440px] lg:pl-2">
                                        {activeReviewItem ? (
                                          <div className="flex flex-col h-full justify-between gap-6">
                                            {/* Sub-Header */}
                                            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                                              <div className="flex items-center gap-3">
                                                <img
                                                  src={
                                                    activeReviewItem.student
                                                      .avatar
                                                  }
                                                  alt={
                                                    activeReviewItem.student
                                                      .name
                                                  }
                                                  className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-900 p-0.5 shrink-0"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div>
                                                  <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-white text-base uppercase tracking-wider">
                                                      {
                                                        activeReviewItem.student
                                                          .name
                                                      }
                                                    </h4>
                                                    <span className="px-2.5 py-0.5 bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] font-black rounded-full uppercase tracking-wider">
                                                      {
                                                        activeReviewItem.student
                                                          .grade
                                                      }
                                                    </span>
                                                  </div>
                                                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">
                                                    Alumno Evaluando • Solicitó
                                                    Evaluación Directa
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="text-right">
                                                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
                                                  Recompensas
                                                </span>
                                                <div className="flex items-center gap-2 mt-1 bg-slate-900 border border-slate-800 p-1 px-2.5 rounded-xl">
                                                  <div className="flex items-center gap-1 font-mono text-amber-400 font-bold text-xs leading-none">
                                                    <span>
                                                      +
                                                      {activeReviewItem
                                                        .taskDetails?.reward
                                                        .tokens || 100}
                                                    </span>
                                                    <span>🪙</span>
                                                  </div>
                                                  {activeReviewItem.taskDetails
                                                    ?.reward.cardId && (
                                                    <div
                                                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
                                                      title="Incluye Coleccionable"
                                                    />
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Submission Body */}
                                            <div className="space-y-4 flex-1">
                                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/60 text-slate-300">
                                                <span className="text-[8px] font-black text-indigo-400 tracking-widest uppercase block mb-1">
                                                  Materia y Desafío
                                                </span>
                                                <h5 className="font-extrabold text-white text-[13px] uppercase tracking-wide">
                                                  {
                                                    activeReviewItem.taskDetails
                                                      ?.title
                                                  }
                                                </h5>
                                                <p className="text-xs text-slate-400 italic mt-1">
                                                  {activeReviewItem.taskDetails
                                                    ?.description ||
                                                    "Resolver la lección y responder con la justificación matemática."}
                                                </p>
                                              </div>

                                              <div className="p-5 bg-indigo-950/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden space-y-3">
                                                <div className="absolute top-3 right-4 flex items-center gap-2">
                                                  <Sparkles
                                                    size={11}
                                                    className="text-indigo-400 animate-pulse"
                                                  />
                                                  <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest font-mono">
                                                    Verificado
                                                  </span>
                                                </div>

                                                <span className="text-[8px] font-black text-indigo-400 tracking-widest uppercase block mb-1">
                                                  Respuestas del Alumno
                                                </span>

                                                <div className="space-y-2">
                                                  <div className="text-[11px] text-slate-350 text-slate-300 leading-relaxed font-bold italic bg-slate-950/60 p-4 rounded-2xl border border-slate-900 border-l-[3px] border-l-indigo-500">
                                                    "Desafío completado con
                                                    éxito. Se justificaron las
                                                    respuestas aplicando el
                                                    proceso pedagógico sugerido.
                                                    Listo para revisión."
                                                  </div>
                                                  <div className="flex items-center gap-4 text-[10px] text-slate-500 bg-slate-950/30 p-2 px-3 rounded-xl border border-slate-900/50 font-mono">
                                                    <span>
                                                      ⏱️ Tiempo estimado: 15 min
                                                    </span>
                                                    <span>
                                                      📈 Precisión: 100%
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Rendering visual evidence under submission block */}
                                              {evidenceUrl ? (
                                                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/60 space-y-3">
                                                  <span className="text-[8px] font-black text-cyan-400 tracking-widest uppercase block mb-1">
                                                    Evidencia Visual del Alumno
                                                  </span>
                                                  <div className="relative border border-slate-800 bg-slate-950 p-2 rounded-2xl overflow-hidden group max-w-full flex justify-center">
                                                    <img
                                                      src={evidenceUrl}
                                                      alt="Evidencia enviada"
                                                      className="max-h-96 w-auto object-contain rounded-xl"
                                                      referrerPolicy="no-referrer"
                                                    />
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                      <button
                                                        onClick={() =>
                                                          downloadBase64File(
                                                            evidenceUrl,
                                                            `evidencia_${activeReviewItem.student.name}_${activeReviewItem.taskId}.jpg`,
                                                          )
                                                        }
                                                        className="px-3 py-1.5 bg-slate-900/90 text-cyan-400 hover:text-white rounded-xl border border-slate-700/50 shadow-md flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                                      >
                                                        <Download size={11} /> Descargar
                                                      </button>
                                                    </div>
                                                  </div>
                                                  <div className="flex justify-end">
                                                    <button
                                                      onClick={() =>
                                                        downloadBase64File(
                                                          evidenceUrl,
                                                          `evidencia_${activeReviewItem.student.name}_${activeReviewItem.taskId}.jpg`,
                                                        )
                                                      }
                                                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 rounded-xl border border-slate-800 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                                    >
                                                      <Download size={14} /> Descargar Evidencia
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="bg-slate-900/20 p-4 rounded-3xl border border-slate-800/40 text-center text-[10px] text-slate-500 italic">
                                                  ⚠️ No se subió evidencia visual o se utilizó un método alternativo.
                                                </div>
                                              )}

                                              {/* Feedback Comment input */}
                                              <div className="space-y-1.5 text-left">
                                                <label className="text-[9px] font-black text-slate-500 tracking-widest uppercase block">
                                                  Comentario de
                                                  Retroalimentación (Opcional)
                                                </label>
                                                <input
                                                  type="text"
                                                  value={teacherFeedbackComment}
                                                  onChange={(e) =>
                                                    setTeacherFeedbackComment(
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder="Ej. ¡Excelente esfuerzo! Sigue así... / Revisa el ejercicio 3..."
                                                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-xs font-semibold text-white focus:outline-none transition-all placeholder:text-slate-700"
                                                />
                                              </div>
                                            </div>

                                            {/* Control buttons */}
                                            <div className="flex gap-3 pt-3 border-t border-slate-800/85">
                                              <button
                                                onClick={() => {
                                                  const {
                                                    student,
                                                    taskId,
                                                    taskDetails,
                                                  } = activeReviewItem;
                                                  const targetUserStats =
                                                    rawStudents.find(
                                                      (u) =>
                                                        u.id === student.id,
                                                    );
                                                  if (!targetUserStats) return;
                                                  const updatedStats = {
                                                    ...targetUserStats,
                                                  };
                                                  updatedStats.pendingTasks =
                                                    updatedStats.pendingTasks?.filter(
                                                      (id) => id !== taskId,
                                                    );
                                                  updatedStats.completedTasks =
                                                    [
                                                      ...(updatedStats.completedTasks ||
                                                        []),
                                                      taskId,
                                                    ];
                                                  if (
                                                    taskDetails?.reward.tokens
                                                  )
                                                    updatedStats.tokens +=
                                                      taskDetails.reward.tokens;
                                                  if (
                                                    taskDetails?.reward
                                                      .cardId &&
                                                    !updatedStats.collection.includes(
                                                      taskDetails.reward.cardId,
                                                    )
                                                  ) {
                                                    updatedStats.collection.push(
                                                      taskDetails.reward.cardId,
                                                    );
                                                  }
                                                  // Sync to Supabase
                                                  if (targetUserStats.id) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        targetUserStats.id,
                                                        updatedStats,
                                                      )
                                                      .then(async () => {
                                                        await supabaseService.sendNotification(
                                                          targetUserStats.id!,
                                                          "Tarea Aprobada",
                                                          `Tu tarea "${taskDetails?.title}" ha sido aprobada. ${teacherFeedbackComment ? "Retroalimentación: " + teacherFeedbackComment : "¡Recibiste tus recompensas!"}`,
                                                          "success",
                                                        );
                                                        loadUsers();
                                                        setTeacherFeedbackComment(
                                                          "",
                                                        );
                                                        setSelectedReviewItem(
                                                          null,
                                                        );
                                                        toast.success(
                                                          "¡Actividad aprobada! Recompensas enviadas al alumno.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                }}
                                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 duration-300 pointer-events-auto active:scale-95"
                                              >
                                                <CheckCircle2 size={16} />{" "}
                                                Aprobar y Premiar
                                              </button>

                                              <button
                                                onClick={() => {
                                                  const {
                                                    student,
                                                    taskId,
                                                    taskDetails,
                                                  } = activeReviewItem;
                                                  const targetUserStats =
                                                    rawStudents.find(
                                                      (u) =>
                                                        u.id === student.id,
                                                    );
                                                  if (!targetUserStats) return;
                                                  const updatedStats = {
                                                    ...targetUserStats,
                                                  };
                                                  updatedStats.pendingTasks =
                                                    updatedStats.pendingTasks?.filter(
                                                      (id) => id !== taskId,
                                                    );

                                                  if (targetUserStats.id) {
                                                    supabaseService
                                                      .updateUserStats(
                                                        targetUserStats.id,
                                                        updatedStats,
                                                      )
                                                      .then(async () => {
                                                        await supabaseService.sendNotification(
                                                          targetUserStats.id!,
                                                          "Tarea Rechazada",
                                                          `Tu tarea "${taskDetails?.title}" no fue aprobada. ${teacherFeedbackComment ? "Observación: " + teacherFeedbackComment : "Por favor, revisa tus respuestas e inténtalo de nuevo."}`,
                                                          "error",
                                                        );
                                                        loadUsers();
                                                        setTeacherFeedbackComment(
                                                          "",
                                                        );
                                                        setSelectedReviewItem(
                                                          null,
                                                        );
                                                        toast.error(
                                                          "Actividad rechazada. El alumno deberá corregir.",
                                                        );
                                                      })
                                                      .catch(console.error);
                                                  }
                                                }}
                                                className="px-6 py-4 bg-slate-900 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 border border-slate-850 border-slate-800 hover:border-rose-500/20 font-extrabold text-xs uppercase tracking-widest rounded-2xl flex justify-center items-center gap-2 transition-all duration-300 active:scale-95 shadow-inner"
                                              >
                                                <Trash2 size={16} /> Rechazar
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-900/10 border border-slate-900 border-dashed rounded-3xl h-full">
                                            <AlertCircle
                                              className="text-slate-600 mb-2"
                                              size={24}
                                            />
                                            <p className="text-xs text-slate-600 uppercase font-black tracking-wider">
                                              Selecciona una entrega de la
                                              bandeja
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side Sidebar: Estadísticas & Destacados */}
                                <div className="lg:col-span-4 space-y-8">
                                  {/* Estadísticas de Desempeño */}
                                  <div className="space-y-4">
                                    <div className="text-left px-1">
                                      <h3 className="text-xs font-black uppercase text-indigo-400 tracking-[0.2em] font-sans">
                                        Estadísticas de Desempeño
                                      </h3>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                      {/* Metric 1 */}
                                      <div className="bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300">
                                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                                          <Users size={18} />
                                        </div>
                                        <div className="text-left">
                                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                                            Alumnos a cargo
                                          </span>
                                          <h4 className="text-2xl font-black text-white italic tracking-tight leading-none mt-1">
                                            {totalStudentsCount}
                                          </h4>
                                        </div>
                                      </div>

                                      {/* Metric 2 */}
                                      <div className="bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300">
                                        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                                          <Coins
                                            size={18}
                                            className="text-amber-400"
                                          />
                                        </div>
                                        <div className="text-left">
                                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                                            Tokens Otorgados
                                          </span>
                                          <div className="flex items-baseline gap-1 mt-1">
                                            <h4 className="text-2xl font-black text-white italic tracking-tight leading-none">
                                              {totalStudentTokens}
                                            </h4>
                                            <span className="text-xs text-amber-400 leading-none">
                                              🪙
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Metric 3 */}
                                      <div
                                        className={cn(
                                          "border p-4 rounded-2xl flex items-center gap-4 transition-all duration-300",
                                          totalPendingReviews > 0
                                            ? "bg-rose-950/25 border-rose-500/30 hover:border-rose-500/50 shadow-rose-500/5"
                                            : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700",
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "p-2.5 rounded-xl border transition-all duration-300",
                                            totalPendingReviews > 0
                                              ? "bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse"
                                              : "bg-slate-850 border-slate-800 text-slate-400",
                                          )}
                                        >
                                          <AlertCircle size={18} />
                                        </div>
                                        <div className="text-left">
                                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                                            Pendientes de Revisión
                                          </span>
                                          <h4
                                            className={cn(
                                              "text-2xl font-black italic tracking-tight leading-none mt-1",
                                              totalPendingReviews > 0
                                                ? "text-rose-400"
                                                : "text-white",
                                            )}
                                          >
                                            {totalPendingReviews}
                                          </h4>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Alumnos Destacados */}
                                  <div className="space-y-4">
                                    <div className="text-left px-1 flex items-center gap-2 text-indigo-400">
                                      <Trophy size={16} />
                                      <h4 className="text-xs font-black uppercase tracking-widest font-sans">
                                        Alumnos Destacados del Aula
                                      </h4>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                      {topStudents.length === 0 ? (
                                        <div className="py-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest bg-slate-950/20 rounded-2xl border border-slate-800/40">
                                          No hay alumnos vinculados aún
                                        </div>
                                      ) : (
                                        topStudents.map((student, index) => {
                                          const podiumIcons = [
                                            "🏆 1er Lugar",
                                            "🥈 2do Lugar",
                                            "🥉 3er Lugar",
                                          ];
                                          const cardStyles = [
                                            "bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/5",
                                            "bg-gradient-to-br from-slate-400/5 to-transparent border-slate-500/10 text-slate-300",
                                            "bg-gradient-to-br from-orange-500/5 to-transparent border-orange-600/10 text-orange-400",
                                          ];

                                          return (
                                            <div
                                              key={
                                                student.id ||
                                                `top-student-${index}`
                                              }
                                              className={cn(
                                                "flex flex-col justify-between p-5 rounded-2xl border transform hover:-translate-y-1 duration-200 gap-4 text-left relative overflow-hidden",
                                                cardStyles[index] ||
                                                  "bg-slate-950/40 border-slate-900 text-slate-400",
                                              )}
                                            >
                                              <div className="flex items-center gap-3">
                                                <img
                                                  src={student.avatar}
                                                  alt={student.name}
                                                  className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 p-0.5 shrink-0"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="min-w-0">
                                                  <span className="text-[9px] font-black uppercase tracking-widest block opacity-70 mb-0.5">
                                                    {podiumIcons[index] ||
                                                      `#${index + 1}`}
                                                  </span>
                                                  <h5 className="font-extrabold text-white text-sm uppercase tracking-wider truncate">
                                                    {student.name}
                                                  </h5>
                                                </div>
                                              </div>

                                              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                <div className="text-[10px] font-black tracking-widest text-slate-450 text-slate-400 uppercase bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800/40">
                                                  Grado {student.grade}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  <div className="flex items-center gap-0.5 text-orange-400 font-black text-xs">
                                                    <Flame
                                                      size={12}
                                                      className="fill-orange-400 animate-pulse"
                                                    />
                                                    <span>
                                                      {student.streak}d
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1 bg-slate-950/70 py-1 px-2.5 rounded-lg border border-slate-800/60 font-mono text-xs text-amber-400 font-bold">
                                                    <span>
                                                      {student.tokens}
                                                    </span>
                                                    <span className="text-[10px]">
                                                      🪙
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* STUDENT WELCOME (HOME) */
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-900 border border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-lg group transition-all">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)]"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                            <div className="max-w-xl text-left">
                              <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight italic tracking-tighter text-indigo-400">
                                ¿Listo para un desafío?
                              </h2>
                              <p className="text-slate-400 text-base sm:text-lg font-medium opacity-90">
                                Demuestra qué tanto sabes de cultura general
                                para ganar puntos.
                              </p>
                              <div className="flex flex-wrap gap-4 mt-8 justify-start">
                                <button
                                  onClick={() => {
                                    if (
                                      hasCompletedDaily ||
                                      sessionCompletedChallenges.has(
                                        currentChallenge.id,
                                      )
                                    ) {
                                      generateDailyChallenge();
                                    }
                                    setShowChallengeModal(true);
                                  }}
                                  disabled={isGeneratingChallenge}
                                  className={cn(
                                    "w-full sm:w-auto px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2",
                                    isGeneratingChallenge
                                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg",
                                  )}
                                >
                                  {isGeneratingChallenge ? (
                                    <>
                                      <Loader2
                                        size={18}
                                        className="animate-spin text-slate-500"
                                      />
                                      Generando...
                                    </>
                                  ) : hasCompletedDaily ? (
                                    "Volver a Jugar"
                                  ) : (
                                    "¡Estoy listo!"
                                  )}
                                </button>
                              </div>
                            </div>
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                                rotate: [12, 15, 12],
                                opacity: [0.1, 0.15, 0.1],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="hidden md:block pointer-events-none"
                            >
                              <Rocket className="w-56 h-56 text-indigo-400" />
                            </motion.div>
                          </div>
                        </div>

                        <div>
                          {/* RANKING VIEW - ALWAYS VISIBLE ON HOME */}
                          <div className="space-y-2 relative z-10 -mt-2">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="text-xl font-black italic uppercase tracking-widest text-indigo-400">
                                Ranking: {stats.grade}
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-4 italic">
                                  Estudiantes Destacados
                                </h4>
                                <div className="space-y-2">
                                  {allStudents
                                    .filter((s) => s.grade === stats.grade)
                                    .sort((a, b) => b.tokens - a.tokens)
                                    .slice(0, 10)
                                    .map((student, i) => (
                                      <button
                                        key={
                                          student.id ||
                                          `ranking-${student.username || i}`
                                        }
                                        onClick={() =>
                                          setSelectedStudent(student)
                                        }
                                        className={cn(
                                          "w-full flex items-center justify-between p-3 rounded-3xl transition-all border",
                                          selectedStudent?.id === student.id
                                            ? "bg-indigo-600/10 border-indigo-500/30 text-white shadow-md"
                                            : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                                        )}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="relative">
                                            <img
                                              src={student.avatar}
                                              alt={student.name}
                                              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-lg"
                                            />
                                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center text-[10px] font-black italic border border-slate-800">
                                              #{i + 1}
                                            </div>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-tight">
                                              {student.name}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-500 tracking-widest">
                                              {student.grade} GRADO
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Flame
                                            size={14}
                                            className="text-rose-500"
                                          />
                                          <span className="text-xs font-black italic">
                                            {student.streak}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-6">
                                {selectedStudent ? (
                                  <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                    <div className="flex flex-col items-start text-left space-y-4">
                                      <img
                                        src={selectedStudent.avatar}
                                        alt=""
                                        className="w-24 h-24 rounded-[2rem] border-4 border-indigo-600 shadow-lg object-cover"
                                      />
                                      <div>
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                          {selectedStudent.name}
                                        </h4>
                                      </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-800">
                                      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6 w-fit">
                                        {[
                                          {
                                            label: "Colección",
                                            value: "Collectible",
                                          },
                                          {
                                            label: "Logros",
                                            value: "Achievement",
                                          },
                                        ].map((tab) => (
                                          <button
                                            key={tab.value}
                                            onClick={() =>
                                              setRankingSubTab(tab.value as any)
                                            }
                                            className={cn(
                                              "px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all whitespace-nowrap",
                                              rankingSubTab === tab.value
                                                ? "bg-indigo-600 text-white shadow-lg"
                                                : "text-slate-500 hover:text-slate-300",
                                            )}
                                          >
                                            {tab.label}
                                          </button>
                                        ))}
                                      </div>

                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3 px-2 sm:px-0">
                                        {allAvailableCards
                                          .filter(
                                            (c) =>
                                              c.category === rankingSubTab &&
                                              selectedStudent.collection.includes(
                                                c.id,
                                              ),
                                          )
                                          .map((card) => {
                                            return (
                                              <div
                                                key={card.id}
                                                onClick={() =>
                                                  setSelectedCardId(card.id)
                                                }
                                                className={cn(
                                                  "aspect-[2/3] bg-black rounded-2xl md:rounded-[2rem] overflow-hidden border transition-all cursor-pointer group shadow-lg flex items-center justify-center relative",
                                                  card.rarity === "Legendary"
                                                    ? "border-amber-500/60 shadow-amber-500/20"
                                                    : card.rarity === "Epic"
                                                      ? "border-purple-600/60 shadow-purple-500/20"
                                                      : card.rarity === "Rare"
                                                        ? "border-blue-500/60 shadow-blue-500/20"
                                                        : "border-slate-800",
                                                )}
                                              >
                                                <img
                                                  src={card.imageUrl}
                                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                              </div>
                                            );
                                          })}
                                      </div>
                                      {allAvailableCards.filter(
                                        (c) =>
                                          c.category === rankingSubTab &&
                                          selectedStudent.collection.includes(
                                            c.id,
                                          ),
                                      ).length === 0 && (
                                        <div className="py-12 text-center opacity-30">
                                          <p className="text-[10px] font-black uppercase tracking-widest italic">
                                            Aún no ha descubierto cartas en este
                                            sector
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                                    <UserIcon size={64} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                      Selecciona un estudiante para
                                      <br />
                                      ver sus hallazgos en la red
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "collection" && (
                  <motion.div
                    key="collection"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6 md:space-y-8 pb-6"
                  >
                    {stats.role === "Admin" ? (
                      /* ADMIN COLLECTION MANAGEMENT */
                      <div className="space-y-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 text-left">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-600 pb-2 px-1 shrink-0">
                              Registro de Cartas
                            </h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1 shrink-0">
                              Configuración Maestro de la Colección
                            </p>
                          </div>
                          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto transform-gpu max-w-full w-full min-h-[44px] items-center justify-start md:w-auto">
                            {[
                              { label: "Colección", value: "Collectible" },
                              { label: "Logros", value: "Achievement" },
                            ].map((sub) => (
                              <button
                                key={sub.value}
                                onClick={() =>
                                  setCollectionSubTab(sub.value as any)
                                }
                                className={cn(
                                  "px-4 md:px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap flex-1 md:flex-none text-center",
                                  collectionSubTab === sub.value
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-500 hover:text-slate-300",
                                )}
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all">
                              <Plus size={14} /> Nueva Carta de{" "}
                              {collectionSubTab}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-12">
                            {allAvailableCards
                              .filter((c) => c.category === collectionSubTab)
                              .map((card) => (
                                <button
                                  key={card.id}
                                  onClick={() => setSelectedAdminCard(card)}
                                  className={cn(
                                    "relative aspect-[2/3] rounded-2xl md:rounded-[2rem] overflow-hidden group transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-lg border bg-slate-950",
                                    card.rarity === "Legendary"
                                      ? "border-amber-500/50 shadow-amber-500/20"
                                      : card.rarity === "Epic"
                                        ? "border-purple-500/50 shadow-purple-500/20"
                                        : card.rarity === "Rare"
                                          ? "border-indigo-500/50 shadow-indigo-500/20"
                                          : "border-slate-800 shadow-black/50",
                                  )}
                                >
                                  <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  {/* Holographic Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-light.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-8">
                                    <h4 className="font-black text-[10px] uppercase text-white tracking-tighter leading-tight truncate drop-shadow-md">
                                      {card.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <div
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full shadow-lg",
                                          card.rarity === "Secret"
                                            ? "bg-rose-400"
                                            : card.rarity === "Legendary"
                                              ? "bg-amber-400"
                                              : card.rarity === "Epic"
                                                ? "bg-purple-400"
                                                : card.rarity === "Rare"
                                                  ? "bg-indigo-400"
                                                  : "bg-slate-400",
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "text-[7px] font-black uppercase opacity-70",
                                          card.rarity === "Secret"
                                            ? "text-rose-400"
                                            : card.rarity === "Legendary"
                                              ? "text-amber-400"
                                              : card.rarity === "Epic"
                                                ? "text-purple-400"
                                                : card.rarity === "Rare"
                                                  ? "text-indigo-400"
                                                  : "text-slate-400",
                                        )}
                                      >
                                        {card.rarity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-6 h-6 bg-white/10  rounded-lg flex items-center justify-center text-white">
                                      <Pencil size={12} />
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : stats.role === "Teacher" ? (
                      <div className="space-y-10">
                        {selectedTeacherGroup ? (
                          /* DEDICATED GROUP DETAIL SCREEN (PÁGINA DETALLES DE GRUPO) */
                          <div className="space-y-6">
                            {/* BACK HEADER */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 text-left">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => setSelectedTeacherGroup(null)}
                                  className="flex items-center gap-2 group text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest bg-slate-900/60 border border-slate-800 p-2.5 px-5 rounded-2xl transition-all hover:bg-slate-800/80 cursor-pointer"
                                >
                                  <ArrowLeft
                                    size={14}
                                    className="transition-transform group-hover:-translate-x-1"
                                  />
                                  Volver a Grupos
                                </button>
                                <div>
                                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                                    Grupo {selectedTeacherGroup}
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full not-italic">
                                      {selectedTeacherGroup[0]}º Año
                                    </span>
                                  </h2>
                                  <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mt-1">
                                    Revisión Pedagógica y Expediente de Alumnos
                                  </p>
                                </div>
                              </div>

                              {/* QUICK STATS IN ROW */}
                              <div className="flex flex-wrap gap-2.5">
                                <div className="bg-slate-900/40 border border-slate-800/80 p-3 px-5 rounded-2xl flex items-center gap-3 min-w-[120px]">
                                  <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center text-indigo-400">
                                    <Users size={16} />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                      Alumnos
                                    </span>
                                    <span className="text-base font-black text-white">
                                      {
                                        globalStudents.filter(
                                          (s) =>
                                            s.grade === selectedTeacherGroup,
                                        ).length
                                      }
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800/80 p-3 px-5 rounded-2xl flex items-center gap-3 min-w-[120px]">
                                  <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 size={16} />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-sans">
                                      Misiones
                                    </span>
                                    <span className="text-base font-black text-white">
                                      {globalStudents
                                        .filter(
                                          (s) =>
                                            s.grade === selectedTeacherGroup,
                                        )
                                        .reduce(
                                          (sum, s) =>
                                            sum + s.completedTasks.length,
                                          0,
                                        )}
                                    </span>
                                  </div>
                                </div>

                                {(() => {
                                  const totalPendingGroup = globalStudents
                                    .filter(
                                      (s) => s.grade === selectedTeacherGroup,
                                    )
                                    .reduce(
                                      (sum, s) =>
                                        sum + (s.pendingTasks?.length || 0),
                                      0,
                                    );
                                  return (
                                    <div
                                      className={cn(
                                        "border p-3 px-5 rounded-2xl flex items-center gap-3 min-w-[120px] transition-all",
                                        totalPendingGroup > 0
                                          ? "bg-amber-500/[0.04] border-amber-500/30"
                                          : "bg-slate-900/40 border-slate-800/80",
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center",
                                          totalPendingGroup > 0
                                            ? "bg-amber-500/10 text-amber-400 font-sans"
                                            : "bg-slate-800/60 text-slate-500 font-sans",
                                        )}
                                      >
                                        <AlertCircle size={14} />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                          Pendientes
                                        </span>
                                        <span
                                          className={cn(
                                            "text-base font-black",
                                            totalPendingGroup > 0
                                              ? "text-amber-400"
                                              : "text-white",
                                          )}
                                        >
                                          {totalPendingGroup}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {globalStudents.filter(
                              (s) => s.grade === selectedTeacherGroup,
                            ).length === 0 ? (
                              <div className="bg-slate-900 border border-slate-800 p-16 rounded-[2.5rem] flex flex-col items-center justify-center text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <Users size={48} className="opacity-20 mb-4" />
                                No hay alumnos registrados en este grupo.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* LEFT COLUMN: LIST and searching & filters of Students */}
                                <div className="lg:col-span-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-[2.2rem] space-y-4 text-left">
                                  <div className="flex justify-between items-center px-1 border-b border-slate-800/60 pb-2">
                                    <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] font-sans">
                                      Alumnos de la Clase
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-500 font-sans bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                                      {
                                        globalStudents.filter(
                                          (s) =>
                                            s.grade === selectedTeacherGroup,
                                        ).length
                                      }{" "}
                                      total
                                    </span>
                                  </div>

                                  {/* SEARCH BAR */}
                                  <div className="relative">
                                    <Search
                                      size={14}
                                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                    />
                                    <input
                                      type="text"
                                      value={groupStudentSearch}
                                      onChange={(e) =>
                                        setGroupStudentSearch(e.target.value)
                                      }
                                      placeholder="Buscar alumno..."
                                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/80 rounded-2xl p-2.5 pl-10 text-xs font-semibold text-white focus:outline-none placeholder:text-slate-600 transition-all text-left"
                                    />
                                    {groupStudentSearch && (
                                      <button
                                        onClick={() =>
                                          setGroupStudentSearch("")
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>

                                  {/* FILTERS */}
                                  <div className="flex gap-1.5 p-1 bg-slate-900/20 rounded-xl border border-slate-800/40">
                                    <button
                                      onClick={() =>
                                        setActiveStudentFilter("all")
                                      }
                                      className={cn(
                                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                        activeStudentFilter === "all"
                                          ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                                          : "text-slate-500 hover:text-slate-300",
                                      )}
                                    >
                                      Todos
                                    </button>
                                    <button
                                      onClick={() =>
                                        setActiveStudentFilter("pending")
                                      }
                                      className={cn(
                                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                        activeStudentFilter === "pending"
                                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                          : "text-slate-500 hover:text-slate-300",
                                      )}
                                    >
                                      Pendientes
                                    </button>
                                    <button
                                      onClick={() =>
                                        setActiveStudentFilter("online")
                                      }
                                      className={cn(
                                        "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                        activeStudentFilter === "online"
                                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                          : "text-slate-500 hover:text-slate-300",
                                      )}
                                    >
                                      En Línea
                                    </button>
                                  </div>

                                  {/* ENDPOINT USER CARD TILES CONTAINER */}
                                  <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                                    {(() => {
                                      const studentsInGroup =
                                        globalStudents.filter(
                                          (s) =>
                                            s.grade === selectedTeacherGroup,
                                        );
                                      const filteredStudents = studentsInGroup
                                        .filter((std) => {
                                          if (!groupStudentSearch.trim())
                                            return true;
                                          return std.name
                                            .toLowerCase()
                                            .includes(
                                              groupStudentSearch.toLowerCase(),
                                            );
                                        })
                                        .filter((std) => {
                                          if (
                                            activeStudentFilter === "pending"
                                          ) {
                                            return (
                                              (std.pendingTasks?.length || 0) >
                                              0
                                            );
                                          }
                                          if (
                                            activeStudentFilter === "online"
                                          ) {
                                            const isOnline =
                                              std.tokens % 3 === 0 ||
                                              std.streak > 8;
                                            return isOnline;
                                          }
                                          return true;
                                        });

                                      if (filteredStudents.length === 0) {
                                        return (
                                          <div className="text-center py-10 text-slate-500 text-[10px] font-bold uppercase tracking-widest font-sans">
                                            Sin alumnos encontrados
                                          </div>
                                        );
                                      }

                                      return filteredStudents.map((std) => {
                                        const isSelected =
                                          std.id === activeGroupStudentId;
                                        const completedCount =
                                          std.completedTasks.length;
                                        const pendingCount =
                                          std.pendingTasks?.length || 0;
                                        const isOnline =
                                          std.tokens % 3 === 0 ||
                                          std.streak > 8;

                                        return (
                                          <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            key={std.id}
                                            onClick={() => {
                                              setActiveGroupStudentId(std.id);
                                              setGroupDirectFeedback("");
                                            }}
                                            className={cn(
                                              "w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all border text-left cursor-pointer",
                                              isSelected
                                                ? "bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/5"
                                                : "bg-slate-950 border-slate-900 hover:bg-slate-900/80 hover:border-slate-800",
                                            )}
                                          >
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className="relative mt-0.5">
                                                <div
                                                  className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden relative bg-slate-900",
                                                    isSelected
                                                      ? "border-indigo-400"
                                                      : "border-slate-800",
                                                  )}
                                                >
                                                  {std.avatar ? (
                                                    <img
                                                      src={std.avatar}
                                                      alt={std.name}
                                                      className="w-full h-full object-cover"
                                                      referrerPolicy="no-referrer"
                                                    />
                                                  ) : (
                                                    <span className="text-white font-black text-xs uppercase">
                                                      {std.name.charAt(0)}
                                                    </span>
                                                  )}
                                                </div>
                                                {isOnline ? (
                                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full font-sans">
                                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
                                                  </div>
                                                ) : (
                                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-500 border-2 border-slate-950 rounded-full font-sans"></div>
                                                )}
                                              </div>

                                              <div className="min-w-0">
                                                <span
                                                  className={cn(
                                                    "font-black text-xs block truncate transition-colors uppercase tracking-tight",
                                                    isSelected
                                                      ? "text-white"
                                                      : "text-slate-300",
                                                  )}
                                                >
                                                  {std.name}
                                                </span>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 block truncate">
                                                  {completedCount} Hechas •{" "}
                                                  {pendingCount} Pendiente
                                                  {pendingCount !== 1
                                                    ? "s"
                                                    : ""}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              {pendingCount > 0 && (
                                                <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black flex items-center justify-center font-mono border border-amber-500/20">
                                                  {pendingCount}
                                                </span>
                                              )}
                                              <ChevronRight
                                                size={14}
                                                className={cn(
                                                  "transition-colors",
                                                  isSelected
                                                    ? "text-indigo-400"
                                                    : "text-slate-600",
                                                )}
                                              />
                                            </div>
                                          </motion.button>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>

                                {/* RIGHT COLUMN: Selected Student Workspace */}
                                {(() => {
                                  const studentsInSelectedGroup =
                                    globalStudents.filter(
                                      (s) => s.grade === selectedTeacherGroup,
                                    );
                                  const activeStudent =
                                    studentsInSelectedGroup.find(
                                      (s) => s.id === activeGroupStudentId,
                                    ) ||
                                    studentsInSelectedGroup[0] ||
                                    null;

                                  if (!activeStudent) return null;

                                  const studentData = activeStudent;
                                  const yearKey = (studentData.grade?.[0] ||
                                    "1") as Year;
                                  const studentGrade = studentData.grade;

                                  const hasIntegrationThisYear = (
                                    stats.assignedSubjects || []
                                  ).some((s) => {
                                    const baseId = s.includes(":")
                                      ? s.split(":")[0]
                                      : s;
                                    const group = s.includes(":")
                                      ? s.split(":")[1]
                                      : null;
                                    return (
                                      baseId === `int_cur_${yearKey}` &&
                                      (!group || group === studentGrade)
                                    );
                                  });

                                  const specificSubjectsForThisGrade = (
                                    stats.assignedSubjects || []
                                  )
                                    .filter((s) =>
                                      s.includes(":")
                                        ? s.split(":")[1] === studentGrade
                                        : false,
                                    )
                                    .map((s) => s.split(":")[0]);

                                  const legacySubjects = (
                                    stats.assignedSubjects || []
                                  ).filter((s) => !s.includes(":"));

                                  const baseSubjects = [
                                    ...new Set([
                                      ...specificSubjectsForThisGrade,
                                      ...legacySubjects,
                                    ]),
                                  ];

                                  const subjectsToCheck = hasIntegrationThisYear
                                    ? (ACADEMIC_CONTENT[yearKey] || []).map(
                                        (s) => s.id,
                                      )
                                    : baseSubjects;

                                  const totalTasks = (
                                    ACADEMIC_CONTENT[yearKey] || []
                                  )
                                    .filter((s) =>
                                      subjectsToCheck.includes(s.id),
                                    )
                                    .reduce(
                                      (acc, s) =>
                                        acc +
                                        s.topics.reduce(
                                          (acc2, t) => acc2 + t.tasks.length,
                                          0,
                                        ),
                                      0,
                                    );

                                  const completedTasksCount =
                                    studentData.completedTasks.filter(
                                      (taskId) =>
                                        subjectsToCheck.some((subId) =>
                                          (ACADEMIC_CONTENT[yearKey] || [])
                                            .find((s) => s.id === subId)
                                            ?.topics.some((t) =>
                                              t.tasks.some(
                                                (task) => task.id === taskId,
                                              ),
                                            ),
                                        ),
                                    ).length;

                                  const progress =
                                    totalTasks > 0
                                      ? (completedTasksCount / totalTasks) * 100
                                      : 0;

                                  // Academic Rank helper
                                  let rankName = "NÓMADA DEL CONOCIMIENTO";
                                  let rankColor =
                                    "text-slate-400 bg-slate-500/10 border-slate-500/20";
                                  if (activeStudent.tokens >= 200) {
                                    rankName = "LEYENDA ACADÉMICA";
                                    rankColor =
                                      "text-amber-400 bg-amber-500/10 border-amber-500/20";
                                  } else if (activeStudent.tokens >= 100) {
                                    rankName = "ALQUIMISTA EXPERTO";
                                    rankColor =
                                      "text-purple-400 bg-purple-500/10 border-purple-500/20";
                                  } else if (activeStudent.tokens >= 50) {
                                    rankName = "EXPLORADOR BRONCE";
                                    rankColor =
                                      "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                                  }

                                  return (
                                    <div className="lg:col-span-8 space-y-6">
                                      {/* PROFILE CARD */}
                                      <div className="bg-slate-900/10 border border-slate-800/60 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden text-left">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                                          <div className="flex items-center gap-4 text-left">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/10 shrink-0">
                                              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                                                {activeStudent.avatar ? (
                                                  <img
                                                    src={activeStudent.avatar}
                                                    alt={activeStudent.name}
                                                    className="w-full h-full object-cover animate-fadeIn"
                                                    referrerPolicy="no-referrer"
                                                  />
                                                ) : (
                                                  <span className="text-white font-black text-lg uppercase">
                                                    {activeStudent.name.charAt(
                                                      0,
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div>
                                              <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-xl font-black text-white italic uppercase tracking-tight leading-none">
                                                  {activeStudent.name}
                                                </h3>
                                                <span
                                                  className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                                    rankColor,
                                                  )}
                                                >
                                                  {rankName}
                                                </span>
                                              </div>
                                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-3">
                                                <span>
                                                  Grado:{" "}
                                                  <b className="text-slate-300 font-sans">
                                                    {activeStudent.grade}
                                                  </b>
                                                </span>
                                                <span>•</span>
                                                <span>
                                                  ID Alumno:{" "}
                                                  <b className="text-slate-300 font-sans">
                                                    {activeStudent.id.substring(
                                                      0,
                                                      8,
                                                    )}
                                                  </b>
                                                </span>
                                              </p>
                                            </div>
                                          </div>

                                          <div className="w-full md:w-auto flex flex-col gap-1 shrink-0">
                                            <div className="w-full md:w-56 space-y-1 bg-slate-950/40 p-3 rounded-2xl border border-slate-900/80 shadow-inner">
                                              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest font-sans">
                                                <span className="text-slate-400 font-sans">
                                                  Progreso de Curso
                                                </span>
                                                <span className="text-indigo-400 font-mono">
                                                  {Math.round(progress)}%
                                                </span>
                                              </div>
                                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                                <div
                                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                                  style={{
                                                    width: `${progress}%`,
                                                  }}
                                                />
                                              </div>
                                              <div className="text-[7.5px] font-semibold text-slate-500 text-right uppercase tracking-[0.05em] font-sans">
                                                {completedTasksCount} de{" "}
                                                {totalTasks} aprobados
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* BENTO QUICK METRICS GRID */}
                                        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/50">
                                          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-colors">
                                            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-sans">
                                              <Flame
                                                size={16}
                                                className="animate-pulse"
                                              />
                                            </div>
                                            <div className="flex flex-col text-left">
                                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider font-sans">
                                                Estudio Activo
                                              </span>
                                              <span className="text-xs sm:text-sm font-black text-white">
                                                {activeStudent.streak} Dientes
                                              </span>
                                            </div>
                                          </div>

                                          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-colors">
                                            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center font-sans">
                                              <Coins size={16} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider font-sans">
                                                Fichas Clave
                                              </span>
                                              <span className="text-xs sm:text-sm font-black text-white">
                                                {activeStudent.tokens} 🪙
                                              </span>
                                            </div>
                                          </div>

                                          <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-colors">
                                            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center font-sans">
                                              <Trophy size={16} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider font-sans">
                                                Colección
                                              </span>
                                              <span className="text-xs sm:text-sm font-black text-white">
                                                {
                                                  (
                                                    activeStudent.collection ||
                                                    []
                                                  ).length
                                                }{" "}
                                                Cartas
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* QUICK MOTIVAL ENCOURAGEMENT BOX */}
                                      <div className="bg-gradient-to-r from-indigo-950/10 to-indigo-900/5 border border-indigo-500/20 p-5 rounded-[2.2rem] space-y-4 text-left">
                                        <div className="flex items-center gap-2">
                                          <Sparkles
                                            size={14}
                                            className="text-indigo-400"
                                          />
                                          <h4 className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.1em] font-sans">
                                            Canal de Reconocimiento y Motivación
                                            Rápida
                                          </h4>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                          Envía un mensaje de motivación
                                          inmediato al alumno. Genera una
                                          notificación en tiempo real y le
                                          otorga de forma pedagógica{" "}
                                          <b className="text-amber-400">
                                            +10 fichas
                                          </b>{" "}
                                          de estímulo.
                                        </p>

                                        {/* PRESET PILLS FOR RECOGNITION */}
                                        <div className="flex flex-wrap gap-2.5">
                                          <button
                                            onClick={() =>
                                              handleSendEncouragement(
                                                activeStudent.id,
                                                "¡Excelente originalidad en el desarrollo de tus respuestas y gran análisis de la información! 🎉",
                                              )
                                            }
                                            className="bg-indigo-950/40 border border-indigo-900 hover:border-indigo-500 text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            <span>
                                              🎨 ¡Felicitar Originalidad!
                                            </span>
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleSendEncouragement(
                                                activeStudent.id,
                                                "¡Muy bien estructurados los argumentos y el razonamiento analítico dentro de la misión! 💡",
                                              )
                                            }
                                            className="bg-indigo-950/40 border border-indigo-900 hover:border-indigo-500 text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            <span>
                                              💡 ¡Felicitar Razonamiento!
                                            </span>
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleSendEncouragement(
                                                activeStudent.id,
                                                "¡Sigue adelante con esa perseverancia y excelente racha de estudio diaria! 🚀",
                                              )
                                            }
                                            className="bg-indigo-950/40 border border-indigo-900 hover:border-indigo-500 text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            <span>
                                              🔥 ¡Felicitar Perseverancia!
                                            </span>
                                          </button>
                                        </div>

                                        {/* CUSTOM TEXT ENCOURAGEMENT */}
                                        <div className="flex gap-2 text-left">
                                          <input
                                            type="text"
                                            value={customMotivationText}
                                            onChange={(e) =>
                                              setCustomMotivationText(
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Escribe un mensaje de felicitación e incentivo personalizado..."
                                            className="w-full bg-slate-900/60 border border-slate-800 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-xs font-semibold text-white transition-all text-left"
                                          />
                                          <button
                                            onClick={() => {
                                              if (
                                                !customMotivationText.trim()
                                              ) {
                                                toast.error(
                                                  "Por favor, escribe un mensaje personalizado.",
                                                );
                                                return;
                                              }
                                              handleSendEncouragement(
                                                activeStudent.id,
                                                customMotivationText,
                                              );
                                              setCustomMotivationText("");
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-transform active:scale-95 cursor-pointer flex items-center gap-1 font-sans border border-indigo-400/20"
                                          >
                                            <span>Enviar</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* SECTION: Pendientes de Revisión */}
                                      <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-2 px-1 border-b border-slate-800 pb-2">
                                          <Clock
                                            size={14}
                                            className="text-amber-500"
                                          />
                                          <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                            Actividades Pendientes de Revisión (
                                            {
                                              (activeStudent.pendingTasks || [])
                                                .length
                                            }
                                            )
                                          </h4>
                                        </div>

                                        {!activeStudent.pendingTasks ||
                                        activeStudent.pendingTasks.length ===
                                          0 ? (
                                          <div className="bg-slate-900/10 border border-slate-800/40 p-10 rounded-3xl flex flex-col items-center justify-center text-center text-slate-500 font-bold text-[11px] gap-2 uppercase tracking-widest w-full">
                                            <CheckCircle2
                                              size={24}
                                              className="text-emerald-500/70"
                                            />
                                            <span className="font-sans">
                                              Sin pendientes por calificar para
                                              este alumno.
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {Array.from(new Set(activeStudent.pendingTasks)).map(
                                              (tId) => {
                                                const details =
                                                  lookupTaskDetails(tId);
                                                if (!details) return null;

                                                return (
                                                  <div
                                                    key={tId}
                                                    className="bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4 relative overflow-hidden"
                                                  >
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-3xl"></div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                                      <div>
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                                            {
                                                              details.subject
                                                                .name
                                                            }
                                                          </span>
                                                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                                            {details.topicName}
                                                          </span>
                                                        </div>
                                                        <h5 className="font-extrabold text-sm text-white uppercase tracking-wide leading-tight">
                                                          {details.task.title}
                                                        </h5>
                                                        <p className="text-[11px] text-slate-400 mt-1 italic">
                                                          {
                                                            details.task
                                                              .description
                                                          }
                                                        </p>
                                                      </div>

                                                      <div className="flex items-center gap-2 self-start bg-slate-900 border border-slate-800 p-1 px-2.5 rounded-xl text-[10px] font-black font-mono text-amber-400">
                                                        <span>
                                                          +
                                                          {
                                                            details.task.reward
                                                              .tokens
                                                          }
                                                        </span>
                                                        <span>🪙</span>
                                                      </div>
                                                    </div>

                                                    <div className="space-y-3 pt-2.5 border-t border-slate-900">
                                                      <div>
                                                        <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                          Evidencia Entregada
                                                        </span>
                                                        <div className="text-[11px] text-slate-300 leading-relaxed font-semibold italic bg-slate-900/60 border border-slate-900 p-3.5 rounded-2xl border-l-[3px] border-l-indigo-500 text-left">
                                                          "Desafío completado
                                                          con éxito. Se
                                                          justificaron las
                                                          respuestas aplicando
                                                          el proceso pedagógico
                                                          sugerido. Listo para
                                                          revisión."
                                                        </div>
                                                      </div>

                                                      <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
                                                        <input
                                                          type="text"
                                                          value={
                                                            groupDirectFeedback
                                                          }
                                                          onChange={(e) =>
                                                            setGroupDirectFeedback(
                                                              e.target.value,
                                                            )
                                                          }
                                                          placeholder="Escribe una retroalimentación opcional (Ej: ¡Excelente respuesta!)..."
                                                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none transition-all placeholder:text-slate-750 text-left text-xs"
                                                        />
                                                        <button
                                                          onClick={() =>
                                                            handleDirectApprove(
                                                              activeStudent.id,
                                                              tId,
                                                            )
                                                          }
                                                          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[9px] tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0 border border-indigo-400/30 cursor-pointer font-sans"
                                                        >
                                                          <CheckCircle2
                                                            size={13}
                                                          />
                                                          Aprobar
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* SECTION: Actividades Realizadas */}
                                      <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-2 px-1 border-b border-slate-800 pb-2">
                                          <CheckCircle2
                                            size={14}
                                            className="text-emerald-400"
                                          />
                                          <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                            Actividades Realizadas (
                                            {
                                              activeStudent.completedTasks
                                                .length
                                            }
                                            )
                                          </h4>
                                        </div>

                                        {activeStudent.completedTasks.length ===
                                        0 ? (
                                          <div className="bg-slate-900/10 border border-slate-800/40 p-10 rounded-3xl flex flex-col items-center justify-center text-center text-slate-500 font-bold text-[11px] gap-2 uppercase tracking-widest w-full">
                                            <span className="font-sans">
                                              Sin registros. El estudiante no ha
                                              completado actividades aún.
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-fadeIn">
                                            {Array.from(new Set(activeStudent.completedTasks)).map(
                                              (tId) => {
                                                const details =
                                                  lookupTaskDetails(tId);
                                                if (!details) return null;

                                                return (
                                                  <div
                                                    key={tId}
                                                    className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex items-start gap-3 hover:border-slate-800 transition-all text-left"
                                                  >
                                                    <CheckCircle2
                                                      size={14}
                                                      className="text-emerald-400 mt-0.5 shrink-0"
                                                    />
                                                    <div className="min-w-0 flex-1 text-left">
                                                      <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-500 block truncate">
                                                        {details.subject.name} •{" "}
                                                        {details.topicName}
                                                      </span>
                                                      <span className="font-extrabold text-xs text-slate-200 uppercase tracking-wide block truncate mt-0.5 font-sans">
                                                        {details.task.title}
                                                      </span>
                                                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-amber-400 font-bold">
                                                        <span>
                                                          +
                                                          {
                                                            details.task.reward
                                                              .tokens
                                                          }
                                                        </span>
                                                        <span>🪙</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* MAIN SUBJECTS & GROUPS DIRECTORY LIST */
                          <div className="space-y-10">
                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 text-left">
                              <div className="min-w-0 max-w-full w-full">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600 pb-2 px-1 shrink-0">
                                  Mis Grupos
                                </h2>
                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1 shrink-0">
                                  Directorio de Alumnos por Materia
                                </p>
                              </div>
                            </div>

                            {(() => {
                              const assigned = stats.assignedSubjects || [];
                              const hasIntegration = assigned.some((sid) =>
                                sid.startsWith("int_cur_"),
                              );

                              let subjectNamesWithIds: {
                                id: string;
                                name: string;
                              }[] = [];

                              if (hasIntegration) {
                                // Handle Integration Curricular
                                const integratedYears = assigned
                                  .filter((sid) => sid.startsWith("int_cur_"))
                                  .map((sid) => sid.split("_")[2]);

                                const allUniqueSubjects = new Map<
                                  string,
                                  string
                                >();
                                integratedYears.forEach((year) => {
                                  const content =
                                    ACADEMIC_CONTENT[year as Year] || [];
                                  content.forEach((s) =>
                                    allUniqueSubjects.set(s.id, s.name),
                                  );
                                });

                                assigned.forEach((sid) => {
                                  // Extract base ID if it's the new format subjectId:groupId
                                  const baseId = sid.includes(":")
                                    ? sid.split(":")[0]
                                    : sid;
                                  for (const y in ACADEMIC_CONTENT) {
                                    const s = (
                                      ACADEMIC_CONTENT[y as Year] || []
                                    ).find((sub) => sub.id === baseId);
                                    if (s)
                                      allUniqueSubjects.set(baseId, s.name);
                                  }
                                });

                                subjectNamesWithIds = Array.from(
                                  allUniqueSubjects.entries(),
                                ).map(([id, name]) => ({ id, name }));
                              } else {
                                const uniqueBaseIds = Array.from(
                                  new Set(
                                    assigned.map((sid) =>
                                      sid.includes(":")
                                        ? sid.split(":")[0]
                                        : sid,
                                    ),
                                  ),
                                );
                                subjectNamesWithIds = uniqueBaseIds
                                  .map((sid) => {
                                    for (const year in ACADEMIC_CONTENT) {
                                      const yearContent =
                                        ACADEMIC_CONTENT[year as Year];
                                      if (yearContent) {
                                        const sub = yearContent.find(
                                          (s) => s.id === sid,
                                        );
                                        if (sub)
                                          return { id: sid, name: sub.name };
                                      }
                                    }
                                    return null;
                                  })
                                  .filter(
                                    (x): x is { id: string; name: string } =>
                                      x !== null,
                                  );
                              }

                              return subjectNamesWithIds.map((subjectInfo) => {
                                if (!subjectInfo) return null;
                                const { id: sid, name: subjectName } =
                                  subjectInfo;

                                let subjectYear = "1";
                                for (const y in ACADEMIC_CONTENT) {
                                  const yearContent =
                                    ACADEMIC_CONTENT[y as Year];
                                  if (
                                    yearContent &&
                                    yearContent.some((sub) => sub.id === sid)
                                  ) {
                                    subjectYear = y;
                                    break;
                                  }
                                }

                                // New granular logic:
                                // If there's any mapping for this subject in the format 'subjectId:groupId', use those.
                                // Otherwise, fall back to matching by year.
                                const specificMappings = (
                                  stats.assignedSubjects || []
                                )
                                  .filter((s) => s.startsWith(`${sid}:`))
                                  .map((s) => s.split(":")[1]);

                                const groupsForSubject =
                                  specificMappings.length > 0
                                    ? specificMappings
                                    : (stats.assignedGroups || []).filter((g) =>
                                        g.startsWith(subjectYear),
                                      );

                                if (groupsForSubject.length === 0) return null;

                                return (
                                  <div
                                    key={sid}
                                    className="space-y-4 bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-slate-800/60 shadow-inner"
                                  >
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-100 flex items-center gap-3 border-b border-slate-800/80 pb-3">
                                      <BookOpenCheck
                                        size={18}
                                        className="text-indigo-400"
                                      />
                                      {subjectName}{" "}
                                      <span className="text-slate-500 font-medium text-xs font-sans not-italic">
                                        ({subjectYear}º Año)
                                      </span>
                                    </h3>
                                    <div className="flex flex-wrap gap-3 pt-1">
                                      {groupsForSubject.map((group) => {
                                        const isSelected =
                                          selectedTeacherGroup === group;
                                        const studentCount =
                                          globalStudents.filter(
                                            (s) => s.grade === group,
                                          ).length;
                                        return (
                                          <button
                                            key={group}
                                            onClick={() =>
                                              setSelectedTeacherGroup(group)
                                            }
                                            className={cn(
                                              "relative group/btn overflow-hidden px-6 py-4 rounded-2xl flex items-center gap-4 transition-all border text-left min-w-[120px] justify-between cursor-pointer",
                                              isSelected
                                                ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/80 shadow-lg shadow-indigo-500/10"
                                                : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900",
                                            )}
                                          >
                                            <div className="flex flex-col text-left">
                                              <span
                                                className={cn(
                                                  "font-black tracking-tight text-2xl",
                                                  isSelected
                                                    ? "text-cyan-400"
                                                    : "text-slate-100",
                                                )}
                                              >
                                                {group}
                                              </span>
                                              <span
                                                className={cn(
                                                  "text-[8px] font-black uppercase tracking-wider mt-0.5",
                                                  isSelected
                                                    ? "text-indigo-400"
                                                    : "text-slate-500",
                                                )}
                                              >
                                                Alumnos
                                              </span>
                                            </div>

                                            <div
                                              className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                                                isSelected
                                                  ? "bg-indigo-500 text-white"
                                                  : "bg-slate-900 text-slate-400 group-hover/btn:bg-slate-800 group-hover/btn:text-slate-200",
                                              )}
                                            >
                                              {studentCount}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <StickerAlbum
                        collection={stats.collection}
                        animatingCards={animatingCards}
                        onAnimationsComplete={() => setAnimatingCards([])}
                        cards={allAvailableCards}
                        packs={INITIAL_PACKS}
                        role={stats.role}
                        onRedeemReward={(card) => {
                          toast.success(
                            `¡Carta canjeada! Muestra esto a tu profesor: ${card.name}`,
                          );
                        }}
                      />
                    )}
                  </motion.div>
                )}

                {activeTab === "shop" && (
                  <motion.div
                    key="shop"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col min-h-[calc(100dvh-12rem)] md:min-h-[calc(100dvh-14rem)] pb-6 justify-center space-y-2 md:space-y-6 text-center"
                  >
                    <div className="space-y-0.5 px-4 mb-2 md:mb-6 shrink-0 pt-4 md:pt-0">
                      <h2 className="text-xl md:text-2xl font-black tracking-tighter italic uppercase text-indigo-400">
                        {stats.role === "Admin"
                          ? "Configuración de Sobres"
                          : "Compra un sobrecito"}
                      </h2>
                      <p className="text-slate-500 font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                        {stats.role === "Admin"
                          ? "Control Maestro de Probabilidades y Packs"
                          : "Intercambia tus medallas por Cartas"}
                      </p>
                    </div>

                    {stats.role === "Admin" ? (
                      <div className="flex-1 overflow-y-auto transform-gpu w-full no-scrollbar px-2 sm:px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch pt-2">
                          {packs.map((pack) => (
                            <div
                              key={pack.id}
                              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-md flex flex-col justify-between group hover:border-indigo-500/30 transition-all hover:-translate-y-2"
                            >
                              <div className="space-y-6">
                                <div
                                  className={cn(
                                    "w-32 h-48 mx-auto flex flex-col items-center justify-center shadow-lg relative overflow-hidden bg-slate-800 rounded-xl",
                                    pack.id === "pack_jacobo"
                                      ? "bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border border-slate-500/50"
                                      : pack.id === "pack_culiacan"
                                        ? "bg-gradient-to-b from-indigo-400 via-indigo-600 to-indigo-900 border border-indigo-400/50"
                                        : "bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 border border-amber-400/50",
                                  )}
                                >
                                  <div
                                    className="absolute top-0 left-0 w-full h-3 bg-black/20 border-b border-white/10 z-20"
                                    style={{
                                      backgroundImage:
                                        "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                                    }}
                                  ></div>
                                  <div
                                    className="absolute bottom-0 left-0 w-full h-3 bg-black/20 border-t border-white/10 z-20"
                                    style={{
                                      backgroundImage:
                                        "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                                    }}
                                  ></div>

                                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-60 z-10 pointer-events-none"></div>

                                  <img
                                    src={
                                      pack.id === "pack_jacobo"
                                        ? "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop"
                                        : pack.id === "pack_culiacan"
                                          ? "https://upload.wikimedia.org/wikipedia/commons/4/4e/Vista_panor%C3%A1mica_de_Culiac%C3%A1n.jpg"
                                          : "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop"
                                    }
                                    alt={pack.name}
                                    className="absolute inset-1.5 top-5 bottom-5 w-[calc(100%-12px)] h-[calc(100%-40px)] object-cover rounded opacity-90 border border-white/20 shadow-inner"
                                  />
                                  <div className="absolute inset-1.5 top-5 bottom-5 bg-gradient-to-t from-black/80 via-black/10 to-transparent rounded pointer-events-none" />

                                  {pack.active && (
                                    <div className="absolute top-4 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg z-30 ring-2 ring-white/20"></div>
                                  )}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-20 px-1  mt-2">
                                    <span
                                      className={cn(
                                        "text-2xl font-black italic uppercase tracking-tighter leading-none block",
                                        pack.id === "pack_jacobo"
                                          ? "text-slate-100 "
                                          : pack.id === "pack_culiacan"
                                            ? "text-indigo-100 "
                                            : "text-amber-100 ",
                                      )}
                                    >
                                      {pack.name.replace(
                                        /^Sobrecitos (de )?/i,
                                        "",
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2 mt-4 text-center border-t border-slate-800 pt-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Estado:{" "}
                                    {pack.active
                                      ? "Activo en Tienda"
                                      : "Inactivo"}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-10 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                                  <span>Costo</span>
                                  <span className="text-amber-400">
                                    {pack.price} Medallas
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                                  <span>Probabilidades</span>
                                  <span className="text-indigo-400">
                                    L:{pack.rarities.legendary}% / E:
                                    {pack.rarities.epic}%
                                  </span>
                                </div>
                                <button
                                  onClick={() => setEditingPack(pack)}
                                  className="w-full mt-4 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
                                >
                                  <Settings size={14} /> Editar Pack
                                </button>
                              </div>
                            </div>
                          ))}
                          <button className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-500 transition-all group">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                              <Plus size={32} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
                              Crear Nuevo Pack
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 flex flex-col justify-center">
                        <div
                          ref={packsScrollRef}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUpOrLeave}
                          onPointerLeave={handlePointerUpOrLeave}
                          className={cn(
                            "flex overflow-x-auto transform-gpu lg:overflow-x-visible gap-4 sm:gap-6 lg:gap-12 px-[15vw] sm:px-[25vw] lg:px-4 py-8 md:py-12 no-scrollbar items-center justify-start lg:justify-center min-w-full cursor-grab lg:cursor-auto active:cursor-grabbing select-none h-auto items-stretch sm:items-center",
                            isDraggingPack
                              ? ""
                              : "snap-x snap-mandatory lg:snap-none",
                          )}
                        >
                          {packs
                            .filter((p) => p.active)
                            .map((pack, idx) => (
                              <motion.div
                                key={pack.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                  "flex-none w-[75vw] sm:w-[45vw] md:w-[300px] max-h-[100%] sm:max-h-full snap-center bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-lg relative overflow-hidden flex flex-col items-center justify-between gap-3 sm:gap-4 md:gap-6 group transition-all duration-500",
                                  "hover:scale-[1.02] hover:border-indigo-500 hover:shadow-indigo-500/20 z-10",
                                )}
                              >
                                {idx === 1 && (
                                  <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#4f46e5,transparent_70%)]"></div>
                                )}

                                <div className="relative flex-1 min-h-0 flex flex-col justify-center w-full">
                                  <div
                                    className={cn(
                                      "w-full h-full min-h-[150px] aspect-[4/5] sm:w-48 sm:h-[260px] sm:aspect-auto rounded-xl mx-auto shadow-lg flex flex-col items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden bg-slate-800",
                                      pack.id === "pack_jacobo"
                                        ? "bg-gradient-to-b from-slate-400 via-slate-600 to-slate-900 border border-slate-400/50"
                                        : pack.id === "pack_culiacan"
                                          ? "bg-gradient-to-b from-indigo-400 via-indigo-600 to-indigo-900 border border-indigo-400/50"
                                          : "bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 border border-amber-400/50",
                                    )}
                                  >
                                    <div
                                      className="absolute top-0 left-0 w-full h-4 sm:h-6 bg-black/20 border-b border-white/20 z-20"
                                      style={{
                                        backgroundImage:
                                          "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)",
                                      }}
                                    ></div>
                                    <div
                                      className="absolute bottom-0 left-0 w-full h-4 sm:h-6 bg-black/20 border-t border-white/20 z-20"
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
                                      className="absolute inset-[8px] sm:inset-2.5 top-[32px] bottom-[32px] sm:top-10 sm:bottom-10 w-[calc(100%-16px)] sm:w-[calc(100%-20px)] h-[calc(100%-64px)] sm:h-[calc(100%-80px)] object-cover rounded-md opacity-90 border border-white/20 shadow-lg pointer-events-none"
                                    />

                                    <div className="absolute inset-[8px] sm:inset-2.5 top-[32px] bottom-[32px] sm:top-10 sm:bottom-10 bg-gradient-to-t from-black/90 via-black/20 to-black/30 rounded-md pointer-events-none" />

                                    <div className="absolute top-10 sm:top-14 left-1/2 -translate-x-1/2 w-full text-center z-20 px-2  pointer-events-none">
                                      <span
                                        className={cn(
                                          "text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none block",
                                          pack.id === "pack_jacobo"
                                            ? "text-slate-100 "
                                            : pack.id === "pack_culiacan"
                                              ? "text-indigo-100 "
                                              : "text-amber-100 ",
                                        )}
                                      >
                                        {pack.name.replace(
                                          /^Sobrecitos (de )?/i,
                                          "",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex w-full gap-2 relative z-20">
                                  <button
                                    onClick={() => buyPack(pack)}
                                    className={cn(
                                      "flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                                      "bg-slate-800 text-white hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500",
                                    )}
                                  >
                                    {pack.price}{" "}
                                    <Coins
                                      size={20}
                                      className="text-amber-400"
                                    />
                                  </button>
                                  <button
                                    onClick={() => setExchangePackId(pack.id)}
                                    className={cn(
                                      "px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center",
                                      "bg-slate-800 text-white hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500",
                                      !stats.packCurrencies?.[pack.id] &&
                                        "opacity-50",
                                    )}
                                  >
                                    <Repeat size={20} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-6 z-40 flex justify-center">
              <div className="w-full max-w-lg flex justify-between items-center h-full">
                <button
                  onClick={() => setActiveTab("home")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                    activeTab === "home"
                      ? "text-indigo-400 bg-indigo-500/10 shadow-lg"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <LayoutDashboard
                    size={20}
                    className={activeTab === "home" ? "animate-pulse" : ""}
                  />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                    {stats.role === "Admin" ? "Asignación" : "Inicio"}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("challenges")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                    activeTab === "challenges"
                      ? "text-indigo-400 bg-indigo-500/10 shadow-lg"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <Target
                    size={20}
                    className={
                      activeTab === "challenges" ? "animate-pulse" : ""
                    }
                  />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                    Desafíos
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("collection")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                    activeTab === "collection"
                      ? "text-indigo-400 bg-indigo-500/10 shadow-lg"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {stats.role === "Teacher" ? (
                    <Users
                      size={20}
                      className={
                        activeTab === "collection" ? "animate-pulse" : ""
                      }
                    />
                  ) : (
                    <Library
                      size={20}
                      className={
                        activeTab === "collection" ? "animate-pulse" : ""
                      }
                    />
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                    {stats.role === "Admin"
                      ? "Catálogo"
                      : stats.role === "Teacher"
                        ? "Grupos"
                        : "Álbum"}
                  </span>
                </button>

                {(stats.role === "Student" || stats.role === "Admin") && (
                  <button
                    onClick={() => setActiveTab("shop")}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                      activeTab === "shop"
                        ? "text-indigo-400 bg-indigo-500/10 shadow-lg"
                        : "text-slate-500 hover:text-slate-300",
                    )}
                  >
                    <ShoppingBag
                      size={20}
                      className={activeTab === "shop" ? "animate-pulse" : ""}
                    />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                      Tienda
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                    activeTab === "profile"
                      ? "text-indigo-400 bg-indigo-500/10 shadow-lg"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <UserIcon
                    size={20}
                    className={activeTab === "profile" ? "animate-pulse" : ""}
                  />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                    Perfil
                  </span>
                </button>
              </div>
            </footer>

            {/* Overlays */}
            <AnimatePresence>
              {selectedAdminCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedAdminCard(null)}
                    className="absolute inset-0 bg-slate-950/90 "
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn(
                      "relative w-full max-w-4xl bg-slate-900 rounded-[3rem] border shadow-lg overflow-y-auto transform-gpu no-scrollbar flex flex-col md:flex-row max-h-[85vh]",
                      selectedAdminCard.rarity === "Legendary"
                        ? "border-amber-500/50 shadow-amber-500/20"
                        : selectedAdminCard.rarity === "Epic"
                          ? "border-purple-500/50 shadow-purple-500/20"
                          : selectedAdminCard.rarity === "Rare"
                            ? "border-indigo-500/50 shadow-indigo-500/20"
                            : "border-slate-800 shadow-black/50",
                    )}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedAdminCard(null)}
                      className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center z-20 transition-all active:scale-95 "
                    >
                      <X size={24} />
                    </button>

                    {/* Left Side: Large Card Image */}
                    <div className="w-full md:w-1/2 aspect-square md:aspect-[3/4] relative overflow-hidden">
                      <img
                        src={selectedAdminCard.imageUrl}
                        alt={selectedAdminCard.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60",
                          selectedAdminCard.rarity === "Legendary" &&
                            "shadow-lg",
                        )}
                      />

                      <div className="absolute bottom-8 left-8">
                        <span
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md",
                            selectedAdminCard.rarity === "Legendary"
                              ? "bg-amber-500 text-slate-950"
                              : selectedAdminCard.rarity === "Epic"
                                ? "bg-purple-500 text-white"
                                : selectedAdminCard.rarity === "Rare"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-slate-700 text-slate-200",
                          )}
                        >
                          {selectedAdminCard.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Right Side: Details */}
                    <div className="flex-1 p-8 md:p-12 space-y-6 flex flex-col justify-center overflow-y-auto transform-gpu">
                      <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                          {selectedAdminCard.name}
                        </h2>
                        <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs">
                          {selectedAdminCard.category || "Misión Académica"}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2 text-center md:text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Descripción
                          </p>
                          <p className="text-slate-300 font-medium leading-relaxed italic text-sm">
                            "
                            {selectedAdminCard.description ||
                              "Sin descripción disponible."}
                            "
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                              Requisito
                            </p>
                            <p className="text-xs font-black text-white uppercase tracking-tighter">
                              {selectedAdminCard.requirement || "N/A"}
                            </p>
                          </div>
                          {selectedAdminCard.subject && (
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                Materia
                              </p>
                              <p className="text-xs font-black text-white uppercase tracking-tighter">
                                {selectedAdminCard.subject}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-800 flex gap-4">
                        <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95">
                          Modificar Carta
                        </button>
                        <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-2xl transition-all active:scale-95">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {showPackOpener && activePack && (
                <PackOpening
                  pack={activePack}
                  availableCards={allAvailableCards.filter(
                    (c) => c.category === "Collectible",
                  )}
                  onCardsDrawn={handleCardsDrawn}
                  onClose={() => {
                    setShowPackOpener(false);
                    setActivePack(null);
                    setActiveTab("collection");
                  }}
                  ownedCardIds={[
                    ...stats.collection,
                    ...(stats.unstickedCards || []),
                  ]}
                />
              )}

              {exchangePackId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90  overflow-y-auto transform-gpu">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full relative my-auto shadow-lg"
                  >
                    <button
                      onClick={() => setExchangePackId(null)}
                      className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-rose-500 p-2 rounded-full"
                    >
                      <X size={20} />
                    </button>

                    <div className="text-center mb-8 pr-8 sm:pr-0">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Intercambio de Duplicadas
                      </h3>
                      <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">
                        Usa las monedas de sobres repetidos para comprar cartas
                        específicas
                      </p>
                    </div>

                    <div className="flex justify-center mb-8">
                      <div className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-6 py-3">
                        <Coins
                          className={
                            exchangePackId === "pack_culiacan"
                              ? "text-rose-500"
                              : exchangePackId === "pack_six_seven"
                                ? "text-emerald-500"
                                : "text-slate-400"
                          }
                          size={20}
                        />
                        <span className="font-black text-lg text-white">
                          {stats.packCurrencies?.[exchangePackId] || 0}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto transform-gpu pr-2 custom-scrollbar">
                      {allAvailableCards
                        .filter(
                          (c) =>
                            c.category === "Collectible" &&
                            (c.sourcePackId || "pack_jacobo") ===
                              exchangePackId,
                        )
                        .map((card) => {
                          const isOwned = stats.collection.includes(card.id);
                          if (isOwned) return null; // Don't show owned cards

                          const cost =
                            card.rarity === "Legendary" ||
                            card.rarity === "Secret"
                              ? 1000
                              : card.rarity === "Epic"
                                ? 250
                                : card.rarity === "Rare"
                                  ? 75
                                  : 25;
                          const userCoins =
                            stats.packCurrencies?.[exchangePackId] || 0;
                          const canAfford = userCoins >= cost;
                          const CurrencyIconClass =
                            exchangePackId === "pack_culiacan"
                              ? "text-rose-500"
                              : exchangePackId === "pack_six_seven"
                                ? "text-emerald-500"
                                : "text-slate-400";

                          return (
                            <div
                              key={"store" + card.id}
                              className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 group"
                            >
                              <div className="w-full flex justify-center transform group-hover:scale-105 transition-transform duration-300 min-h-[140px] sm:min-h-[180px]">
                                <CardComponent
                                  card={card}
                                  isLocked={!canAfford}
                                  className="w-24 sm:w-32"
                                />
                              </div>
                              <div className="text-center w-full flex flex-col justify-end flex-1 mt-auto">
                                <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-slate-300 truncate w-full mb-3">
                                  {card.name}
                                </h4>
                                <button
                                  onClick={() => {
                                    if (canAfford) {
                                      setStats((prev) => ({
                                        ...prev,
                                        collection: [
                                          ...prev.collection,
                                          card.id,
                                        ],
                                        packCurrencies: {
                                          ...prev.packCurrencies,
                                          pack_jacobo:
                                            prev.packCurrencies?.pack_jacobo ||
                                            0,
                                          pack_culiacan:
                                            prev.packCurrencies
                                              ?.pack_culiacan || 0,
                                          pack_six_seven:
                                            prev.packCurrencies
                                              ?.pack_six_seven || 0,
                                          [exchangePackId]:
                                            (prev.packCurrencies?.[
                                              exchangePackId
                                            ] || 0) - cost,
                                        },
                                      }));
                                    }
                                  }}
                                  disabled={!canAfford}
                                  className={cn(
                                    "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-lg",
                                    canAfford
                                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                                      : "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed",
                                  )}
                                >
                                  {cost}{" "}
                                  <Coins
                                    size={14}
                                    className={CurrencyIconClass}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {allAvailableCards.filter(
                        (c) =>
                          c.category === "Collectible" &&
                          (c.sourcePackId || "pack_jacobo") ===
                            exchangePackId &&
                          !stats.collection.includes(c.id),
                      ).length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 font-bold tracking-widest uppercase text-xs">
                          Ya tienes todas las cartas de este sobre.
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {showChallengeModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowChallengeModal(false)}
                    className="absolute inset-0 bg-slate-950/90 "
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-indigo-500/20 shadow-lg flex flex-col"
                  >
                    <div className="flex justify-end p-4 absolute top-0 right-0 z-[130] pointer-events-none">
                      <button
                        onClick={() => setShowChallengeModal(false)}
                        className="w-10 h-10 bg-slate-800/80 text-slate-400 hover:text-white rounded-full flex items-center justify-center pointer-events-auto transition-all active:scale-95  border border-white/5"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto transform-gpu no-scrollbar pt-2 sm:pt-0">
                      <DailyChallenge
                        challenge={currentChallenge}
                        isCompleted={sessionCompletedChallenges.has(
                          currentChallenge.id,
                        )}
                        userRole={stats.role}
                        onComplete={(correct) => {
                          handleChallengeComplete(correct);
                          if (correct) {
                            setTimeout(
                              () => setShowChallengeModal(false),
                              2000,
                            );
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              )}

              {editingPack && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingPack(null)}
                    className="absolute inset-0 bg-slate-950/90 "
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] shadow-lg p-6 sm:p-8 md:p-12 overflow-y-auto transform-gpu no-scrollbar max-h-[90vh] mx-auto"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        Setup_Pack
                      </h2>
                      <button
                        onClick={() => setEditingPack(null)}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                      >
                        <X size={24} className="text-slate-500" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                          Nombre del Sobrecito
                        </label>
                        <input
                          type="text"
                          value={editingPack.name}
                          onChange={(e) =>
                            setEditingPack({
                              ...editingPack,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                            Costo (Medallas)
                          </label>
                          <input
                            type="number"
                            value={editingPack.price}
                            onChange={(e) =>
                              setEditingPack({
                                ...editingPack,
                                price: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                            Cartas Incluidas
                          </label>
                          <input
                            type="number"
                            value={editingPack.cardsCount}
                            onChange={(e) =>
                              setEditingPack({
                                ...editingPack,
                                cardsCount: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-slate-950 rounded-[2rem] border border-slate-800 space-y-5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                          <Sparkles size={14} /> Probabilidades de Rareza (%)
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(editingPack.rarities).map(
                            ([rarity, value]) => (
                              <div key={rarity} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span
                                    className={cn(
                                      "text-[9px] font-black uppercase tracking-widest",
                                      rarity === "legendary"
                                        ? "text-amber-400"
                                        : rarity === "epic"
                                          ? "text-purple-400"
                                          : rarity === "rare"
                                            ? "text-indigo-400"
                                            : rarity === "secret"
                                              ? "text-rose-400"
                                              : "text-slate-500",
                                    )}
                                  >
                                    {rarity}
                                  </span>
                                  <span className="text-[9px] font-black text-white">
                                    {value}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={value}
                                  onChange={(e) => {
                                    const newVal = parseInt(e.target.value);
                                    setEditingPack({
                                      ...editingPack,
                                      rarities: {
                                        ...editingPack.rarities,
                                        [rarity]: newVal,
                                      },
                                    });
                                  }}
                                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                              </div>
                            ),
                          )}
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Integridad de Probabilidades
                          </span>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-md text-[10px] font-black",
                              Object.values(editingPack.rarities).reduce(
                                (a, b) => a + b,
                                0,
                              ) === 100
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400",
                            )}
                          >
                            {Object.values(editingPack.rarities).reduce(
                              (a, b) => a + b,
                              0,
                            )}
                            % / 100%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={() => {
                            const total = Object.values(
                              editingPack.rarities,
                            ).reduce((a, b) => a + b, 0);
                            if (total !== 100) {
                              toast.error(
                                "ERROR: La suma de las probabilidades debe ser exactamente 100%",
                              );
                              return;
                            }
                            setPacks((prev) =>
                              prev.map((p) =>
                                p.id === editingPack.id ? editingPack : p,
                              ),
                            );
                            setEditingPack(null);
                          }}
                          className="flex-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-md active:scale-95"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={() => setEditingPack(null)}
                          className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-slate-700"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {showPasswordModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                            <Key size={20} />
                          </div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                            Contraseña
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowPasswordModal(false);
                            setPasswordForm({
                              current: "",
                              new: "",
                              confirm: "",
                            });
                          }}
                          className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Nueva Contraseña
                          </label>
                          <input
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                new: e.target.value,
                              }))
                            }
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Confirmar Contraseña
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirm: e.target.value,
                              }))
                            }
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        disabled={
                          isChangingPassword ||
                          !passwordForm.new ||
                          !passwordForm.confirm
                        }
                        onClick={async () => {
                          if (passwordForm.new !== passwordForm.confirm) {
                            toast.error("Las contraseñas no coinciden");
                            return;
                          }
                          if (passwordForm.new.length < 6) {
                            toast.error(
                              "La contraseña debe tener al menos 6 caracteres",
                            );
                            return;
                          }

                          setIsChangingPassword(true);
                          try {
                            const { error } =
                              await supabaseService.updatePassword(
                                passwordForm.new,
                              );
                            if (error) throw error;

                            toast.success(
                              "¡Contraseña actualizada exitosamente!",
                            );
                            setShowPasswordModal(false);
                            setPasswordForm({
                              current: "",
                              new: "",
                              confirm: "",
                            });
                          } catch (err: any) {
                            toast.error(
                              `Error: ${err.message || "No se pudo actualizar"}`,
                            );
                          } finally {
                            setIsChangingPassword(false);
                          }
                        }}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                          isChangingPassword ||
                            !passwordForm.new ||
                            !passwordForm.confirm
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20",
                        )}
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          "Actualizar Contraseña"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                stats={stats}
                setStats={(updatedStats) => {
                  setStats(updatedStats);
                  loadUsers();
                }}
              />

              {assignmentModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 ">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] overflow-y-auto transform-gpu max-h-[90vh] no-scrollbar shadow-lg"
                  >
                    <div className="p-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            Asignación
                          </h3>
                          <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                            Configurando Docente:{" "}
                            {
                              teachers.find(
                                (t) => t.id === assignmentModal.teacherId,
                              )?.name
                            }
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAssignmentModal({
                              teacherId: null,
                              isOpen: false,
                              selectedGroups: [],
                              selectedSubjects: [],
                              activeYear: "1",
                            })
                          }
                          className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center px-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Asignar Materias y Grupos
                              </label>
                              <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">
                                Paso 1: Elige Año. Paso 2: Elige Materia. Paso
                                3: Elige Grupo.
                              </p>
                            </div>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                              {(["1", "2", "3"] as Year[]).map((year) => (
                                <button
                                  key={year}
                                  onClick={() =>
                                    setAssignmentModal((prev) => ({
                                      ...prev,
                                      activeYear: year,
                                    }))
                                  }
                                  className={cn(
                                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    assignmentModal.activeYear === year
                                      ? "bg-slate-800 text-white shadow-md"
                                      : "text-slate-500 hover:text-slate-400",
                                  )}
                                >
                                  {year}º
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 transform-gpu scrollbar-thin scrollbar-thumb-slate-800">
                            {(
                              ACADEMIC_CONTENT[assignmentModal.activeYear] || []
                            ).map((subject) => {
                              const isSubjectSelected =
                                assignmentModal.selectedSubjects.some(
                                  (s) =>
                                    s === subject.id ||
                                    s.startsWith(`${subject.id}:`),
                                );
                              return (
                                <div
                                  key={subject.id}
                                  className={cn(
                                    "rounded-2xl border transition-all overflow-hidden",
                                    isSubjectSelected
                                      ? "bg-slate-800/40 border-indigo-500/30"
                                      : "bg-slate-800/10 border-slate-800",
                                  )}
                                >
                                  <button
                                    onClick={() => {
                                      setAssignmentModal((prev) => {
                                        const alreadySelected =
                                          prev.selectedSubjects.some(
                                            (s) =>
                                              s === subject.id ||
                                              s.startsWith(`${subject.id}:`),
                                          );
                                        if (alreadySelected) {
                                          return {
                                            ...prev,
                                            selectedSubjects:
                                              prev.selectedSubjects.filter(
                                                (s) =>
                                                  s !== subject.id &&
                                                  !s.startsWith(
                                                    `${subject.id}:`,
                                                  ),
                                              ),
                                          };
                                        } else {
                                          return {
                                            ...prev,
                                            selectedSubjects: [
                                              ...prev.selectedSubjects,
                                              subject.id,
                                            ],
                                          };
                                        }
                                      });
                                    }}
                                    className="w-full p-4 flex items-center justify-between group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                          isSubjectSelected
                                            ? "bg-indigo-500 text-white"
                                            : "bg-slate-800 text-slate-500 group-hover:bg-slate-700",
                                        )}
                                      >
                                        <BookOpen size={16} />
                                      </div>
                                      <span
                                        className={cn(
                                          "text-xs font-black uppercase tracking-widest",
                                          isSubjectSelected
                                            ? "text-white"
                                            : "text-slate-400",
                                        )}
                                      >
                                        {subject.name}
                                      </span>
                                    </div>
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                        isSubjectSelected
                                          ? "bg-indigo-500 border-indigo-500"
                                          : "border-slate-700",
                                      )}
                                    >
                                      {isSubjectSelected && (
                                        <Check
                                          size={12}
                                          className="text-white"
                                        />
                                      )}
                                    </div>
                                  </button>

                                  {isSubjectSelected && (
                                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-800/50">
                                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Elegir Grupos:
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {SCHOOL_GROUPS.filter((g) =>
                                          g.startsWith(
                                            assignmentModal.activeYear,
                                          ),
                                        ).map((g) => {
                                          const isMapped =
                                            assignmentModal.selectedSubjects.includes(
                                              `${subject.id}:${g}`,
                                            );
                                          // Also consider it selected if subject.id is there (legacy format means "all groups of this year")
                                          // but we want to encourage specific mapping now
                                          const isActive =
                                            isMapped ||
                                            (assignmentModal.selectedSubjects.includes(
                                              subject.id,
                                            ) &&
                                              g.startsWith(
                                                assignmentModal.activeYear,
                                              ));

                                          return (
                                            <button
                                              key={g}
                                              onClick={() => {
                                                setAssignmentModal((prev) => {
                                                  const newSubs = [
                                                    ...prev.selectedSubjects,
                                                  ];
                                                  const mapping = `${subject.id}:${g}`;

                                                  // If base subject is there, it implies all groups.
                                                  // Let's replace base subject with specific mappings to be more granular as requested.
                                                  let filtered = newSubs.filter(
                                                    (s) => s !== subject.id,
                                                  );

                                                  if (
                                                    filtered.includes(mapping)
                                                  ) {
                                                    filtered = filtered.filter(
                                                      (s) => s !== mapping,
                                                    );
                                                  } else {
                                                    filtered.push(mapping);
                                                  }

                                                  return {
                                                    ...prev,
                                                    selectedSubjects: filtered,
                                                  };
                                                });
                                              }}
                                              className={cn(
                                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                isActive
                                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10"
                                                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700",
                                              )}
                                            >
                                              {g}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (assignmentModal.selectedSubjects.length === 0) {
                            toast.error(
                              "Por favor selecciona al menos una materia y su grupo.",
                            );
                            return;
                          }
                          if (assignmentModal.teacherId) {
                            const newSubjects =
                              assignmentModal.selectedSubjects;
                            const derivedGroupsFromSubjects = newSubjects
                              .filter((s) => s.includes(":"))
                              .map((s) => s.split(":")[1] as Grade);

                            // Groups are now strictly derived from subject mappings to prevent "broadcasting"
                            const newGroups = Array.from(
                              new Set(derivedGroupsFromSubjects),
                            );

                            const updatePromise =
                              supabaseService.updateUserStats(
                                assignmentModal.teacherId,
                                {
                                  assignedGroups: newGroups,
                                  assignedSubjects: newSubjects,
                                },
                              );

                            toast.promise(updatePromise, {
                              loading: "Guardando cambios...",
                              success: () => {
                                loadUsers();

                                // If current user is the one being updated, update local stats too
                                if (
                                  assignmentModal.teacherId === currentUserId ||
                                  assignmentModal.teacherId === stats.id
                                ) {
                                  setStats((prev) => ({
                                    ...prev,
                                    assignedGroups: newGroups,
                                    assignedSubjects: newSubjects,
                                  }));
                                }

                                setAssignmentModal({
                                  teacherId: null,
                                  isOpen: false,
                                  selectedGroups: [],
                                  selectedSubjects: [],
                                  activeYear: "1",
                                });
                                return `Asignación actualizada exitosamente.`;
                              },
                              error: "Error al actualizar la asignación.",
                            });
                          }
                        }}
                        className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all shadow-cyan-600/20"
                      >
                        Confirmar Asignación
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {showCreateChallengeModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden my-8"
                  >
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <Sparkles size={20} className="animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                              Crear Desafío
                            </h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">
                              Academia de Desafíos
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCreateChallengeModal(false)}
                          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* TABS SELECTION */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/85">
                        <button
                          type="button"
                          onClick={() => setCreateChallengeType("AI")}
                          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            createChallengeType === "AI"
                              ? "bg-slate-800 text-cyan-400 border border-slate-700/60 shadow-lg"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <Sparkles size={14} /> Generar con IA
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreateChallengeType("Manual")}
                          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            createChallengeType === "Manual"
                              ? "bg-slate-800 text-indigo-400 border border-slate-700/60 shadow-lg"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <PenTool size={14} /> Creación Manual
                        </button>
                      </div>

                      {/* AI FORM PANEL */}
                      {createChallengeType === "AI" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Materia
                            </label>
                            <select
                              value={aiChallengeForm.subjectId}
                              onChange={(e) =>
                                setAiChallengeForm((prev) => ({
                                  ...prev,
                                  subjectId: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all cursor-pointer"
                            >
                              <option
                                value=""
                                disabled
                                className="text-slate-500 bg-slate-950"
                              >
                                Selecciona una materia...
                              </option>
                              {["1", "2", "3"].map((grade) => {
                                const list = getSubjectListHelper().filter(
                                  (s) => s.grade === grade,
                                );
                                const labelText =
                                  grade === "1"
                                    ? "🟢 1º GRADO (PRIMARIA/SECUNDARIA)"
                                    : grade === "2"
                                      ? "🔵 2º GRADO (PLAN SEP)"
                                      : "🟣 3º GRADO (CIERRE)";
                                const colorClass =
                                  grade === "1"
                                    ? "text-emerald-400"
                                    : grade === "2"
                                      ? "text-cyan-400"
                                      : "text-purple-400";
                                return (
                                  <optgroup
                                    key={grade}
                                    label={labelText}
                                    className={`${colorClass} bg-slate-950 font-black uppercase tracking-wider text-xs p-2`}
                                  >
                                    {list.map((s) => (
                                      <option
                                        key={s.id}
                                        value={s.id}
                                        className="text-slate-200 bg-slate-950 font-medium normal-case py-2 pl-4 text-sm"
                                      >
                                        &nbsp;&nbsp;&nbsp;{s.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Tema Principal o Contenido Académico *
                            </label>
                            <input
                              type="text"
                              required
                              value={aiChallengeForm.topicName}
                              onChange={(e) =>
                                setAiChallengeForm((prev) => ({
                                  ...prev,
                                  topicName: e.target.value,
                                }))
                              }
                              placeholder="Ej. Ecuaciones lineales de primer grado, Ley de conservación de energía"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                            />
                            <p className="text-[9px] text-slate-500 ml-1 leading-normal italic">
                              Consistente con los programas oficiales de la SEP.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Sugerencias o Ideas Especiales (Opcional)
                            </label>
                            <textarea
                              value={aiChallengeForm.idea}
                              onChange={(e) =>
                                setAiChallengeForm((prev) => ({
                                  ...prev,
                                  idea: e.target.value,
                                }))
                              }
                              placeholder="Ej. Quiero que sea un desafío de tipo práctico, o que incluya un acertijo matemático ambientado en el espacio..."
                              rows={3}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 resize-none"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={isGeneratingAIChallenge}
                            onClick={handleGenerateAIChallenge}
                            className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all shadow-cyan-600/20 disabled:animate-pulse flex items-center justify-center gap-3 border border-cyan-500/10"
                          >
                            {isGeneratingAIChallenge ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Diseñando Desafío Inteligente...
                              </>
                            ) : (
                              <>
                                <Sparkles
                                  size={16}
                                  className="text-cyan-200 animate-bounce"
                                />
                                Generar Desafío con IA
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* MANUAL FORM PANEL */}
                      {createChallengeType === "Manual" && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Materia
                              </label>
                              <select
                                value={manualChallengeForm.subjectId}
                                onChange={(e) =>
                                  setManualChallengeForm((prev) => ({
                                    ...prev,
                                    subjectId: e.target.value,
                                  }))
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-500/50 outline-none cursor-pointer"
                              >
                                <option
                                  value=""
                                  disabled
                                  className="text-slate-500 bg-slate-950"
                                >
                                  Selecciona una materia...
                                </option>
                                {["1", "2", "3"].map((grade) => {
                                  const list = getSubjectListHelper().filter(
                                    (s) => s.grade === grade,
                                  );
                                  const labelText =
                                    grade === "1"
                                      ? "🟢 1º GRADO (PRIMARIA/SECUNDARIA)"
                                      : grade === "2"
                                        ? "🔵 2º GRADO (PLAN SEP)"
                                        : "🟣 3º GRADO (CIERRE)";
                                  const colorClass =
                                    grade === "1"
                                      ? "text-emerald-400"
                                      : grade === "2"
                                        ? "text-cyan-400"
                                        : "text-purple-400";
                                  return (
                                    <optgroup
                                      key={grade}
                                      label={labelText}
                                      className={`${colorClass} bg-slate-950 font-black uppercase tracking-wider text-xs p-1`}
                                    >
                                      {list.map((s) => (
                                        <option
                                          key={s.id}
                                          value={s.id}
                                          className="text-slate-200 bg-slate-950 font-medium normal-case py-2 pl-4 text-xs"
                                        >
                                          &nbsp;&nbsp;&nbsp;{s.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  );
                                })}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Grupo de Alumnos Destino
                              </label>
                              <select
                                value={manualChallengeForm.group}
                                onChange={(e) =>
                                  setManualChallengeForm((prev) => ({
                                    ...prev,
                                    group: e.target.value,
                                  }))
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-500/50 outline-none cursor-pointer"
                              >
                                <option value="A">Grupo A</option>
                                <option value="B">Grupo B</option>
                                <option value="C">Grupo C</option>
                                <option value="D">Grupo D</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Bloque / Sector (Tema principal) *
                            </label>
                            <input
                              type="text"
                              required
                              value={manualChallengeForm.topicName}
                              onChange={(e) =>
                                setManualChallengeForm((prev) => ({
                                  ...prev,
                                  topicName: e.target.value,
                                }))
                              }
                              placeholder="Ej. Suma de Fracciones"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500/50 outline-none placeholder:text-slate-700"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Título del Desafío *
                            </label>
                            <input
                              type="text"
                              required
                              value={manualChallengeForm.title}
                              onChange={(e) =>
                                setManualChallengeForm((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Ej. El Desafío del Repartidor de Pasteles"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500/50 outline-none placeholder:text-slate-700"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Descripción Breve *
                            </label>
                            <input
                              type="text"
                              required
                              value={manualChallengeForm.description}
                              onChange={(e) =>
                                setManualChallengeForm((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Ej. Resuelve los ejercicios prácticos para ganar fichas y medallas."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500/50 outline-none placeholder:text-slate-700"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Instrucciones Detalladas del Desafío *
                            </label>
                            <textarea
                              required
                              value={manualChallengeForm.instructions}
                              onChange={(e) =>
                                setManualChallengeForm((prev) => ({
                                  ...prev,
                                  instructions: e.target.value,
                                }))
                              }
                              placeholder="Escribe el texto detallado de la actividad o el planteamiento detallado..."
                              rows={3}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500/50 outline-none placeholder:text-slate-700 resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Dificultad
                              </label>
                              <select
                                value={manualChallengeForm.difficulty}
                                onChange={(e) =>
                                  setManualChallengeForm((prev) => ({
                                    ...prev,
                                    difficulty: e.target.value as any,
                                  }))
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-500/50 outline-none cursor-pointer"
                              >
                                <option value="Easy">Fácil (+25 Tokens)</option>
                                <option value="Medium">
                                  Medio (+50 Tokens)
                                </option>
                                <option value="Hard">
                                  Difícil (+150 Tokens & Sobre)
                                </option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Tipo de Actividad
                              </label>
                              <select
                                value={manualChallengeForm.type}
                                onChange={(e) =>
                                  setManualChallengeForm((prev) => ({
                                    ...prev,
                                    type: e.target.value as any,
                                  }))
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-500/50 outline-none cursor-pointer"
                              >
                                <option value="Exercise">
                                  Práctica Escrita (Reporte)
                                </option>
                                <option value="Quiz">
                                  Examen Opciones (Quiz)
                                </option>
                              </select>
                            </div>
                          </div>

                          {manualChallengeForm.type === "Quiz" && (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                Opciones de Respuesta del Quiz
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {manualChallengeForm.quizOptions.map(
                                  (opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-[10px] font-black text-slate-500 w-4">
                                        {String.fromCharCode(65 + oIdx)})
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        placeholder={`Opción ${String.fromCharCode(65 + oIdx)}`}
                                        onChange={(e) => {
                                          const optionsCopy = [
                                            ...manualChallengeForm.quizOptions,
                                          ];
                                          optionsCopy[oIdx] = e.target.value;
                                          setManualChallengeForm((prev) => ({
                                            ...prev,
                                            quizOptions: optionsCopy,
                                          }));
                                        }}
                                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500/30 outline-none"
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                              <div className="space-y-1.5 pt-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  Opción Correcta
                                </label>
                                <select
                                  value={manualChallengeForm.quizAnswer}
                                  onChange={(e) =>
                                    setManualChallengeForm((prev) => ({
                                      ...prev,
                                      quizAnswer: parseInt(e.target.value),
                                    }))
                                  }
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500/30 outline-none cursor-pointer"
                                >
                                  <option value={0}>A</option>
                                  <option value={1}>B</option>
                                  <option value={2}>C</option>
                                  <option value={3}>D</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {manualChallengeForm.type === "Exercise" && (
                            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                              <input
                                type="checkbox"
                                id="evidenceRequiredCheck"
                                checked={manualChallengeForm.evidenceRequired}
                                onChange={(e) =>
                                  setManualChallengeForm((prev) => ({
                                    ...prev,
                                    evidenceRequired: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-800 rounded focus:ring-indigo-500/30"
                              />
                              <label
                                htmlFor="evidenceRequiredCheck"
                                className="text-xs text-slate-350 cursor-pointer select-none"
                              >
                                Exigir entrega de evidencia escaneada o foto
                                para aprobar
                              </label>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleSaveManualChallenge}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all shadow-indigo-600/20 mt-4"
                          >
                            Crear y Asignar Desafío Manual 📝
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {showCreateUserModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                            <UserPlus size={20} />
                          </div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                            Nuevo{" "}
                            {showCreateUserModal.role === "Teacher"
                              ? "Docente"
                              : "Alumno"}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowCreateUserModal({
                              isOpen: false,
                              role: "Teacher",
                            });
                            setCreateUserForm({
                              username: "",
                              email: "",
                              password: "",
                              grade: "",
                            });
                          }}
                          className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            value={createUserForm.username}
                            onChange={(e) =>
                              setCreateUserForm((prev) => ({
                                ...prev,
                                username: e.target.value.toUpperCase(),
                              }))
                            }
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            value={createUserForm.email}
                            onChange={(e) =>
                              setCreateUserForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="correo@ejemplo.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Contraseña
                          </label>
                          <input
                            type="password"
                            value={createUserForm.password}
                            onChange={(e) =>
                              setCreateUserForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        {showCreateUserModal.role === "Student" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Grado/Grupo Primario
                            </label>
                            <input
                              type="text"
                              value={createUserForm.grade}
                              onChange={(e) =>
                                setCreateUserForm((prev) => ({
                                  ...prev,
                                  grade: e.target.value,
                                }))
                              }
                              placeholder="Ej. 1A"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 uppercase"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        disabled={
                          isCreatingUser ||
                          !createUserForm.email ||
                          !createUserForm.password ||
                          !createUserForm.username
                        }
                        onClick={async () => {
                          setIsCreatingUser(true);
                          try {
                            await supabaseService.adminCreateUser({
                              email: createUserForm.email,
                              password: createUserForm.password,
                              username: createUserForm.username
                                .trim()
                                .toUpperCase(),
                              role: showCreateUserModal.role,
                              grade: createUserForm.grade || "1",
                              assignedGroups: [],
                            });

                            toast.success(
                              `¡${showCreateUserModal.role === "Teacher" ? "Docente" : "Alumno"} creado exitosamente!`,
                            );
                            setShowCreateUserModal({
                              isOpen: false,
                              role: "Teacher",
                            });
                            setCreateUserForm({
                              username: "",
                              email: "",
                              password: "",
                              grade: "",
                            });
                            loadUsers();
                          } catch (err: any) {
                            toast.error(
                              `Error: ${err.message || "No se pudo crear el usuario"}`,
                            );
                          } finally {
                            setIsCreatingUser(false);
                          }
                        }}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                          isCreatingUser ||
                            !createUserForm.email ||
                            !createUserForm.password ||
                            !createUserForm.username
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20",
                        )}
                      >
                        {isCreatingUser ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creando...
                          </>
                        ) : (
                          `Crear ${showCreateUserModal.role === "Teacher" ? "Docente" : "Alumno"}`
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {userToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden p-8 space-y-8"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto">
                        <Trash2 size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                          ¿Confirmar Borrado?
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                          Estás a punto de borrar a{" "}
                          <span className="text-white font-bold">
                            {userToDelete.name}
                          </span>{" "}
                          ({userToDelete.role}). Esta acción no se puede
                          deshacer.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        disabled={isDeletingUser}
                        onClick={async () => {
                          setIsDeletingUser(true);
                          try {
                            await supabaseService.deleteUser(userToDelete.id);
                            toast.success(
                              `${userToDelete.role} eliminado con éxito.`,
                            );
                            setUserToDelete(null);
                            loadUsers();
                          } catch (err: any) {
                            toast.error(`Error: ${err.message}`);
                          } finally {
                            setIsDeletingUser(false);
                          }
                        }}
                        className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isDeletingUser ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Borrando...
                          </>
                        ) : (
                          "SÍ, ELIMINAR AHORA"
                        )}
                      </button>
                      <button
                        disabled={isDeletingUser}
                        onClick={() => setUserToDelete(null)}
                        className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                      >
                        CANCELAR
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
