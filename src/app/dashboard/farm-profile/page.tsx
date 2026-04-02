"use client";

import { useState, useEffect } from "react";
import { useUser, useFarm, saveFarmData } from "@/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Sprout, Database, Save, Loader2, AlertCircle, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FarmProfilePage() {
  const { data: session } = useSession();
  const { user } = useUser();
  const { toast } = useToast();
  
  const userUid = user?.uid || (session?.user as any)?.id;
  
  const { data: farmData, isLoading: isFarmLoading, error: farmError } = useFarm(userUid);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalAreaHectares: 0,
    numberOfPlots: 1,
    plots: [
      { id: "plot-1", name: "Plot 1", area: 0, soilType: "", cropType: "", plantingDate: "", growthStage: "", variety: "" }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (farmData) {
      setFormData({
        name: farmData.name || "",
        location: farmData.location || "",
        totalAreaHectares: farmData.total_area_hectares || 0,
        numberOfPlots: farmData.number_of_plots || 1,
        plots: farmData.plots?.length ? farmData.plots : [
          { id: "plot-1", name: "Plot 1", area: farmData.total_area_hectares || 0, soilType: "", cropType: "", plantingDate: "", growthStage: "", variety: "" }
        ]
      });
    }
  }, [farmData]);

  const handlePlotsChange = (val: number) => {
    setFormData(prev => {
      let newPlots = [...prev.plots];
      if (val > newPlots.length) {
        for (let i = newPlots.length; i < val; i++) {
          newPlots.push({ id: `plot-${Date.now()}-${i}`, name: `Plot ${i+1}`, area: 0, soilType: "", cropType: "", plantingDate: "", growthStage: "", variety: "" });
        }
      } else if (val < newPlots.length) {
        newPlots = newPlots.slice(0, val);
      }
      return { ...prev, numberOfPlots: val, plots: newPlots };
    });
  };

  const updatePlot = (index: number, key: string, val: any) => {
    setFormData(prev => {
      const newPlots = [...prev.plots];
      newPlots[index] = { ...newPlots[index], [key]: val };
      return { ...prev, plots: newPlots };
    });
  };

  const handleSave = async () => {
    if (!userUid) {
      toast({
        variant: "destructive",
        title: "Not Signed In",
        description: "Please sign in to save your farm profile.",
      });
      return;
    }

    setIsSaving(true);

    const computedTotalArea = formData.plots.reduce((acc, p) => acc + (p.area || 0), 0);

    // Map form data to snake_case database column names
    const dbPayload = {
      name: formData.name,
      location: formData.location,
      total_area_hectares: computedTotalArea,
      number_of_plots: formData.plots.length,
      plots: formData.plots,
    };

    try {
      await saveFarmData(userUid, dbPayload);
      toast({
        title: "Farm Profile Saved ✓",
        description: "Your farm details have been saved to the cloud.",
      });
    } catch (error: any) {
      console.error("Cloud save failed:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error?.message || "Could not save to database. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isFarmLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Retrieving secure farm records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-headline">Farm Profile</h1>
          <p className="text-muted-foreground">Manage your master farm and individual plot configurations.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] bg-muted px-2 py-1 rounded border">
          <Database className="h-3 w-3" />
          <span>Cloud Sync Active</span>
        </div>
      </div>

      {farmError && (
        <Alert variant="destructive" className="bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cloud Synchronization Issue</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>We encountered a permission error accessing your farm records.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              General Information
            </CardTitle>
            <CardDescription>Master details for the entire farming operation.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="farm-name">Farm Name</Label>
              <Input id="farm-name" placeholder="e.g. Sunny Punjab Fields" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (District/State)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="location" className="pl-9" placeholder="e.g. Bathinda, Punjab" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="farm-size">Total Computed Area (Acres)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center text-sm font-semibold">
                {formData.plots.reduce((acc, p) => acc + (p.area || 0), 0).toFixed(2)} Acres
              </div>
            </div>
            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={(e) => {
                  e.preventDefault();
                  setFormData(prev => ({
                    ...prev,
                    numberOfPlots: prev.plots.length + 1,
                    plots: [
                      ...prev.plots, 
                      { id: `plot-${Date.now()}`, name: `Plot ${prev.plots.length + 1}`, area: 0, soilType: "", cropType: "", plantingDate: "", growthStage: "", variety: "" }
                    ]
                  }));
                }}
              >
                <Plus className="h-4 w-4" /> Add New Plot Field
              </Button>
            </div>
          </CardContent>
        </Card>

        {formData.plots.map((plot, i) => (
          <Card key={plot.id} className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-md">
                <Sprout className="h-4 w-4 text-primary" />
                Plot {i + 1} Configuration
              </CardTitle>
              {formData.plots.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive h-8 px-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData(prev => ({
                      ...prev,
                      numberOfPlots: prev.plots.length - 1,
                      plots: prev.plots.filter((_, idx) => idx !== i)
                    }));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Plot Alias</Label>
                <Input value={plot.name} onChange={(e) => updatePlot(i, 'name', e.target.value)} placeholder="e.g. North Field" className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Plot Area (Acres)</Label>
                <Input type="number" value={plot.area} onChange={(e) => updatePlot(i, 'area', parseFloat(e.target.value)||0)} className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Soil Type</Label>
                <Select value={plot.soilType} onValueChange={(val) => updatePlot(i, 'soilType', val)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Soil type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="silt">Silt</SelectItem>
                    <SelectItem value="black">Black Soil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Crop Type</Label>
                <Input value={plot.cropType} onChange={(e) => updatePlot(i, 'cropType', e.target.value)} placeholder="e.g. Wheat, Paddy, etc." className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Planting Date</Label>
                <Input type="date" value={plot.plantingDate} onChange={(e) => updatePlot(i, 'plantingDate', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Growth Stage</Label>
                <Select value={plot.growthStage} onValueChange={(val) => updatePlot(i, 'growthStage', val)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="germination">Germination</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="fruiting">Fruiting / Grain filling</SelectItem>
                    <SelectItem value="ripening">Ripening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => window.location.reload()}>Discard Changes</Button>
          <Button className="bg-primary hover:bg-primary/90 min-w-[140px]" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save to Cloud
          </Button>
        </div>
      </div>
    </div>
  );
}