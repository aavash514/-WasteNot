import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import MealTracking from "@/pages/meal-tracking";
import Achievements from "@/pages/achievements";
import Sustainability from "@/pages/sustainability";
import Settings from "@/pages/settings";
import DownloadPage from "@/pages/download";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/useAuth";
import useAuth from "@/hooks/useAuth";

// This is a custom component that renders a protected route
function ProtectedRoutes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  if (!user) {
    navigate("/");
    return null;
  }
  
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/meals" component={MealTracking} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/sustainability" component={Sustainability} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  // These routes are accessible without authentication
  const publicPaths = ["/", "/register", "/download"];
  const isPublicPath = publicPaths.includes(location);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isPublicPath ? (
          <Switch>
            <Route path="/" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/download" component={DownloadPage} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <ProtectedRoutes />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
