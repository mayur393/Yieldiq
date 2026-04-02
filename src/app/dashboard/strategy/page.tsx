"use client";

import { useState, useEffect, useRef } from "react";
import { generateCultivationRecommendations, generateDetailedCropStrategy } from "@/app/actions/generate-strategy";
import { RecommendationOutput, DetailedStrategyOutput } from "@/ai/flows/cultivation-strategy-flow";
import { StrategyForm, StrategyFormValues } from "@/components/dashboard/strategy-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Sprout,
  TrendingUp,
  CalendarDays,
  Leaf,
  AudioLines,
  Zap,
  DollarSign,
  Recycle,
  Droplets,
  Bug,
  ClipboardList,
  AlertTriangle,
  Download,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useUser, useFarm } from "@/supabase";
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

export default function CultivationStrategyPage() {
  const { data: session } = useSession();
  const { user } = useUser();
  const userUid = user?.uid || (session?.user as any)?.id;
  const { data: farmData } = useFarm(userUid);

  const reportRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [isGeneratingDetail, setIsGeneratingDetail] = useState(false);

  const [recommendations, setRecommendations] = useState<RecommendationOutput | null>(null);
  const [detailedStrategy, setDetailedStrategy] = useState<DetailedStrategyOutput | null>(null);
  const [selectedCropIdx, setSelectedCropIdx] = useState<number>(0);

  const [lastInputs, setLastInputs] = useState<any>(null);

  const handleGenerateInitial = async (values: StrategyFormValues) => {
    setIsGeneratingRecs(true);
    setDetailedStrategy(null);
    setRecommendations(null);
    try {
      const result = await generateCultivationRecommendations(values);
      setRecommendations(result.recommendations);
      setLastInputs(result);

      // Auto-load detail for the top match
      await handleSelectCrop(0, result.recommendations.crop_recommendations[0].cropName, result);

      toast({
        title: "Recommendations Ready",
        description: "We identified 3 ideal crops. Select any to see the detailed plan.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: isQuotaError(error) ? "Daily Limit Reached" : "Generation Failed",
        description: isQuotaError(error)
          ? "Your daily limit is exceeded. Please try again tomorrow."
          : (error.message || "Failed to generate recommendations. Please try again."),
      });
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleSelectCrop = async (idx: number, cropName: string, inputsOverride?: any) => {
    const inputs = inputsOverride || lastInputs;
    if (!inputs) return;

    setSelectedCropIdx(idx);
    setIsGeneratingDetail(true);
    try {
      const result = await generateDetailedCropStrategy(
        cropName,
        inputs.farm,
        inputs.weather,
        inputs.waterReport
      );
      setDetailedStrategy(result.strategy);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: isQuotaError(error) ? "Daily Limit Reached" : "Plan Failed",
        description: isQuotaError(error)
          ? "Your daily limit is exceeded. Please try again tomorrow."
          : "Could not generate detailed strategy for this crop.",
      });
    } finally {
      setIsGeneratingDetail(false);
    }
  };

  const downloadAsPdf = () => {
    if (!reportRef.current) return;

    toast({
      title: "Opening Print Dialog",
      description: "Select 'Save as PDF' as the destination to download your report.",
    });

    // Brief delay so toast renders before print dialog blocks the thread
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const activeCrop = recommendations?.crop_recommendations[selectedCropIdx];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">Cultivation Strategy</h1>
          <p className="text-muted-foreground">AI-driven precision plan based on soil, climate, and economics.</p>
        </div>
        <div className="flex items-center gap-2">
          {recommendations && (
            <>
              <Button onClick={downloadAsPdf} variant="outline" size="sm" className="gap-2 border-primary/30 text-primary">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
              <Button onClick={() => { setRecommendations(null); setDetailedStrategy(null); }} variant="outline" size="sm">
                New Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      {isGeneratingRecs && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Computing ROI pipelines safely via local AI constraints...</p>
        </div>
      )}

      {!recommendations && !isGeneratingRecs && (
        <div className="max-w-4xl mx-auto">
          <StrategyForm onSubmit={handleGenerateInitial} isLoading={isGeneratingRecs} plots={farmData?.plots || []} locationName={farmData?.location || ""} />
        </div>
      )}

      {recommendations && !isGeneratingRecs && (
        <div ref={reportRef} className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12">

          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Projected Yield Shift</p>
                  <div className="text-2xl font-bold text-primary">{recommendations.metrics.projectedYieldIncreasePercent}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Est. Profit Margin</p>
                  <div className="text-2xl font-bold text-green-600">{recommendations.metrics.estimatedProfitMargin}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Recycle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Waste Reduction</p>
                  <div className="text-2xl font-bold text-blue-600">{recommendations.metrics.wasteReductionPercent}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agronomist Summary */}
          <Alert className="border-l-4 border-l-primary bg-muted/40 text-foreground">
            <AudioLines className="h-5 w-5 text-primary" />
            <AlertTitle className="font-bold">Agronomist Summary</AlertTitle>
            <AlertDescription className="text-sm mt-1 leading-relaxed">
              {recommendations.agronomist_summary}
            </AlertDescription>
          </Alert>

          {/* Top Crop Recommendations - Clickable */}
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.crop_recommendations.map((crop, idx) => (
              <Card
                key={idx}
                onClick={() => handleSelectCrop(idx, crop.cropName)}
                className={`cursor-pointer transition-all hover:border-primary/50 relative ${selectedCropIdx === idx ? "border-primary ring-2 ring-primary/10 shadow-lg scale-[1.02] bg-primary/[0.02]" : "hover:scale-[1.01]"
                  }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sprout className={`h-4 w-4 ${selectedCropIdx === idx ? 'text-primary' : 'text-muted-foreground'}`} />
                      {crop.cropName}
                    </CardTitle>
                    {idx === 0 && <Badge variant="secondary" className="text-[10px]">Top Pick</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{crop.whyThisCrop}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] border rounded p-2 bg-muted/10">
                    <div>
                      <span className="text-muted-foreground block">Exp. Yield</span>
                      <span className="font-semibold">{crop.expectedYieldPerAcre} q/ac</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Net Profit</span>
                      <span className="font-semibold text-green-600">₹{crop.expectedNetProfitPerAcre}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Market Price:</span>
                    <span className="font-medium">{crop.marketPriceRange}</span>
                  </div>
                </CardContent>
                {selectedCropIdx === idx && (
                  <div className="absolute top-0 right-0 p-1">
                    <Zap className="h-3 w-3 text-primary fill-primary" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="border-t border-dashed my-2" />

          {/* Detailed Strategy Section */}
          {isGeneratingDetail ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-muted/20 border-dashed border-2 rounded-xl">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground animate-pulse">Mapping ${activeCrop?.cropName} specific variables to climate models...</p>
            </div>
          ) : detailedStrategy ? (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">

              <div className="flex items-center gap-2 px-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-xl">Scientific Plan: <span className="text-primary">{activeCrop?.cropName}</span></h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Input & Fertilizer Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Precision Input Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Irrigation ({detailedStrategy.input_plan.irrigation.method})</h4>
                      <p className="text-xs text-muted-foreground">Freq: {detailedStrategy.input_plan.irrigation.frequency} | Dur: {detailedStrategy.input_plan.irrigation.duration}</p>
                      <p className="text-xs text-muted-foreground bg-blue-500/10 p-2 rounded text-blue-700 dark:text-blue-300">
                        <strong>Critical Stage:</strong> {detailedStrategy.input_plan.irrigation.criticalStages}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Fertilizer Schedule</h4>
                      <Table className="text-xs border rounded-lg">
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Stage</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty / Acre</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailedStrategy.input_plan.fertilizerSchedule.map((fert, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{fert.stage}</TableCell>
                              <TableCell>{fert.fertilizer}</TableCell>
                              <TableCell>{fert.quantityPerAcre}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Economics & Checklists */}
                <div className="space-y-6">
                  {/* Economics */}
                  <Card className="border-green-500/20">
                    <CardHeader className="bg-green-500/5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Economic Projections (Per Acre)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        {detailedStrategy.economics.itemizedCosts.map((item, i) => (
                          <div key={i} className="flex justify-between border-b border-muted/30 pb-1">
                            <span className="text-muted-foreground">{item.item}</span>
                            <span>₹{item.costPerAcre.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 font-bold text-destructive">
                          <span>Total Input Cost</span>
                          <span>₹{detailedStrategy.economics.totalInputCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-primary">
                          <span>Expected Revenue</span>
                          <span>₹{detailedStrategy.economics.expectedRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 font-black text-green-600 text-lg border-t mt-2">
                          <span>Net Profit</span>
                          <span>₹{detailedStrategy.economics.netProfit.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-right text-muted-foreground">ROI: {detailedStrategy.economics.roi}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Checklist */}
                  <Card className="border-accent/30 shadow-sm shadow-accent/5">
                    <CardHeader className="bg-accent/5">
                      <CardTitle className="text-lg flex items-center gap-2 text-accent-foreground">
                        <ClipboardList className="h-5 w-5" />
                        Immediate Action Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {detailedStrategy.action_checklist.map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="bg-accent/20 text-accent-foreground h-5 w-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold block bg-muted w-fit px-1 rounded uppercase">{item.timing}</span>
                            <span className="text-xs text-muted-foreground">{item.action}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Integrated Pest Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bug className="h-5 w-5 text-destructive" />
                    Pest & Disease Management
                  </CardTitle>
                  <CardDescription>Targeted threats for {activeCrop?.cropName}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {detailedStrategy.pest_management.map((pest, i) => (
                      <div key={i} className="border border-destructive/10 rounded-lg p-3 bg-card space-y-2">
                        <h4 className="font-bold text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {pest.threatName}
                        </h4>
                        <p className="text-[11px] font-semibold text-muted-foreground">{pest.symptoms}</p>
                        <div className="text-[10px] space-y-1 mt-2 p-2 bg-muted/40 rounded">
                          <p><strong>Chemical:</strong> {pest.chemicalControl}</p>
                          <p><strong>Organic:</strong> <span className="text-green-600">{pest.organicAlternative}</span></p>
                          <p><strong>Timing:</strong> {pest.bestSprayTiming}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cultivation Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-purple-500" />
                    Timeline (GDD-based thermal days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {detailedStrategy.cultivation_calendar.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center mt-1">
                          <div className="h-3 w-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                          {idx !== detailedStrategy.cultivation_calendar.length - 1 && (
                            <div className="w-px h-full bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm">{step.stage}</h4>
                            <Badge variant="outline" className="text-[10px] text-purple-600 bg-purple-50">{step.timing}</Badge>
                          </div>
                          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                            {step.actions.map((act, j) => <li key={j}>{act}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 border-dashed border-2 rounded-xl">
              <AudioLines className="h-10 w-10 text-muted" />
              <p className="text-sm text-muted-foreground">Select a crop above to generate its specific detailed plan.</p>
            </div>
          )}

          <p className="text-xs text-center pb-8 pt-4 text-muted-foreground italic">
            💡 Your strategy is optimized for your local conditions. Ensure you verify market prices and chemical availability locally before execution.
          </p>
        </div>
      )}
    </div>
  );
}
