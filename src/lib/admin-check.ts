/**
 * Admin check utility - NO "use server" directive.
 * This is a plain async function safe to call from
 * both Server Actions, API routes, and NextAuth callbacks.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Checks if an email is authorized for admin access.
 * Checks .env whitelist first (fast), then the Supabase DB.
 */
export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  // 1. First check hardcoded .env list (zero-latency)
  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdmins.includes(email.toLowerCase())) {
    console.log(`[Admin] Env match for: ${email}`);
    return true;
  }

  // 2. Fallback: check Supabase admin_access table
  // Only attempt if we have the service key configured
  if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'dummy_key') {
    return false;
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await adminClient
      .from("admin_access")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (!error && data) {
      console.log(`[Admin] DB match for: ${email}`);
      return true;
    }
  } catch (e) {
    console.error("[Admin] DB check failed:", e);
  }

  return false;
}
