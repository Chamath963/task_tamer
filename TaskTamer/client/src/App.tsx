import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import MainLayout from "./components/layout/main-layout";
import Dashboard from "./pages/dashboard.tsx";
import Timer from "./pages/timer.tsx";
import Journal from "./pages/journal.tsx";
import Analytics from "./pages/analytics.tsx";
import Login from "./pages/login";
import Register from "./pages/register";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/timer">
        <ProtectedRoute>
          <Timer />
        </ProtectedRoute>
      </Route>
      <Route path="/journal">
        <ProtectedRoute>
          <Journal />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
