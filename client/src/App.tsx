import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import DailySales from "@/pages/DailySales";
import ServiceOrders from "@/pages/ServiceOrders";
import Salespersons from "@/pages/Salespersons";
import Products from "@/pages/Products";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { Store, LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pos" component={POS} />
      <Route path="/daily-sales" component={DailySales} />
      <Route path="/service-orders" component={ServiceOrders} />
      <Route path="/salespersons" component={Salespersons} />
      <Route path="/products" component={Products} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const [storeName, setStoreName] = useState(() => {
    const saved = localStorage.getItem('storeInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.name || 'BRINKPDV';
      } catch {
        return 'BRINKPDV';
      }
    }
    return 'BRINKPDV';
  });

  useEffect(() => {
    const handleStoreInfoUpdate = () => {
      const saved = localStorage.getItem('storeInfo');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStoreName(parsed.name || 'BRINKPDV');
        } catch {
          setStoreName('BRINKPDV');
        }
      }
    };

    const handleAuthChange = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(auth);
      
      if (auth) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storeInfoUpdated', handleStoreInfoUpdate);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storeInfoUpdated', handleStoreInfoUpdate);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    // Disparar evento customizado
    window.dispatchEvent(new Event('authChanged'));
    
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado do sistema",
    });
    setLocation("/login");
  };

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <Login />
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3 border-b bg-background">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex items-center gap-2" data-testid="text-store-name">
                      <Store className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{storeName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentUser && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted" data-testid="text-current-user">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{currentUser.username}</span>
                        <span className="text-xs text-muted-foreground">({currentUser.role})</span>
                      </div>
                    )}
                    <ThemeToggle />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
