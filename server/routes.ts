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
import { analyzeFoodConsumption, checkIfImageContainsFood } from "./lib/gemini";

// Setup file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueId = nanoid();
      const fileExt = path.extname(file.originalname);
      cb(null, `${uniqueId}${fileExt}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // ... (auth and other routes unchanged)

  router.post("/meals/:id/before-photo", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const meal = await storage.getMeal(mealId);
      if (!meal) return res.status(404).json({ message: "Meal not found" });
      if (!req.file) return res.status(400).json({ message: "No photo uploaded" });

      const photoPath = path.join(process.cwd(), "uploads", req.file.filename);
      const isFood = await checkIfImageContainsFood(photoPath);
      if (!isFood) {
        fs.unlinkSync(photoPath); // Delete the file if not valid
        return res.status(400).json({ message: "Image does not appear to contain food." });
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      const updatedMeal = await storage.updateMeal(mealId, { beforePhotoUrl: photoUrl });
      res.status(200).json(updatedMeal);
    } catch (error) {
      console.error("Error uploading before photo:", error);
      res.status(500).json({ message: "Could not upload before photo" });
    }
  });

  router.post("/meals/:id/after-photo", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const meal = await storage.getMeal(mealId);
      if (!meal) return res.status(404).json({ message: "Meal not found" });
      if (!req.file) return res.status(400).json({ message: "No photo uploaded" });
      if (!meal.beforePhotoUrl) return res.status(400).json({ message: "Before photo must be uploaded first" });

      const photoUrl = `/uploads/${req.file.filename}`;
      const photoPath = path.join(process.cwd(), "uploads", req.file.filename);

      const isFood = await checkIfImageContainsFood(photoPath);
      if (!isFood) {
        fs.unlinkSync(photoPath); // Delete invalid photo
        return res.status(400).json({ message: "Image does not appear to contain food." });
      }

      const beforePhotoFilename = meal.beforePhotoUrl.split("/").pop();
      const beforePhotoPath = beforePhotoFilename
        ? path.join(process.cwd(), "uploads", beforePhotoFilename)
        : null;

      let wastePercentage = 0;
      try {
        if (req.body.wastePercentage !== undefined) {
          wastePercentage = parseInt(req.body.wastePercentage);
        } else if (beforePhotoPath && fs.existsSync(beforePhotoPath)) {
          wastePercentage = await analyzeFoodConsumption(beforePhotoPath, photoPath);
          const beforeStats = fs.statSync(beforePhotoPath);
          const afterStats = fs.statSync(photoPath);
          const sizeDifference = Math.abs(beforeStats.size - afterStats.size) / beforeStats.size;
          if (sizeDifference < 0.05) {
            console.log("Before and after photos appear very similar - possible duplicate upload");
            wastePercentage = Math.min(wastePercentage, 5);
          }
        } else {
          wastePercentage = await analyzeFoodWaste(photoPath);
        }
        console.log(`Analyzed food waste: ${wastePercentage}%`);
      } catch (visionError) {
        console.error("Error analyzing food waste:", visionError);
        wastePercentage = parseInt(req.body.wastePercentage || "5");
      }

      let pointsEarned = 0;
      if (wastePercentage <= 10) pointsEarned = 150;
      else if (wastePercentage <= 30) pointsEarned = 100;
      else if (wastePercentage <= 50) pointsEarned = 50;
      else pointsEarned = 25;

      const updatedMeal = await storage.updateMeal(mealId, {
        afterPhotoUrl: photoUrl,
        status: "completed",
        wastePercentage,
        pointsEarned
      });

      await storage.updateUserPoints(meal.userId, pointsEarned);
      const userMeals = await storage.getMealsByUser(meal.userId);
      const completedMeals = userMeals.filter(m => m.status === "completed");
      const user = await storage.getUser(meal.userId);
      if (user) {
        const newStreak = completedMeals.length;
        await storage.updateUserStreak(user.id, newStreak);
        if (newStreak >= 10 && newStreak % 10 === 0) {
          let level = "bronze";
          if (newStreak >= 50) level = "gold";
          else if (newStreak >= 25) level = "silver";
          await storage.createBadge({ userId: user.id, type: "streak", level, count: newStreak, earnedAt: new Date() });
        }
      }

      res.status(200).json(updatedMeal);
    } catch (error) {
      console.error("Error processing after photo:", error);
      res.status(500).json({ message: "Could not upload after photo" });
    }
  });

  // ... (rest of the routes remain unchanged)

  app.use("/api", router);
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  const httpServer = createServer(app);
  return httpServer;
}
