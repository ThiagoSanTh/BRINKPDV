import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Wrench,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "PDV / Vendas",
    url: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Vendas do Dia",
    url: "/daily-sales",
    icon: TrendingUp,
  },
  {
    title: "Ordens de Serviço",
    url: "/service-orders",
    icon: Wrench,
  },
  {
    title: "Vendedores",
    url: "/salespersons",
    icon: Users,
  },
  {
    title: "Produtos",
    url: "/products",
    icon: Package,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [storeLogo, setStoreLogo] = useState<string | null>(() => {
    return localStorage.getItem('storeLogo') || null;
  });

  useEffect(() => {
    // Escutar mudanças no logo
    const handleLogoUpdate = () => {
      setStoreLogo(localStorage.getItem('storeLogo') || null);
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          {storeLogo ? (
            <div className="h-8 w-8 rounded-md overflow-hidden flex items-center justify-center bg-muted">
              <img 
                src={storeLogo} 
                alt="Logo da loja" 
                className="h-full w-full object-contain"
                data-testid="img-sidebar-logo"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg">BRINKPDV</h2>
            <p className="text-xs text-muted-foreground">Sistema PDV</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
