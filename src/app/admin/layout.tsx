import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Leaf, LayoutDashboard, Users, BarChart3, ShieldCheck, LogOut, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Admin Panel – YieldIQ",
  description: "Admin dashboard for managing YieldIQ users and platform data.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // --- Auth Guard ---
  if (!session?.user?.email) {
    redirect("/login");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  const adminUser = session.user;

  return (
    <div className="flex min-h-screen" style={{ background: "hsl(220, 20%, 6%)", color: "hsl(220, 10%, 95%)" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col border-r"
        style={{ borderColor: "hsl(220,15%,15%)", background: "hsl(220,20%,8%)" }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6" style={{ borderColor: "hsl(220,15%,15%)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "hsl(98,60%,40%)" }}>
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">YieldIQ</span>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3" style={{ color: "hsl(45,85%,60%)" }} />
              <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: "hsl(45,85%,60%)" }}>
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: "/admin", icon: LayoutDashboard, label: "Overview" },
            { href: "/admin/users", icon: Users, label: "All Users" },
            { href: "/admin/stats", icon: BarChart3, label: "Platform Stats" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group"
              style={{ color: "hsl(220,10%,65%)" }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
              <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Footer: admin user info */}
        <div className="border-t p-4" style={{ borderColor: "hsl(220,15%,15%)" }}>
          <div className="rounded-lg p-3" style={{ background: "hsl(220,15%,12%)" }}>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "hsl(98,60%,40%)", color: "white" }}
              >
                {adminUser.name?.charAt(0)?.toUpperCase() || adminUser.email?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-white">{adminUser.name || "Admin"}</p>
                <p className="text-[10px] truncate" style={{ color: "hsl(220,10%,50%)" }}>{adminUser.email}</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ color: "hsl(220,10%,50%)" }}
          >
            <LogOut className="h-3 w-3" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header
          className="flex h-16 items-center justify-between px-6 border-b"
          style={{ borderColor: "hsl(220,15%,15%)", background: "hsl(220,20%,8%)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: "hsl(45,85%,60%)" }} />
            <span className="font-semibold text-white">Admin Control Panel</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "hsl(98,60%,40%,0.15)", color: "hsl(98,60%,65%)" }}>
            Superadmin Access
          </span>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
