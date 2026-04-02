"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useFarm, saveFarmData } from "@/supabase";
import { generateInsights } from "@/app/actions/generate-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Zap, 
  FlaskConical,
  Beaker,
  Database,
  Droplets,
  Sprout
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function ReportUploadPage() {
  const { data: session } = useSession();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [uploadingPlotIdx, setUploadingPlotIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userUid = user?.uid || (session?.user as any)?.id;
  const { data: farmData } = useFarm(userUid);
  
  const [localFarm, setLocalFarm] = useState<any>(null);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('demo_farm');
      if (stored) setLocalFarm(JSON.parse(stored));
    } catch (e) {}
  }, []);
  
  const plots = farmData?.plots || localFarm?.plots || [];

  const triggerUploadForPlot = (idx: number) => {
    setUploadingPlotIdx(idx);
    fileInputRef.current?.click();
  };

  const handleDeleteReport = async (idx: number) => {
    if (!userUid || !farmData?.plots) return;
    
    const plotName = plots[idx].name || `Plot ${idx + 1}`;
    
    try {
      const updatedPlots = [...farmData.plots];
      updatedPlots[idx] = {
        ...updatedPlots[idx],
        lastComputedInsights: null,
        latestAdvisory: null,
        waterReportUploadDate: null,
        waterReportFileName: null
      };

      await saveFarmData(userUid, {
        plots: updatedPlots,
      });

      toast({
        title: "Report Deleted",
        description: `Lab report for ${plotName} has been removed.`,
      });
    } catch (dbError) {
      console.error("Error deleting report:", dbError);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to remove the report from our database.",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingPlotIdx === null) return;
    const currentUploadIdx = uploadingPlotIdx;
    const fileName = file.name;

    if (!userUid) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please wait for your session to initialize or try logging in again.",
      });
      setUploadingPlotIdx(null);
      e.target.value = '';
      return;
    }

    setProgress(10);
    setStep("Reading report...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        setProgress(30);
        setStep("Extracting lab parameters with Gemini...");
        
        const plotData = plots.length > 0 ? plots[currentUploadIdx] : undefined;
        const result = await generateInsights(userUid, plotData, base64);
        
        // Save to Supabase specific plot (snake_case columns only)
        if (userUid && farmData?.plots) {
          try {
            const updatedPlots = [...farmData.plots];
            updatedPlots[currentUploadIdx] = {
              ...updatedPlots[currentUploadIdx],
              lastComputedInsights: result.computed,
              latestAdvisory: result.advisory,
              waterReportUploadDate: new Date().toISOString(),
              waterReportFileName: fileName
            };

            await saveFarmData(userUid, {
              plots: updatedPlots,
            });
          } catch (dbError) {
            console.error("Error saving to Supabase:", dbError);
          }
        }

        setProgress(70);
        setStep("Running agronomy models...");
        
        setTimeout(() => {
          setProgress(100);
          setStep("Analysis Complete!");
          toast({
            title: "Report Analyzed",
            description: `Advisory for ${plotData?.name || 'this plot'} has been updated.`,
          });
          setUploadingPlotIdx(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          router.push("/dashboard/advisory");
        }, 1500);
      };
    } catch (error: any) {
      console.error(error);
      setUploadingPlotIdx(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      const isLimit = isQuotaError(error);
      toast({
        variant: "destructive",
        title: isLimit ? "Daily Limit Reached" : "Analysis Failed",
        description: isLimit 
          ? "Your daily limit is exceeded. Please try again tomorrow." 
          : (error.message || "Failed to parse lab report."),
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Lab Report Analysis</h1>
        <p className="text-muted-foreground">Upload water or soil reports directly to their respective plots for precise AI calibration.</p>
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept=".pdf,image/*" 
        onChange={handleFileUpload}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          
          {plots.length === 0 && (
            <Alert className="bg-destructive/10 text-destructive border-none">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Plots Configured</AlertTitle>
              <AlertDescription>Please navigate to your Farm Profile and add at least one Plot before uploading reports.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {plots.map((plot: any, idx: number) => {
              const isThisUploading = uploadingPlotIdx === idx;
              const hasReport = !!plot.waterReportUploadDate;
              const fileName = plot.waterReportFileName || (hasReport ? "Standard Lab Report" : null);

              return (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border bg-card transition-all ${isThisUploading ? 'ring-2 ring-primary ring-offset-2' : 'border-primary/10'}`}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">{idx + 1}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">{plot.name || `Plot ${idx + 1}`}</h3>
                        {hasReport && !isThisUploading && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-green-500/10 text-green-600 border-none font-bold uppercase shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {plot.cropType || 'No Crop'} • {plot.soilType || 'No Soil'}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 flex-1 px-4 border-l border-r border-primary/5 mx-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">Assigned Report</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText className={`h-3 w-3 ${hasReport ? "text-primary" : "text-muted"}`} />
                          <span className={`text-xs truncate font-medium ${hasReport ? "text-foreground" : "text-muted-foreground italic"}`}>
                            {isThisUploading ? "Analyzing..." : (fileName || "No report assigned")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {isThisUploading ? (
                      <div className="flex items-center gap-2 px-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">{progress}%</span>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => triggerUploadForPlot(idx)}
                          disabled={uploadingPlotIdx !== null}
                          title={hasReport ? "Replace Report" : "Assign Report"}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        {hasReport && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteReport(idx)}
                            disabled={uploadingPlotIdx !== null}
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Alert className="bg-accent/5 border-accent/20">
            <Zap className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent-foreground font-bold">Quick Tip</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Uploading a report to a specific plot maps the values solely to that plot's metrics, enabling highly isolated crop predictions!
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What we derive</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                 { icon: FlaskConical, title: "Predicted Yield", desc: "Harvest Forecast Overview" },
                 { icon: Droplets, title: "Water Needs", desc: "Smart irrigation scheduling" },
                 { icon: CheckCircle2, title: "Soil Health", desc: "Overall soil vitality index" },
                 { icon: Database, title: "Risk Level", desc: "Actionable hazard alerts" }
               ].map((item, i) => (
                 <div key={i} className="flex gap-3">
                   <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                   <div>
                     <h4 className="text-sm font-semibold">{item.title}</h4>
                     <p className="text-xs text-muted-foreground">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
