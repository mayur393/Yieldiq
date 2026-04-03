"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  UserCircle, 
  LineChart, 
  MessageSquare, 
  Map as MapIcon, 
  Bell, 
  FileText,
  Database,
  FileUp,
  Activity,
  Sprout,
  History,
  ShoppingCart,
  ShieldCheck
} from "lucide-react";

const items = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Farm Profile",
    href: "/dashboard/farm-profile",
    icon: UserCircle,
  },
  {
    title: "Upload Lab Report",
    href: "/dashboard/report-upload",
    icon: FileUp,
  },
  {
    title: "Advisory Reports",
    href: "/dashboard/advisory",
    icon: FileText,
  },
  {
    title: "Cultivation Strategy",
    href: "/dashboard/strategy",
    icon: Sprout,
  },
  {
    title: "YieldIQ Assistant",
    href: "/dashboard/assistant",
    icon: MessageSquare,
  },
  {
    title: "GIS Visualization",
    href: "/dashboard/map",
    icon: MapIcon,
  },
  {
    title: "Data Pipeline",
    href: "/dashboard/data-pipeline",
    icon: Activity,
  },
  {
    title: "Database Explorer",
    href: "/dashboard/explorer",
    icon: Database,
  },
  {
    title: "Season History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Marketplace",
    href: "/dashboard/marketplace",
    icon: ShoppingCart,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {isAdmin && (
        <Link
          href="/dashboard/admin"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all bg-primary/10 text-primary border border-primary/20",
            pathname.startsWith("/dashboard/admin") ? "bg-primary text-white" : ""
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin Control
        </Link>
      )}
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            pathname === item.href 
              ? "bg-sidebar-accent text-sidebar-primary font-semibold" 
              : "text-sidebar-foreground/70"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
