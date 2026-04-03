"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DemoProvider, useDemoMode } from "@/components/demo-provider";
import { Leaf, User, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    localStorage.removeItem('demo_farm');
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Authenticating YieldIQ Dashboard...</p>
        </div>
      </div>
    );
  }

  // NextAuth gives us `{ user: { name, email, image } }`
  const user = session?.user;

  return (
    <DemoProvider>
      <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight font-headline">YieldIQ</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarNav />
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || "Farmer"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header - Mobile & Shared */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-4 md:hidden">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">YieldIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <h2 className="text-lg font-semibold font-headline">Dashboard</h2>
            <DemoToggle />
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/farm-profile">Farm Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
      </div>
    </DemoProvider>
  );
}

function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  return (
    <div className="flex items-center gap-2 border rounded-full px-3 py-1 bg-secondary/30">
       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Demo</span>
       <button 
         onClick={toggleDemoMode}
         className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isDemoMode ? 'bg-primary' : 'bg-muted'}`}
       >
         <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDemoMode ? 'translate-x-4' : 'translate-x-0'}`} />
       </button>
    </div>
  );
}
