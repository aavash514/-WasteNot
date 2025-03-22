import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import MobileNav from "@/components/layout/MobileNav";
import ActivityCard from "@/components/sustainability/ActivityCard";
import { ROUTES } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { Activity } from "@/lib/types";

export default function Sustainability() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);
  
  // Fetch sustainability activities
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
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
                <h1 className="text-2xl font-heading font-bold text-gray-900">Sustainability</h1>
                <p className="text-sm text-gray-500">Join activities to earn points and badges</p>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Sustainability Activities</h1>
              <p className="text-gray-500">Join these campus activities to earn points and special badges!</p>
            </div>
            
            {/* Upcoming Activities */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <h2 className="font-heading font-semibold text-lg">Upcoming Activities</h2>
                <p className="text-sm text-gray-500">
                  Participate to earn rewards and make a difference
                </p>
              </div>
              
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities?.map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sustainability Tips */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <h2 className="font-heading font-semibold text-lg">Sustainability Tips</h2>
                <p className="text-sm text-gray-500">
                  Small changes that make a big impact
                </p>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Reducing Food Waste</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Plan your meals and make a shopping list to avoid buying excess food</li>
                      <li>Store food properly to extend its freshness</li>
                      <li>Learn to repurpose leftovers into new meals</li>
                      <li>Understand the difference between "best by" and "expires on" dates</li>
                      <li>Serve smaller portions and go back for seconds if needed</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Sustainable Campus Living</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Bring a reusable water bottle and coffee mug to campus</li>
                      <li>Use digital notes instead of paper when possible</li>
                      <li>Turn off lights and unplug electronics when not in use</li>
                      <li>Take shorter showers to conserve water</li>
                      <li>Use campus recycling bins properly by following sorting guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
