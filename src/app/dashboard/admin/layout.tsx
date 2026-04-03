import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  LayoutDashboard, 
  ArrowLeft,
  Settings,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // 🛡️ SERVER-SIDE GUARD
  // If not an admin, redirect to standard dashboard immediately.
  if (!session || (session as any).user?.role !== 'admin') {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden lg:flex flex-col">
        <div className="p-6 border-b bg-card">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-headline tracking-tight uppercase text-sm">Admin Control</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/dashboard/admin" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Global Overview
          </Link>
          <Link 
            href="/dashboard/admin/users" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium transition-colors"
          >
            <Users className="h-4 w-4" />
            Teammate Management
          </Link>
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            System
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </nav>

        <div className="p-4 border-t bg-card text-[10px] text-muted-foreground flex items-center justify-between">
           <span>YieldIQ v1.0.4-st</span>
           <Database className="h-3 w-3" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" asChild>
                <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Command Center</h2>
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                ACTIVE SESSION: {(session as any).user?.email}
              </span>
           </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
