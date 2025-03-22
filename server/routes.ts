import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMealSchema, 
  updateMealSchema, 
  insertBadgeSchema, 
  insertActivityParticipantSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { analyzeFoodWaste } from "./vision-api";

// Setup file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const uniqueId = nanoid();
      const fileExt = path.extname(file.originalname);
      cb(null, `${uniqueId}${fileExt}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Auth routes
  router.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create default meals for the user (5 days, 3 meals per day)
      for (let day = 1; day <= 5; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day - 1);
        
        const mealTypes = ["breakfast", "lunch", "dinner"];
        for (const type of mealTypes) {
          await storage.createMeal({
            userId: user.id,
            type,
            date,
            day,
            status: "pending"
          });
        }
      }
      
      // Remove password before sending the user back
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Could not register user" });
    }
  });
  
  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password before sending the user back
      const { password: userPassword, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Could not log in" });
    }
  });
  
  // User routes
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending the user back
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Could not retrieve user" });
    }
  });
  
  // Upload profile picture
  router.post("/users/:id/avatar", upload.single("avatar"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
      
      const avatarUrl = `/uploads/${req.file.filename}`;
      
      const updatedUser = await storage.updateUserAvatar(userId, avatarUrl);
      
      // Remove password before sending the user back
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Could not update profile picture" });
    }
  });
  
  // Meal routes
  router.get("/users/:userId/meals", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const meals = await storage.getMealsByUser(userId);
      res.status(200).json(meals);
    } catch (error) {
      res.status(500).json({ message: "Could not retrieve meals" });
    }
  });
  
  router.get("/users/:userId/meals/day/:day", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const day = parseInt(req.params.day);
      const meals = await storage.getMealsByUserAndDay(userId, day);
      res.status(200).json(meals);
    } catch (error) {
      res.status(500).json({ message: "Could not retrieve meals for the day" });
    }
  });
  
  router.post("/meals/:id/before-photo", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const meal = await storage.getMeal(mealId);
      
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No photo uploaded" });
      }
      
      const photoUrl = `/uploads/${req.file.filename}`;
      
      const updatedMeal = await storage.updateMeal(mealId, {
        beforePhotoUrl: photoUrl
      });
      
      res.status(200).json(updatedMeal);
    } catch (error) {
      res.status(500).json({ message: "Could not upload before photo" });
    }
  });
  
  router.post("/meals/:id/after-photo", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const meal = await storage.getMeal(mealId);
      
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No photo uploaded" });
      }
      
      if (!meal.beforePhotoUrl) {
        return res.status(400).json({ message: "Before photo must be uploaded first" });
      }
      
      const photoUrl = `/uploads/${req.file.filename}`;
      const photoPath = path.join(process.cwd(), "uploads", req.file.filename);
      
      // Extract "before" photo path from the URL
      const beforePhotoFilename = meal.beforePhotoUrl.split('/').pop();
      const beforePhotoPath = beforePhotoFilename 
        ? path.join(process.cwd(), "uploads", beforePhotoFilename)
        : null;
      
      // Compare before and after photos for better waste analysis
      let wastePercentage = 0;
      try {
        // User can provide an estimate if they want to override the automatic analysis
        if (req.body.wastePercentage !== undefined) {
          wastePercentage = parseInt(req.body.wastePercentage);
        } else if (beforePhotoPath && fs.existsSync(beforePhotoPath)) {
          // If we have valid before and after photos, we can do a comparison
          // For now, we'll use the Vision API on just the after photo, but in a real app
          // you would analyze both photos and compare them
          wastePercentage = await analyzeFoodWaste(photoPath);
          
          // Add logic to detect if both photos are identical or very similar
          // This is a simplified approach - in a real app you'd use image comparison algorithms
          const beforeStats = fs.statSync(beforePhotoPath);
          const afterStats = fs.statSync(photoPath);
          
          // If file sizes are very close (within 5% of each other), they might be similar photos
          // This is a very naive check but helps with the case where someone uploads the same photo twice
          const sizeDifference = Math.abs(beforeStats.size - afterStats.size) / beforeStats.size;
          if (sizeDifference < 0.05) {
            console.log("Before and after photos appear very similar - possible duplicate upload");
            wastePercentage = Math.min(wastePercentage, 5); // Assume minimal waste if photos look identical
          }
        } else {
          // If we can't compare, use Vision API on the after photo
          wastePercentage = await analyzeFoodWaste(photoPath);
        }
        
        console.log(`Analyzed food waste: ${wastePercentage}%`);
      } catch (visionError) {
        console.error("Error analyzing food waste:", visionError);
        // Fall back to user-provided value if available, or default to a low waste percentage
        wastePercentage = parseInt(req.body.wastePercentage || "5");
      }
      
      // Calculate points based on waste percentage
      let pointsEarned = 0;
      if (wastePercentage <= 10) {
        pointsEarned = 150; // Almost no waste
      } else if (wastePercentage <= 30) {
        pointsEarned = 100; // Some waste
      } else if (wastePercentage <= 50) {
        pointsEarned = 50; // Significant waste
      } else {
        pointsEarned = 25; // Lots of waste
      }
      
      const updatedMeal = await storage.updateMeal(mealId, {
        afterPhotoUrl: photoUrl,
        status: "completed",
        wastePercentage,
        pointsEarned
      });
      
      // Update user points
      await storage.updateUserPoints(meal.userId, pointsEarned);
      
      // Check for streak and update if needed
      const userMeals = await storage.getMealsByUser(meal.userId);
      const completedMeals = userMeals.filter(m => m.status === "completed");
      
      // Simple streak logic - count consecutive completed meals
      const user = await storage.getUser(meal.userId);
      if (user) {
        const newStreak = completedMeals.length;
        await storage.updateUserStreak(user.id, newStreak);
        
        // Check if streak badge should be awarded
        if (newStreak >= 10 && newStreak % 10 === 0) {
          let level = "bronze";
          if (newStreak >= 50) level = "gold";
          else if (newStreak >= 25) level = "silver";
          
          await storage.createBadge({
            userId: user.id,
            type: "streak",
            level,
            count: newStreak,
            earnedAt: new Date()
          });
        }
      }
      
      res.status(200).json(updatedMeal);
    } catch (error) {
      console.error("Error processing after photo:", error);
      res.status(500).json({ message: "Could not upload after photo" });
    }
  });
  
  // Badge routes
  router.get("/users/:userId/badges", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const badges = await storage.getBadgesByUser(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ message: "Could not retrieve badges" });
    }
  });
  
  // Activity routes
  router.get("/activities", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "Could not retrieve activities" });
    }
  });
  
  router.post("/activities/:id/join", async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if user already registered
      const existingParticipant = await storage.getParticipantByUserAndActivity(userId, activityId);
      if (existingParticipant) {
        return res.status(400).json({ message: "User already registered for this activity" });
      }
      
      const participant = await storage.addParticipant({
        activityId,
        userId,
        registered: true,
        attended: false
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ message: "Could not join activity" });
    }
  });
  
  // Add a download route for the source code zip file
  router.get("/download/source-code", (req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), "uploads", "wastenot_source_code.zip");
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, "wastenot_source_code.zip");
    } else {
      res.status(404).json({ message: "Source code file not found" });
    }
  });
  
  // Mount API routes
  app.use("/api", router);
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  const httpServer = createServer(app);
  return httpServer;
}
