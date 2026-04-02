"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetchUserDetailAction, adminDeleteUserDataAction } from "@/app/actions/admin";
import {
  ArrowLeft,
  Sprout,
  User,
  Trash2,
  Loader2,
  FlaskConical,
  MapPin,
  Calendar,
  Info,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

type Plot = {
  name: string;
  area?: number | string;
  crop?: string;
  labReport?: any;
  strategy?: any;
};

type FarmData = {
  owner_id: string;
  owner_name?: string;
  owner_email?: string;
  name?: string;
  location?: string;
  totalArea?: number | string;
  soilType?: string;
  irrigationType?: string;
  plots?: Plot[];
  created_at?: string;
  updated_at?: string;
  lastComputedInsights?: any;
};

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    adminFetchUserDetailAction(userId)
      .then((res) => setFarm(res.farm))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = async () => {
    if (!confirm("Delete all data for this user? This is permanent.")) return;
    setDeleting(true);
    try {
      await adminDeleteUserDataAction(userId);
      router.push("/admin");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
      setDeleting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const card = {
    background: "hsl(220,20%,10%)",
    border: "1px solid hsl(220,15%,16%)",
    borderRadius: "14px",
  };
  const textMuted = { color: "hsl(220,10%,55%)" };
  const accent = "hsl(98,60%,45%)";
  const gold = "hsl(45,85%,60%)";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: accent }} />
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-sm" style={textMuted}>
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>
        <div
          className="flex items-center gap-3 p-5 rounded-xl"
          style={{ background: "hsl(0,60%,12%)", border: "1px solid hsl(0,60%,25%)" }}
        >
          <ShieldAlert className="h-5 w-5" style={{ color: "hsl(0,80%,65%)" }} />
          <span style={{ color: "hsl(0,80%,75%)" }}>{error || "User data not found."}</span>
        </div>
      </div>
    );
  }

  const plots: Plot[] = farm.plots || [];
  const hasInsights = !!farm.lastComputedInsights;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            id="back-to-admin"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={textMuted}
          >
            <ArrowLeft className="h-4 w-4" /> All Users
          </Link>
          <span style={textMuted}>/</span>
          <span className="text-sm text-white font-semibold">{farm.owner_name || farm.owner_email || userId}</span>
        </div>
        <button
          id="delete-user-data"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "hsl(0,60%,20%)", color: "hsl(0,80%,70%)", border: "1px solid hsl(0,60%,30%)" }}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete User Data
        </button>
      </div>

      {/* User Identity Card */}
      <div className="flex items-center gap-5 p-6" style={card}>
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: "hsl(98,60%,40%,0.15)", color: accent }}
        >
          {farm.owner_name?.charAt(0)?.toUpperCase() || farm.owner_email?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-white">{farm.owner_name || "Unknown User"}</p>
          <p className="text-sm" style={textMuted}>{farm.owner_email || "No email on record"}</p>
          <p className="text-xs mt-1 font-mono" style={{ color: "hsl(220,10%,40%)" }}>ID: {farm.owner_id}</p>
        </div>
        <div className="text-right">
          {hasInsights ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "hsl(98,60%,40%,0.15)", color: accent }}
            >
              <CheckCircle2 className="h-3 w-3" /> AI Insights Active
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "hsl(220,15%,15%)", color: "hsl(220,10%,50%)" }}
            >
              <Info className="h-3 w-3" /> No AI Insights
            </span>
          )}
        </div>
      </div>

      {/* Farm Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Farm Info */}
        <div className="p-6 space-y-4" style={card}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" style={{ color: accent }} />
            <h3 className="font-semibold text-white">Farm Information</h3>
          </div>
          {[
            { label: "Farm Name", value: farm.name || "—" },
            { label: "Location", value: farm.location || "—" },
            { label: "Total Area", value: farm.totalArea ? `${farm.totalArea} acres` : "—" },
            { label: "Soil Type", value: farm.soilType || "—" },
            { label: "Irrigation", value: farm.irrigationType || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm" style={textMuted}>{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Account Meta */}
        <div className="p-6 space-y-4" style={card}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" style={{ color: gold }} />
            <h3 className="font-semibold text-white">Account Activity</h3>
          </div>
          {[
            { label: "Account Created", value: formatDate(farm.created_at) },
            { label: "Last Updated", value: formatDate(farm.updated_at) },
            { label: "Total Plots", value: plots.length.toString() },
            { label: "Plots with Reports", value: plots.filter((p) => p.labReport).length.toString() },
            { label: "Plots with Strategy", value: plots.filter((p) => p.strategy).length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm" style={textMuted}>{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plots List */}
      <div style={card} className="overflow-hidden">
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: "1px solid hsl(220,15%,15%)" }}
        >
          <Sprout className="h-5 w-5" style={{ color: gold }} />
          <h3 className="font-semibold text-white">Plots</h3>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "hsl(45,85%,60%,0.12)", color: gold }}
          >
            {plots.length}
          </span>
        </div>

        {plots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Info className="h-10 w-10 mb-3" style={textMuted} />
            <p className="text-sm" style={textMuted}>No plots have been defined for this farm.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "hsl(220,15%,12%)" }}>
            {plots.map((plot, idx) => (
              <div key={idx} className="px-6 py-4 flex items-start gap-5">
                {/* Index */}
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "hsl(220,15%,14%)", color: "hsl(220,10%,60%)" }}
                >
                  {idx + 1}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{plot.name || `Plot ${idx + 1}`}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {plot.area && (
                      <span className="text-xs" style={textMuted}>
                        Area: <span className="text-white">{plot.area} acres</span>
                      </span>
                    )}
                    {plot.crop && (
                      <span className="text-xs" style={textMuted}>
                        Crop: <span className="text-white">{plot.crop}</span>
                      </span>
                    )}
                  </div>
                </div>
                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {plot.labReport ? (
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: "hsl(98,60%,40%,0.12)", color: accent }}
                    >
                      <FlaskConical className="h-3 w-3" /> Lab Report
                    </span>
                  ) : (
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: "hsl(220,15%,14%)", color: "hsl(220,10%,45%)" }}
                    >
                      No Report
                    </span>
                  )}
                  {plot.strategy ? (
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: "hsl(45,85%,60%,0.12)", color: gold }}
                    >
                      <User className="h-3 w-3" /> Strategy
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
