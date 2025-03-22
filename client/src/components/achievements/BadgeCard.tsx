import { 
  Award, Flame, Leaf, Recycle, Trophy
} from "lucide-react";
import { Badge } from "@/lib/types";
import { BADGE_TYPES } from "@/lib/constants";

interface BadgeCardProps {
  badge?: Badge;
  type: string;
  title: string;
  count?: number;
  locked?: boolean;
}

export default function BadgeCard({ 
  badge, 
  type, 
  title, 
  count = 0,
  locked = false 
}: BadgeCardProps) {
  // Function to get appropriate icon
  const getIcon = () => {
    switch (type) {
      case BADGE_TYPES.STREAK:
        return <Flame className="text-2xl text-accent-500" />;
      case BADGE_TYPES.SUSTAINABILITY:
        return <Leaf className="text-2xl text-green-500" />;
      case BADGE_TYPES.RECYCLING:
        return <Recycle className="text-2xl text-blue-500" />;
      case BADGE_TYPES.ZERO_WASTE:
        return <Trophy className="text-2xl text-gray-400" />;
      default:
        return <Award className="text-2xl text-amber-500" />;
    }
  };
  
  // Function to get background color based on badge type
  const getBgColor = () => {
    switch (type) {
      case BADGE_TYPES.STREAK:
        return "bg-accent-100";
      case BADGE_TYPES.SUSTAINABILITY:
        return "bg-green-100";
      case BADGE_TYPES.RECYCLING:
        return "bg-blue-100";
      case BADGE_TYPES.ZERO_WASTE:
        return "bg-gray-100";
      default:
        return "bg-amber-100";
    }
  };
  
  const actualCount = badge?.count || count;
  
  return (
    <div className={`flex flex-col items-center ${locked ? "opacity-50" : ""}`}>
      <div className="relative">
        <div className={`h-16 w-16 rounded-full ${getBgColor()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        {actualCount > 0 && !locked && (
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {actualCount}
          </div>
        )}
      </div>
      <span className="mt-2 text-sm font-medium">{title}</span>
      {locked && <span className="text-xs text-gray-500">Locked</span>}
    </div>
  );
}
