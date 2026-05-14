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
  ChevronDown,
  Camera,
  Brain,
  History,
  Repeat,
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
} from "./types";
import {
  INITIAL_CARDS,
  INITIAL_CHALLENGE,
  ACADEMIC_CONTENT,
  SCHOOL_GROUPS,
  MOCK_STUDENTS as IMPORTED_MOCK_STUDENTS,
  INITIAL_PACKS,
} from "./constants";
import { cn } from "./lib/utils";
import { playCoinSound } from "./lib/sounds";

export type Student = {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  collection: string[];
  completedTasks: string[];
  streak: number;
  tokens: number;
};

export type TeacherModel = {
  id: string;
  name: string;
  subjects: string[];
  groups: string[];
  students: number;
  status: string;
};

const MOCK_TEACHERS: TeacherModel[] = [
  {
    id: "t1",
    name: "Prof. Javier Méndez",
    subjects: ["math_2"],
    groups: ["2A", "2B"],
    students: 45,
    status: "Active",
  },
  {
    id: "t2",
    name: "Dra. Elena Rossi",
    subjects: ["span_2"],
    groups: ["2C"],
    students: 38,
    status: "Active",
  },
  {
    id: "t3",
    name: "Alquimista Maestro",
    subjects: [],
    groups: [],
    students: 0,
    status: "On Leave",
  },
];

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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none text-emerald-400 font-black text-xs sm:text-sm drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] z-50 flex items-center justify-center whitespace-nowrap"
          >
            +{anim.diff} <Coins size={10} className="ml-0.5" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
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

  const [activeTab, setActiveTab] = useState<
    "home" | "collection" | "shop" | "challenges" | "profile"
  >("home");

  // NEW admin state
  const [allStudents, setAllStudents] = useState<UserStats[]>([]);
  useEffect(() => {
    const rawUsers: UserStats[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cardacademy_stats_')) {
           try {
               const stat: UserStats = JSON.parse(localStorage.getItem(key)!);
               if (stat) rawUsers.push(stat);
           } catch(e){}
        }
    }
    
    setAllStudents(rawUsers.filter(u => u.role === 'Student'));

    const computeStudents: Student[] = rawUsers.filter(u => u.role === 'Student').map(s => ({
        id: s.username || '',
        name: s.username || 'Alumno',
        grade: s.grade || '2A',
        collection: s.collection || [],
        completedTasks: s.completedTasks || [],
        streak: s.streak || 0,
        tokens: s.tokens || 0,
        avatar: undefined
    }));
    setGlobalStudents(computeStudents);

    const computeTeachers: TeacherModel[] = rawUsers.filter(u => u.role === 'Teacher').map(t => ({
        id: t.username || '',
        name: t.username || 'Profesor',
        subjects: t.assignedSubjects || [],
        groups: t.assignedGroups || [],
        students: 30,
        status: 'Active'
    }));

    const isDemo = currentUser?.toLowerCase().includes('demo') || currentUser?.toLowerCase() === 'admin' || stats?.username?.toLowerCase().includes('demo') || stats?.username?.toLowerCase() === 'admin';
    if (isDemo) {
        const teacherMap = new Map();
        MOCK_TEACHERS.forEach(t => teacherMap.set(t.id, t));
        computeTeachers.forEach(t => teacherMap.set(t.id, t));
        setTeachers(Array.from(teacherMap.values()));
    } else {
        setTeachers(computeTeachers);
    }
  }, [stats.role, stats.username, currentUser, adminDashboardTab]);

  const MOCK_STUDENTS = React.useMemo(() => {
      const isDemo = currentUser?.toLowerCase().includes('demo') || currentUser?.toLowerCase() === 'admin' || stats?.username?.toLowerCase().includes('demo') || stats?.username?.toLowerCase() === 'admin';
      const map = new Map<string, Student>();
      if (isDemo) {
          IMPORTED_MOCK_STUDENTS.forEach(s => map.set(s.id, s));
      }
      globalStudents.forEach(s => map.set(s.id, s));
      return Array.from(map.values());
  }, [globalStudents, currentUser, stats.username]);

  const [selectedAdminCard, setSelectedAdminCard] = useState<CardType | null>(
    null,
  );
  const [collectionSubTab, setCollectionSubTab] = useState<
    "Collectible" | "Achievement" | "Reward"
  >("Collectible");
  const [rankingSubTab, setRankingSubTab] = useState<
    "Collectible" | "Achievement" | "Reward"
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
      alert(
        `Hubo un error al generar el quiz con IA: ${errorMessage}. Por favor intenta de nuevo.`,
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Load from local storage
  useEffect(() => {
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

    const completed = localStorage.getItem("cardacademy_challenge_completed");
    if (completed === new Date().toDateString()) setHasCompletedDaily(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`cardacademy_stats_${currentUser}`, JSON.stringify(stats));
    }
  }, [stats, currentUser]);

  const handleLogin = (role: UserRole, username: string, grade?: string) => {
    const freshUser = username || 'Alumno';
    setCurrentUser(freshUser);
    localStorage.setItem("cardacademy_current_user", freshUser);
    
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
            ? ["tec_2", "art_3"]
            : role === "Admin"
              ? []
              : ["math_2"],
        assignedGroups:
          role === "Teacher"
            ? ["2D", "3A", "3B", "3C", "3D"]
            : role === "Admin"
              ? []
              : [(grade as any) || "2A"],
      });
      
      // Admin notification for new student
      if (role === 'Student') {
        const adminNotif = localStorage.getItem('cardacademy_admin_notifs') || '[]';
        const notifs = JSON.parse(adminNotif);
        notifs.push({
          id: Date.now().toString(),
          type: 'new_student',
          student: freshUser,
          grade: (grade as any) || "2A",
          date: new Date().toISOString()
        });
        localStorage.setItem('cardacademy_admin_notifs', JSON.stringify(notifs));
      }
    }
    
    setIsAuthenticated(true);
    localStorage.setItem("cardacademy_is_authenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
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
      alert(`¡Obtuviste ${duplicateCount} carta(s) repetida(s)! Ganaste ${duplicatePoints} moneda(s) para la tienda.`);
    }

    setAnimatingCards(trulyNewCardIds);
  };

  const buyPack = (pack: Pack) => {
    if (stats.tokens >= pack.price) {
      setStats((prev) => ({ ...prev, tokens: prev.tokens - pack.price }));
      setActivePack(pack);
      setShowPackOpener(true);
    } else {
      alert(`Medallas insuficientes para adquirir ${pack.name}.`);
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
        alert(
          `¡Misión Cumplida! Has ganado: ${task.reward.tokens ? `${task.reward.tokens} Medallas` : ""} ${task.reward.cardId ? " y una Nueva Tarjeta" : ""}`,
        );
      }

      return newStats;
    });
  };

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = INITIAL_CARDS.find((c) => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage onLogin={handleLogin} />
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
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
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
                      className="w-[280px] sm:w-[320px] aspect-[2/3] max-w-full shadow-[0_0_50px_rgba(79,70,229,0.3)]"
                    />
                    <button
                      onClick={() => setSelectedCardId(null)}
                      className="bg-slate-800 text-white px-10 py-3 rounded-full font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-colors shadow-xl"
                    >
                      Regresar
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Header */}
            <nav className="h-16 md:h-20 bg-slate-900/80 border-b border-indigo-500/30 sticky top-0 z-30 px-3 md:px-6 flex items-center justify-center">
              <div className="absolute inset-0 -z-10 backdrop-blur-md pointer-events-none"></div>
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
                        <p className="hidden md:flex text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] items-center gap-2 font-mono leading-none">
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
                      <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-1.5 py-1 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] shrink min-w-0">
                        <Flame className="text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" size={14} />
                        <span className="text-rose-400 font-black font-mono text-xs tracking-tighter drop-shadow-md truncate">
                          {stats.streak}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Mobile Left Teacher Students Online */}
                  {stats.role === "Teacher" && (
                    <div className="flex md:hidden items-center gap-1 sm:gap-3 shrink min-w-0">
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/30 shrink min-w-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <span className="text-[10px] uppercase text-indigo-300 font-black tracking-widest hidden sm:inline-block">Alumnos</span>
                        <span className="text-[10px] uppercase text-indigo-300 font-black tracking-widest sm:hidden">Alum.</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-indigo-400 font-black font-mono text-xs tracking-tighter truncate">
                          {MOCK_STUDENTS.filter(s => stats.assignedGroups.includes(s.grade) && ((s.tokens % 3 === 0) || (s.streak > 8))).length}
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
                      <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] shrink min-w-0">
                        <Flame className="text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" size={14} />
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
                      <div className="flex items-center gap-2.5 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink min-w-0">
                        <span className="text-[11px] uppercase text-indigo-300 font-black tracking-widest">
                          Alumnos
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-indigo-400 font-black font-mono text-base tracking-tighter truncate">
                          {MOCK_STUDENTS.filter(s => stats.assignedGroups.includes(s.grade) && ((s.tokens % 3 === 0) || (s.streak > 8))).length}
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
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ originX: 1, originY: 0 }}
                            className={cn(
                              "fixed top-[72px] inset-x-4 mx-auto w-auto max-w-[320px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 sm:max-w-none bg-slate-900 border-2 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col",
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
                            <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest">
                              2 NUEVAS
                            </span>
                          </div>
                          <div className="max-h-[60vh] overflow-y-auto no-scrollbar bg-slate-900">
                            {stats.role === "Student" ? (
                              <>
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    El profesor{" "}
                                    <span className="font-bold text-indigo-400">
                                      Juan Pérez
                                    </span>{" "}
                                    ha marcado tu desafío de Matemáticas como
                                    completado.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 10 min
                                  </span>
                                </div>
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    El profesor{" "}
                                    <span className="font-bold text-rose-400">
                                      Ana Gómez
                                    </span>{" "}
                                    no aprobó tu evidencia. Revisa los
                                    comentarios.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 2 horas
                                  </span>
                                </div>
                              </>
                            ) : stats.role === "Teacher" ? (
                              <>
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    El alumno{" "}
                                    <span className="font-bold text-emerald-400">
                                      Carlos M.
                                    </span>{" "}
                                    ha subido evidencia para el desafío de
                                    Física.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 5 min
                                  </span>
                                </div>
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    El alumno{" "}
                                    <span className="font-bold text-emerald-400">
                                      Laura T.
                                    </span>{" "}
                                    ha subido evidencia para el desafío de
                                    Química.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 1 hora
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                {JSON.parse(localStorage.getItem('cardacademy_admin_notifs') || '[]').reverse().map((n: any) => (
                                  <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden">
                                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                     <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                       <span className="text-emerald-400 font-bold">
                                         [NUEVO ALUMNO]
                                       </span>{" "}
                                       El alumno <strong className="text-white">{n.student}</strong> se ha registrado en el grupo <strong className="text-white">{n.grade}</strong>.
                                     </p>
                                     <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                        Hace un momento
                                     </span>
                                  </div>
                                ))}
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    <span className="text-amber-400 font-bold">
                                      [ALERTA]
                                    </span>{" "}
                                    El sistema de recompensas experimentó un
                                    retraso al procesar el último lote.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 1 min
                                  </span>
                                </div>
                                <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    <span className="text-rose-400 font-bold">
                                      [REPORTE]
                                    </span>{" "}
                                    Un usuario ha reportado un problema con el
                                    acceso a la colección.
                                  </p>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block tracking-widest group-hover:text-slate-400 transition-colors">
                                    Hace 3 horas
                                  </span>
                                </div>
                              </>
                            )}
                            <div className="p-3 text-center bg-slate-900">
                              <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors py-2">
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
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ originX: 1, originY: 0 }}
                            className={cn(
                              "fixed top-[72px] inset-x-4 mx-auto w-auto max-w-[280px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-64 sm:max-w-none bg-slate-900 border-2 rounded-3xl shadow-2xl overflow-hidden z-50 p-2",
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
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
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
                    <div className="bg-slate-900/50 border border-indigo-500/10 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl relative">
                      <div className="absolute top-0 inset-x-0 h-24 md:h-32 bg-gradient-to-r from-indigo-900/40 to-slate-900 z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                      </div>

                      <div className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                          <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[1.5rem] bg-slate-950 border-4 border-indigo-600 p-1 shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative group overflow-hidden">
                            <div className="w-full h-full rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-inner uppercase">
                              {stats.role.charAt(0)}
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white border-2 border-slate-950 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={14} />
                            </button>
                          </div>
                          <div className="flex-1 text-center md:text-left min-w-0 mt-2 md:mt-0">
                            <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                              <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight truncate">
                                SESIÓN_{stats.role.toUpperCase()}
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
                                    alert("Nombre actualizado exitosamente.");
                                 }
                               }}
                               className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95">
                              <Settings size={14} /> Config
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                      <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        {/* STATISTICS CARD */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden group">
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
                                    val: MOCK_STUDENTS.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.completedTasks.length, 0), // Simulating pending reviews for now
                                    color: "text-emerald-400",
                                  },
                                  {
                                    label: "Medallas de alumnos",
                                    val: MOCK_STUDENTS.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.tokens, 0),
                                    color: "text-amber-400",
                                  },
                                  {
                                    label: "Racha global",
                                    val: `${MOCK_STUDENTS.filter((s) => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.streak, 0)} Días`,
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
                                        val: `${Math.round((stats.collection.length / INITIAL_CARDS.length) * 100)}%`,
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
                                        "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                                        idx.bar,
                                      )}
                                    ></motion.div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* QUICK MENU */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 md:p-3 shadow-xl">
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
                          <button className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-emerald-500/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <ShieldCheck
                                size={18}
                                className="group-hover:text-emerald-400"
                              />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Privacidad
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
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
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
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 md:space-y-8">
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5 md:mb-6">
                              Administración Académica
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="bg-indigo-600 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-xl shadow-indigo-600/20 border-b-8 border-indigo-800">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 italic">
                                  Alumnos en Radar
                                </h4>
                                <p className="text-5xl md:text-6xl font-black italic leading-none">
                                  83
                                </p>
                              </div>
                              <div className="bg-slate-800 border border-slate-700 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 space-y-4 border-b-8 border-slate-950">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
                                  Misiones por Validar
                                </h4>
                                <p className="text-6xl font-black italic text-white leading-none">
                                  12
                                </p>
                              </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 md:mb-6 italic">
                                Materias Asignadas
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {stats.assignedSubjects.map((sid) => (
                                  <span
                                    key={sid}
                                    className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-black uppercase tracking-tighter text-white"
                                  >
                                    {sid.replace("_", " ").toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {stats.role === "Admin" && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 md:space-y-8">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
                                <ShieldCheck
                                  className="text-rose-400"
                                  size={26}
                                />{" "}
                                Protocolo Maestro
                              </h3>
                              <div className="flex gap-2">
                                <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">
                                  MASTER_ACCESS
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              {[
                                {
                                  label: "Usuarios",
                                  val: "412",
                                  color: "text-white",
                                },
                                {
                                  label: "Carga",
                                  val: "12%",
                                  color: "text-emerald-400",
                                },
                                {
                                  label: "Uptime",
                                  val: "99.9%",
                                  color: "text-indigo-400",
                                },
                              ].map((st) => (
                                <div
                                  key={st.label}
                                  className="bg-slate-800 border border-slate-700 p-5 md:p-6 rounded-2xl md:rounded-[2rem]"
                                >
                                  <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                    {st.label}
                                  </h4>
                                  <p
                                    className={cn(
                                      "text-3xl font-black italic",
                                      st.color,
                                    )}
                                  >
                                    {st.val}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="pt-8 border-t border-slate-800">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 italic">
                                Privilegios Inyectados
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  "Edit_All_Cards",
                                  "Assign_Teachers",
                                  "Store_Override",
                                  "Global_Broadcast",
                                  "Database_Wipe_Safe",
                                ].map((p) => (
                                  <span
                                    key={p}
                                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default"
                                  >
                                    {p}
                                  </span>
                                ))}
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
                      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 text-left">
                        <div className="px-2">
                          <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 pb-2 pr-2">
                            {stats.role === "Admin"
                              ? "Explorador Global"
                              : "Desafíos Académicos"}
                          </h2>
                          <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] mt-1">
                            {stats.role === "Admin"
                              ? "Control maestro de todas las materias"
                              : `Sincronización de Retos: Grupo ${stats.grade}`}
                          </p>
                        </div>

                        {stats.role === "Admin" && (
                          <div className="flex bg-slate-900/50 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 gap-1 overflow-x-auto no-scrollbar max-w-full">
                            {(["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D"] as Grade[]).map((g) => (
                              <button
                                key={g}
                                onClick={() => {
                                  setStats((prev) => ({ ...prev, grade: g }));
                                  setSelectedSubject(null);
                                  setSelectedTopic(null);
                                  setSelectedTask(null);
                                }}
                                className={cn(
                                  "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
                                  stats.grade[0] === g[0]
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-500 hover:text-slate-300",
                                )}
                              >
                                {g[0]} Año
                              </button>
                            ))}
                          </div>
                        )}

                        {stats.role === "Teacher" && (
                          <button
                            onClick={() =>
                              alert(
                                "Módulo de creación de desafíos: ¡Próximamente!",
                              )
                            }
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
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
                              subjects
                                .filter((s) => {
                                  if (stats.role === "Admin") return true;
                                  if (stats.role === "Teacher")
                                    return stats.assignedSubjects.includes(
                                      s.id,
                                    );
                                  return stats.grade[0] === grade;
                                })
                                .map((subject) => (
                                  <motion.button
                                    key={`${grade}-${subject.id}`}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      setSelectedSubject(subject.id)
                                    }
                                    className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-left hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-xl"
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
                                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
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
                                {
                                  ACADEMIC_CONTENT[stats.grade[0] as Year].find(
                                    (s) => s.id === selectedSubject,
                                  )?.name
                                }
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              {ACADEMIC_CONTENT[stats.grade[0] as Year]
                                .find((s) => s.id === selectedSubject)
                                ?.topics.map((topic) => (
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
                                ))}
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
                              {
                                ACADEMIC_CONTENT[stats.grade[0] as Year]
                                  .find((s) => s.id === selectedSubject)
                                  ?.topics.find((t) => t.id === selectedTopic)
                                  ?.name
                              }
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                              {ACADEMIC_CONTENT[stats.grade[0] as Year]
                                .find((s) => s.id === selectedSubject)
                                ?.topics.find((t) => t.id === selectedTopic)
                                ?.tasks.map((task) => {
                                  const isCompleted =
                                    stats.completedTasks.includes(task.id);
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
                                        "bg-slate-900 border p-6 rounded-[2.5rem] transition-all relative overflow-hidden shadow-xl",
                                        isCompleted
                                          ? "border-emerald-500/20 opacity-60"
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
                                            : "from-indigo-500 to-transparent",
                                        )}
                                      />

                                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                          <div className="flex flex-wrap items-center gap-4">
                                            <span
                                              className={cn(
                                                "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                config.color,
                                                config.border,
                                                config.bg,
                                              )}
                                            >
                                              {config.label}
                                            </span>
                                            {isCompleted && (
                                              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                                                <CheckCircle2 size={10} />{" "}
                                                Completado
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

                                        {!isCompleted && (
                                          <div className="flex flex-col gap-3">
                                            {!isTaskActive ? (
                                              <button
                                                onClick={() => {
                                                  // Check daily limits
                                                  if (stats.dailyLimits) {
                                                    if (task.difficulty === 'Easy' && stats.dailyLimits.easyCompleted >= 3) {
                                                      alert('Has alcanzado el límite diario de 3 desafíos básicos. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                    if (task.difficulty === 'Medium' && stats.dailyLimits.mediumCompleted >= 2) {
                                                      alert('Has alcanzado el límite diario de 2 desafíos intermedios. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                    if (task.difficulty === 'Hard' && stats.dailyLimits.hardCompleted >= 1) {
                                                      alert('Has alcanzado el límite diario de 1 desafío difícil. ¡Vuelve mañana!');
                                                      return;
                                                    }
                                                  }

                                                  setSelectedTask(task.id);
                                                  if (task.isAIQuiz) {
                                                    const subjectName =
                                                      ACADEMIC_CONTENT[
                                                        stats.grade[0] as Year
                                                      ].find(
                                                        (s) =>
                                                          s.id ===
                                                          selectedSubject,
                                                      )?.name || "";
                                                    const topicName =
                                                      ACADEMIC_CONTENT[
                                                        stats.grade[0] as Year
                                                      ]
                                                        .find(
                                                          (s) =>
                                                            s.id ===
                                                            selectedSubject,
                                                        )
                                                        ?.topics.find(
                                                          (t) =>
                                                            t.id ===
                                                            selectedTopic,
                                                        )?.name || "";
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
                                                                      alert(
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
                                                                      alert(
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
                                                                  alert(
                                                                    "¡Correcto! Desafío completado.",
                                                                  );
                                                                  completeTask(
                                                                    task,
                                                                  );
                                                                  setSelectedTask(
                                                                    null,
                                                                  );
                                                                } else {
                                                                  alert(
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
                                                          alert(
                                                            "Evidencia subida correctamente. El profesor validará tu desafío.",
                                                          );
                                                          completeTask(task);
                                                          setSelectedTask(null);
                                                        }
                                                      };
                                                      input.click();
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 border-b-4 border-indigo-800"
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
                                })}
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
                          
                          <div className="flex bg-slate-900/50 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 gap-1 w-full md:w-auto">
                            <button
                               onClick={() => setAdminDashboardTab("stats")}
                               className={cn(
                                 "flex-1 md:flex-none px-6 py-3 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
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
                                 "flex-1 md:flex-none px-6 py-3 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
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
                                 "flex-1 md:flex-none px-6 py-3 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
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
                                val: MOCK_STUDENTS.length.toString(),
                                icon: <Users size={24} className="text-emerald-400" />
                              },
                              {
                                label: "Grupos Asignados",
                                val: SCHOOL_GROUPS.length.toString(),
                                icon: <BookOpen size={24} className="text-rose-400" />
                              },
                              {
                                label: "Misiones Resueltas",
                                val: MOCK_STUDENTS.reduce((acc, curr) => acc + curr.completedTasks.length, 0).toString(),
                                icon: <TrendingUp size={24} className="text-amber-400" />
                              }
                            ].map((stat, i) => (
                              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-4 hover:border-slate-700 transition-all shadow-lg">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                                    {stat.icon}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-3xl font-black italic text-slate-100 mb-1">{stat.val}</div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : adminDashboardTab === "teachers" ? (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                <Plus size={18} /> Nuevo Docente
                              </button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                          <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                              Plantilla Docente
                            </h4>
                          </div>
                          
                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-x-auto">
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
                                      <div className="flex flex-wrap gap-2">
                                        {teacher.subjects.length > 0 ? (
                                          teacher.subjects.map((sid) => (
                                            <div key={sid} className="flex flex-col gap-1">
                                              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-black uppercase">
                                                {sid.split("_")[0]} ({sid.split("_")[1]} Año)
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-[9px] font-black text-slate-600 uppercase italic">
                                            Sin asignar
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                      <span
                                        className={cn(
                                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                          teacher.status === "Active"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-slate-800 text-slate-500 border-slate-700",
                                        )}
                                      >
                                        {teacher.status === "Active" ? "Activo" : "Licencia"}
                                      </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            const newName = prompt('Nuevo nombre:', teacher.name);
                                            if (newName && newName.trim()) {
                                              setTeachers(prev => prev.map(t => t.id === teacher.id ? {...t, name: newName.trim()} : t));
                                            }
                                          }}
                                          className="text-indigo-400 hover:text-indigo-300 font-bold p-2 bg-indigo-500/10 rounded-full transition-all border border-indigo-500/20"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const confirm = window.confirm(`¿Borrar al docente ${teacher.name}?`);
                                            if (confirm) {
                                              setTeachers(prev => prev.filter(t => t.id !== teacher.id));
                                            }
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
                                          className="inline-flex items-center justify-end gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition-colors border border-transparent hover:border-slate-700"
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
                                  <span
                                        className={cn(
                                          "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border shrink-0",
                                          teacher.status === "Active"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-slate-800 text-slate-500 border-slate-700",
                                        )}
                                      >
                                        {teacher.status === "Active" ? "Activo" : "Licencia"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pl-15">
                                    {teacher.subjects.length > 0 ? (
                                          teacher.subjects.map((sid) => (
                                              <span key={sid} className="px-2 py-1 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-black uppercase">
                                                {sid.split("_")[0]} ({sid.split("_")[1]} Año)
                                              </span>
                                          ))
                                        ) : (
                                          <span className="text-[9px] font-black text-slate-600 uppercase italic">
                                            Sin asignar materias
                                          </span>
                                        )}
                                </div>
                                <div className="flex justify-end pt-2 border-t border-slate-800/50 mt-2 gap-2">
                                  <button
                                    onClick={() => {
                                      const newName = prompt('Nuevo nombre:', teacher.name);
                                      if (newName && newName.trim()) {
                                        setTeachers(prev => prev.map(t => t.id === teacher.id ? {...t, name: newName.trim()} : t));
                                      }
                                    }}
                                    className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const confirm = window.confirm(`¿Borrar al docente ${teacher.name}?`);
                                      if (confirm) {
                                        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
                                      }
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
                                        className="flex-1 sm:flex-none w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 rounded-xl text-slate-300 transition-colors border border-slate-700"
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
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                               <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                   <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Listado de Alumnos</h4>
                               </div>
                               <div className="overflow-x-auto">
                                   <table className="w-full text-left">
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
                                              <tr key={student.username} className="hover:bg-slate-800/30 transition-colors">
                                                 <td className="px-8 py-6 text-sm font-bold text-slate-200">{student.username}</td>
                                                 <td className="px-8 py-6 text-sm text-indigo-400 font-bold uppercase">{student.grade}</td>
                                                 <td className="px-8 py-6 text-sm text-amber-500 font-black flex items-center gap-1.5"><Coins size={14} className="text-amber-500"/> {student.tokens}</td>
                                                 <td className="px-8 py-6 text-right">
                                                   <div className="flex items-center justify-end gap-2">
                                                     <button
                                                        onClick={() => {
                                                           const action = prompt(`Editar datos de ${student.username}:\n1. Editar Nombre\n2. Editar Grupo\nIngresa 1 o 2:`);
                                                           if (action === '1') {
                                                              const newName = prompt('Nuevo nombre:', student.username);
                                                              if (newName && newName.trim()) {
                                                                 const newStats = {...student, username: newName.trim()};
                                                                 localStorage.setItem('cardacademy_stats_' + student.username, JSON.stringify(newStats));
                                                                 setAllStudents(prev => prev.map(s => s.username === student.username ? newStats : s));
                                                              }
                                                           } else if (action === '2') {
                                                              const newGrp = prompt('Nuevo grupo (ej. 2A):', student.grade);
                                                              if (newGrp && newGrp.trim()) {
                                                                 const newStats = {...student, grade: newGrp.trim() as any};
                                                                 localStorage.setItem('cardacademy_stats_' + student.username, JSON.stringify(newStats));
                                                                 setAllStudents(prev => prev.map(s => s.username === student.username ? newStats : s));
                                                              }
                                                           }
                                                        }}
                                                        className="text-indigo-400 hover:text-indigo-300 font-bold p-2 bg-indigo-500/10 rounded-full transition-all border border-indigo-500/20"
                                                     >
                                                        <Pencil size={16} />
                                                     </button>
                                                     <button
                                                        onClick={() => {
                                                          const confirm = window.confirm(`¿Borrar a ${student.username}?`);
                                                          if (confirm) {
                                                             localStorage.removeItem('cardacademy_stats_' + student.username);
                                                             setAllStudents(prev => prev.filter(s => s.username !== student.username));
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
                                          {allStudents.length === 0 && (
                                              <tr>
                                                <td colSpan={4} className="px-8 py-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                                   No hay alumnos registrados aún.
                                                </td>
                                              </tr>
                                          )}
                                      </tbody>
                                   </table>
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
                            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                              <Plus size={18} /> Nuevo Desafío
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {[
                            {
                              label: "Alumnos a Cargo",
                              val: MOCK_STUDENTS.filter(s => stats.assignedGroups.includes(s.grade)).length.toString(),
                              icon: (
                                <Users size={24} className="text-indigo-400" />
                              ),
                            },
                            {
                              label: "Misiones Resueltas",
                              val: MOCK_STUDENTS.filter(s => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.completedTasks.length, 0).toString(),
                              icon: (
                                <FileCheck
                                  size={24}
                                  className="text-emerald-400"
                                />
                              ),
                            },
                            {
                              label: "Tokens Obtenidos",
                              val: MOCK_STUDENTS.filter(s => stats.assignedGroups.includes(s.grade)).reduce((acc, curr) => acc + curr.tokens, 0).toString(),
                              icon: (
                                <Coins
                                  size={24}
                                  className="text-amber-400"
                                />
                              ),
                            },
                            {
                              label: "Entregas por Revisar",
                              val: "5",
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

                      </div>
                    ) : (
                      /* STUDENT WELCOME (HOME) */
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-900 border border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl group transition-all">
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
                                    "w-full sm:w-auto px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2",
                                    isGeneratingChallenge
                                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.4)]",
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
                                  {MOCK_STUDENTS
                                    .filter(s => s.grade === stats.grade)
                                    .sort((a, b) => b.tokens - a.tokens)
                                    .slice(0, 5)
                                    .map((student, i) => (
                                    <button
                                      key={student.id}
                                      onClick={() =>
                                        setSelectedStudent(student)
                                      }
                                      className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-3xl transition-all border",
                                        selectedStudent?.id === student.id
                                          ? "bg-indigo-600/10 border-indigo-500/30 text-white shadow-xl"
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
                                        className="w-24 h-24 rounded-[2rem] border-4 border-indigo-600 shadow-2xl object-cover"
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
                                          {
                                            label: "Canjeables",
                                            value: "Reward",
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
                                        {INITIAL_CARDS.filter(
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
                                      {INITIAL_CARDS.filter(
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
                          <div className="min-w-0 max-w-full w-full">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-600 pb-2 px-1 truncate shrink-0">
                              Registro de Cartas
                            </h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1 shrink-0">
                              Configuración Maestro de la Colección
                            </p>
                          </div>
                          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1 overflow-x-auto no-scrollbar max-w-full w-full justify-center md:justify-end md:w-auto">
                            {[
                              { label: "Canjeables", value: "Reward" },
                              { label: "Logros", value: "Achievement" },
                              { label: "Colección", value: "Collectible" },
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

                        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all">
                              <Plus size={14} /> Nueva Carta de{" "}
                              {collectionSubTab}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-12">
                            {INITIAL_CARDS.filter(
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
                                        "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
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
                                  <div className="w-6 h-6 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white">
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
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600 pb-2 px-1 truncate shrink-0">
                              Mis Grupos
                            </h2>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1 shrink-0">
                              Directorio de Alumnos por Materia
                            </p>
                          </div>
                        </div>

                        {["Tecnología", "Artes"].map((subjectName) => {
                          // Very basic mock subject grouping logic for now:
                          // If group starts with '2' it's tech, otherwise arts. Add '3' for tech maybe.
                          const groupsForSubject = stats.assignedGroups.filter(
                            (g) => (subjectName === "Tecnología" ? g.startsWith("2") || g.startsWith("3") : g.startsWith("1"))
                          );
                          
                          if (groupsForSubject.length === 0) return null;

                          return (
                            <div key={subjectName} className="space-y-6">
                              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 flex items-center gap-3 px-1 border-b border-slate-800 pb-4">
                                <BookOpenCheck size={20} className="text-indigo-400" />
                                {subjectName}
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
                                          : "bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "font-black italic uppercase tracking-tight text-xl",
                                          isSelected ? "text-indigo-300" : "text-slate-100"
                                        )}
                                      >
                                        Grupo {group}
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[10px] font-black uppercase tracking-widest",
                                          isSelected ? "text-indigo-400" : "text-slate-500"
                                        )}
                                      >
                                        {MOCK_STUDENTS.filter(s => s.grade === group).length} Alumnos
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {selectedTeacherGroup && (
                          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl mt-8">
                            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                              <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                                Alumnos de {selectedTeacherGroup}
                              </h4>
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {MOCK_STUDENTS.filter(s => s.grade === selectedTeacherGroup).length} Alumnos Activos
                              </div>
                            </div>
                            <div className="flex flex-col divide-y divide-slate-800/50">
                              {MOCK_STUDENTS.filter(s => s.grade === selectedTeacherGroup).map((student) => {
                                const studentData = student as Student;
                                const isOnline = (studentData.tokens % 3 === 0) || (studentData.streak > 8);
                                const totalTasks = ACADEMIC_CONTENT[student.grade[0] as Year]
                                  .filter((s) => stats.assignedSubjects.includes(s.id))
                                  .reduce((acc, s) => acc + s.topics.reduce((acc2, t) => acc2 + t.tasks.length, 0), 0);
                                const completedTasksCount = studentData.completedTasks.filter((taskId) =>
                                  stats.assignedSubjects.some((subId) =>
                                    ACADEMIC_CONTENT[student.grade[0] as Year]
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
                                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
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
                                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000"
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
                              {MOCK_STUDENTS.filter(s => s.grade === selectedTeacherGroup).length === 0 && (
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
                        cards={INITIAL_CARDS}
                        packs={INITIAL_PACKS}
                        role={stats.role}
                        onRedeemReward={(card) => {
                          alert(`¡Carta canjeada! Muestra esto a tu profesor: ${card.name}`);
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
                      <div className="flex-1 overflow-y-auto w-full no-scrollbar px-2 sm:px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch pt-2">
                          {packs.map((pack) => (
                          <div
                            key={pack.id}
                            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all hover:-translate-y-2"
                          >
                            <div className="space-y-6">
                              <div
                                className={cn(
                                  "w-32 h-48 mx-auto flex flex-col items-center justify-center shadow-2xl relative overflow-hidden bg-slate-800 rounded-xl",
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
                                  <div className="absolute top-4 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] z-30 ring-2 ring-white/20"></div>
                                )}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-20 px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-2">
                                  <span
                                    className={cn(
                                      "text-2xl font-black italic uppercase tracking-tighter leading-none block",
                                      pack.id === "pack_jacobo"
                                        ? "text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                                        : pack.id === "pack_culiacan"
                                          ? "text-indigo-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                                          : "text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]",
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
                          className={cn("flex overflow-x-auto lg:overflow-x-visible gap-4 sm:gap-6 lg:gap-12 px-[15vw] sm:px-[25vw] lg:px-4 py-8 md:py-12 no-scrollbar items-center justify-start lg:justify-center min-w-full cursor-grab lg:cursor-auto active:cursor-grabbing select-none h-auto items-stretch sm:items-center", isDraggingPack ? "" : "snap-x snap-mandatory lg:snap-none")}
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
                                  "flex-none w-[75vw] sm:w-[45vw] md:w-[300px] max-h-[100%] sm:max-h-full snap-center bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between gap-3 sm:gap-4 md:gap-6 group transition-all duration-500",
                                  "hover:scale-[1.02] hover:border-indigo-500 hover:shadow-indigo-500/20 z-10",
                                )}
                              >
                                {idx === 1 && (
                                  <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#4f46e5,transparent_70%)]"></div>
                                )}

                                <div className="relative flex-1 min-h-0 flex flex-col justify-center w-full">
                                  <div
                                    className={cn(
                                      "w-full h-full min-h-[150px] aspect-[4/5] sm:w-48 sm:h-[260px] sm:aspect-auto rounded-xl mx-auto shadow-[0_25px_50px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden bg-slate-800",
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
                                      className="absolute inset-[8px] sm:inset-2.5 top-[32px] bottom-[32px] sm:top-10 sm:bottom-10 w-[calc(100%-16px)] sm:w-[calc(100%-20px)] h-[calc(100%-64px)] sm:h-[calc(100%-80px)] object-cover rounded-md opacity-90 border border-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"
                                    />

                                    <div className="absolute inset-[8px] sm:inset-2.5 top-[32px] bottom-[32px] sm:top-10 sm:bottom-10 bg-gradient-to-t from-black/90 via-black/20 to-black/30 rounded-md pointer-events-none" />

                                    <div className="absolute top-10 sm:top-14 left-1/2 -translate-x-1/2 w-full text-center z-20 px-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pointer-events-none">
                                      <span
                                        className={cn(
                                          "text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none block",
                                          pack.id === "pack_jacobo"
                                            ? "text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                                            : pack.id === "pack_culiacan"
                                              ? "text-indigo-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                                              : "text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]",
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
                                      "flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2",
                                      "bg-slate-800 text-white hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500",
                                    )}
                                  >
                                    {pack.price} <Coins size={20} className="text-amber-400" />
                                  </button>
                                  <button
                                    onClick={() => setExchangePackId(pack.id)}
                                    className={cn(
                                      "px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center",
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
            <footer className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/60 backdrop-blur-xl border-t border-slate-800 px-6 z-40 flex justify-center">
              <div className="w-full max-w-lg flex justify-between items-center h-full">
                <button
                  onClick={() => setActiveTab("home")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 group",
                    activeTab === "home"
                      ? "text-indigo-400 bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]"
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
                      ? "text-indigo-400 bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]"
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
                      ? "text-indigo-400 bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]"
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
                        ? "text-indigo-400 bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]"
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
                      ? "text-indigo-400 bg-indigo-500/10 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]"
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
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn(
                      "relative w-full max-w-4xl bg-slate-900 rounded-[3rem] border shadow-2xl overflow-y-auto no-scrollbar flex flex-col md:flex-row max-h-[85vh]",
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
                      className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center z-20 transition-all active:scale-95 backdrop-blur-md"
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
                            "shadow-[inset_0_0_100px_rgba(245,158,11,0.2)]",
                        )}
                      />

                      <div className="absolute bottom-8 left-8">
                        <span
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl",
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
                    <div className="flex-1 p-8 md:p-12 space-y-6 flex flex-col justify-center overflow-y-auto">
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
                  availableCards={INITIAL_CARDS.filter(
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
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full relative my-auto shadow-2xl"
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {INITIAL_CARDS.filter(c => c.category === 'Collectible' && (c.sourcePackId || 'pack_jacobo') === exchangePackId).map(card => {
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
                      {INITIAL_CARDS.filter(c => c.category === 'Collectible' && (c.sourcePackId || 'pack_jacobo') === exchangePackId && !stats.collection.includes(c.id)).length === 0 && (
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
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-indigo-500/20 shadow-2xl flex flex-col"
                  >
                    <div className="flex justify-end p-4 absolute top-0 right-0 z-[130] pointer-events-none">
                      <button
                        onClick={() => setShowChallengeModal(false)}
                        className="w-10 h-10 bg-slate-800/80 text-slate-400 hover:text-white rounded-full flex items-center justify-center pointer-events-auto transition-all active:scale-95 backdrop-blur-md border border-white/5"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar pt-2 sm:pt-0">
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
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-6 sm:p-8 md:p-12 overflow-y-auto no-scrollbar max-h-[90vh] mx-auto"
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
                              alert(
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
                          className="flex-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95"
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

              {assignmentModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl"
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
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                            Grupos Asignados
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {SCHOOL_GROUPS.map((g) => (
                              <button
                                key={g}
                                onClick={() =>
                                  setAssignmentModal((prev) => ({
                                    ...prev,
                                    selectedGroups: prev.selectedGroups.includes(g)
                                      ? prev.selectedGroups.filter((x) => x !== g)
                                      : [...prev.selectedGroups, g],
                                  }))
                                }
                                className={cn(
                                  "p-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all",
                                  assignmentModal.selectedGroups.includes(g)
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600",
                                )}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                            Materias Impartidas
                          </label>
                          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                            {(["1", "2", "3"] as Year[]).map((year) => (
                              <button
                                key={year}
                                onClick={() => setAssignmentModal(prev => ({ ...prev, activeYear: year }))}
                                className={cn(
                                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                  assignmentModal.activeYear === year
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-400"
                                )}
                              >
                                {year === "1" ? "Primero" : year === "2" ? "Segundo" : "Tercero"}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                            <div className="grid grid-cols-2 gap-2">
                              {ACADEMIC_CONTENT[assignmentModal.activeYear].map((subject) => (
                                <button
                                  key={subject.id}
                                  onClick={() =>
                                    setAssignmentModal((prev) => ({
                                      ...prev,
                                      selectedSubjects: prev.selectedSubjects.includes(subject.id)
                                        ? prev.selectedSubjects.filter((x) => x !== subject.id)
                                        : [...prev.selectedSubjects, subject.id],
                                    }))
                                  }
                                  className={cn(
                                    "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all text-left flex flex-col gap-1",
                                    assignmentModal.selectedSubjects.includes(subject.id)
                                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800",
                                  )}
                                >
                                  <span>{subject.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (assignmentModal.selectedGroups.length === 0 && assignmentModal.selectedSubjects.length === 0) {
                            alert(
                              "Por favor selecciona al menos un grupo o materia.",
                            );
                            return;
                          }
                          setTeachers((prev) =>
                            prev.map((t) =>
                              t.id === assignmentModal.teacherId
                                ? {
                                    ...t,
                                    status: "Active",
                                    groups: assignmentModal.selectedGroups,
                                    subjects: assignmentModal.selectedSubjects,
                                    students: assignmentModal.selectedGroups.length * 30, // Estimación
                                  }
                                : t,
                            ),
                          );
                          alert(
                            `Asignación actualizada exitosamente.`,
                          );
                          setAssignmentModal({
                            teacherId: null,
                            isOpen: false,
                            selectedGroups: [],
                            selectedSubjects: [],
                            activeYear: "1",
                          });
                        }}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                      >
                        Confirmar Asignación
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
