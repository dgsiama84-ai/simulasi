import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameStoreProvider, useGameStore } from "@/hooks/use-game-store";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import GamePage from "@/pages/GamePage";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient();

// Route Guard Component
function RouteGuard() {
  const { session } = useGameStore();
  const [location] = useLocation();

  if (!session) {
    if (location !== "/") {
      return <AuthPage />;
    }
    return <AuthPage />;
  }

  if (session.isAdmin) {
    if (location === "/") return <GamePage />;
    return (
      <Switch>
        <Route path="/game" component={GamePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/" component={GamePage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Regular user
  if (location === "/admin") return <GamePage />; // Block regular user from admin
  
  return (
    <Switch>
      <Route path="/" component={GamePage} />
      <Route path="/game" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameStoreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <RouteGuard />
          </WouterRouter>
          <Toaster />
        </GameStoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
