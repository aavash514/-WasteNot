import { useMutation } from "@tanstack/react-query";
import { Leaf, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@/lib/types";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { queryClient, apiRequest } from "@/lib/queryClient";
import useAuth from "@/hooks/useAuth";
import { format } from "date-fns";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { user } = useAuth();
  
  // Format the date for display
  const formattedDate = format(new Date(activity.date), "EEEE, MMM d • h:mm a");
  
  // Join activity mutation
  const joinActivity = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to join an activity");
      
      return apiRequest("POST", `/api/activities/${activity.id}/join`, {
        userId: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    }
  });
  
  // Get appropriate icon based on activity type
  const getIcon = () => {
    switch (activity.type) {
      case ACTIVITY_TYPES.GARDEN:
        return <Leaf className="text-green-600" />;
      case ACTIVITY_TYPES.RECYCLING:
        return <Recycle className="text-blue-600" />;
      default:
        return <Leaf className="text-green-600" />;
    }
  };
  
  // Get background color based on activity type
  const getBgColor = () => {
    switch (activity.type) {
      case ACTIVITY_TYPES.GARDEN:
        return "bg-green-100";
      case ACTIVITY_TYPES.RECYCLING:
        return "bg-blue-100";
      default:
        return "bg-green-100";
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-200 transition">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getBgColor()} mr-3`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium">{activity.title}</h3>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div>
          <Badge variant="outline" className="text-primary bg-primary-100">
            +{activity.points} points
          </Badge>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-200">
        <div className="flex items-center">
          <span className="text-xs text-gray-500">{activity.participantsCount} people going</span>
        </div>
        <Button 
          variant="link" 
          className="text-primary hover:text-primary/90 p-0 h-auto"
          onClick={() => joinActivity.mutate()}
          disabled={joinActivity.isPending}
        >
          {joinActivity.isPending ? "Joining..." : "Join Event"}
        </Button>
      </div>
    </div>
  );
}
