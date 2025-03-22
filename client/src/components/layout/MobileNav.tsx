import { Link, useLocation } from "wouter";
import { Home, Utensils, Medal, Leaf, Settings, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { 
      name: "Home", 
      icon: <Home className="h-5 w-5" />, 
      href: ROUTES.DASHBOARD,
      active: location === ROUTES.DASHBOARD
    },
    { 
      name: "Meals", 
      icon: <Utensils className="h-5 w-5" />, 
      href: ROUTES.MEALS,
      active: location === ROUTES.MEALS
    },
    { 
      name: "Badges", 
      icon: <Medal className="h-5 w-5" />, 
      href: ROUTES.ACHIEVEMENTS,
      active: location === ROUTES.ACHIEVEMENTS
    },
    { 
      name: "Activity", 
      icon: <Leaf className="h-5 w-5" />, 
      href: ROUTES.SUSTAINABILITY,
      active: location === ROUTES.SUSTAINABILITY
    },
    { 
      name: "Settings", 
      icon: <Settings className="h-5 w-5" />, 
      href: ROUTES.SETTINGS,
      active: location === ROUTES.SETTINGS
    }
  ];
  
  return (
    <>
      {/* Mobile Action Button */}
      {location === ROUTES.MEALS && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <Button className="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 p-0">
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-2"
            >
              <span className={item.active ? "text-primary" : "text-gray-900"}>{item.icon}</span>
              <span className={`text-xs mt-1 ${item.active ? "text-primary font-medium" : "text-gray-500"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
