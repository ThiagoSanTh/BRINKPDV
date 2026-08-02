import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold">Sidebar Example</h1>
          <p className="text-muted-foreground mt-2">
            This is the main content area
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
