// App constants
export const APP_NAME = "WasteNot";

// Routes
export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  MEALS: "/meals",
  ACHIEVEMENTS: "/achievements",
  SUSTAINABILITY: "/sustainability",
  SETTINGS: "/settings",
  DOWNLOAD: "/download",
};

// Meal types
export const MEAL_TYPES = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
};

// Badge types
export const BADGE_TYPES = {
  STREAK: "streak",
  SUSTAINABILITY: "sustainability",
  RECYCLING: "recycling",
  ZERO_WASTE: "zeroWaste",
};

// Activity types
export const ACTIVITY_TYPES = {
  GARDEN: "garden",
  RECYCLING: "recycling",
  CLEANUP: "cleanup",
  WORKSHOP: "workshop",
};

// Badge level thresholds
export const BADGE_LEVELS = {
  BRONZE: {
    name: "bronze",
    threshold: 10,
  },
  SILVER: {
    name: "silver",
    threshold: 25,
  },
  GOLD: {
    name: "gold",
    threshold: 50,
  },
};

// Default avatar URL
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";

// Points configuration
export const POINTS = {
  ZERO_WASTE: 150,
  LOW_WASTE: 100,
  MEDIUM_WASTE: 50,
  HIGH_WASTE: 25,
};

// Day names
export const DAY_NAMES = [
  "Mon", "Tue", "Wed", "Thu", "Fri"
];
