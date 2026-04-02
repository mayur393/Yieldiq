"use server";

import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize a Server-Side Supabase client with the Service Role Key
// This client bypasses RLS and should ONLY be used in Server Actions.
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
 * Server Action to save or update farm data.
 * Bypasses RLS using the Service Role Key.
 */
export async function saveFarmDataAction(userId: string, payload: any) {
  // Validate session for security
  const session = await getServerSession(authOptions);
  if (!session || !userId) {
    throw new Error("Unauthorized: No valid session found.");
  }

  // Ensure the user is only saving their OWN data
  const authenticatedUserId = ((session as any).user as any).id || ((session as any).user as any).sub;
  if (userId !== authenticatedUserId) {
    throw new Error("Forbidden: You cannot modify another user's farm data.");
  }

  // Enrich payload with owner identity so the admin panel can display user info
  const enrichedPayload = {
    owner_id: userId,
    owner_email: (session as any).user?.email || null,
    owner_name: (session as any).user?.name || null,
    ...payload,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("farms")
    .upsert(enrichedPayload, { onConflict: "owner_id" });

  if (error) {
    console.error("Supabase Upsert Error (Server-Side):", error);
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Server Action to fetch farm data.
 */
export async function fetchFarmDataAction(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !userId || !(session as any).user) {
     return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabaseAdmin
    .from("farms")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Server Action to fetch an entire collection.
 */
export async function fetchCollectionAction(tableName: string, userIdKey: string, userIdVal?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !userIdVal || !(session as any).user) {
     return { data: [], error: "Unauthorized" };
  }

  const { data: rows, error } = await supabaseAdmin
    .from(tableName)
    .select("*")
    .eq(userIdKey, userIdVal);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: rows || [], error: null };
}
