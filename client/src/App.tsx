import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/AuthContext"; // Importe aqui
import { queryClient } from "./lib/queryClient";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TripsPage from "@/pages/trips";
import NotFound from "@/pages/not-found";

// Componente de Rota Protegida
function PrivateRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>; // Ou um spinner
  }

  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <PrivateRoute path="/dashboard" component={Dashboard} />
      <PrivateRoute path="/trips" component={TripsPage} />
      {/* Rota raiz redireciona para o dashboard se logado, senão para login */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider> {/* Envolve o Router com o AuthProvider */}
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;