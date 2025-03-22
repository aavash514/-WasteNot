import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Coffee, Utensils, Drumstick, Camera, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Meal } from "@/lib/types";
import { MEAL_TYPES } from "@/lib/constants";
import CameraCapture from "@/components/camera/CameraCapture";

interface MealCardProps {
  meal: Meal;
  isActive?: boolean;
}

export default function MealCard({ meal, isActive = false }: MealCardProps) {
  const [showBeforeCamera, setShowBeforeCamera] = useState(false);
  const [showAfterCamera, setShowAfterCamera] = useState(false);
  
  const getMealIcon = () => {
    switch (meal.type) {
      case MEAL_TYPES.BREAKFAST:
        return <Coffee className="text-green-700" />;
      case MEAL_TYPES.LUNCH:
        return <Utensils className="text-green-700" />;
      case MEAL_TYPES.DINNER:
        return <Drumstick className="text-primary-700" />;
      default:
        return <Utensils className="text-green-700" />;
    }
  };
  
  const getMealTime = () => {
    switch (meal.type) {
      case MEAL_TYPES.BREAKFAST:
        return "7:00 AM - 9:00 AM";
      case MEAL_TYPES.LUNCH:
        return "12:00 PM - 2:00 PM";
      case MEAL_TYPES.DINNER:
        return "6:00 PM - 8:00 PM";
      default:
        return "";
    }
  };
  
  // Helper to format meal type for display
  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Upload before photo mutation
  const uploadBeforePhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      const response = await fetch(`/api/meals/${meal.id}/before-photo`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${meal.userId}/meals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${meal.userId}/meals/day/${meal.day}`] });
    }
  });
  
  // Upload after photo mutation
  const uploadAfterPhoto = useMutation({
    mutationFn: async ({ file, wastePercentage }: { file: File; wastePercentage: number }) => {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("wastePercentage", wastePercentage.toString());
      
      const response = await fetch(`/api/meals/${meal.id}/after-photo`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${meal.userId}/meals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${meal.userId}/meals/day/${meal.day}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${meal.userId}`] });
    }
  });
  
  const handleBeforePhotoCapture = (file: File) => {
    uploadBeforePhoto.mutate(file);
    setShowBeforeCamera(false);
  };
  
  const handleAfterPhotoCapture = (file: File) => {
    // For simplicity, we're hardcoding a very low waste percentage (5%)
    // In a real app, this would be determined through image analysis or user input
    uploadAfterPhoto.mutate({ file, wastePercentage: 5 });
    setShowAfterCamera(false);
  };
  
  const isCompleted = meal.status === "completed";
  const hasBeforePhoto = !!meal.beforePhotoUrl;
  const hasAfterPhoto = !!meal.afterPhotoUrl;
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden ${
        isCompleted 
          ? "border-green-200 bg-green-50" 
          : isActive 
            ? "border-primary-200" 
            : "border-gray-200"
      }`}
    >
      <div 
        className={`px-4 py-3 flex justify-between items-center ${
          isCompleted 
            ? "bg-green-100" 
            : isActive 
              ? "bg-primary-50" 
              : "bg-gray-50"
        }`}
      >
        <div className="flex items-center">
          <div 
            className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${
              isCompleted 
                ? "bg-green-200" 
                : isActive 
                  ? "bg-primary-100" 
                  : "bg-gray-200"
            }`}
          >
            {getMealIcon()}
          </div>
          <div>
            <h3 className="font-medium">{formatMealType(meal.type)}</h3>
            <p className="text-xs text-gray-500">{getMealTime()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {isCompleted ? (
            <Badge variant="outline" className="text-green-700 bg-green-200">
              Completed
            </Badge>
          ) : isActive ? (
            <Badge variant="outline" className="text-blue-700 bg-blue-100">
              In Progress
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500 bg-gray-100">
              Pending
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex space-x-4 mb-3">
          {/* Before Photo Section */}
          {hasBeforePhoto ? (
            <div className="flex-1 rounded-md overflow-hidden relative">
              <img 
                src={meal.beforePhotoUrl} 
                alt={`${meal.type} before`} 
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-1 px-2">
                <span className="text-white text-xs font-medium">Before</span>
              </div>
            </div>
          ) : (
            <div 
              className={`flex-1 border-2 border-dashed rounded-md overflow-hidden h-32 relative flex flex-col items-center justify-center ${
                isActive 
                  ? "border-primary-300 bg-primary-50" 
                  : "border-gray-300 bg-gray-50 opacity-50"
              }`}
            >
              <div className="flex items-center justify-center flex-col">
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
                    isActive ? "bg-primary-100" : "bg-gray-100"
                  }`}
                >
                  <Camera 
                    className={`text-xl ${isActive ? "text-primary-600" : "text-gray-500"}`} 
                  />
                </div>
                <p 
                  className={`text-sm font-medium ${
                    isActive ? "text-primary-700" : "text-gray-500"
                  }`}
                >
                  Take 'Before' Photo
                </p>
              </div>
              {isActive && (
                <Button 
                  className="absolute inset-0 w-full h-full opacity-0" 
                  onClick={() => setShowBeforeCamera(true)}
                >
                  Take Photo
                </Button>
              )}
            </div>
          )}
          
          {/* After Photo Section */}
          {hasAfterPhoto ? (
            <div className="flex-1 rounded-md overflow-hidden relative">
              <img 
                src={meal.afterPhotoUrl} 
                alt={`${meal.type} after`} 
                className="w-full h-32 object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white bg-green-600 rounded-full p-2">
                  <Check className="h-4 w-4" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-1 px-2">
                <span className="text-white text-xs font-medium">After</span>
              </div>
            </div>
          ) : (
            <div 
              className={`flex-1 border-2 border-dashed rounded-md overflow-hidden h-32 relative flex flex-col items-center justify-center ${
                isActive && hasBeforePhoto
                  ? "border-primary-300 bg-primary-50" 
                  : "border-gray-300 bg-gray-50 opacity-50"
              }`}
            >
              <div className="flex items-center justify-center flex-col">
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
                    isActive && hasBeforePhoto ? "bg-primary-100" : "bg-gray-100"
                  }`}
                >
                  <Camera 
                    className={`text-xl ${
                      isActive && hasBeforePhoto ? "text-primary-600" : "text-gray-500"
                    }`} 
                  />
                </div>
                <p 
                  className={`text-sm font-medium ${
                    isActive && hasBeforePhoto ? "text-primary-700" : "text-gray-500"
                  }`}
                >
                  Take 'After' Photo
                </p>
              </div>
              {isActive && hasBeforePhoto && (
                <Button 
                  className="absolute inset-0 w-full h-full opacity-0" 
                  onClick={() => setShowAfterCamera(true)}
                >
                  Take Photo
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between border-t pt-3 border-gray-200">
          {isCompleted ? (
            <div className="flex items-center text-sm text-green-700">
              <Star className="mr-1 h-4 w-4" />
              <span>+{meal.pointsEarned} points earned!</span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-500">
              <span>Capture your meal to earn points</span>
            </div>
          )}
          
          <Button
            disabled={isCompleted || !isActive}
            variant={isCompleted ? "ghost" : "default"}
            className={`px-4 py-1 rounded-full text-sm h-auto ${
              isCompleted 
                ? "bg-gray-200 text-gray-500" 
                : "bg-primary text-white hover:bg-primary/90"
            }`}
            onClick={() => {
              if (!hasBeforePhoto) {
                setShowBeforeCamera(true);
              } else if (!hasAfterPhoto) {
                setShowAfterCamera(true);
              }
            }}
          >
            {isCompleted ? "Already tracked" : "Track Meal"}
          </Button>
        </div>
      </div>
      
      {showBeforeCamera && (
        <CameraCapture 
          onCapture={handleBeforePhotoCapture}
          onCancel={() => setShowBeforeCamera(false)}
          title="Take Before Meal Photo"
        />
      )}
      
      {showAfterCamera && (
        <CameraCapture 
          onCapture={handleAfterPhotoCapture}
          onCancel={() => setShowAfterCamera(false)}
          title="Take After Meal Photo"
        />
      )}
    </div>
  );
}
