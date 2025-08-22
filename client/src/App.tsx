import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TripsPage from "@/pages/trips";
import NotFound from "@/pages/not-found";

function Router() {
  const authenticated = isAuthenticated();

  return (
    <Switch>
      <Route path="/" component={authenticated ? Dashboard : Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={authenticated ? Dashboard : Login} />
      <Route path="/trips" component={authenticated ? TripsPage : Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
