import { fetchAllFarmsAdmin } from "@/app/actions/admin";
import { AdminOverview } from "@/components/dashboard/admin-overview";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let farms = [];
  let error = null;

  try {
    farms = await fetchAllFarmsAdmin();
  } catch (e: any) {
    console.error("Admin Dashboard Fetch Error:", e);
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter">GLOBAL OVERVIEW</h1>
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          Real-time intelligence from the YieldIQ network.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Admin Database Sync Issue</AlertTitle>
          <AlertDescription>
            Could not fetch global farm data. This is likely because the <strong>admin_access</strong> table has not been created in Supabase yet.
            <div className="mt-4 p-4 bg-black/10 rounded font-mono text-[10px] break-all">
               {error}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <AdminOverview farms={farms} />
      )}
    </div>
  );
}
