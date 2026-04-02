"use client";

import { useState, useEffect } from "react";
import { useUser, useFarm, saveFarmData } from "@/supabase";
import { generateInsights } from "@/app/actions/generate-insights";
import { AdvisoryOutput } from "@/ai/flows/personalized-farming-advisory-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Loader2, 
  Droplets, 
  Zap, 
  Bug, 
  Warehouse, 
  Store, 
  CheckSquare, 
  Download,
  AlertCircle,
  Database,
  Sprout,
  ShieldAlert,
  Map as MapIcon
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

// Helper: detect Gemini quota/rate-limit errors
function isQuotaError(error: any): boolean {
  const msg = (error?.message || String(error)).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  );
}

export default function AdvisoryPage() {
  const { data: session } = useSession();
  const { user } = useUser();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const userUid = user?.uid || (session?.user as any)?.id;

  const { data: farmData } = useFarm(userUid);

  const [localFarm, setLocalFarm] = useState<any>(null);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('demo_farm');
      if (stored) {
        setLocalFarm(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);
  
  const activeData = farmData || localFarm;
  const plots = activeData?.plots || [];
  const [selectedPlotIndex, setSelectedPlotIndex] = useState<string>("0");
  const currentPlot = plots[parseInt(selectedPlotIndex)];

  const handleGenerateReport = async () => {
    if (!userUid || !currentPlot) return;
    setIsGenerating(true);
    
    try {
      const idx = parseInt(selectedPlotIndex);
      const result = await generateInsights(userUid, currentPlot);
      
      // PERSIST RESULTS to specific plot (snake_case columns only)
      if (userUid && activeData) {
        try {
          const updatedPlots = [...plots];
          updatedPlots[idx] = {
            ...updatedPlots[idx],
            lastComputedInsights: result.computed,
            latestAdvisory: result.advisory,
          };
          
          await saveFarmData(userUid, {
            plots: updatedPlots,
          });
        } catch (dbError) {
          console.error("Supabase persistence error:", dbError);
        }
      }

      toast({
        title: "Report Generated",
        description: `Advisory for ${currentPlot.name || 'Plot'} has been updated.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: isQuotaError(error) ? "Daily Limit Reached" : "Generation Failed",
        description: isQuotaError(error)
          ? "Your daily limit is exceeded. Please try again tomorrow."
          : (error.message || "Failed to generate report. Ensure profile is complete."),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!farmData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading specific plot data...</p>
      </div>
    );
  }

  if (plots.length === 0) {
    return (
      <Card className="border-dashed flex flex-col items-center justify-center p-12 bg-muted/30">
        <Sprout className="h-16 w-16 text-muted mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Plots Configured</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Please add plots in your Farm Profile to generate targeted agronomic insights.
        </p>
      </Card>
    );
  }

  const currentAdvisory = currentPlot?.latestAdvisory;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">Scientific Advisory Report</h1>
          <p className="text-muted-foreground">Detailed precision guidance derived for your specific plots.</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating} size="lg" className="bg-primary hover:bg-primary/90">
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Refresh Plot Insights
        </Button>
      </div>

      <Tabs value={selectedPlotIndex} onValueChange={setSelectedPlotIndex} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto bg-transparent justify-start gap-2">
           {plots.map((p: any, i: number) => (
             <TabsTrigger 
               key={i} 
               value={String(i)} 
               className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary border border-transparent bg-muted"
             >
               {p.name || `Plot ${i + 1}`} ({p.cropType || 'Empty'})
             </TabsTrigger>
           ))}
        </TabsList>

        <TabsContent value={selectedPlotIndex} className="mt-0 outline-none animate-in fade-in">
          
          {!currentPlot?.lastComputedInsights && (
            <Alert className="bg-accent/10 border-accent/20 mb-6">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle>Lab Report Recommended</AlertTitle>
              <AlertDescription>
                To generate a high-accuracy scientific report for {currentPlot?.name || 'this plot'}, consider uploading a lab report in the "Upload Lab Report" page.
              </AlertDescription>
            </Alert>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Database className="h-4 w-4 text-accent" />
                 </div>
              </div>
              <p className="text-muted-foreground animate-pulse text-sm">Targeting agronomy models for {currentPlot?.name}...</p>
            </div>
          )}

          {!currentAdvisory && !isGenerating && (
            <Card className="border-dashed flex flex-col items-center justify-center p-12 bg-muted/30">
              <FileText className="h-16 w-16 text-muted mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Advisory Exists for {currentPlot?.name}</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Click "Refresh Plot Insights" to ask the AI to map solutions specifically using the parameters of this plot.
              </p>
            </Card>
          )}

          {currentAdvisory && !isGenerating && (
            <div className="grid gap-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Predicted Yield</p>
                    <div className="text-2xl font-bold text-primary">{currentAdvisory.predictedYieldSummary.display}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{currentAdvisory.predictedYieldSummary.subtitle}</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="pt-6">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Water Needs</p>
                    <div className="text-2xl font-bold text-blue-600">{currentAdvisory.waterNeedsSummary.level}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{currentAdvisory.waterNeedsSummary.nextIrrigationText}</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Soil Health</p>
                    <div className="text-2xl font-bold text-accent-foreground">{currentAdvisory.soilHealthSummary.score}/10</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{currentAdvisory.soilHealthSummary.label}</p>
                  </CardContent>
                </Card>
                <Card className={currentAdvisory.riskSummary.level === 'High' ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-muted"}>
                  <CardContent className="pt-6">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Risk Status</p>
                    <div className={`text-2xl font-bold ${currentAdvisory.riskSummary.level === 'High' ? 'text-destructive' : 'text-foreground'}`}>
                      {currentAdvisory.riskSummary.level}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">{currentAdvisory.riskSummary.primaryRisk}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Detailed Analysis Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Plot Composition Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          Water Quality & Irrigation
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentAdvisory.detailedReport.waterQualityAnalysis}
                        </p>
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 mt-2">
                           <p className="text-xs italic">{currentAdvisory.detailedReport.irrigationRecommendations}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-primary" />
                          Fertilizer & Soil Health
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentAdvisory.detailedReport.fertilizerRecommendations}
                        </p>
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mt-2">
                           <p className="text-xs italic">{currentAdvisory.detailedReport.soilManagementTips}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                          Yield Optimization Tips
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                          {currentAdvisory.detailedReport.yieldOptimizationTips.map((tip: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Smart Tasks Side Panel */}
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Priority Plot Tasks</CardTitle>
                      <CardDescription>Actions isolated for this specific area.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentAdvisory.smartTasks.map((task: any, i: number) => (
                        <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2 ${
                          task.priority === 'High' ? 'bg-destructive/5 border-destructive/20' : 'bg-background border-muted'
                        }`}>
                          <div className="flex justify-between items-start">
                            <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px] uppercase">
                              {task.priority}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Due: {task.dueInDays}d</span>
                          </div>
                          <h4 className="text-sm font-bold leading-tight">{task.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-snug">{task.rationale}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {currentAdvisory.detailedReport.seasonalAlerts && (
                    <Alert className="border-accent/40 bg-accent/5">
                      <Zap className="h-4 w-4 text-accent" />
                      <AlertTitle className="text-xs font-bold uppercase">Plot Alert</AlertTitle>
                      <AlertDescription className="text-xs leading-relaxed">
                        {currentAdvisory.detailedReport.seasonalAlerts}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
