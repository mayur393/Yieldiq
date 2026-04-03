"use client";

import { use, useEffect } from "react";
import { useUser, useFarm } from "@/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { computeCropStage, getDaysElapsed } from "@/lib/lifecycle";
import { ConsultantChat } from "@/components/dashboard/consultant-chat";

export default function PlotConsultantPage({ params }: { params: Promise<{ plotId: string }> }) {
  const { user } = useUser();
  const { data: farmData, isLoading } = useFarm(user?.uid);
  
  // React 19 / Next.js 15: Unwrapping params Promise
  const resolvedParams = use(params);
  const plotId = resolvedParams.plotId;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Find the requested plot
  // The PlotId from the URL could be "plot-0" etc. 
  // In farm-profile we define id as `plot-{timestamp}` usually. But dashboard gives index based ID sometimes if generic.
  // Let's do a robust search
  const plotIndex = plotId.startsWith('plot-') ? parseInt(plotId.split('-')[1]) : -1;
  let currentPlot = farmData?.plots?.find((p: any) => p.id === plotId);
  
  if (!currentPlot && plotIndex > -1 && farmData?.plots?.[plotIndex]) {
    currentPlot = farmData.plots[plotIndex];
  }

  if (!currentPlot) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20">
          <p className="text-muted-foreground font-semibold">Plot not found.</p>
          <p className="text-sm">We couldn't locate the data for this plot ID.</p>
        </div>
      </div>
    );
  }

  const cropStage = computeCropStage(currentPlot.cropType, currentPlot.plantingDate);
  const daysElapsed = getDaysElapsed(currentPlot.plantingDate);

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4 shrink-0">
         <Button variant="outline" size="icon" asChild className="shrink-0 h-9 w-9 rounded-full">
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
         </Button>
         <div>
            <h1 className="text-2xl font-bold font-headline">AI Consultant</h1>
            <p className="text-sm text-muted-foreground">Expert guidance tailored to {currentPlot.name || 'this plot'}.</p>
         </div>
      </div>

      <div className="flex-1 w-full relative">
        <ConsultantChat 
          plotData={currentPlot} 
          cropStage={cropStage}
          daysElapsed={daysElapsed} 
        />
      </div>
    </div>
  );
}
