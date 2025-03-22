import { Switch, Route, Redirect, useLocation } from "wouter";
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
import { AuthProvider, AuthContext } from "@/hooks/useAuth";
import { useContext } from "react";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path?: string }) {
  const { user } = useContext(AuthContext);
  const [, navigate] = useLocation();
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  return <Component {...rest} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/download" component={DownloadPage} />
          <Route path="/dashboard">
            <ProtectedRoute component={Dashboard} />
          </Route>
          <Route path="/meals">
            <ProtectedRoute component={MealTracking} />
          </Route>
          <Route path="/achievements">
            <ProtectedRoute component={Achievements} />
          </Route>
          <Route path="/sustainability">
            <ProtectedRoute component={Sustainability} />
          </Route>
          <Route path="/settings">
            <ProtectedRoute component={Settings} />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
