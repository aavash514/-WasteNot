import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import MobileNav from "@/components/layout/MobileNav";
import BadgeCard from "@/components/achievements/BadgeCard";
import { ROUTES, BADGE_TYPES } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/lib/types";

export default function Achievements() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);
  
  // Fetch user's badges
  const { data: badges, isLoading } = useQuery<Badge[]>({
    queryKey: user ? [`/api/users/${user.id}/badges`] : null,
    enabled: !!user,
  });
  
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
                <h1 className="text-2xl font-heading font-bold text-gray-900">Achievements</h1>
                <p className="text-sm text-gray-500">Your badges and rewards</p>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Achievements</h1>
              <p className="text-gray-500">Track your progress and unlock special rewards!</p>
            </div>
            
            {/* Badges and Achievements */}
            <Tabs defaultValue="badges" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="badges" className="space-y-6">
                {/* Current Badges */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="font-heading font-semibold text-lg">Your Badges</h2>
                    <p className="text-sm text-gray-500">
                      Badges earned through your sustainable actions
                    </p>
                  </div>
                  
                  {isLoading ? (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
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
                      <BadgeCard 
                        type="sustainability"
                        title="Green Guardian"
                        locked={true}
                      />
                      <BadgeCard 
                        type="recycling"
                        title="Waste Warrior"
                        locked={true}
                      />
                      <BadgeCard 
                        type="streak"
                        title="Food Saver"
                        locked={true}
                      />
                      <BadgeCard 
                        type="zeroWaste"
                        title="Eco Champion"
                        locked={true}
                      />
                    </div>
                  )}
                </div>
                
                {/* Badge Levels */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="font-heading font-semibold text-lg">Badge Levels</h2>
                    <p className="text-sm text-gray-500">
                      How to progress from bronze to gold
                    </p>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center mr-4">
                          <span className="text-amber-800 font-semibold">B</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Bronze Level</h3>
                          <p className="text-sm text-gray-500">10-24 streak days or activities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                          <span className="text-gray-700 font-semibold">S</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Silver Level</h3>
                          <p className="text-sm text-gray-500">25-49 streak days or activities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center mr-4">
                          <span className="text-amber-900 font-semibold">G</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Gold Level</h3>
                          <p className="text-sm text-gray-500">50+ streak days or activities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rewards" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="font-heading font-semibold text-lg">Available Rewards</h2>
                    <p className="text-sm text-gray-500">
                      Redeem your {user.points.toLocaleString()} points for these rewards
                    </p>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                              <span className="font-bold text-primary">S</span>
                            </div>
                            <div>
                              <h3 className="font-medium">$5 Sodexo Gift Card</h3>
                              <p className="text-xs text-gray-500">Use at any campus dining location</p>
                            </div>
                          </div>
                          <div className="text-primary-700 bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">
                            1,000 points
                          </div>
                        </div>
                        <div className="p-4 flex justify-end">
                          <button 
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              user.points >= 1000
                                ? "bg-primary text-white hover:bg-primary/90" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={user.points < 1000}
                          >
                            Redeem Reward
                          </button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                              <span className="font-bold text-green-600">S</span>
                            </div>
                            <div>
                              <h3 className="font-medium">$10 Starbucks Gift Card</h3>
                              <p className="text-xs text-gray-500">Valid at campus Starbucks location</p>
                            </div>
                          </div>
                          <div className="text-primary-700 bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">
                            2,000 points
                          </div>
                        </div>
                        <div className="p-4 flex justify-end">
                          <button 
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              user.points >= 2000
                                ? "bg-primary text-white hover:bg-primary/90" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={user.points < 2000}
                          >
                            Redeem Reward
                          </button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <span className="font-bold text-blue-600">C</span>
                            </div>
                            <div>
                              <h3 className="font-medium">Campus Bookstore Voucher</h3>
                              <p className="text-xs text-gray-500">$15 off your next purchase</p>
                            </div>
                          </div>
                          <div className="text-primary-700 bg-primary-100 px-3 py-1 rounded-full text-sm font-medium">
                            3,000 points
                          </div>
                        </div>
                        <div className="p-4 flex justify-end">
                          <button 
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              user.points >= 3000
                                ? "bg-primary text-white hover:bg-primary/90" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={user.points < 3000}
                          >
                            Redeem Reward
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
