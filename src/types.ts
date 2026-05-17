export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret';
export type CardCategory = 'Reward' | 'Achievement' | 'Collectible';

export interface Card {
  id: string;
  name: string;
  description: string;
  category: CardCategory;
  rarity: CardRarity;
  imageUrl: string;
  subject?: string;
  isRedeemable?: boolean;
  requirement?: string;
  sourcePackId?: string;
}

export type Year = '1' | '2' | '3';
export type Grade = '1A' | '1B' | '1C' | '1D' | '2A' | '2B' | '2C' | '2D' | '3A' | '3B' | '3C' | '3D' | 'Cuerpo Académico' | 'Administración';
export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Quiz' | 'Exercise';
  quizOptions?: string[];
  quizAnswer?: number;
  isAIQuiz?: boolean;
  reward: {
    tokens: number;
    cardId?: string;
    pack?: boolean;
  };
  evidenceRequired?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  tasks: Task[];
}

export interface SubjectTopics {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export interface DailyLimits {
  lastResetDate: string;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  totalCompleted?: number;
}

export interface PackCurrencies {
  pack_jacobo: number;
  pack_culiacan: number;
  pack_six_seven: number;
  [key: string]: number;
}

export interface UserStats {
  id?: string; // Supabase ID
  grade: Grade;
  role: UserRole;
  originalRole?: UserRole; // Track original login role
  username?: string;
  assignedSubjects: string[]; // Subject IDs (e.g., 'math_1')
  assignedGroups: string[]; // Group names or IDs (e.g., '1ero A')
  tokens: number;
  streak: number;
  collection: string[]; // Card IDs
  unstickedCards?: string[]; // Pending to be sticked into album
  completedTasks: string[]; // Task IDs
  pendingTasks?: string[]; // Task IDs waiting for review
  dailyLimits?: DailyLimits;
  packCurrencies?: PackCurrencies;
  // Real-time tracking
  lastActive?: string;
}

export interface Challenge {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  tokenReward: number;
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  cardsCount: number;
  active: boolean;
  rarities: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    secret?: number;
  };
}
