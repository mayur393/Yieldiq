"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Trophy } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { HarvestReportPDF } from "./harvest-report-pdf";
import { toast } from "@/hooks/use-toast";
import { useDemoMode } from "@/components/demo-provider";
import { DEMO_DATA } from "@/lib/demo-data";

interface HarvestModalProps {
  plotData: any;
  isOpen: boolean;
  onClose: () => void;
  onHarvestComplete: (stats: any) => void;
}

export function HarvestModal({ plotData, isOpen, onClose, onHarvestComplete }: HarvestModalProps) {
  const [formData, setFormData] = useState({
    totalWeight: "",
    profit: "",
    quality: "Grade A",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { isDemoMode } = useDemoMode();

  // Uses mock data if in demo mode, otherwise uses plot's real AI history if available
  const activeAdvisoryHistory = isDemoMode ? DEMO_DATA.mockAdvisoryHistory : (plotData?.aiHistory || []);

  const handleGeneratePDF = async () => {
    if (!formData.totalWeight || !formData.profit) {
      toast({ title: "Missing Fields", description: "Please enter harvest yields.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      // Small timeout to ensure the hidden PDF component is fully rendered in DOM
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = pdfContainerRef.current;
      if (!element) throw new Error("Report container not found.");

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
      pdf.save(`YieldIQ-Harvest-Report-${plotData.name || 'Plot'}.pdf`);
      
      toast({ title: "Report Saved", description: "Your certified harvest PDF has been downloaded." });
      
      // Complete flow
      onHarvestComplete({ ...formData, date: new Date().toLocaleDateString() });
      
    } catch (e: any) {
      console.error("PDF generation failed:", e);
      toast({ title: "Generation Error", description: "Could not build PDF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Trophy className="h-5 w-5 text-amber-500" />
               Harvest Completion
            </DialogTitle>
            <DialogDescription>
              Enter final yield outcomes for <strong>{plotData?.name}</strong> to generate your certified season report and archive this plot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">Total Yield</Label>
              <Input 
                id="weight" 
                placeholder="e.g. 5.2 Tons" 
                className="col-span-3"
                value={formData.totalWeight}
                onChange={e => setFormData({...formData, totalWeight: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profit" className="text-right">Net Profit (₹)</Label>
              <Input 
                id="profit" 
                type="number"
                placeholder="e.g. 45000" 
                className="col-span-3"
                value={formData.profit}
                onChange={e => setFormData({...formData, profit: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quality" className="text-right">Quality Grade</Label>
              <Select value={formData.quality} onValueChange={(val) => setFormData({...formData, quality: val})}>
                <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Select final grade" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="Grade A+ (Premium)">Grade A+ (Premium)</SelectItem>
                   <SelectItem value="Grade A">Grade A</SelectItem>
                   <SelectItem value="Grade B">Grade B</SelectItem>
                   <SelectItem value="Grade C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isGenerating} onClick={handleGeneratePDF} className="w-full gap-2 bg-green-600 hover:bg-green-700">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isGenerating ? "Generating Certified PDF..." : "Generate PDF & Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Canvas Component */}
      {isOpen && (
        <div style={{ position: 'fixed', top: '200vh', pointerEvents: 'none', opacity: 0, zIndex: -9999 }}>
          <HarvestReportPDF 
            ref={pdfContainerRef}
            plotData={plotData}
            harvestStats={{ ...formData, date: new Date().toLocaleDateString() }}
            advisoryHistory={activeAdvisoryHistory} 
          />
        </div>
      )}
    </>
  );
}
