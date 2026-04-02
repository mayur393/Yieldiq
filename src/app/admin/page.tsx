"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminFetchAllUsersAction,
  adminGetPlatformStatsAction,
  adminDeleteUserDataAction,
} from "@/app/actions/admin";
import {
  Users,
  Sprout,
  Activity,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  Loader2,
} from "lucide-react";

type UserRecord = {
  id: string;
  email: string;
  name: string;
  farmName: string;
  plotCount: number;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  totalUsers: number;
  totalPlots: number;
  activeUsers: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResult, statsResult] = await Promise.all([
        adminFetchAllUsersAction(),
        adminGetPlatformStatsAction(),
      ]);
      setUsers(usersResult.users);
      setStats(statsResult);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user's farm data? This cannot be undone.")) return;
    setDeletingId(userId);
    try {
      await adminDeleteUserDataAction(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.farmName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- Style tokens ---
  const card = {
    background: "hsl(220,20%,10%)",
    border: "1px solid hsl(220,15%,16%)",
    borderRadius: "14px",
  };
  const textMuted = { color: "hsl(220,10%,55%)" };
  const accent = "hsl(98,60%,45%)";
  const gold = "hsl(45,85%,60%)";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(220,10%,97%)" }}>
          Platform Overview
        </h1>
        <p className="text-sm mt-1" style={textMuted}>
          Manage all registered users and their YieldIQ farm data.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: "hsl(0,60%,15%)", border: "1px solid hsl(0,60%,30%)" }}
        >
          <ShieldAlert className="h-5 w-5 flex-shrink-0" style={{ color: "hsl(0,80%,65%)" }} />
          <span className="text-sm" style={{ color: "hsl(0,80%,75%)" }}>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers ?? "—",
            icon: Users,
            color: accent,
            bg: "hsl(98,60%,40%, 0.12)",
          },
          {
            label: "Total Plots",
            value: stats?.totalPlots ?? "—",
            icon: Sprout,
            color: gold,
            bg: "hsl(45,85%,60%, 0.12)",
          },
          {
            label: "Active (7d)",
            value: stats?.activeUsers ?? "—",
            icon: Activity,
            color: "hsl(200,80%,60%)",
            bg: "hsl(200,80%,50%, 0.12)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-5 p-6"
            style={card}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {loading ? <Loader2 className="h-7 w-7 animate-spin inline" style={textMuted} /> : value}
              </p>
              <p className="text-sm" style={textMuted}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table Section */}
      <div style={card} className="overflow-hidden">
        {/* Table header bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4"
          style={{ borderBottom: "1px solid hsl(220,15%,15%)" }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: accent }} />
            <h2 className="text-base font-semibold text-white">User Registry</h2>
            {!loading && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "hsl(98,60%,40%,0.15)", color: accent }}
              >
                {filtered.length} users
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={textMuted} />
              <input
                id="admin-search"
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-colors"
                style={{
                  background: "hsl(220,20%,7%)",
                  border: "1px solid hsl(220,15%,20%)",
                  color: "hsl(220,10%,90%)",
                }}
              />
            </div>
            {/* Refresh */}
            <button
              id="admin-refresh"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-all"
              style={{
                background: "hsl(220,15%,14%)",
                border: "1px solid hsl(220,15%,20%)",
                color: "hsl(220,10%,70%)",
              }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: accent }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp className="h-12 w-12 mb-4" style={textMuted} />
            <p className="text-base font-medium text-white">No users found</p>
            <p className="text-sm mt-1" style={textMuted}>
              {searchQuery ? "Try a different search term." : "No users have created a farm yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(220,15%,14%)" }}>
                  {["User", "Farm", "Plots", "Joined", "Last Active", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={textMuted}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="group transition-colors"
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid hsl(220,15%,12%)" : "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "hsl(220,20%,12%)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: "hsl(98,60%,40%,0.2)", color: accent }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs" style={textMuted}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Farm */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{user.farmName}</span>
                    </td>

                    {/* Plots */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "hsl(45,85%,60%,0.12)",
                          color: gold,
                        }}
                      >
                        <Sprout className="h-3 w-3" />
                        {user.plotCount} plots
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4">
                      <span style={textMuted}>{formatDate(user.createdAt)}</span>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4">
                      <span style={textMuted}>{formatDate(user.updatedAt)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          id={`view-user-${user.id}`}
                          href={`/admin/users/${user.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "hsl(220,15%,15%)",
                            color: "hsl(220,10%,75%)",
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        <button
                          id={`delete-user-${user.id}`}
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "hsl(0,60%,20%,0.5)",
                            color: "hsl(0,80%,65%)",
                          }}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
