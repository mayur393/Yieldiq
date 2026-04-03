"use client";

import { useUser, useFarm } from "@/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  ArrowRight,
  Loader2,
  Info,
  FileUp,
  FlaskConical,
  Sun,
  CloudRain
} from "lucide-react";
import Link from "next/link";
import { YieldOverviewChart } from "@/components/dashboard/yield-overview-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { PlotStatusCard } from "@/components/dashboard/plot-status-card";
import { useDemoMode } from "@/components/demo-provider";
import { DEMO_DATA } from "@/lib/demo-data";

export default function Dashboard() {
  const { data: session } = useSession();
  const { user } = useUser();

  const { isDemoMode } = useDemoMode();

  // Prefer NextAuth session if user isn't synced yet (for UI only)
  const displayUser = isDemoMode ? { name: "Demo Farmer" } : (user || session?.user);
  const userUid = user?.uid || (session?.user as any)?.id;
  const userName = isDemoMode ? "Demo Farmer" : ((displayUser as any)?.name || (displayUser as any)?.displayName || "Farmer");

  const { data: farmData, isLoading: isFarmLoading } = useFarm(userUid);

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  if (isFarmLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const activeFarm = isDemoMode ? DEMO_DATA.farm : farmData;
  const hasInsights = isDemoMode ? true : !!activeFarm?.lastComputedInsights;
  const advisory = isDemoMode ? activeFarm?.plots[0]?.latestAdvisory : activeFarm?.latestAdvisory;
  const plots = activeFarm?.plots || [];
  const weatherText = isDemoMode ? DEMO_DATA.dashboard.weather : "32°C • Clear";
  const smartTasks = isDemoMode ? DEMO_DATA.dashboard.smartTasks : advisory?.smartTasks || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            {farmData?.name ? `Farm: ${farmData.name}` : "Connect your data for AI-driven farming advice."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-lg border border-primary/10">
            <Sun className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{weatherText}</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg border border-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{today}</span>
          </div>
        </div>
      </div>

      {!hasInsights && (
        <Alert className="bg-primary/5 border-primary/20 p-6">
          <FlaskConical className="h-6 w-6 text-primary" />
          <div className="ml-4 flex-1">
            <AlertTitle className="text-lg font-bold">Scientific Insights Ready for You</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <span className="max-w-xl text-muted-foreground">
                Upload your water or soil lab report to see your predicted yield and irrigation schedule tailored to your land.
              </span>
              <Button size="lg" className="shrink-0 gap-2" asChild>
                <Link href="/dashboard/report-upload">
                  <FileUp className="h-4 w-4" />
                  Upload Lab Report
                </Link>
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Plot Wise Status Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
            Plot Wise Status
            {plots.length > 0 && <Badge variant="outline" className="ml-2">{plots.length} Plots</Badge>}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/report-upload" className="text-primary text-xs font-bold uppercase tracking-tight">
              Manage Plots 
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>

        {plots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plots.map((plot: any, idx: number) => (
              <PlotStatusCard key={idx} plot={plot} index={idx} />
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Info className="h-10 w-10 text-muted-foreground mb-4" />
              <CardTitle className="text-lg">No Plots Defined</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Go to your Farm Profile to add plots and upload lab reports for AI analysis.
              </CardDescription>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/farm-profile">Set Up Farm Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Harvest Forecast</CardTitle>
              <CardDescription>Comparison of your historical yield against AI predictions.</CardDescription>
            </div>
            {hasInsights && (
               <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                 Science Verified
               </Badge>
            )}
          </CardHeader>
          <CardContent>
            <YieldOverviewChart />
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
               Smart Tasks
               {hasInsights && <Badge className="ml-2 bg-primary">{smartTasks.length}</Badge>}
            </CardTitle>
            <CardDescription>Actions to take right now for better growth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasInsights ? (
              smartTasks.map((task: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors group">
                  <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                    task.priority === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Priority: {task.priority}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                 <Info className="h-10 w-10 text-muted mx-auto mb-4" />
                 <p className="text-sm text-muted-foreground">Upload a lab report to see your tasks.</p>
              </div>
            )}
            
            <Button className="w-full mt-4" asChild>
              <Link href="/dashboard/advisory">Read Full Advice Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
