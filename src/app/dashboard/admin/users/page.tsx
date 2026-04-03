import { fetchAdminTeammates } from "@/app/actions/admin";
import { AdminTeammates } from "@/components/dashboard/admin-teammates";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminTeammatesPage() {
  let teammates = [];
  let error = null;

  try {
    teammates = await fetchAdminTeammates();
  } catch (e: any) {
    console.error("Admin Teammates Fetch Error:", e);
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">Teammate Management</h1>
        <p className="text-muted-foreground text-sm">
          Control who can access the YieldIQ Command Center and sensitive farm data.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Authorization Database Error</AlertTitle>
          <AlertDescription>
            Could not fetch teammate list. Please ensure the <strong>admin_access</strong> table is created in Supabase.
            <div className="mt-4 p-4 bg-black/10 rounded font-mono text-[10px] break-all">
               {error}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <AdminTeammates initialTeammates={teammates} />
      )}
    </div>
  );
}
