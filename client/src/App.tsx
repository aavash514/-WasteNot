import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/meals" component={MealTracking} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/sustainability" component={Sustainability} />
      <Route path="/settings" component={Settings} />
      <Route path="/download" component={DownloadPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
