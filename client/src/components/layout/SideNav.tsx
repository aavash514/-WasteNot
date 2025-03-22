import { Link, useLocation } from "wouter";
import { 
  Home, Utensils, Medal, Leaf, Settings, Coins, Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_AVATAR, ROUTES } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";

export default function SideNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  
  const navItems = [
    { 
      name: "Dashboard", 
      icon: <Home className="w-5 h-5" />, 
      href: ROUTES.DASHBOARD,
      active: location === ROUTES.DASHBOARD
    },
    { 
      name: "Meal Tracking", 
      icon: <Utensils className="w-5 h-5" />, 
      href: ROUTES.MEALS,
      active: location === ROUTES.MEALS
    },
    { 
      name: "Achievements", 
      icon: <Medal className="w-5 h-5" />, 
      href: ROUTES.ACHIEVEMENTS,
      active: location === ROUTES.ACHIEVEMENTS
    },
    { 
      name: "Sustainability", 
      icon: <Leaf className="w-5 h-5" />, 
      href: ROUTES.SUSTAINABILITY,
      active: location === ROUTES.SUSTAINABILITY
    },
    { 
      name: "Settings", 
      icon: <Settings className="w-5 h-5" />, 
      href: ROUTES.SETTINGS,
      active: location === ROUTES.SETTINGS
    },
    { 
      name: "Download", 
      icon: <Download className="w-5 h-5" />, 
      href: ROUTES.DOWNLOAD,
      active: location === ROUTES.DOWNLOAD
    }
  ];
  
  return (
    <aside className="hidden md:block md:w-64 lg:w-72 flex-shrink-0 mb-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col items-center py-6 px-4 bg-gradient-to-r from-primary to-primary/90 text-white">
          <Avatar className="h-24 w-24 rounded-full border-4 border-white shadow-md">
            <AvatarImage src={user.avatarUrl || DEFAULT_AVATAR} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 font-heading font-semibold text-lg">{user.name}</h2>
          <p className="text-primary-100 text-sm">{user.email}</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-gray-500 uppercase font-semibold">Current Points</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-secondary-500">{user.points.toLocaleString()}</span>
                <Coins className="ml-2 h-5 w-5 text-secondary-400" />
              </div>
            </div>
            <Button className="bg-primary text-white text-sm px-3 py-1 h-auto rounded-full hover:bg-primary/90 shadow-sm">
              Redeem
            </Button>
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 uppercase font-semibold">Current Streak</span>
              <span className="text-xs text-gray-500">{user.streak} days</span>
            </div>
            <Progress value={Math.min(user.streak, 100)} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition ${
                  item.active 
                    ? "bg-primary-50 text-primary font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className={`mr-3 ${item.active ? "" : "text-gray-400"}`}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
