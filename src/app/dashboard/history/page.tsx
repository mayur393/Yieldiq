"use client";

import { useState, useRef } from "react";
import { useUser, useFarm } from "@/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Trophy, History, Sprout, TrendingUp, IndianRupee, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDemoMode } from "@/components/demo-provider";
import { DEMO_DATA } from "@/lib/demo-data";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { HarvestReportPDF } from "@/components/dashboard/harvest-report-pdf";
import { toast } from "@/hooks/use-toast";

export default function SeasonHistoryPage() {
  const { user } = useUser();
  const { data: farmData, isLoading } = useFarm(user?.uid);

  const { isDemoMode } = useDemoMode();

  // In a full production app, this would be fetched from a `past_seasons` Supabase table
  const historicalPlots = isDemoMode ? DEMO_DATA.historicalPlots : [];
  
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [activePlotForPDF, setActivePlotForPDF] = useState<any>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async (plot: any) => {
    setIsGenerating(plot.id);
    setActivePlotForPDF(plot);

    try {
      // Short delay to allow state update and component render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = pdfContainerRef.current;
      if (!element) throw new Error("PDF generator template not found.");

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false 
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`YieldIQ-Archive-${plot.name}-${plot.harvestDate}.pdf`);
      
      toast({ title: "Archive Retrieved", description: "Harvest report downloaded successfully." });
    } catch (e) {
      console.error("PDF download failed:", e);
      toast({ title: "Download Error", description: "Could not retrieve the archived record.", variant: "destructive" });
    } finally {
      setIsGenerating(null);
      setActivePlotForPDF(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            Season History Vault
          </h1>
          <p className="text-muted-foreground mt-2">
            Your YieldIQ certified harvest records. Use these verified records in the marketplace.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {historicalPlots.length === 0 && (
           <Card className="p-12 text-center border-dashed bg-muted/20">
             <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-bold font-headline">No Seasons Archived Yet</h3>
             <p className="text-muted-foreground mt-2 max-w-sm mx-auto">When your crops mature and you finalize the harvest, the certified reports will appear here.</p>
             {!isDemoMode && <p className="text-xs text-primary mt-6">(Toggle Demo Mode in the header to see sample history)</p>}
           </Card>
        )}
        
        {historicalPlots.map((plot) => (
          <Card key={plot.id} className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Core Info */}
              <div className="p-6 bg-muted/30 md:w-1/3 border-r relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Trophy className="h-32 w-32" />
                 </div>
                 
                 <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[9px] font-black">
                   Verified Record
                 </Badge>

                 <CardTitle className="text-2xl font-bold mb-1">{plot.name}</CardTitle>
                 <CardDescription className="flex items-center gap-1.5 text-sm font-semibold mb-6">
                   <Sprout className="h-3.5 w-3.5" /> {plot.cropType} • {plot.soilType}
                 </CardDescription>

                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between border-b pb-2">
                     <span className="text-muted-foreground">Planted</span>
                     <span className="font-medium">{plot.plantingDate}</span>
                   </div>
                   <div className="flex justify-between border-b pb-2">
                     <span className="text-muted-foreground">Harvested</span>
                     <span className="font-medium text-amber-600">{plot.harvestDate}</span>
                   </div>
                 </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-6 bg-background gap-2 h-9 text-xs"
                    disabled={isGenerating !== null}
                    onClick={() => handleDownloadPDF(plot)}
                  >
                     {isGenerating === plot.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                     ) : (
                        <Download className="h-3.5 w-3.5" />
                     )}
                     {isGenerating === plot.id ? "Retrieving..." : "Re-Download PDF"}
                  </Button>
              </div>

              {/* Right Column - Outcomes */}
              <div className="p-6 md:w-2/3 grid grid-cols-2 gap-6 bg-card">
                 <div className="col-span-2 border-b pb-4 mb-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Season Outcomes</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-1 relative">
                          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-green-500" /> Total Yield</p>
                          <p className="text-2xl font-black">{plot.totalYield}</p>
                       </div>
                       
                       <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-blue-500" /> Net Profit</p>
                          <p className="text-2xl font-black text-primary">₹{plot.profit}</p>
                       </div>

                       <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-amber-500" /> Quality</p>
                          <p className="text-2xl font-black text-amber-600">{plot.yieldScore}</p>
                       </div>
                    </div>
                 </div>

                 <div className="col-span-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">AI Intervention Summary</h3>
                    <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
                       <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                         <History className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                         <p className="text-sm font-medium">YieldIQ AI guided this crop successfully from planting to harvest with <strong>{plot.aiInterventions} logged interventions</strong> including dynamic spray and irrigation adjustments.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Hidden Global PDF Generator Template */}
      <div style={{ position: 'fixed', top: '200vh', pointerEvents: 'none', opacity: 0, zIndex: -9999 }}>
        {activePlotForPDF && (
          <HarvestReportPDF 
            ref={pdfContainerRef}
            plotData={activePlotForPDF}
            harvestStats={{ 
              totalWeight: activePlotForPDF.totalYield, 
              profit: activePlotForPDF.profit, 
              quality: activePlotForPDF.yieldScore,
              date: activePlotForPDF.harvestDate 
            }}
            advisoryHistory={DEMO_DATA.mockAdvisoryHistory}
          />
        )}
      </div>
    </div>
  );
}
