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
 * Checks if an email is authorized for admin access.
 * Whitelists emails from .env and the `admin_access` table.
 */
export async function checkIsAdminAction(email: string | null | undefined) {
  if (!email) return false;

  // 1. Check Hardcoded Admins (from .env)
  const envAdmins = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  console.log(`[Admin Debug] Checking: ${email} against:`, envAdmins);
  
  if (envAdmins.includes(email.toLowerCase())) {
    console.log(`[Admin Debug] Match found in .env!`);
    return true;
  }

  // 2. Check Database Whitelist (admin_access table)
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_access")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (!error && data) {
       console.log(`[Admin Debug] Match found in DB!`);
       return true;
    }
    if (error) console.log(`[Admin Debug] DB Error or No Match:`, error.message);
  } catch (e) {
    console.error("Admin check failed (DB):", e);
  }

  console.log(`[Admin Debug] No admin match found for ${email}`);
  return false;
}

/**
 * Fetches all farms for the Admin Dashboard overview.
 */
export async function fetchAllFarmsAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }

  const { data, error } = await supabaseAdmin
    .from("farms")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Admin Fetch Farms failed:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetches the list of teammate emails with admin access.
 */
export async function fetchAdminTeammates() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }

  const { data, error } = await supabaseAdmin
    .from("admin_access")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Adds a new teammate email to the admin whitelist.
 */
export async function addAdminTeammate(email: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }

  const { error } = await supabaseAdmin
    .from("admin_access")
    .insert([{ email: email.toLowerCase(), added_at: new Date().toISOString() }]);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Removes a teammate email from the admin whitelist.
 */
export async function removeAdminTeammate(email: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required.");
  }

  // Prevent self-removal if the email is also the Root Admin in .env (though .env check happens first usually)
  const { error } = await supabaseAdmin
    .from("admin_access")
    .delete()
    .eq("email", email.toLowerCase());

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
