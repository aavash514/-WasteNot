import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import MobileNav from "@/components/layout/MobileNav";
import { ROUTES } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { Meal, Badge, Activity } from "@/lib/types";
import WeekProgress from "@/components/meals/WeekProgress";
import MealCard from "@/components/meals/MealCard";
import BadgeCard from "@/components/achievements/BadgeCard";
import ActivityCard from "@/components/sustainability/ActivityCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);
  
  // Fetch user's meals
  const { data: meals, isLoading: isMealsLoading } = useQuery<Meal[]>({
    queryKey: user ? [`/api/users/${user.id}/meals`] : null,
    enabled: !!user,
  });
  
  // Fetch user's badges
  const { data: badges, isLoading: isBadgesLoading } = useQuery<Badge[]>({
    queryKey: user ? [`/api/users/${user.id}/badges`] : null,
    enabled: !!user,
  });
  
  // Fetch sustainability activities
  const { data: activities, isLoading: isActivitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });
  
  // Set current day as 3 for demonstration purposes
  const currentDay = 3;
  
  // Get meals for today
  const todayMeals = meals?.filter(meal => meal.day === currentDay);
  
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
                <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user.name}!</p>
            </div>
            
            {/* Week Progress */}
            {isMealsLoading ? (
              <div className="mb-6">
                <Skeleton className="h-56 w-full rounded-lg" />
              </div>
            ) : (
              meals && <WeekProgress meals={meals} currentDay={currentDay} />
            )}
            
            {/* Today's Highlight Meal */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <h2 className="font-heading font-semibold text-lg">Next Meal to Track</h2>
                <p className="text-sm text-gray-500">Track your meal to earn points!</p>
              </div>
              
              <div className="p-4">
                {isMealsLoading ? (
                  <Skeleton className="h-64 w-full rounded-lg" />
                ) : (
                  todayMeals && todayMeals.find(meal => meal.status === "pending") ? (
                    // Show the first pending meal for today
                    <MealCard 
                      meal={todayMeals.find(meal => meal.status === "pending")!} 
                      isActive={true} 
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      All meals tracked for today! 🎉
                    </div>
                  )
                )}
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-heading font-semibold text-lg">Your Achievements</h2>
                <a href={ROUTES.ACHIEVEMENTS} className="text-sm text-primary hover:text-primary/90">View All</a>
              </div>
              
              <div className="p-4">
                {isBadgesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <BadgeCard 
                      badge={badges?.find(b => b.type === "streak")}
                      type="streak"
                      title="Streak Master"
                      count={user.streak}
                    />
                    <BadgeCard 
                      badge={badges?.find(b => b.type === "sustainability")}
                      type="sustainability"
                      title="Plant Helper"
                      count={3}
                    />
                    <BadgeCard 
                      badge={badges?.find(b => b.type === "recycling")}
                      type="recycling"
                      title="Recycling Pro"
                      count={7}
                    />
                    <BadgeCard 
                      type="zeroWaste"
                      title="Zero Waste"
                      locked={true}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Sustainability Activities */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-heading font-semibold text-lg">Sustainability Activities</h2>
                <a href={ROUTES.SUSTAINABILITY} className="text-sm text-primary hover:text-primary/90">View All</a>
              </div>
              
              <div className="p-4">
                {isActivitiesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities && activities.slice(0, 2).map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
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
