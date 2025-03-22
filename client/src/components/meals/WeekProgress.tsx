import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { DAY_NAMES } from "@/lib/constants";
import { Meal, DayStatus } from "@/lib/types";

interface WeekProgressProps {
  meals: Meal[];
  currentDay: number;
}

export default function WeekProgress({ meals, currentDay }: WeekProgressProps) {
  // Calculate week's progress stats
  const progress = useMemo(() => {
    // Total meals we expect to track (5 days, 3 meals per day)
    const totalMeals = 5 * 3;
    
    // Count completed meals
    const completedMeals = meals.filter(meal => meal.status === "completed").length;
    
    // Calculate percentage
    const percentComplete = Math.round((completedMeals / totalMeals) * 100);
    
    return {
      percentComplete,
      completedMeals,
      totalMeals
    };
  }, [meals]);
  
  // Create day status array for rendering day circles
  const dayStatus: DayStatus[] = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const dayNumber = i + 1;
      const dayMeals = meals.filter(meal => meal.day === dayNumber);
      
      return {
        day: dayNumber,
        dayName: DAY_NAMES[i],
        isActive: dayNumber === currentDay,
        isCompleted: dayMeals.every(meal => meal.status === "completed"),
        meals: {
          breakfast: dayMeals.find(meal => meal.type === "breakfast")?.status === "completed",
          lunch: dayMeals.find(meal => meal.type === "lunch")?.status === "completed",
          dinner: dayMeals.find(meal => meal.type === "dinner")?.status === "completed"
        }
      };
    });
  }, [meals, currentDay]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">This Week's Progress</h2>
        <div className="text-sm font-medium text-primary">Day {currentDay} of 5</div>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-50">
              {progress.percentComplete}% Complete
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-secondary-600">
              {progress.completedMeals}/{progress.totalMeals} meals tracked
            </span>
          </div>
        </div>
        <Progress value={progress.percentComplete} className="h-2 mb-4" />
      </div>
      
      <div className="flex justify-between items-center space-x-4 overflow-x-auto py-2">
        {dayStatus.map(day => (
          <div key={day.day} className="flex-shrink-0 w-1/5 min-w-[90px]">
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-gray-500">{day.dayName}</div>
              <div className="relative flex items-center justify-center mt-1 mb-1">
                <div 
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    day.isActive
                      ? "bg-primary"
                      : day.day < currentDay
                        ? "bg-primary-100"
                        : "bg-gray-200"
                  }`}
                >
                  <span 
                    className={`font-medium ${
                      day.isActive
                        ? "text-white"
                        : day.day < currentDay
                          ? "text-primary-800"
                          : "text-gray-500"
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
                {day.isCompleted && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
                {!day.isCompleted && day.day < currentDay && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex space-x-1">
                <div 
                  className={`h-2 w-2 rounded-full ${
                    day.meals.breakfast
                      ? "bg-green-500"
                      : day.day <= currentDay
                        ? "bg-gray-300"
                        : "bg-gray-200"
                  }`}
                ></div>
                <div 
                  className={`h-2 w-2 rounded-full ${
                    day.meals.lunch
                      ? "bg-green-500"
                      : day.day <= currentDay
                        ? "bg-gray-300"
                        : "bg-gray-200"
                  }`}
                ></div>
                <div 
                  className={`h-2 w-2 rounded-full ${
                    day.meals.dinner
                      ? "bg-green-500"
                      : day.day <= currentDay
                        ? "bg-gray-300"
                        : "bg-gray-200"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
