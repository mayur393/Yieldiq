"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout } from "lucide-react";

export const strategyFormSchema = z.object({
  locationName: z.string().min(2, "District or Location is required"),
  landTenure: z.string().min(1, "Please select land tenure"),
  farmSize: z.string().min(1, "Farm size is required"),
  irrigationMethod: z.string().min(1, "Please select an irrigation method"),
  soilType: z.string().min(1, "Please select soil type"),
  previousCrop: z.string().min(2, "Previous crop is required"),
  workingCapital: z.string().min(1, "Please estimate working capital in INR"),
  creditAccess: z.string().min(1, "Please indicate if you have formal credit access"),
  labReport: z.string().optional(),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;

interface StrategyFormProps {
  onSubmit: (values: StrategyFormValues) => void;
  isLoading: boolean;
  plots?: any[];
  locationName?: string;
}

export function StrategyForm({ onSubmit, isLoading, plots = [], locationName = "" }: StrategyFormProps) {
  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      locationName: locationName || "",
      landTenure: "Owned",
      farmSize: "",
      irrigationMethod: "",
      soilType: "",
      previousCrop: "",
      workingCapital: "",
      creditAccess: "No",
      labReport: "",
    },
  });

  const handlePlotAutofill = (plotIdxString: string) => {
    if (plotIdxString === "none") return;
    const plot = plots[parseInt(plotIdxString)];
    if (!plot) return;
    
    // Auto-fill form based on plot
    form.setValue("locationName", locationName);
    form.setValue("farmSize", String(plot.area || ""));
    // Match dropdown strings roughly, or just push the text
    const soilMap: any = {
      'black': 'Black Cotton (Regur)',
      'alluvial': 'Alluvial',
      'red': 'Red Soil',
      'sandy': 'Sandy Loam',
      'loamy': 'Alluvial',
      'clay': 'Black Cotton (Regur)',
      'silt': 'Alluvial'
    };
    if (plot.soilType) {
      form.setValue("soilType", soilMap[plot.soilType.toLowerCase()] || 'Alluvial');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      form.setValue('labReport', base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Agronomic & Economic Profile</h3>
              </div>
              {plots && plots.length > 0 && (
                <Select onValueChange={handlePlotAutofill}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="Auto-fill from Plot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Clear Selection</SelectItem>
                    {plots.map((p, idx) => (
                      <SelectItem key={idx} value={String(idx)}>{p.name || `Plot ${idx+1}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Geographic Info */}
              <FormField
                control={form.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (District/State)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nagpur, Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Size (Acres)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 5.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Infrastructure */}
              <FormField
                control={form.control}
                name="landTenure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Tenure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Owned">Owned</SelectItem>
                        <SelectItem value="Leased (Long-term)">Leased (Long-term)</SelectItem>
                        <SelectItem value="Leased (Short-term)">Leased (Short-term)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="irrigationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Irrigation Infrastructure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select irrigation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Drip">Drip Irrigation</SelectItem>
                        <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="Flood / Canal">Flood / Canal</SelectItem>
                        <SelectItem value="Rainfed">Rain-fed (No Irrigation)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agronomic History */}
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Predominant Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Black Cotton (Regur)">Black Cotton (Regur)</SelectItem>
                        <SelectItem value="Alluvial">Alluvial</SelectItem>
                        <SelectItem value="Red Soil">Red Soil</SelectItem>
                        <SelectItem value="Laterite">Laterite</SelectItem>
                        <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="previousCrop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Season Crop</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cotton, Wheat, Fallow" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Economic Constraints */}
              <FormField
                control={form.control}
                name="workingCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Working Capital (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formal Credit Access (e.g., KCC)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Do you have access to credit?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <FormField
                control={form.control}
                name="labReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Soil / Water Lab Report (Optional)</FormLabel>
                    <FormDescription>Upload a PDF or PNG scan (Max 5 MB). AI will analyze it to suggest precise manure/fertilizer parameters.</FormDescription>
                    <FormControl>
                      <Input type="file" accept=".pdf, .png" onChange={handleFileChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto mt-6">
              {isLoading ? "Analyzing Constraints..." : "Compute Strategy Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
