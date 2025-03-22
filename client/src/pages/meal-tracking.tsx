import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import MobileNav from "@/components/layout/MobileNav";
import WeekProgress from "@/components/meals/WeekProgress";
import MealCard from "@/components/meals/MealCard";
import { ROUTES } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { Meal } from "@/lib/types";

export default function MealTracking() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Set current day as 3 for demonstration purposes
  const [currentDay] = useState(3);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);
  
  // Fetch user's meals
  const { data: allMeals, isLoading: isAllMealsLoading } = useQuery<Meal[]>({
    queryKey: user ? [`/api/users/${user.id}/meals`] : null,
    enabled: !!user,
  });
  
  // Fetch meals for current day
  const { data: todayMeals, isLoading: isTodayMealsLoading } = useQuery<Meal[]>({
    queryKey: user ? [`/api/users/${user.id}/meals/day/${currentDay}`] : null,
    enabled: !!user,
  });
  
  // Get today's date
  const todayDate = format(new Date(), "EEEE, MMMM d");
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="md:flex md:space-x-6">
          <SideNav />
          
          <div className="flex-1">
            {/* Mobile header */}
            <div className="md:hidden flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Meal Tracking</h1>
                <p className="text-sm text-gray-500">Track your meals to earn points</p>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Meal Tracking</h1>
              <p className="text-gray-500">Track your meals to reduce waste and earn points!</p>
            </div>
            
            {/* Week Progress */}
            {isAllMealsLoading ? (
              <div className="mb-6">
                <Skeleton className="h-56 w-full rounded-lg" />
              </div>
            ) : (
              allMeals && <WeekProgress meals={allMeals} currentDay={currentDay} />
            )}
            
            {/* Today's Meals */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <h2 className="font-heading font-semibold text-lg">Today's Meals</h2>
                <p className="text-sm text-gray-500">{todayDate}</p>
              </div>
              
              <div className="p-4 space-y-4">
                {isTodayMealsLoading ? (
                  <>
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </>
                ) : (
                  todayMeals?.map(meal => (
                    <MealCard 
                      key={meal.id} 
                      meal={meal} 
                      isActive={meal.status === "pending"} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
