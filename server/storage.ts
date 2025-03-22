import { 
  User, InsertUser, 
  Meal, InsertMeal, UpdateMeal,
  Badge, InsertBadge,
  Activity, InsertActivity,
  ActivityParticipant, InsertActivityParticipant
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  updateUserStreak(userId: number, streak: number): Promise<User>;
  
  // Meal methods
  getMeal(id: number): Promise<Meal | undefined>;
  getMealsByUserAndDay(userId: number, day: number): Promise<Meal[]>;
  getMealsByUser(userId: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: UpdateMeal): Promise<Meal>;
  
  // Badge methods
  getBadgesByUser(userId: number): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivityParticipants(id: number, count: number): Promise<Activity>;
  
  // Activity Participation methods
  getActivityParticipants(activityId: number): Promise<ActivityParticipant[]>;
  getParticipantByUserAndActivity(userId: number, activityId: number): Promise<ActivityParticipant | undefined>;
  addParticipant(participant: InsertActivityParticipant): Promise<ActivityParticipant>;
  markParticipantAttended(id: number): Promise<ActivityParticipant>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private badges: Map<number, Badge>;
  private activities: Map<number, Activity>;
  private activityParticipants: Map<number, ActivityParticipant>;
  
  private userIdCounter: number;
  private mealIdCounter: number;
  private badgeIdCounter: number;
  private activityIdCounter: number;
  private participantIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.badges = new Map();
    this.activities = new Map();
    this.activityParticipants = new Map();
    
    this.userIdCounter = 1;
    this.mealIdCounter = 1;
    this.badgeIdCounter = 1;
    this.activityIdCounter = 1;
    this.participantIdCounter = 1;
    
    // Add seed data for activities
    this.seedActivities();
  }
  
  private seedActivities() {
    const activities: InsertActivity[] = [
      {
        title: "Campus Garden Cleanup",
        description: "Join us to clean up and plant new flowers in the campus garden.",
        type: "garden",
        date: new Date("2023-10-14T10:00:00"),
        points: 200,
        location: "Main Campus Garden"
      },
      {
        title: "Recycling Workshop",
        description: "Learn how to properly sort and recycle different materials.",
        type: "recycling",
        date: new Date("2023-10-17T14:00:00"),
        points: 150,
        location: "Student Union Building, Room 201"
      }
    ];
    
    activities.forEach(activity => {
      this.createActivity(activity);
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      points: 0,
      streak: 0
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      points: user.points + points
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStreak(userId: number, streak: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      streak
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Meal methods
  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }
  
  async getMealsByUserAndDay(userId: number, day: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.userId === userId && meal.day === day
    );
  }
  
  async getMealsByUser(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.userId === userId
    );
  }
  
  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealIdCounter++;
    const newMeal: Meal = { ...meal, id, pointsEarned: 0 };
    this.meals.set(id, newMeal);
    return newMeal;
  }
  
  async updateMeal(id: number, update: UpdateMeal): Promise<Meal> {
    const meal = await this.getMeal(id);
    if (!meal) {
      throw new Error("Meal not found");
    }
    
    const updatedMeal: Meal = { ...meal, ...update };
    this.meals.set(id, updatedMeal);
    
    return updatedMeal;
  }
  
  // Badge methods
  async getBadgesByUser(userId: number): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(
      (badge) => badge.userId === userId
    );
  }
  
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const newBadge: Badge = { ...badge, id };
    this.badges.set(id, newBadge);
    return newBadge;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = { 
      ...activity, 
      id,
      participantsCount: 0
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  async updateActivityParticipants(id: number, count: number): Promise<Activity> {
    const activity = await this.getActivity(id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    
    const updatedActivity: Activity = {
      ...activity,
      participantsCount: activity.participantsCount + count
    };
    
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  // Activity Participation methods
  async getActivityParticipants(activityId: number): Promise<ActivityParticipant[]> {
    return Array.from(this.activityParticipants.values()).filter(
      (participant) => participant.activityId === activityId
    );
  }
  
  async getParticipantByUserAndActivity(userId: number, activityId: number): Promise<ActivityParticipant | undefined> {
    return Array.from(this.activityParticipants.values()).find(
      (participant) => participant.userId === userId && participant.activityId === activityId
    );
  }
  
  async addParticipant(participant: InsertActivityParticipant): Promise<ActivityParticipant> {
    const id = this.participantIdCounter++;
    const newParticipant: ActivityParticipant = { ...participant, id };
    this.activityParticipants.set(id, newParticipant);
    
    // Update the activity's participant count
    await this.updateActivityParticipants(participant.activityId, 1);
    
    return newParticipant;
  }
  
  async markParticipantAttended(id: number): Promise<ActivityParticipant> {
    const participant = this.activityParticipants.get(id);
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    const updatedParticipant: ActivityParticipant = {
      ...participant,
      attended: true
    };
    
    this.activityParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }
}

export const storage = new MemStorage();
