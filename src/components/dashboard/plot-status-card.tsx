"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Plus,
  FileText
} from "lucide-react";
import Link from "next/link";

interface PlotStatusCardProps {
  plot: any;
  index: number;
}

export function PlotStatusCard({ plot, index }: PlotStatusCardProps) {
  const hasReport = !!plot.waterReportUploadDate;
  const advisory = plot.latestAdvisory;
  const plotName = plot.name || `Plot ${index + 1}`;

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border-primary/10 ${!hasReport ? 'bg-secondary/20' : 'bg-card'}`}>
      <CardHeader className="pb-3 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">{index + 1}</span>
            </div>
            <div>
              <CardTitle className="text-base font-bold">{plotName}</CardTitle>
              <CardDescription className="text-[10px] uppercase font-semibold tracking-wider">
                {plot.cropType || 'No Crop'} • {plot.soilType || 'No Soil'}
              </CardDescription>
            </div>
          </div>
          {hasReport ? (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-bold text-[9px] uppercase">
              Analyzed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground">
              No Report
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {hasReport ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase">Yield</span>
                </div>
                <div className="text-lg font-bold">{advisory?.predictedYieldSummary?.display || "--"}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase">Water</span>
                </div>
                <div className="text-lg font-bold">{advisory?.waterNeedsSummary?.level || "--"}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-bold uppercase">Soil</span>
                </div>
                <div className="text-lg font-bold">{advisory?.soilHealthSummary?.label || "--"}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <AlertTriangle className={`h-3 w-3 ${advisory?.riskSummary?.level === 'High' ? 'text-destructive' : 'text-orange-500'}`} />
                  <span className="text-[10px] font-bold uppercase">Risk</span>
                </div>
                <div className="text-lg font-bold">{advisory?.riskSummary?.level || "Low"}</div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold gap-2 group border-primary/20 hover:bg-primary hover:text-primary-foreground" asChild>
              <Link href="/dashboard/advisory">
                View Full Advisory
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
               <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold">Awaiting Lab Report</p>
              <p className="text-[10px] text-muted-foreground mt-1">Upload a report to see AI predictions.</p>
            </div>
            <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2" asChild>
              <Link href="/dashboard/report-upload">
                <Plus className="h-3.5 w-3.5" />
                Upload Now
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
