"use client";
/**
 * @fileOverview YieldIQ GIS Field Intelligence Dashboard.
 * Provides an interactive Leaflet map with plot health overlays,
 * real weather data, NDVI proxy scores, and integration with the
 * Advisory Reports and Farm Profile features.
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useUser, useFarm } from "@/supabase";
import { useSession } from "next-auth/react";
import { getGisData } from "@/app/actions/get-gis-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import {
  Map as MapIcon,
  Loader2,
  Thermometer,
  Droplets,
  CloudRain,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Navigation,
  ArrowRight,
  Activity,
} from "lucide-react";

// ─── Dynamic Import (avoids SSR window error from Leaflet) ────────────────────
const GisMapClient = dynamic(
  () => import("@/components/dashboard/gis-map-client"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[560px] flex items-center justify-center bg-secondary/20 rounded-xl border border-primary/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading interactive map…</p>
        </div>
      </div>
    ),
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-lime-600";
  if (score >= 4) return "text-amber-600";
  return "text-red-600";
}

function healthBg(score: number): string {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-lime-400";
  if (score >= 4) return "bg-amber-500";
  return "bg-red-500";
}

function defaultSoilHealth(soilType: string): number {
  const map: Record<string, number> = {
    black: 8.5, "black cotton": 8.5, loamy: 9.0, alluvial: 9.0,
    clay: 7.0, sandy: 6.5, "sandy loam": 6.5, silt: 7.5,
    red: 7.0, "red laterite": 7.0, saline: 4.0,
  };
  const lower = (soilType || "").toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return v;
  }
  return 7.0;
}

function ndviProxy(score: number): string {
  return (0.15 + (score / 10) * 0.72).toFixed(2);
}

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function GISMapPage() {
  const { data: session } = useSession();
  const { user } = useUser();
  const userUid = user?.uid || (session?.user as any)?.id;
  const { data: farmData, isLoading: isFarmLoading } = useFarm(userUid);

  const [gisData, setGisData] = useState<any>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.211, 74.9455]);
  const [activeTab, setActiveTab] = useState("plots");

  // Geocode farm location + fetch weather when farm data loads
  useEffect(() => {
    if (!farmData) return;
    setIsGeoLoading(true);
    getGisData(farmData.location || "")
      .then((data) => {
        setGisData(data);
        setMapCenter([data.coordinates.lat, data.coordinates.lng]);
      })
      .catch(console.error)
      .finally(() => setIsGeoLoading(false));
  }, [farmData?.location]);

  const plots: any[] = farmData?.plots || [];
  const weather = gisData?.weather ?? null;

  // ── Derived farm-wide stats ────────────────────────────────────────────────
  const totalArea = plots.reduce((s: number, p: any) => s + (p.area || 0), 0);

  const avgNdvi =
    plots.length > 0
      ? (
          plots.reduce((s: number, p: any) => {
            const score = p.latestAdvisory?.soilHealthSummary?.score ?? defaultSoilHealth(p.soilType);
            return s + parseFloat(ndviProxy(score));
          }, 0) / plots.length
        ).toFixed(2)
      : "--";

  const healthyPlots = plots.filter(
    (p: any) =>
      (p.latestAdvisory?.soilHealthSummary?.score ?? defaultSoilHealth(p.soilType)) >= 7
  ).length;

  const riskAlerts = plots.filter(
    (p: any) =>
      p.latestAdvisory?.riskSummary?.level === "High" ||
      p.latestAdvisory?.riskSummary?.level === "Critical"
  ).length;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isFarmLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-primary" />
            GIS Field Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            {farmData?.name ? (
              <>
                <span className="font-medium text-foreground">{farmData.name}</span>
                {" — "}
                <Navigation className="inline h-3 w-3 text-primary mb-0.5" />{" "}
                {gisData?.coordinates?.displayName || farmData.location || "Set location in Farm Profile"}
              </>
            ) : (
              "Configure your Farm Profile to enable spatial field analysis."
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/dashboard/advisory">
              <Activity className="h-4 w-4" />
              Advisory Reports
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/dashboard/farm-profile">
              <Sprout className="h-4 w-4" />
              Edit Farm Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* ── No farm prompt ───────────────────────────────────────────────────── */}
      {!farmData && (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Set Up Your Farm Profile</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span>Add your farm location and plots to see spatial health maps, NDVI overlays, and irrigation zones.</span>
            <Button size="sm" asChild className="shrink-0">
              <Link href="/dashboard/farm-profile">Go to Farm Profile <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main Layout: Map + Side Panel ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-4 gap-6">

        {/* Map Area (3/4 width) */}
        <div className="lg:col-span-3">
          {isGeoLoading ? (
            <div className="w-full min-h-[560px] flex items-center justify-center bg-secondary/20 rounded-xl border border-primary/10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Geocoding farm location…</p>
              </div>
            </div>
          ) : (
            <GisMapClient
              center={mapCenter}
              plots={plots}
              weather={weather}
              farmName={farmData?.name}
            />
          )}

          {/* Map attribution note */}
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            Plot boundaries are spatial approximations. Switch to Satellite layer for actual field imagery.
          </p>
        </div>

        {/* Side Panel (1/4 width) */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="plots" className="text-xs">Plots</TabsTrigger>
              <TabsTrigger value="weather" className="text-xs">Weather</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
            </TabsList>

            {/* ── Plots Tab ─────────────────────────────────────────────────── */}
            <TabsContent value="plots" className="mt-3 space-y-3">
              {plots.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 pb-5 text-center">
                    <Sprout className="h-8 w-8 text-muted mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No plots configured. Add plots in Farm Profile to see spatial health mapping.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 text-xs" asChild>
                      <Link href="/dashboard/farm-profile">Add Plots</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                plots.map((plot: any, i: number) => {
                  const advisory = plot.latestAdvisory;
                  const soilHealth =
                    advisory?.soilHealthSummary?.score ?? defaultSoilHealth(plot.soilType);
                  const waterNeeds = advisory?.waterNeedsSummary?.level ?? "—";
                  const riskLevel = advisory?.riskSummary?.level ?? "—";
                  const ndvi = ndviProxy(soilHealth);
                  const isRisk = riskLevel === "High" || riskLevel === "Critical";

                  return (
                    <Card
                      key={i}
                      className={`border-l-4 hover:shadow-sm transition-shadow ${
                        isRisk
                          ? "border-l-red-500"
                          : soilHealth >= 7
                          ? "border-l-green-500"
                          : "border-l-amber-400"
                      }`}
                    >
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold truncate">{plot.name || `Plot ${i + 1}`}</p>
                          <Badge variant="outline" className="text-[9px] shrink-0 ml-1">
                            {plot.cropType || "—"}
                          </Badge>
                        </div>

                        {/* NDVI progress bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>NDVI Proxy</span>
                            <span className={`font-bold ${healthColor(soilHealth)}`}>{ndvi}</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${healthBg(soilHealth)}`}
                              style={{ width: `${(parseFloat(ndvi) / 0.87) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Soil</span>
                            <span className={`font-semibold ${healthColor(soilHealth)}`}>
                              {soilHealth.toFixed(1)}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Water</span>
                            <span className="font-medium">{waterNeeds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk</span>
                            <span
                              className={`font-medium ${
                                isRisk
                                  ? "text-red-600"
                                  : riskLevel === "Moderate"
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }`}
                            >
                              {riskLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Area</span>
                            <span className="font-medium">{plot.area || 0} ac</span>
                          </div>
                        </div>

                        {advisory?.predictedYieldSummary?.display && (
                          <div className="mt-2 pt-2 border-t flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Yield Prediction</span>
                            <span className="font-bold text-primary">
                              {advisory.predictedYieldSummary.display}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ── Weather Tab ───────────────────────────────────────────────── */}
            <TabsContent value="weather" className="mt-3 space-y-3">
              {weather ? (
                <>
                  <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{weatherIcon(weather.weatherCode)}</span>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{weather.currentTemp?.toFixed(1)}°C</p>
                          <p className="text-[10px] text-muted-foreground">Current Temperature</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            icon: <Droplets className="h-3 w-3 text-blue-500" />,
                            value: `${weather.currentHumidity}%`,
                            label: "Humidity",
                            bg: "bg-blue-50/60 border-blue-100",
                            text: "text-blue-700",
                          },
                          {
                            icon: <CloudRain className="h-3 w-3 text-sky-500" />,
                            value: `${weather.currentRainfall} mm`,
                            label: "Rainfall",
                            bg: "bg-sky-50/60 border-sky-100",
                            text: "text-sky-700",
                          },
                          {
                            icon: <Thermometer className="h-3 w-3 text-amber-500" />,
                            value: `${weather.soilTempSurface?.toFixed(1)}°C`,
                            label: "Soil Temp",
                            bg: "bg-amber-50/60 border-amber-100",
                            text: "text-amber-700",
                          },
                          {
                            icon: <Droplets className="h-3 w-3 text-green-500" />,
                            value: `${((weather.soilMoistureTop || 0) * 100).toFixed(1)}%`,
                            label: "Soil Moisture",
                            bg: "bg-green-50/60 border-green-100",
                            text: "text-green-700",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border text-center ${item.bg}`}
                          >
                            <div className="flex justify-center mb-1">{item.icon}</div>
                            <p className={`text-sm font-bold ${item.text}`}>{item.value}</p>
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-sm">7-Day Forecast Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rain Forecast</span>
                        <span className="font-bold text-blue-600">
                          {weather.forecast7dayRain?.toFixed(1)} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Temp (7-day)</span>
                        <span
                          className={`font-bold ${
                            weather.forecastMaxTemp > 38 ? "text-red-600" : "text-foreground"
                          }`}
                        >
                          {weather.forecastMaxTemp?.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ETo (mm/day)</span>
                        <span className="font-bold text-green-700">{weather.eto?.toFixed(2)}</span>
                      </div>

                      {weather.forecastMaxTemp > 38 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 leading-snug">
                          ⚠ Heat stress risk — consider extra irrigation and shade nets.
                        </div>
                      )}
                      {weather.forecast7dayRain > 20 && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 leading-snug">
                          💧 Significant rain expected — reduce irrigation by ~30%.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 pb-5 text-center">
                    <CloudRain className="h-8 w-8 text-muted mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Weather loads after farm location is set in Farm Profile.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── Insights Tab ──────────────────────────────────────────────── */}
            <TabsContent value="insights" className="mt-3 space-y-3">
              {/* Spatial Analysis */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold uppercase text-primary mb-1">Spatial Analysis</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {plots.length > 0
                    ? `${healthyPlots}/${plots.length} plots show healthy soil profiles (score ≥ 7). Click any plot on the map for full metrics.`
                    : "Add plots in Farm Profile to enable spatial health mapping."}
                </p>
              </div>

              {/* Irrigation Zones */}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-bold uppercase text-blue-700 mb-1">Irrigation Zones</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {weather
                    ? `ETo of ${weather.eto?.toFixed(2)} mm/day detected. ${
                        weather.forecast7dayRain > 15
                          ? "Upcoming rain may reduce irrigation needs by 20–40%."
                          : "Schedule irrigation based on crop-specific water requirements."
                      }`
                    : "Set farm location to enable irrigation zone mapping."}
                </p>
              </div>

              {/* Risk Zones */}
              {riskAlerts > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-[10px] font-bold uppercase text-red-700 mb-1">
                    {riskAlerts} Risk Zone{riskAlerts > 1 ? "s" : ""} Detected
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    High-risk plots marked with dashed red borders and (!) icons on the map.
                    Open Advisory Reports for targeted corrective actions.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs h-7 text-red-700 border-red-200 hover:bg-red-50" asChild>
                    <Link href="/dashboard/advisory">View Advisory <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              )}

              {/* NDVI explanation */}
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-[10px] font-bold uppercase mb-1">How NDVI Proxy Works</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  NDVI proxy is derived from your soil health score computed by YieldIQ's agronomy engine (FAO Paper 29/56 + IS-10500 standards). Upload a lab report for a higher-accuracy score.
                </p>
              </div>

              {/* Map Legend */}
              <Card>
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-xs font-semibold">Map Legend</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2 text-[10px]">
                  {[
                    { color: "bg-green-500", label: "Excellent Health (NDVI ≥ 0.72)" },
                    { color: "bg-lime-400",  label: "Good Health (NDVI 0.57–0.71)" },
                    { color: "bg-amber-500", label: "Fair Health (NDVI 0.43–0.56)" },
                    { color: "bg-red-500",   label: "Stressed Zone (NDVI < 0.43)" },
                    { color: "bg-red-600 ring-2 ring-red-800", label: "High Risk Zone (dashed border)" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-sm shrink-0 ${item.color}`} />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Bottom Stats Row ────────────────────────────────────────────────── */}
      {plots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Total Farm Area</p>
              <p className="text-2xl font-bold text-primary">{totalArea.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">acres across {plots.length} plot{plots.length > 1 ? "s" : ""}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Avg NDVI Proxy</p>
              <p className={`text-2xl font-bold ${parseFloat(avgNdvi) >= 0.57 ? "text-green-600" : parseFloat(avgNdvi) >= 0.43 ? "text-amber-600" : "text-red-600"}`}>
                {avgNdvi}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {parseFloat(avgNdvi) >= 0.57 ? "Healthy vegetation" : parseFloat(avgNdvi) >= 0.43 ? "Moderate stress" : "Significant stress"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Healthy Plots</p>
                  <p className="text-2xl font-bold text-green-600">{healthyPlots}<span className="text-sm text-muted-foreground font-normal">/{plots.length}</span></p>
                  <p className="text-[10px] text-muted-foreground">soil health score ≥ 7</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-sm ${riskAlerts > 0 ? "border-red-200 bg-red-50/30" : ""}`}>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Risk Alerts</p>
                  <p className={`text-2xl font-bold ${riskAlerts > 0 ? "text-red-600" : "text-foreground"}`}>
                    {riskAlerts}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {riskAlerts > 0 ? "plots need attention" : "No critical risks"}
                  </p>
                </div>
                <AlertTriangle className={`h-5 w-5 mt-1 ${riskAlerts > 0 ? "text-red-500" : "text-muted"}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
