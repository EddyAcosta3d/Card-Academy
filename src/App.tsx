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
} from "lucide-react";

import { GoogleGenAI, Type } from "@google/genai";
import { Card as CardComponent } from "./components/Card";
import { StickerAlbum } from "./components/StickerAlbum";
import { PackOpening } from "./components/PackOpening";
import { DailyChallenge } from "./components/DailyChallenge";
import { LoginPage } from "./components/LoginPage";
import { Logo } from "./components/Logo";
import {
  UserStats,
  Card as CardType,
  Grade,
  Task,
  UserRole,
  Pack,
  Year,
  AppNotification
} from "./types";
import {
  INITIAL_CARDS,
  INITIAL_CHALLENGE,
  ACADEMIC_CONTENT,
  SCHOOL_GROUPS,
  INITIAL_PACKS,
} from "./constants";
import { cn } from "./lib/utils";
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

const AnimatedTokens = ({ tokens, className }: { tokens: number; className?: string }) => {
  const [prevTokens, setPrevTokens] = useState(tokens);
  const [animations, setAnimations] = useState<{ id: number; diff: number }[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (tokens > prevTokens) {
      const diff = tokens - prevTokens;
      const id = nextId.current++;
      setAnimations(a => [...a, { id, diff }]);

      // Trigger coin sound
      playCoinSound();

      setTimeout(() => {
        setAnimations(a => a.filter(anim => anim.id !== id));
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
  if (!assigned || assigned.length === 0) return (
    <span className="text-[9px] font-black text-slate-600 uppercase italic">
      Sin asignar
    </span>
  );

  // Group by base subject ID
  const groupsBySubject = new Map<string, Set<string>>();
  
  assigned.forEach(sid => {
    const parts = sid.includes(':') ? sid.split(':') : [sid];
    const subId = parts[0];
    const groupId = parts.slice(1).join(':');
    
    if (!groupsBySubject.has(subId)) groupsBySubject.set(subId, new Set());
    if (groupId) groupsBySubject.get(subId)!.add(groupId);
  });

  return Array.from(groupsBySubject.entries()).map(([sid, groups]) => {
    let prettyName = sid.replace('_', ' ').toUpperCase();
    let year = sid.split('_')[1] || '';
    
    for (const y in ACADEMIC_CONTENT) {
      const sub = (ACADEMIC_CONTENT[y as Year] || []).find(s => s.id === sid);
      if (sub) {
        prettyName = sub.name;
        year = y;
        break;
      }
    }

    // Identificación especial para Integración Curricular
    if (prettyName.toLowerCase().includes('integración') || prettyName.toLowerCase().includes('int.')) {
        prettyName = 'INT';
    } else if (prettyName.toLowerCase().includes('tecnología')) {
        prettyName = 'TEC';
    }

    const groupList = Array.from(groups).sort().join(',');
    const groupLabel = groupList ? ` (${groupList})` : '';

    return (
      <div key={sid} className="px-2 py-0.5 bg-cyan-900/40 border border-cyan-500/40 text-cyan-200 rounded text-[9px] font-black uppercase whitespace-nowrap shadow-sm">
        {prettyName}{groupLabel}
      </div>
    );
  });
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedTeacherGroup, setSelectedTeacherGroup] = useState<string | null>(null);
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
      "coll_A1_01", "coll_A1_03", "coll_A1_05", "coll_A1_07", "coll_A1_12", 
      "coll_A2_02", "coll_A2_04", "coll_A2_06",
      "coll_A3_01", "coll_A3_04", "coll_A3_08",
      "achiev_1", "achiev_2", "achiev_3", "achiev_5", "achiev_17",
      "reward_1", "reward_3", "reward_4"
    ],
    unstickedCards: [
      "coll_A1_02", "coll_A2_01", "coll_A3_02", "achiev_4", "reward_2"
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
    }
  };

  const [stats, setStats] = useState<UserStats>(defaultStats);
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
      const realTimeNotifs = await supabaseService.fetchNotifications(currentUserId);
      setNotifications(realTimeNotifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId && isNotificationsOpen) {
      loadNotifications();
    }
  }, [currentUserId, isNotificationsOpen, loadNotifications]);

  const [teachers, setTeachers] = useState<TeacherModel[]>([]);
  const [globalStudents, setGlobalStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<{
    teacherId: string | null;
    isOpen: boolean;
    selectedGroups: string[];
    selectedSubjects: string[];
    activeYear: Year;
  }>({ teacherId: null, isOpen: false, selectedGroups: [], selectedSubjects: [], activeYear: "1" });

  const [adminDashboardTab, setAdminDashboardTab] = useState<"stats" | "teachers" | "students">("stats");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState<{ isOpen: boolean; role: "Teacher" | "Student" }>({ isOpen: false, role: "Teacher" });
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string, role: string } | null>(null);
  const [createUserForm, setCreateUserForm] = useState({ username: "", email: "", password: "", grade: "" });
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "home" | "collection" | "shop" | "challenges" | "profile"
  >("home");

  // Reset internal navigation when changing tabs
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedTask(null);
  }, [activeTab]);

  // Integration of global configuration from Supabase
  useEffect(() => {
    const fetchGlobalConfig = async () => {
      const key = await supabaseService.getGlobalMasterKey();
      if (key) {
        setMasterTeacherKey(key);
        localStorage.setItem('masterTeacherKey', key);
      }
    };
    fetchGlobalConfig();
  }, []);

  // NEW admin state
  const [rawStudents, setRawStudents] = useState<UserStats[]>([]);
  const [masterTeacherKey, setMasterTeacherKey] = useState(() => {
    return localStorage.getItem('masterTeacherKey') || "DOCENTE-2026";
  });
  const [showMasterKeyInProfile, setShowMasterKeyInProfile] = useState(false);
  const [isEditingMasterKey, setIsEditingMasterKey] = useState(false);
  const [tempMasterKey, setTempMasterKey] = useState(masterTeacherKey);

  // Persistence for master key
  useEffect(() => {
    localStorage.setItem('masterTeacherKey', masterTeacherKey);
    setTempMasterKey(masterTeacherKey);
  }, [masterTeacherKey]);

  const loadUsers = React.useCallback(async () => {
    try {
      const users = await supabaseService.fetchAllUsers();
      
      setRawStudents(users.filter(u => u.role === 'Student'));

      const computeStudents: Student[] = users.filter(u => u.role === 'Student').map(s => ({
          id: s.id || s.username || '',
          name: s.username || 'Alumno',
          username: s.username || 'Alumno',
          grade: s.grade || '2A',
          collection: s.collection || [],
          completedTasks: s.completedTasks || [],
          pendingTasks: s.pendingTasks || [],
          streak: s.streak || 0,
          tokens: s.tokens || 0,
          lastActive: s.lastActive,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`
      }));
      setGlobalStudents(computeStudents);

      const computeTeachers: TeacherModel[] = users.filter(u => u.role === 'Teacher').map(t => ({
          id: t.id || t.username || '',
          name: t.username || 'Profesor',
          subjects: t.assignedSubjects || [],
          groups: t.assignedGroups || [],
          students: users.filter(u => u.role === 'Student' && (t.assignedGroups || []).includes(u.grade)).length,
          status: 'Active',
          lastActive: t.lastActive
      }));

      setTeachers(computeTeachers);
    } catch (e) {
      console.error("Error loading all users from Supabase:", e);
    }
  }, [stats.role, stats.username, currentUser]);

  useEffect(() => {
    // Solo cargar usuarios si está autenticado y tiene permisos
    if (isAuthenticated && (stats.role === 'Admin' || stats.role === 'Teacher')) {
      loadUsers();
    }
  }, [loadUsers, adminDashboardTab, isAuthenticated, stats.role]);

  const allStudents = React.useMemo(() => {
      const map = new Map<string, Student>();
      // Always include current real students from Supabase
      globalStudents.forEach(s => map.set(s.id, s));
      return Array.from(map.values());
  }, [globalStudents, currentUser, stats.username]);

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
  const [sessionCompletedChallenges, setSessionCompletedChallenges] = useState<Set<string>>(new Set());
  const [animatingCards, setAnimatingCards] = useState<string[]>([]);
  const [dbCards, setDbCards] = useState<CardType[]>([]);

  // Fetch all cards from database
  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from('cards').select('*');
      if (error) {
        console.error("Error fetching cards from DB:", error);
        return;
      }
      if (data && data.length > 0) {
        const mappedCards: CardType[] = data.map(c => ({
          id: c.id,
          name: c.name,
          rarity: c.rarity as any,
          sourcePackId: c.pack_type,
          description: c.description || "",
          imageUrl: c.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.id}`,
          category: (c.category as any) || 'Collectible'
        }));
        setDbCards(mappedCards);
      }
    };
    fetchCards();
  }, []);

  // Compute total cards (DB + Constants as fallback)
  const allAvailableCards = React.useMemo(() => {
    const cardMap = new Map<string, CardType>();
    INITIAL_CARDS.forEach(c => cardMap.set(c.id, c));
    dbCards.forEach(c => cardMap.set(c.id, c));
    return Array.from(cardMap.values());
  }, [dbCards]);

  const generateDailyChallenge = async () => {
    setIsGeneratingChallenge(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Genera una pregunta de trivia de cultura general de opción múltiple muy interesante en español, con un ligero enfoque hacia México pero sin dejar de lado el ámbito internacional. Debe tener 4 opciones (strings).
        La respuesta debe ser en formato JSON con la siguiente estructura: 
        { "question": "texto de la pregunta", "options": ["opcion1", "opcion2", "opcion3", "opcion4"], "answer": 0 }
        La propiedad "answer" debe ser el índice de la respuesta correcta (0-3).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.INTEGER },
            },
            required: ["question", "options", "answer"],
          },
        },
      });
      const data = JSON.parse(response.text);
      setCurrentChallenge({
        id: `daily_${Date.now()}`,
        subject: "Cultura General",
        question: data.question,
        options: data.options,
        correctAnswer: data.answer,
        difficulty: 'Medium',
        tokenReward: hasCompletedDaily ? 0 : 25,
      });
    } catch (e) {
      console.error("Error generating daily challenge:", e);
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && stats.role === "Student") {
      if (currentChallenge.id === 'daily_1') {
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

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined in process.env");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Genera una pregunta de opción múltiple para un estudiante de grado ${stats.grade} sobre la materia "${subjectName}" y el tema "${topicName}". 
        La respuesta debe ser en formato JSON con la siguiente estructura: 
        { "question": "texto de la pregunta", "options": ["opcion1", "opcion2", "opcion3", "opcion4"], "answer": 0 }
        La propiedad "answer" debe ser el índice de la respuesta correcta (0-3).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.INTEGER },
            },
            required: ["question", "options", "answer"],
          },
        },
      });

      const data = JSON.parse(response.text);
      setAiQuiz(data);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      const errorMessage = error?.message || "Error desconocido";
      toast.error(
        `Hubo un error al generar el quiz con IA: ${errorMessage}. Por favor intenta de nuevo.`,
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Load from Supabase or local storage on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const fetchedStats = await supabaseService.getProfile(session.user.id, session.user.user_metadata);
          setStats(fetchedStats);
          setCurrentUserId(session.user.id);
          setCurrentUser(fetchedStats.username || 'Usuario');
          setIsAuthenticated(true);
        } catch (e: any) {
          if (e.message === 'Tu perfil de usuario no fue encontrado.') {
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
            if (!parsedStats.dailyLimits || parsedStats.dailyLimits.lastResetDate !== today) {
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
      // Sync with Supabase (fire and forget for now, but in production consider debouncing)
      supabaseService.updateUserStats(currentUserId, stats).catch(console.error);
    }
    if (currentUser) {
      localStorage.setItem(`cardacademy_stats_${currentUser}`, JSON.stringify(stats));
    }
  }, [stats, currentUserId, currentUser]);

  const handleLogin = (role: UserRole, username: string, grade?: string, initialStats?: UserStats) => {
    const freshUser = username || 'Alumno';
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
          }
        };

        setStats({
          ...freshStats,
          role: role,
          originalRole: role,
          username: freshUser,
          grade: (grade as any) || (role === "Student" ? "2A" : "2D"),
          assignedSubjects:
            role === "Teacher"
              ? []
              : role === "Admin"
                ? []
                : ["math_2"],
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
    setSessionCompletedChallenges(prev => {
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
        const points = c.rarity === 'Legendary' || c.rarity === 'Secret' ? 200 : c.rarity === 'Epic' ? 50 : c.rarity === 'Rare' ? 15 : 5;
        duplicatePoints += points;
      } else {
        trulyNewCardIds.push(c.id);
      }
      currentDrawnSet.add(c.id);
    });

    setStats((prev) => {
      const prevCollectionSet = new Set(prev.collection);
      currentDrawnSet.forEach(cId => prevCollectionSet.add(cId));

      const newPackCurrencies = prev.packCurrencies ? { ...prev.packCurrencies } : { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 };
      if (duplicatePoints > 0) {
        newPackCurrencies[packId] = (newPackCurrencies[packId] || 0) + duplicatePoints;
      }

      return {
        ...prev,
        collection: Array.from(prevCollectionSet),
        packCurrencies: newPackCurrencies,
      };
    });
    
    if (duplicatePoints > 0) {
      toast.info(`¡Obtuviste ${duplicateCount} carta(s) repetida(s)! Ganaste ${duplicatePoints} moneda(s) para la tienda.`);
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
        if (task.difficulty === 'Easy') newStats.dailyLimits.easyCompleted++;
        else if (task.difficulty === 'Medium') newStats.dailyLimits.mediumCompleted++;
        else if (task.difficulty === 'Hard') newStats.dailyLimits.hardCompleted++;
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

  const submitTaskForReview = (task: Task) => {
    setStats((prev) => {
      const newStats = { ...prev };
      if (!newStats.pendingTasks) {
        newStats.pendingTasks = [];
      }
      if (!newStats.pendingTasks.includes(task.id) && !newStats.completedTasks.includes(task.id)) {
        newStats.pendingTasks = [...newStats.pendingTasks, task.id];
      }
      return newStats;
    });
  };

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = allAvailableCards.find((c) => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">
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
                        <AnimatedTokens tokens={stats.tokens} className="text-amber-400 font-bold text-xs" />
                        <Coins className="text-amber-500 shrink-0" size={12} />
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-1.5 py-1 rounded-full border border-rose-500/30 shadow-lg shrink min-w-0">
                        <Flame className="text-rose-500 animate-pulse  shrink-0" size={14} />
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
                        <span className="text-[10px] uppercase text-cyan-400 font-black tracking-widest hidden sm:inline-block">Alumnos</span>
                        <span className="text-[10px] uppercase text-cyan-400 font-black tracking-widest sm:hidden">Alum.</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg"></div>
                        <span className="text-indigo-400 font-black font-mono text-xs tracking-tighter truncate">
                          {globalStudents.filter(s => {
                            const isAssigned = stats.assignedGroups.includes(s.grade);
                            if (!isAssigned) return false;
                            if (!s.lastActive) return false;
                            const lastSeen = new Date(s.lastActive).getTime();
                            const now = Date.now();
                            return (now - lastSeen) < 300000; // 5 minutes
                          }).length}
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
                        <AnimatedTokens tokens={stats.tokens} className="text-amber-400 font-bold text-sm" />
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">
                          Medallas
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/30 shadow-lg shrink min-w-0">
                        <Flame className="text-rose-500 animate-pulse  shrink-0" size={14} />
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
                          {globalStudents.filter(s => {
                            const isAssigned = stats.assignedGroups.includes(s.grade);
                            if (!isAssigned) return false;
                            if (!s.lastActive) return false;
                            const lastSeen = new Date(s.lastActive).getTime();
                            const now = Date.now();
                            return (now - lastSeen) < 300000; // 5 minutes
                          }).length}
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
                      {notifications.filter(n => !n.isRead).length > 0 && (
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
                                  : "border-emerald-500/50 shadow-emerald-500/20"
                            )}
                          >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
                              <h3 className="font-black text-slate-100 uppercase tracking-widest text-[10px]">
                                Notificaciones
                              </h3>
                              {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest">
                                  {notifications.filter(n => !n.isRead).length} NUEVAS
                                </span>
                              )}
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto transform-gpu no-scrollbar bg-slate-900 min-h-[100px]">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                  <Bell size={32} className="mx-auto text-slate-700 mb-3 opacity-20" />
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
                                          await supabaseService.markNotificationAsRead(n.id);
                                          loadNotifications();
                                        } catch (e) {
                                          console.error("Error marking as read:", e);
                                        }
                                      }
                                    }}
                                    className={cn(
                                      "p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden",
                                      !n.isRead && "bg-indigo-500/5"
                                    )}
                                  >
                                    {!n.isRead && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                      <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        n.type === 'success' ? "text-emerald-400" :
                                        n.type === 'warning' ? "text-amber-400" :
                                        n.type === 'error' ? "text-rose-400" : "text-indigo-400"
                                      )}>
                                        [{n.title.toUpperCase()}]
                                      </p>
                                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-400">
                                        {new Date(n.createdAt).toLocaleDateString()}
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
                                      await supabaseService.markAllNotificationsAsRead(currentUserId);
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
                      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-700">
                        <div
                          className={cn(
                            "w-full h-full bg-gradient-to-tr transition-all",
                            stats.role === "Admin"
                              ? "from-amber-400 to-rose-600"
                              : stats.role === "Teacher"
                                ? "from-indigo-400 to-purple-600"
                                : "from-emerald-400 to-cyan-600",
                          )}
                        >
                          <div className="w-full h-full flex items-center justify-center text-white font-black text-xs uppercase">
                            {stats.username ? stats.username.charAt(0) : stats.role.charAt(0)}
                          </div>
                        </div>
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
                                : "border-emerald-500/50 shadow-emerald-500/20"
                          )}
                        >
                          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                            <div
                              className={cn(
                                "shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-black uppercase",
                                stats.role === "Admin"
                                  ? "bg-amber-500"
                                  : stats.role === "Teacher"
                                    ? "bg-indigo-500"
                                    : "bg-emerald-500",
                              )}
                            >
                              {stats.username ? stats.username.charAt(0) : stats.role.charAt(0)}
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
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
                              <UserCog
                                size={18}
                                className="group-hover:text-indigo-400"
                              />
                              <span className="text-xs font-black uppercase tracking-widest">
                                Editar Perfil
                              </span>
                            </button>

                            {stats.originalRole === "Admin" && (
                              <div className="py-2 border-t border-slate-800 my-1">
                                <p className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">
                                  Simular Rol (Demo)
                                </p>
                                <div className="flex flex-col gap-1">
                                  {(["Student", "Teacher", "Admin"] as const).map(
                                    (r) => (
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
                                                ? [
                                                    "2D",
                                                    "3A",
                                                    "3B",
                                                    "3C",
                                                    "3D",
                                                  ]
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
                                    ),
                                  )}
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
                    className="space-y-6 md:space-y-8 pb-24"
                  >
                    {/* Profile Header Hero */}
                    <div className="bg-slate-900/50 border border-indigo-500/10 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-md relative">
                      <div className="absolute top-0 inset-x-0 h-24 md:h-32 bg-gradient-to-r from-indigo-900/40 to-slate-900 z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                      </div>

                      <div className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                          <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[1.5rem] bg-slate-950 border-4 border-indigo-600 p-1 shadow-lg relative group overflow-hidden">
                            <div className="w-full h-full rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-inner uppercase">
                              {stats.role.charAt(0)}
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white border-2 border-slate-950 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={14} />
                            </button>
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
                                 const newName = window.prompt("Ingresa nuevo nombre de usuario:", stats.username);
                                 if (newName?.trim()) {
                                    setStats(s => ({...s, username: newName.trim()}));
                                    toast.success("Nombre actualizado exitosamente.");
                                 }
                               }}
                               className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95">
                              <Settings size={14} /> Perfil
                            </button>
                            {stats.role === "Teacher" && (
                              <button 
                                onClick={() => setAssignmentModal({
                                  teacherId: currentUserId || stats.id || "",
                                  isOpen: true,
                                  selectedGroups: stats.assignedGroups || [],
                                  selectedSubjects: stats.assignedSubjects || [],
                                  activeYear: "1"
                                })}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-1.5 border border-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95">
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
                                    val: globalStudents.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.completedTasks.length, 0), // Simulating pending reviews for now
                                    color: "text-emerald-400",
                                  },
                                  {
                                    label: "Medallas de alumnos",
                                    val: globalStudents.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.tokens, 0),
                                    color: "text-amber-400",
                                  },
                                  {
                                    label: "Racha global",
                                    val: `${globalStudents.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.streak, 0)} Días`,
                                    color: "text-rose-400",
                                  }
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
                                    ? [{
                                        label: "Album completado",
                                        val: `${Math.round((stats.collection.length / allAvailableCards.length) * 100)}%`,
                                        color: "text-indigo-400",
                                        bar: "bg-indigo-400",
                                        max: 100,
                                      }] 
                                    : [])
                                ]
                            ).map((idx) => (
                              <div key={idx.label}>
                                <div className={cn("flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500", idx.bar ? "mb-1.5" : "mb-0")}>
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
                                        onChange={(e) => setTempMasterKey(e.target.value.toUpperCase())}
                                        className="bg-slate-950 border border-indigo-500/50 text-white px-2 py-1 rounded-lg text-sm font-black w-32 outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="text-sm font-black text-white uppercase tracking-[0.1em]">
                                        {showMasterKeyInProfile ? masterTeacherKey : "••••••••"}
                                      </span>
                                    )}
                                    <button 
                                      onClick={() => setShowMasterKeyInProfile(!showMasterKeyInProfile)}
                                      className="text-slate-600 hover:text-slate-400 p-1"
                                    >
                                      {showMasterKeyInProfile ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {isEditingMasterKey ? (
                                    <>
                                      <button 
                                        onClick={() => {
                                          if (tempMasterKey.trim()) {
                                            const newKey = tempMasterKey.trim().toUpperCase();
                                            setMasterTeacherKey(normKey => newKey);
                                            setIsEditingMasterKey(false);
                                            // Persist to Supabase
                                            supabaseService.setGlobalMasterKey(newKey).then(() => {
                                              toast.success("Llave maestra actualizada globalmente (MAYÚSCULAS).");
                                            }).catch(() => {
                                              toast.success("Llave maestra actualizada (local).");
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
                                Esta llave es necesaria para que nuevos maestros puedan crear una cuenta.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* QUICK MENU */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 md:p-3 shadow-md">
                          <button className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-indigo-500/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <UserCog
                                size={18}
                                className="group-hover:text-indigo-400"
                              />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Editar Perfil
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
                                stats.completedTasks.map((id) => {
                                  const taskDetails = Object.values(ACADEMIC_CONTENT).flat().flatMap(s => s.topics).flatMap(t => t.tasks).find(t => t.id === id);
                                  const taskTitle = taskDetails?.title || `MISIÓN_${id.slice(-4)}`;
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
                                  {globalStudents.filter(s => stats.assignedGroups.includes(s.grade)).length}
                                </p>
                              </div>
                              <div className="bg-slate-800 border border-slate-700 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 space-y-4 border-b-8 border-slate-950">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
                                  Misiones por Validar
                                </h4>
                                <p className="text-6xl font-black italic text-white leading-none">
                                  {globalStudents.filter(s => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + (curr.pendingTasks?.length || 0), 0)}
                                </p>
                              </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 md:mb-6 italic">
                                Materias Asignadas
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {stats.assignedSubjects.map((sid) => {
                                  const baseId = sid.includes(":") ? sid.split(":")[0] : sid;
                                  const group = sid.includes(":") ? sid.split(":")[1] : null;

                                  let prettyName = baseId.replace("_", " ").toUpperCase();
                                  for (const year in ACADEMIC_CONTENT) {
                                    const sub = (ACADEMIC_CONTENT[year as Year] || []).find((s) => s.id === baseId);
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
                                      {prettyName} {group ? <span className="text-cyan-400 ml-1">[{group}]</span> : ""}
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
                    className="space-y-8 pb-32"
                  >
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 lg:gap-6 text-center lg:text-left">
                        <div className="px-1 lg:px-0">
                          <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 pb-1 pr-2">
                            {stats.role === "Admin"
                              ? "Asignación"
                              : "Desafíos"}
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
                                      setStats((prev) => ({ ...prev, grade: (y + "A") as Grade }));
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
                                  <GraduationCap size={14} className={cn((stats.grade?.[0] || "1") === y ? "text-white" : "text-slate-600")} />
                                  <span>{y}º Año</span>
                                </button>
                              ))}
                            </div>
                            
                            {/* Selector de Grupo */}
                            <div className="flex bg-slate-900/30 p-1 rounded-2xl border border-slate-800/50 gap-1 w-full lg:w-96">
                              {["A", "B", "C", "D"].map((letter) => {
                                const currentYear = stats.grade?.[0] || "1";
                                const fullGrade = (currentYear + letter) as Grade;
                                return (
                                  <button
                                    key={fullGrade}
                                    onClick={() => {
                                      setStats((prev) => ({ ...prev, grade: fullGrade }));
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

                        {stats.role === "Teacher" && (
                          <button
                            onClick={() =>
                              toast.info(
                                "Módulo de creación de desafíos: ¡Próximamente!",
                              )
                            }
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
                          >
                            <Plus size={18} /> Nuevo Desafío
                          </button>
                        )}
                      </div>

                      {!selectedSubject ? (
                        /* SUBJECT SELECTION */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(ACADEMIC_CONTENT).flatMap(
                            ([grade, subjects]) =>
                              (subjects || [])
                                .filter((s) => {
                                  if (stats.role === "Admin") {
                                    return (stats.grade?.[0] || "1") === grade;
                                  }
                                  if (stats.role === "Teacher") {
                                    const hasIntegrationThisYear = stats.assignedSubjects.some((s) => {
                                      const baseId = s.includes(":") ? s.split(":")[0] : s;
                                      return baseId === `int_cur_${grade}`;
                                    });
                                    if (hasIntegrationThisYear) return true;
                                    return stats.assignedSubjects.some((subj) => {
                                      const baseId = subj.includes(":") ? subj.split(":")[0] : subj;
                                      return baseId === s.id;
                                    });
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
                                  for (const year in ACADEMIC_CONTENT) {
                                    const sub = (ACADEMIC_CONTENT[year as Year] || []).find(s => s.id === selectedSubject);
                                    if (sub) return sub.name;
                                  }
                                  return "Materia no encontrada";
                                })()}
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              {(() => {
                                let subject = null;
                                for (const year in ACADEMIC_CONTENT) {
                                  subject = (ACADEMIC_CONTENT[year as Year] || []).find(s => s.id === selectedSubject);
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
                                for (const year in ACADEMIC_CONTENT) {
                                  const sub = (ACADEMIC_CONTENT[year as Year] || []).find(s => s.id === selectedSubject);
                                  if (sub) {
                                    const topic = sub.topics.find((t) => t.id === selectedTopic);
                                    if (topic) return topic.name;
                                  }
                                }
                                return "Tema no encontrado";
                              })()}
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                              {(() => {
                                let topic = null;
                                for (const year in ACADEMIC_CONTENT) {
                                  const sub = (ACADEMIC_CONTENT[year as Year] || []).find(s => s.id === selectedSubject);
                                  if (sub) {
                                    topic = sub.topics.find((t) => t.id === selectedTopic);
                                    if (topic) break;
                                  }
                                }
                                return topic?.tasks.map((task) => {
                                  const isCompleted =
                                    stats.completedTasks.includes(task.id);
                                  const isPending = stats.pendingTasks?.includes(task.id) || false;
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
                                          : isPending ? "border-amber-500/40 opacity-80" : "border-slate-800 hover:border-indigo-500/30",
                                        isTaskActive &&
                                          "border-indigo-500 ring-1 ring-indigo-500/50",
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 pointer-events-none rotate-45 transform translate-x-12 -translate-y-12",
                                          isCompleted
                                            ? "from-emerald-500 to-transparent"
                                            : isPending ? "from-amber-500 to-transparent" : "from-indigo-500 to-transparent",
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
                                                <Flame size={12} />{" "}
                                                En Revisión
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

                                            {isTaskActive &&
                                              task.instructions && (
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
                                                    if (task.difficulty === 'Easy' && (stats.dailyLimits.easyCompleted || 0) >= 4) {
                                                      toast.warning('Has alcanzado el límite diario de 4 desafíos básicos. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                    if (task.difficulty === 'Medium' && (stats.dailyLimits.mediumCompleted || 0) >= 2) {
                                                      toast.warning('Has alcanzado el límite diario de 2 desafíos intermedios. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                    if (task.difficulty === 'Hard' && (stats.dailyLimits.hardCompleted || 0) >= 1) {
                                                      toast.warning('Has alcanzado el límite diario de 1 desafío difícil. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                  }

                                                  setSelectedTask(task.id);
                                                  if (task.isAIQuiz) {
                                                    let subjectName = "";
                                                    let topicName = "";
                                                    
                                                    for (const year in ACADEMIC_CONTENT) {
                                                      const sub = (ACADEMIC_CONTENT[year as Year] || []).find(s => s.id === selectedSubject);
                                                      if (sub) {
                                                        subjectName = sub.name;
                                                        const topic = sub.topics.find(t => t.id === selectedTopic);
                                                        if (topic) {
                                                          topicName = topic.name;
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
                                                      input.onchange = (
                                                        e: any,
                                                      ) => {
                                                        if (
                                                          e.target.files
                                                            .length > 0
                                                        ) {
                                                          toast.success(
                                                            "Evidencia subida correctamente. El profesor validará tu desafío.",
                                                          );
                                                          submitTaskForReview(task);
                                                          setSelectedTask(null);
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
                    className="space-y-12 pb-32"
                  >
                    {stats.role === "Admin" ? (
                      /* ADMIN ASIGNACIÓN (HOME) */
                      <div className="space-y-12">
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
                          </div>
                        </div>

                        {adminDashboardTab === "stats" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                              {
                                label: "Plaza Docente",
                                val: teachers.length.toString(),
                                icon: <UserCog size={24} className="text-indigo-400" />
                              },
                              {
                                label: "Matrícula Activa",
                                val: globalStudents.length.toString(),
                                icon: <Users size={24} className="text-emerald-400" />
                              },
                              {
                                label: "Grupos Asignados",
                                val: SCHOOL_GROUPS.length.toString(),
                                icon: <BookOpen size={24} className="text-rose-400" />
                              },
                              {
                                label: "Misiones Resueltas",
                                val: globalStudents.reduce((acc, curr) => acc + curr.completedTasks.length, 0).toString(),
                                icon: <TrendingUp size={24} className="text-amber-400" />
                              },
                              {
                                label: "Llave de Docente",
                                val: masterTeacherKey,
                                icon: <Lock size={24} className="text-violet-400" />,
                                isEditable: true,
                              }
                            ].map((stat, i) => (
                              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-4 hover:border-slate-700 transition-all shadow-lg relative group overflow-hidden">
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
                                                const newKey = tempMasterKey.trim();
                                                setMasterTeacherKey(newKey);
                                                setIsEditingMasterKey(false);
                                                // Persist to Supabase
                                                supabaseService.setGlobalMasterKey(newKey).then(() => {
                                                  toast.success("Llave actualizada globalmente.");
                                                }).catch(() => {
                                                  toast.success("Llave actualizada.");
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
                                              setTempMasterKey(masterTeacherKey);
                                            }}
                                            className="p-2 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 hover:text-white transition-all"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setIsEditingMasterKey(true)}
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
                                  {(stat as any).isEditable && isEditingMasterKey ? (
                                    <input 
                                      type="text"
                                      value={tempMasterKey}
                                      onChange={(e) => setTempMasterKey(e.target.value.toUpperCase())}
                                      className="bg-slate-950 border border-indigo-500/50 text-indigo-400 text-xl font-black italic rounded-lg px-2 py-1 w-full outline-none ring-4 ring-indigo-500/10 mb-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="text-2xl font-black italic text-slate-100 mb-1 truncate">{stat.val}</div>
                                  )}
                                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : adminDashboardTab === "teachers" ? (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <button 
                                onClick={() => setShowCreateUserModal({ isOpen: true, role: "Teacher" })}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-95">
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
                                          {teacher.name.split(" ")[1]?.charAt(0) || "T"}
                                        </div>
                                        <div>
                                          <div className="font-bold text-slate-100">
                                            {teacher.name}
                                          </div>
                                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            {teacher.students} Alumnos totales
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-8 py-6">
                                      <div className="flex flex-wrap gap-1 items-center">
                                        {renderCompactSubjects(teacher.subjects)}
                                      </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                      {(() => {
                                        const isOnline = teacher.lastActive && (new Date().getTime() - new Date(teacher.lastActive).getTime() < 300000);
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
                                              {isOnline ? "En Línea" : "Desconectado"}
                                            </span>
                                            {teacher.lastActive && !isOnline && (
                                              <span className="text-[8px] text-slate-600 font-bold uppercase truncate max-w-[80px]">
                                                {new Date(teacher.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                            const newName = prompt('Nuevo nombre:', teacher.name);
                                            if (newName && newName.trim()) {
                                              supabaseService.updateUserStats(teacher.id, { username: newName.trim() }).then(() => {
                                                loadUsers();
                                                toast.success("Nombre actualizado con éxito.");
                                              }).catch(err => {
                                                console.error(err);
                                                toast.error("Error al actualizar nombre.");
                                              });
                                            }
                                          }}
                                          className="text-cyan-400 hover:text-cyan-300 font-bold p-2 bg-cyan-500/10 rounded-full transition-all border border-cyan-500/20"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setUserToDelete({ id: teacher.id, name: teacher.name, role: "Docente" });
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
                                              selectedGroups: teacher.groups || [],
                                              selectedSubjects: teacher.subjects || [],
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
                              <div key={teacher.id} className="p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-indigo-900 flex items-center justify-center font-black text-sm text-white shrink-0">
                                    {teacher.name.split(" ")[1]?.charAt(0) || "T"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-slate-100 truncate">{teacher.name}</h4>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{teacher.students} Alumnos</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {(() => {
                                        const isOnline = teacher.lastActive && (new Date().getTime() - new Date(teacher.lastActive).getTime() < 300000);
                                        return (
                                          <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                              "w-1.5 h-1.5 rounded-full",
                                              isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                                            )} />
                                            <span className="text-[8px] font-black uppercase text-slate-500 whitespace-nowrap">
                                              {isOnline ? "En Línea" : "Offline"}
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
                                      const newName = prompt('Nuevo nombre:', teacher.name);
                                      if (newName && newName.trim()) {
                                        supabaseService.updateUserStats(teacher.id, { username: newName.trim() }).then(() => {
                                          loadUsers();
                                          toast.success("Nombre actualizado.");
                                        }).catch(console.error);
                                      }
                                    }}
                                    className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUserToDelete({ id: teacher.id, name: teacher.name, role: "Docente" });
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
                                            selectedGroups: teacher.groups || [],
                                            selectedSubjects: teacher.subjects || [],
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
                        ) : (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <button 
                                onClick={() => setShowCreateUserModal({ isOpen: true, role: "Student" })}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-95">
                                <Plus size={18} /> Nuevo Alumno
                              </button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-md">
                               <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                   <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Listado de Alumnos</h4>
                               </div>
                               <div className="overflow-x-auto transform-gpu pb-2">
                                   {/* Desktop Table View */}
                                   <table className="w-full text-left hidden md:table">
                                      <thead className="bg-slate-800/50 border-b border-slate-700">
                                        <tr>
                                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Alumno</th>
                                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Grado/Grupo</th>
                                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tokens</th>
                                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800">
                                          {allStudents.map(student => (
                                              <tr key={student.username} className="hover:bg-slate-800/30 transition-colors group">
                                                 <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                      {(() => {
                                                         const isOnline = student.lastActive && (new Date().getTime() - new Date(student.lastActive).getTime() < 300000);
                                                         return (
                                                           <div className={cn(
                                                             "w-2 h-2 rounded-full shrink-0",
                                                             isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                                                           )} />
                                                         );
                                                      })()}
                                                      <span className="text-sm font-bold text-slate-200">{student.username}</span>
                                                    </div>
                                                 </td>
                                                 <td className="px-8 py-6 text-sm text-indigo-400 font-bold uppercase">{student.grade}</td>
                                                 <td className="px-8 py-6 text-sm text-amber-500 font-black flex items-center gap-1.5"><Coins size={14} className="text-amber-500"/> {student.tokens}</td>
                                                 <td className="px-8 py-6 text-right">
                                                   <div className="flex items-center justify-end gap-2">
                                                       <button
                                                          onClick={() => {
                                                             const action = prompt(`Editar datos de ${student.username}:\n1. Editar Nombre\n2. Editar Grupo\n3. Editar Tokens\nIngresa 1, 2 o 3:`);
                                                             if (action === '1') {
                                                                const newName = prompt('Nuevo nombre:', student.username);
                                                                if (newName && newName.trim() && student.id) {
                                                                   supabaseService.updateUserStats(student.id, { username: newName.trim() }).then(() => {
                                                                      loadUsers();
                                                                      toast.success("Nombre actualizado.");
                                                                   }).catch(console.error);
                                                                }
                                                             } else if (action === '2') {
                                                                const newGrp = prompt('Nuevo grupo (ej. 2A):', student.grade);
                                                                if (newGrp && newGrp.trim() && student.id) {
                                                                   supabaseService.updateUserStats(student.id, { grade: newGrp.trim() as any }).then(() => {
                                                                      loadUsers();
                                                                      toast.success("Grupo actualizado.");
                                                                   }).catch(console.error);
                                                                }
                                                             } else if (action === '3') {
                                                                const newTokens = prompt('Nuevos tokens:', String(student.tokens));
                                                                if (newTokens !== null && !isNaN(parseInt(newTokens)) && student.id) {
                                                                   supabaseService.updateUserStats(student.id, { tokens: parseInt(newTokens) }).then(() => {
                                                                      loadUsers();
                                                                      toast.success("Tokens actualizados.");
                                                                   }).catch(console.error);
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
                                                            setUserToDelete({ id: student.id, name: student.username, role: "Alumno" });
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
                                      {allStudents.map(student => (
                                        <div key={student.username} className="p-5 space-y-4">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alumno</p>
                                              <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-200">{student.username}</p>
                                                {(() => {
                                                   const isOnline = student.lastActive && (new Date().getTime() - new Date(student.lastActive).getTime() < 300000);
                                                   return (
                                                     <div className={cn(
                                                       "w-1.5 h-1.5 rounded-full shrink-0 mt-0.5",
                                                       isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                                                     )} />
                                                   );
                                                })()}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grado/Grupo</p>
                                              <p className="text-sm text-indigo-400 font-black uppercase">{student.grade}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center justify-between bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-amber-500/10 rounded-xl">
                                                <Coins size={18} className="text-amber-500" />
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tokens</p>
                                                <p className="text-lg text-amber-500 font-black leading-none">{student.tokens}</p>
                                              </div>
                                                        <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => {
                                                  const action = prompt(`Editar datos de ${student.username}:\n1. Editar Nombre\n2. Editar Grupo\n3. Editar Tokens\nIngresa 1, 2 o 3:`);
                                                  if (action === '1') {
                                                    const newName = prompt('Nuevo nombre:', student.username);
                                                    if (newName && newName.trim() && student.id) {
                                                      supabaseService.updateUserStats(student.id, { username: newName.trim() }).then(() => {
                                                        loadUsers();
                                                        toast.success("Nombre actualizado.");
                                                      }).catch(console.error);
                                                    }
                                                  } else if (action === '2') {
                                                    const newGrp = prompt('Nuevo grupo (ej. 2A):', student.grade);
                                                    if (newGrp && newGrp.trim() && student.id) {
                                                      supabaseService.updateUserStats(student.id, { grade: newGrp.trim() as any }).then(() => {
                                                        loadUsers();
                                                        toast.success("Grupo actualizado.");
                                                      }).catch(console.error);
                                                    }
                                                  } else if (action === '3') {
                                                    const newTokens = prompt('Nuevos tokens:', String(student.tokens));
                                                    if (newTokens !== null && !isNaN(parseInt(newTokens)) && student.id) {
                                                      supabaseService.updateUserStats(student.id, { tokens: parseInt(newTokens) }).then(() => {
                                                        loadUsers();
                                                        toast.success("Tokens actualizados.");
                                                      }).catch(console.error);
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
                                                    setUserToDelete({ id: student.id, name: student.username, role: "Alumno" });
                                                  }
                                                }}
                                                className="text-rose-400 hover:text-rose-300 font-bold p-2.5 bg-rose-500/10 rounded-xl transition-all border border-rose-500/20"
                                              >
                                                <Trash2 size={18} />
                                              </button>
                                            </div>
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
                        )}
                      </div>
                    ) : stats.role === "Teacher" ? (
                      /* TEACHER DASHBOARD (HOME) */
                      <div className="space-y-12">
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 text-left">
                          <div>
                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600 pb-2 px-1">
                              Aula Maestro
                            </h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                              Sede de Control Académico y Desempeño
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all border border-slate-700 active:scale-95">
                              <BarChart3 size={18} /> Reporte Grupal
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-cyan-600/20 active:scale-95">
                              <Plus size={18} /> Nuevo Desafío
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {[
                            {
                              label: "Alumnos a Cargo",
                              val: globalStudents.filter(s => {
                                // A student is "under charge" if the teacher has AT LEAST ONE subject assignment for that student's group
                                return stats.assignedSubjects.some(sub => sub.split(":")[1] === s.grade) || stats.assignedGroups.includes(s.grade);
                              }).length.toString(),
                              icon: (
                                <Users size={24} className="text-indigo-400" />
                              ),
                            },
                            {
                              label: "Misiones Resueltas",
                              val: globalStudents.filter(s => {
                                return stats.assignedSubjects.some(sub => sub.split(":")[1] === s.grade) || stats.assignedGroups.includes(s.grade);
                              }).reduce((acc, curr) => acc + curr.completedTasks.length, 0).toString(),
                              icon: (
                                <FileCheck
                                  size={24}
                                  className="text-emerald-400"
                                />
                              ),
                            },
                            {
                              label: "Tokens Obtenidos",
                              val: globalStudents.filter(s => {
                                return stats.assignedSubjects.some(sub => sub.split(":")[1] === s.grade) || stats.assignedGroups.includes(s.grade);
                              }).reduce((acc, curr) => acc + curr.tokens, 0).toString(),
                              icon: (
                                <Coins
                                  size={24}
                                  className="text-amber-400"
                                />
                              ),
                            },
                            {
                              label: "Entregas por Revisar",
                              val: globalStudents.reduce((acc, s) => {
                                // Only count pending tasks for subjects assigned to that student's group
                                const relevantPending = (s.pendingTasks || []).filter(taskId => {
                                  // Find which subject this task belongs to
                                  for (const year in ACADEMIC_CONTENT) {
                                    for (const subject of ACADEMIC_CONTENT[year as Year]) {
                                      if (subject.topics.some(t => t.tasks.some(task => task.id === taskId))) {
                                        // Found subject. Is the teacher assigned to this subject+group?
                                        return stats.assignedSubjects.includes(`${subject.id}:${s.grade}`) || 
                                               (stats.assignedSubjects.includes(subject.id) && s.grade.startsWith(year));
                                      }
                                    }
                                  }
                                  return false;
                                });
                                return acc + relevantPending.length;
                              }, 0).toString(),
                              icon: (
                                <AlertCircle
                                  size={24}
                                  className="text-rose-400"
                                />
                              ),
                            },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-lg group hover:border-slate-700 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                  {stat.icon}
                                </div>
                                <span className="text-3xl font-black italic text-white tracking-widest">
                                  {stat.val}
                                </span>
                              </div>
                              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                {stat.label}
                              </p>
                            </div>
                          ))}
                        </div>

                        {(() => {
                          const studentsWithRelevantTasks = globalStudents.filter(s => {
                            const relevantPending = (s.pendingTasks || []).filter(taskId => {
                              for (const year in ACADEMIC_CONTENT) {
                                for (const subject of ACADEMIC_CONTENT[year as Year]) {
                                  if (subject.topics.some(t => t.tasks.some(task => task.id === taskId))) {
                                    return stats.assignedSubjects.includes(`${subject.id}:${s.grade}`) || 
                                           (stats.assignedSubjects.includes(subject.id) && s.grade.startsWith(year));
                                  }
                                }
                              }
                              return false;
                            });
                            return relevantPending.length > 0;
                          });

                          if (studentsWithRelevantTasks.length === 0) return null;

                          return (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-6 md:p-8 space-y-6">
                              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-3">
                                <AlertCircle size={24} /> Entregas Pendientes
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentsWithRelevantTasks.map(student => {
                                  const relevantPendingTasks = (student.pendingTasks || []).filter(taskId => {
                                    for (const year in ACADEMIC_CONTENT) {
                                      for (const subject of ACADEMIC_CONTENT[year as Year]) {
                                        if (subject.topics.some(t => t.tasks.some(task => task.id === taskId))) {
                                          return stats.assignedSubjects.includes(`${subject.id}:${student.grade}`) || 
                                                 (stats.assignedSubjects.includes(subject.id) && student.grade.startsWith(year));
                                        }
                                      }
                                    }
                                    return false;
                                  });

                                  return (
                                    <div key={student.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1 text-left">
                                          <h4 className="font-bold text-slate-200">{student.name}</h4>
                                          <span className="text-xs font-black tracking-widest uppercase text-indigo-400">{student.grade}</span>
                                        </div>
                                        <div className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-black">
                                           {relevantPendingTasks.length} tareas
                                        </div>
                                      </div>
                                      <div className="space-y-3 pt-4 border-t border-slate-800">
                                        {relevantPendingTasks.map(taskId => {
                                          // Find task details
                                          const taskDetails = Object.values(ACADEMIC_CONTENT).flat().flatMap(s => s.topics).flatMap(t => t.tasks).find(t => t.id === taskId);
                                          if (!taskDetails) return null;
                                          return (
                                            <div key={taskId} className="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-3">
                                              <div className="text-sm font-bold text-slate-300 italic text-left">{taskDetails.title}</div>
                                              <div className="flex items-center gap-3">
                                                <button 
                                                  onClick={() => {
                                                    const targetUserStats = rawStudents.find(u => u.id === student.id);
                                                    if (!targetUserStats) return;
                                                    const updatedStats = { ...targetUserStats };
                                                    updatedStats.pendingTasks = updatedStats.pendingTasks?.filter(id => id !== taskId);
                                                    updatedStats.completedTasks = [...(updatedStats.completedTasks || []), taskId];
                                                    if (taskDetails.reward.tokens) updatedStats.tokens += taskDetails.reward.tokens;
                                                    if (taskDetails.reward.cardId && !updatedStats.collection.includes(taskDetails.reward.cardId)) {
                                                      updatedStats.collection.push(taskDetails.reward.cardId);
                                                    }
                                                    // Sync to Supabase
                                                    if (targetUserStats.id) {
                                                      supabaseService.updateUserStats(targetUserStats.id, updatedStats).then(async () => {
                                                        // Send notification to student
                                                        await supabaseService.sendNotification(
                                                          targetUserStats.id!,
                                                          'Tarea Aprobada',
                                                          `Tu tarea "${taskDetails.title}" ha sido aprobada. ¡Recibiste tus recompensas!`,
                                                          'success'
                                                        );
                                                        loadUsers();
                                                        toast.success('Entrada aprobada, recompensas enviadas al alumno.');
                                                      }).catch(console.error);
                                                    }
                                                  }}
                                                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2 rounded-xl flex justify-center items-center gap-2 transition-colors border border-emerald-500/30">
                                                  <CheckCircle2 size={14} /> Aprobar
                                                </button>
                                                <button 
                                                  onClick={() => {
                                                    const targetUserStats = rawStudents.find(u => u.id === student.id);
                                                    if (!targetUserStats) return;
                                                    const updatedStats = { ...targetUserStats };
                                                    updatedStats.pendingTasks = updatedStats.pendingTasks?.filter(id => id !== taskId);
                                                    
                                                    if (targetUserStats.id) {
                                                      supabaseService.updateUserStats(targetUserStats.id, updatedStats).then(async () => {
                                                        // Send notification to student
                                                        await supabaseService.sendNotification(
                                                          targetUserStats.id!,
                                                          'Tarea Rechazada',
                                                          `Tu tarea "${taskDetails.title}" no fue aprobada. Por favor, revisa tus respuestas e inténtalo de nuevo.`,
                                                          'error'
                                                        );
                                                        loadUsers();
                                                        toast.error('Entrada rechazada, el alumno deberá intentarlo de nuevo.');
                                                      }).catch(console.error);
                                                    }
                                                  }}
                                                  className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs py-2 rounded-xl flex justify-center items-center gap-2 transition-colors border border-rose-500/30">
                                                  <Trash2 size={14} /> Rechazar
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
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
                                Demuestra qué tanto sabes de cultura general para ganar puntos.
                              </p>
                              <div className="flex flex-wrap gap-4 mt-8 justify-start">
                                <button
                                  onClick={() => {
                                    if (hasCompletedDaily || sessionCompletedChallenges.has(currentChallenge.id)) {
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
                                      <Loader2 size={18} className="animate-spin text-slate-500" />
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
                                    .filter(s => s.grade === stats.grade)
                                    .sort((a, b) => b.tokens - a.tokens)
                                    .slice(0, 10)
                                    .map((student, i) => (
                                    <button
                                      key={student.id}
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
                                        {allAvailableCards.filter(
                                          (c) =>
                                            c.category === rankingSubTab &&
                                            selectedStudent.collection.includes(
                                              c.id,
                                            ),
                                        ).map((card) => {
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
                    className="space-y-12 pb-32"
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
                            {allAvailableCards.filter(
                              (c) => c.category === collectionSubTab,
                            ).map((card) => (
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
                            const hasIntegration = assigned.some((sid) => sid.startsWith("int_cur_"));

                            let subjectNamesWithIds: { id: string; name: string }[] = [];

                            if (hasIntegration) {
                              // Handle Integration Curricular
                              const integratedYears = assigned
                                .filter((sid) => sid.startsWith("int_cur_"))
                                .map((sid) => sid.split("_")[2]);

                              const allUniqueSubjects = new Map<string, string>();
                              integratedYears.forEach((year) => {
                                const content = ACADEMIC_CONTENT[year as Year] || [];
                                content.forEach((s) => allUniqueSubjects.set(s.id, s.name));
                              });

                              assigned.forEach((sid) => {
                                // Extract base ID if it's the new format subjectId:groupId
                                const baseId = sid.includes(":") ? sid.split(":")[0] : sid;
                                for (const y in ACADEMIC_CONTENT) {
                                  const s = (ACADEMIC_CONTENT[y as Year] || []).find((sub) => sub.id === baseId);
                                  if (s) allUniqueSubjects.set(baseId, s.name);
                                }
                              });

                              subjectNamesWithIds = Array.from(allUniqueSubjects.entries()).map(([id, name]) => ({ id, name }));
                            } else {
                              const uniqueBaseIds = Array.from(new Set(assigned.map((sid) => (sid.includes(":") ? sid.split(":")[0] : sid))));
                              subjectNamesWithIds = uniqueBaseIds
                                .map((sid) => {
                                  for (const year in ACADEMIC_CONTENT) {
                                    const yearContent = ACADEMIC_CONTENT[year as Year];
                                    if (yearContent) {
                                      const sub = yearContent.find((s) => s.id === sid);
                                      if (sub) return { id: sid, name: sub.name };
                                    }
                                  }
                                  return null;
                                })
                                .filter((x): x is { id: string; name: string } => x !== null);
                            }

                            return subjectNamesWithIds.map((subjectInfo) => {
                              if (!subjectInfo) return null;
                              const { id: sid, name: subjectName } = subjectInfo;

                              const subjectYear = sid.split("_")[1] || "1";
                              
                              // New granular logic:
                              // If there's any mapping for this subject in the format 'subjectId:groupId', use those.
                              // Otherwise, fall back to matching by year.
                              const specificMappings = (stats.assignedSubjects || [])
                                .filter(s => s.startsWith(`${sid}:`))
                                .map(s => s.split(':')[1]);
                              
                              const groupsForSubject = specificMappings.length > 0
                                ? specificMappings
                                : (stats.assignedGroups || []).filter((g) => g.startsWith(subjectYear));

                              if (groupsForSubject.length === 0) return null;

                              return (
                                <div key={sid} className="space-y-6">
                                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 flex items-center gap-3 px-1 border-b border-slate-800 pb-4">
                                    <BookOpenCheck size={20} className="text-indigo-400" />
                                    {subjectName} ({subjectYear}º Año)
                                  </h3>
                                  <div className="flex flex-wrap gap-4">
                                    {groupsForSubject.map((group) => {
                                      const isSelected = selectedTeacherGroup === group;
                                      return (
                                        <button
                                          key={group}
                                          onClick={() => setSelectedTeacherGroup(group)}
                                          className={cn(
                                            "px-6 py-4 rounded-3xl flex flex-col items-start gap-1 transition-all border-2 text-left",
                                            isSelected
                                              ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20"
                                              : "bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800",
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              "font-black italic uppercase tracking-tight text-xl",
                                              isSelected ? "text-cyan-400" : "text-slate-100",
                                            )}
                                          >
                                            Grupo {group}
                                          </span>
                                          <span
                                            className={cn(
                                              "text-[10px] font-black uppercase tracking-widest",
                                              isSelected ? "text-indigo-400" : "text-slate-500",
                                            )}
                                          >
                                            {globalStudents.filter((s) => s.grade === group).length} Alumnos
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            });
                          })()}

                      {selectedTeacherGroup && (
                          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-md mt-8">
                            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                              <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                                Alumnos de {selectedTeacherGroup}
                              </h4>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {globalStudents.filter(s => s.grade === selectedTeacherGroup).length} Alumnos Activos
                              </div>
                            </div>
                            <div className="flex flex-col divide-y divide-slate-800/50">
                              {globalStudents.filter(s => s.grade === selectedTeacherGroup).map((student) => {
                                const studentData = student as Student;
                                const isOnline = (studentData.tokens % 3 === 0) || (studentData.streak > 8);
                                const yearKey = (student.grade?.[0] || "1") as Year;
                                const studentGrade = student.grade;
                                
                                const hasIntegrationThisYear = (stats.assignedSubjects || []).some(s => {
                                  const baseId = s.includes(':') ? s.split(':')[0] : s;
                                  const group = s.includes(':') ? s.split(':')[1] : null;
                                  return baseId === `int_cur_${yearKey}` && (!group || group === studentGrade);
                                });
                                
                                // Override subjects to check based on integration status and granular assignments
                                const specificSubjectsForThisGrade = (stats.assignedSubjects || [])
                                  .filter(s => s.includes(':') ? s.split(':')[1] === studentGrade : false)
                                  .map(s => s.split(':')[0]);
                                
                                const legacySubjects = (stats.assignedSubjects || [])
                                  .filter(s => !s.includes(':'));

                                const baseSubjects = [...new Set([...specificSubjectsForThisGrade, ...legacySubjects])];

                                const subjectsToCheck = hasIntegrationThisYear 
                                  ? (ACADEMIC_CONTENT[yearKey] || []).map(s => s.id)
                                  : baseSubjects;

                                const totalTasks = (ACADEMIC_CONTENT[yearKey] || [])
                                  .filter((s) => subjectsToCheck.includes(s.id))
                                  .reduce((acc, s) => acc + s.topics.reduce((acc2, t) => acc2 + t.tasks.length, 0), 0);
                                
                                const completedTasksCount = studentData.completedTasks.filter((taskId) =>
                                  subjectsToCheck.some((subId) =>
                                    (ACADEMIC_CONTENT[yearKey] || [])
                                      .find((s) => s.id === subId)
                                      ?.topics.some((t) => t.tasks.some((task) => task.id === taskId))
                                  )
                                ).length;
                                
                                const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
                                return (
                                  <div
                                    key={student.id}
                                    className="p-4 md:p-6 hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group"
                                  >
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="relative mt-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-slate-800 overflow-hidden relative">
                                          {student.avatar ? (
                                            <img
                                              src={student.avatar}
                                              alt={student.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <span className="text-white font-black text-sm uppercase">
                                              {student.name.charAt(0)}
                                            </span>
                                          )}
                                        </div>
                                        {isOnline ? (
                                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-lg"></div>
                                        ) : (
                                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-500 border-2 border-slate-900 rounded-full"></div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="font-bold text-slate-200 text-sm md:text-base truncate block">
                                          {student.name}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-1 block truncate">
                                          {isOnline ? (
                                            <span className="text-emerald-400 flex items-center gap-1">En Línea</span>
                                          ) : (
                                            <span className="text-slate-500">Desconectado</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex-1 w-full md:w-auto">
                                      <div className="flex flex-col gap-2 w-full">
                                        <div className="flex justify-between items-end mb-0.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            Progreso del curso
                                          </span>
                                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                            {Math.round(progress)}% Dominio
                                          </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                          <div
                                            className="h-full bg-indigo-500 shadow-lg transition-all duration-1000"
                                            style={{
                                              width: `${progress}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end mt-2 md:mt-0 shrink-0">
                                      <button className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-indigo-600 hover:border-indigo-500 text-indigo-400 hover:text-white uppercase text-[10px] sm:text-[11px] font-black tracking-widest rounded-xl md:rounded-2xl transition-all border border-slate-700 shadow-sm active:scale-95 flex items-center justify-center gap-2">
                                        Detalles <ChevronRight size={14} className="hidden md:block opacity-70" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              {globalStudents.filter(s => s.grade === selectedTeacherGroup).length === 0 && (
                                <div className="p-12 border-t border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                                  <Users size={32} className="opacity-20 mb-4" />
                                  No hay alumnos en este grupo
                                </div>
                              )}
                            </div>
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
                          toast.success(`¡Carta canjeada! Muestra esto a tu profesor: ${card.name}`);
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
                    className="flex flex-col min-h-[calc(100dvh-12rem)] md:min-h-[calc(100dvh-14rem)] pb-20 justify-center space-y-2 md:space-y-6 text-center"
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
                          className={cn("flex overflow-x-auto transform-gpu lg:overflow-x-visible gap-4 sm:gap-6 lg:gap-12 px-[15vw] sm:px-[25vw] lg:px-4 py-8 md:py-12 no-scrollbar items-center justify-start lg:justify-center min-w-full cursor-grab lg:cursor-auto active:cursor-grabbing select-none h-auto items-stretch sm:items-center", isDraggingPack ? "" : "snap-x snap-mandatory lg:snap-none")}
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
                                    {pack.price} <Coins size={20} className="text-amber-400" />
                                  </button>
                                  <button
                                    onClick={() => setExchangePackId(pack.id)}
                                    className={cn(
                                      "px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center",
                                      "bg-slate-800 text-white hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500",
                                      !stats.packCurrencies?.[pack.id] && "opacity-50"
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
                  ownedCardIds={[...stats.collection, ...(stats.unstickedCards || [])]}
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
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Intercambio de Duplicadas</h3>
                      <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">Usa las monedas de sobres repetidos para comprar cartas específicas</p>
                    </div>

                    <div className="flex justify-center mb-8">
                       <div className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-6 py-3">
                         <Coins className={exchangePackId === 'pack_culiacan' ? 'text-rose-500' : exchangePackId === 'pack_six_seven' ? 'text-emerald-500' : 'text-slate-400'} size={20} />
                         <span className="font-black text-lg text-white">
                           {stats.packCurrencies?.[exchangePackId] || 0}
                         </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto transform-gpu pr-2 custom-scrollbar">
                      {allAvailableCards.filter(c => c.category === 'Collectible' && (c.sourcePackId || 'pack_jacobo') === exchangePackId).map(card => {
                         const isOwned = stats.collection.includes(card.id);
                         if (isOwned) return null; // Don't show owned cards

                         const cost = card.rarity === 'Legendary' || card.rarity === 'Secret' ? 1000 : card.rarity === 'Epic' ? 250 : card.rarity === 'Rare' ? 75 : 25;
                         const userCoins = stats.packCurrencies?.[exchangePackId] || 0;
                         const canAfford = userCoins >= cost;
                         const CurrencyIconClass = exchangePackId === 'pack_culiacan' ? 'text-rose-500' : exchangePackId === 'pack_six_seven' ? 'text-emerald-500' : 'text-slate-400';

                         return (
                           <div key={'store'+card.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-4 hover:border-emerald-500/50 transition-all hover:bg-slate-900 group">
                              <div className="w-full flex justify-center transform group-hover:scale-105 transition-transform duration-300 min-h-[140px] sm:min-h-[180px]">
                                <CardComponent card={card} isLocked={!canAfford} className="w-24 sm:w-32" />
                              </div>
                              <div className="text-center w-full flex flex-col justify-end flex-1 mt-auto">
                                <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-slate-300 truncate w-full mb-3">{card.name}</h4>
                                <button 
                                  onClick={() => {
                                    if (canAfford) {
                                      setStats(prev => ({
                                        ...prev,
                                        collection: [...prev.collection, card.id],
                                        packCurrencies: {
                                          ...prev.packCurrencies,
                                          pack_jacobo: prev.packCurrencies?.pack_jacobo || 0,
                                          pack_culiacan: prev.packCurrencies?.pack_culiacan || 0,
                                          pack_six_seven: prev.packCurrencies?.pack_six_seven || 0,
                                          [exchangePackId]: (prev.packCurrencies?.[exchangePackId] || 0) - cost
                                        }
                                      }));
                                    }
                                  }}
                                  disabled={!canAfford}
                                  className={cn("w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-lg", canAfford ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed")}
                                >
                                  {cost} <Coins size={14} className={CurrencyIconClass} />
                                </button>
                              </div>
                           </div>
                         );
                      })}
                      {allAvailableCards.filter(c => c.category === 'Collectible' && (c.sourcePackId || 'pack_jacobo') === exchangePackId && !stats.collection.includes(c.id)).length === 0 && (
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
                        isCompleted={sessionCompletedChallenges.has(currentChallenge.id)}
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
                            setPasswordForm({ current: "", new: "", confirm: "" });
                          }}
                          className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                          <input 
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                          <input 
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        disabled={isChangingPassword || !passwordForm.new || !passwordForm.confirm}
                        onClick={async () => {
                          if (passwordForm.new !== passwordForm.confirm) {
                            toast.error("Las contraseñas no coinciden");
                            return;
                          }
                          if (passwordForm.new.length < 6) {
                            toast.error("La contraseña debe tener al menos 6 caracteres");
                            return;
                          }

                          setIsChangingPassword(true);
                          try {
                            const { error } = await supabaseService.updatePassword(passwordForm.new);
                            if (error) throw error;
                            
                            toast.success("¡Contraseña actualizada exitosamente!");
                            setShowPasswordModal(false);
                            setPasswordForm({ current: "", new: "", confirm: "" });
                          } catch (err: any) {
                            toast.error(`Error: ${err.message || "No se pudo actualizar"}`);
                          } finally {
                            setIsChangingPassword(false);
                          }
                        }}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                          isChangingPassword || !passwordForm.new || !passwordForm.confirm
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20"
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
                              <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">Paso 1: Elige Año. Paso 2: Elige Materia. Paso 3: Elige Grupo.</p>
                            </div>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                              {(["1", "2", "3"] as Year[]).map((year) => (
                                <button
                                  key={year}
                                  onClick={() => setAssignmentModal(prev => ({ ...prev, activeYear: year }))}
                                  className={cn(
                                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    assignmentModal.activeYear === year
                                      ? "bg-slate-800 text-white shadow-md"
                                      : "text-slate-500 hover:text-slate-400"
                                  )}
                                >
                                  {year}º
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 transform-gpu scrollbar-thin scrollbar-thumb-slate-800">
                            {(ACADEMIC_CONTENT[assignmentModal.activeYear] || []).map((subject) => {
                              const isSubjectSelected = assignmentModal.selectedSubjects.some(s => s === subject.id || s.startsWith(`${subject.id}:`));
                              return (
                                <div key={subject.id} className={cn(
                                  "rounded-2xl border transition-all overflow-hidden",
                                  isSubjectSelected ? "bg-slate-800/40 border-indigo-500/30" : "bg-slate-800/10 border-slate-800"
                                )}>
                                  <button
                                    onClick={() => {
                                      setAssignmentModal((prev) => {
                                        const alreadySelected = prev.selectedSubjects.some(s => s === subject.id || s.startsWith(`${subject.id}:`));
                                        if (alreadySelected) {
                                          return {
                                            ...prev,
                                            selectedSubjects: prev.selectedSubjects.filter(s => s !== subject.id && !s.startsWith(`${subject.id}:`))
                                          };
                                        } else {
                                          return {
                                            ...prev,
                                            selectedSubjects: [...prev.selectedSubjects, subject.id]
                                          };
                                        }
                                      });
                                    }}
                                    className="w-full p-4 flex items-center justify-between group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        isSubjectSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                                      )}>
                                        <BookOpen size={16} />
                                      </div>
                                      <span className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        isSubjectSelected ? "text-white" : "text-slate-400"
                                      )}>{subject.name}</span>
                                    </div>
                                    <div className={cn(
                                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                      isSubjectSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-700"
                                    )}>
                                      {isSubjectSelected && <Check size={12} className="text-white" />}
                                    </div>
                                  </button>

                                  {isSubjectSelected && (
                                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-800/50">
                                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Elegir Grupos:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {SCHOOL_GROUPS.filter(g => g.startsWith(assignmentModal.activeYear)).map(g => {
                                          const isMapped = assignmentModal.selectedSubjects.includes(`${subject.id}:${g}`);
                                          // Also consider it selected if subject.id is there (legacy format means "all groups of this year")
                                          // but we want to encourage specific mapping now
                                          const isActive = isMapped || (assignmentModal.selectedSubjects.includes(subject.id) && g.startsWith(assignmentModal.activeYear));
                                          
                                          return (
                                            <button
                                              key={g}
                                              onClick={() => {
                                                setAssignmentModal(prev => {
                                                  const newSubs = [...prev.selectedSubjects];
                                                  const mapping = `${subject.id}:${g}`;
                                                  
                                                  // If base subject is there, it implies all groups. 
                                                  // Let's replace base subject with specific mappings to be more granular as requested.
                                                  let filtered = newSubs.filter(s => s !== subject.id);
                                                  
                                                  if (filtered.includes(mapping)) {
                                                    filtered = filtered.filter(s => s !== mapping);
                                                  } else {
                                                    filtered.push(mapping);
                                                  }

                                                  return { ...prev, selectedSubjects: filtered };
                                                });
                                              }}
                                              className={cn(
                                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                isActive 
                                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10"
                                                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
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
                            const newSubjects = assignmentModal.selectedSubjects;
                            const derivedGroupsFromSubjects = newSubjects
                              .filter(s => s.includes(':'))
                              .map(s => s.split(':')[1] as Grade);
                            
                            // Groups are now strictly derived from subject mappings to prevent "broadcasting"
                            const newGroups = Array.from(new Set(derivedGroupsFromSubjects));
                            
                            const updatePromise = supabaseService.updateUserStats(assignmentModal.teacherId, {
                              assignedGroups: newGroups,
                              assignedSubjects: newSubjects
                            });

                            toast.promise(updatePromise, {
                              loading: 'Guardando cambios...',
                              success: () => {
                                loadUsers();
                                
                                // If current user is the one being updated, update local stats too
                                if (assignmentModal.teacherId === currentUserId || assignmentModal.teacherId === stats.id) {
                                  setStats(prev => ({
                                    ...prev,
                                    assignedGroups: newGroups,
                                    assignedSubjects: newSubjects
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
                              error: 'Error al actualizar la asignación.'
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
                            Nuevo {showCreateUserModal.role === "Teacher" ? "Docente" : "Alumno"}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowCreateUserModal({ isOpen: false, role: "Teacher" });
                            setCreateUserForm({ username: "", email: "", password: "", grade: "" });
                          }}
                          className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                          <input 
                            type="text"
                            value={createUserForm.username}
                            onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                          <input 
                            type="email"
                            value={createUserForm.email}
                            onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                          <input 
                            type="password"
                            value={createUserForm.password}
                            onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 font-mono"
                          />
                        </div>
                        {showCreateUserModal.role === "Student" && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grado/Grupo Primario</label>
                            <input 
                              type="text"
                              value={createUserForm.grade}
                              onChange={(e) => setCreateUserForm(prev => ({ ...prev, grade: e.target.value }))}
                              placeholder="Ej. 1A"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700 uppercase"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        disabled={isCreatingUser || !createUserForm.email || !createUserForm.password || !createUserForm.username}
                        onClick={async () => {
                          setIsCreatingUser(true);
                          try {
                            await supabaseService.adminCreateUser({
                              email: createUserForm.email,
                              password: createUserForm.password,
                              username: createUserForm.username,
                              role: showCreateUserModal.role,
                              grade: createUserForm.grade || '1',
                              assignedGroups: []
                            });
                            
                            toast.success(`¡${showCreateUserModal.role === "Teacher" ? "Docente" : "Alumno"} creado exitosamente!`);
                            setShowCreateUserModal({ isOpen: false, role: "Teacher" });
                            setCreateUserForm({ username: "", email: "", password: "", grade: "" });
                            loadUsers();
                          } catch (err: any) {
                            toast.error(`Error: ${err.message || "No se pudo crear el usuario"}`);
                          } finally {
                            setIsCreatingUser(false);
                          }
                        }}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                          isCreatingUser || !createUserForm.email || !createUserForm.password || !createUserForm.username
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20"
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
                          Estás a punto de borrar a <span className="text-white font-bold">{userToDelete.name}</span> ({userToDelete.role}). Esta acción no se puede deshacer.
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
                            toast.success(`${userToDelete.role} eliminado con éxito.`);
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
