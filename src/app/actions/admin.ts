"use server";

import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Validates whether the current session belongs to an admin user.
 * Admin emails are defined in the ADMIN_EMAILS env variable (comma-separated).
 */
async function validateAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: No valid session.");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    throw new Error("Forbidden: You do not have admin privileges.");
  }

  return session;
}

/**
 * Fetch all users by aggregating data from the farms table.
 * Groups results by owner_id to produce a list of unique users.
 */
export async function adminFetchAllUsersAction() {
  await validateAdminSession();

  const { data: farms, error } = await supabaseAdmin
    .from("farms")
    .select("owner_id, name, created_at, updated_at, plots, owner_email, owner_name")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch users error:", error);
    throw new Error(error.message);
  }

  // Map farms into user records
  const users = (farms || []).map((farm: any) => ({
    id: farm.owner_id,
    email: farm.owner_email || "—",
    name: farm.owner_name || farm.owner_id?.slice(0, 8) || "Unknown",
    farmName: farm.name || "Unnamed Farm",
    plotCount: Array.isArray(farm.plots) ? farm.plots.length : 0,
    createdAt: farm.created_at,
    updatedAt: farm.updated_at,
  }));

  return { users, count: users.length };
}

/**
 * Fetch a single user's complete farm data by owner_id.
 */
export async function adminFetchUserDetailAction(ownerId: string) {
  await validateAdminSession();

  const { data: farm, error } = await supabaseAdmin
    .from("farms")
    .select("*")
    .eq("owner_id", ownerId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { farm };
}

/**
 * Delete a user's farm record and associated data.
 */
export async function adminDeleteUserDataAction(ownerId: string) {
  await validateAdminSession();

  const { error } = await supabaseAdmin
    .from("farms")
    .delete()
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Get platform-wide statistics.
 */
export async function adminGetPlatformStatsAction() {
  await validateAdminSession();

  const { data: farms, error } = await supabaseAdmin
    .from("farms")
    .select("owner_id, plots, updated_at");

  if (error) {
    throw new Error(error.message);
  }

  const totalUsers = farms?.length || 0;
  const totalPlots = (farms || []).reduce((sum: number, f: any) => {
    return sum + (Array.isArray(f.plots) ? f.plots.length : 0);
  }, 0);

  // Users active in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const activeUsers = (farms || []).filter(
    (f: any) => f.updated_at && f.updated_at > sevenDaysAgo
  ).length;

  return { totalUsers, totalPlots, activeUsers };
}
