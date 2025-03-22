// User types
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  points: number;
  streak: number;
  avatarUrl?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  name: string;
  password: string;
}

// Meal types
export interface Meal {
  id: number;
  userId: number;
  type: string;
  date: string;
  day: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  status: string;
  wastePercentage?: number;
  pointsEarned: number;
}

// Badge types
export interface Badge {
  id: number;
  userId: number;
  type: string;
  level: string;
  count: number;
  earnedAt: string;
}

// Activity types
export interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  points: number;
  location: string;
  participantsCount: number;
}

// Day status
export interface DayStatus {
  day: number;
  dayName: string;
  isActive: boolean;
  isCompleted: boolean;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}
