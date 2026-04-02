"use client";
/**
 * @fileOverview YieldIQ GIS Map Client — Leaflet-powered interactive farm field map.
 *
 * Dynamically loaded (ssr: false) to avoid Leaflet's window dependency.
 * Renders:
 *   - 3 switchable base layers: Standard (OSM), Satellite (Esri), Terrain (OpenTopoMap)
 *   - Per-plot colour-coded polygons based on soil health / NDVI proxy
 *   - Clickable popups with advisory details (yield, water needs, risk, tasks)
 *   - Persistent plot-name tooltips
 *   - Risk-warning icons (!) for High / Critical plots
 *   - Farm centre marker
 *   - Auto-fit bounds to show all plots
 */

import { useEffect, useRef } from "react";
import type { WeatherData } from "@/lib/weather";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlotData {
  id: string;
  name: string;
  area: number;          // in acres
  soilType: string;
  cropType: string;
  growthStage: string;
  variety?: string;
  latestAdvisory?: any;  // AdvisoryOutput from personalized-farming-advisory-flow
  lastComputedInsights?: any;
}

export interface GisMapClientProps {
  center: [number, number]; // [lat, lng]
  plots: PlotData[];
  weather: WeatherData | null;
  farmName?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TILE_LAYERS = {
  Standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  Satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "&copy; Esri — Source: Esri, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, UPR-EGP, and GIS User Community",
    maxZoom: 19,
  },
  Terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
  },
} as const;

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Map soil health score (0-10) to a fill colour. */
function healthToColor(score: number): string {
  if (score >= 8) return "#22c55e"; // green-500  — excellent
  if (score >= 6) return "#a3e635"; // lime-400   — good
  if (score >= 4) return "#f59e0b"; // amber-500  — fair
  return "#ef4444";                 // red-500    — stressed
}

/** Derive a rough NDVI proxy (0–1) from soil health score (0–10). */
function ndviProxy(score: number): string {
  return (0.15 + (score / 10) * 0.72).toFixed(2);
}

/** Rough default soil health by texture (when no advisory is available). */
function defaultSoilHealth(soilType: string): number {
  const map: Record<string, number> = {
    black: 8.5, "black cotton": 8.5,
    loamy: 9.0, alluvial: 9.0,
    clay: 7.0,
    sandy: 6.5, "sandy loam": 6.5,
    silt: 7.5,
    red: 7.0, "red laterite": 7.0,
    saline: 4.0, "saline alkaline": 4.0,
  };
  const lower = (soilType || "").toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return 7.0;
}

/**
 * Generates approximate rectangular polygon coordinates for a plot.
 * Arranges plots in a grid around the farm centre — a spatial approximation
 * since individual GPS coordinates per plot are not yet stored.
 */
function generatePlotPolygon(
  centerLat: number,
  centerLng: number,
  areaAcres: number,
  idx: number,
  total: number
): [number, number][] {
  const areaKm2 = Math.max(areaAcres, 0.1) * 0.00404686;
  const side = Math.sqrt(areaKm2);

  // Degrees per km at this latitude
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((centerLat * Math.PI) / 180));

  const latHalf = (side * latPerKm) / 2 * 0.85;
  const lngHalf = (side * lngPerKm) / 2 * 0.85;

  // Grid layout
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const rows = Math.ceil(total / cols);
  const row = Math.floor(idx / cols);
  const col = idx % cols;

  const offsetLat = (row - (rows - 1) / 2) * latHalf * 3.0;
  const offsetLng = (col - (cols - 1) / 2) * lngHalf * 3.0;

  const pLat = centerLat + offsetLat;
  const pLng = centerLng + offsetLng;

  return [
    [pLat - latHalf, pLng - lngHalf],
    [pLat + latHalf, pLng - lngHalf],
    [pLat + latHalf, pLng + lngHalf],
    [pLat - latHalf, pLng + lngHalf],
  ];
}

/** Build the HTML content for the plot detail popup. */
function buildPopupHtml(plot: PlotData, idx: number): string {
  const advisory = plot.latestAdvisory;
  const soilHealth =
    advisory?.soilHealthSummary?.score ?? defaultSoilHealth(plot.soilType);
  const waterNeeds = advisory?.waterNeedsSummary?.level ?? "Unknown";
  const riskLevel = advisory?.riskSummary?.level ?? "Low";
  const predictedYield = advisory?.predictedYieldSummary?.display ?? null;
  const ndvi = ndviProxy(soilHealth);
  const fillColor = healthToColor(soilHealth);

  const riskColor =
    riskLevel === "High" || riskLevel === "Critical"
      ? "#dc2626"
      : riskLevel === "Moderate"
      ? "#d97706"
      : "#16a34a";

  const irrigationTip = advisory?.detailedReport?.irrigationRecommendations
    ? `<div style="margin-top:10px;padding:8px 10px;background:#f0fdf4;border-radius:6px;border-left:3px solid #22c55e;font-size:11px;color:#166534;line-height:1.5;">
        <strong>💧 Irrigation:</strong> ${advisory.detailedReport.irrigationRecommendations.slice(0, 130)}…
       </div>`
    : "";

  const topTask = advisory?.smartTasks?.[0]
    ? `<div style="margin-top:6px;padding:8px 10px;background:#fefce8;border-radius:6px;border-left:3px solid #ca8a04;font-size:11px;color:#713f12;line-height:1.5;">
        <strong>⚡ Priority Task:</strong> ${advisory.smartTasks[0].title}
       </div>`
    : "";

  const yieldRow = predictedYield
    ? `<div style="padding:7px 10px;background:#ecfdf5;border-radius:6px;border:1px solid #bbf7d0;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#166534;font-weight:600;">Predicted Yield</span>
        <span style="font-size:15px;font-weight:800;color:#15803d;">${predictedYield}</span>
       </div>`
    : `<div style="padding:7px 10px;background:#f9fafb;border-radius:6px;border:1px dashed #d1d5db;margin-bottom:8px;text-align:center;font-size:11px;color:#9ca3af;">
        Generate advisory to see yield prediction
       </div>`;

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-width:240px;max-width:300px;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,${fillColor}28,${fillColor}10);padding:12px 14px 10px;border-bottom:2px solid ${fillColor}40;">
        <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:3px;">${plot.name || `Plot ${idx + 1}`}</div>
        <div style="font-size:11px;color:#555;">
          ${plot.cropType || "Crop not set"} &nbsp;·&nbsp; ${plot.area || 0} ac &nbsp;·&nbsp; ${plot.soilType || "Unknown soil"}
          ${plot.growthStage ? `&nbsp;·&nbsp; ${plot.growthStage}` : ""}
        </div>
      </div>

      <!-- Metrics Grid -->
      <div style="padding:10px 12px 4px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div style="text-align:center;padding:8px 4px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
            <div style="font-size:20px;font-weight:800;color:${fillColor};">${soilHealth.toFixed(1)}</div>
            <div style="font-size:10px;color:#6b7280;margin-top:1px;">Soil Health /10</div>
          </div>
          <div style="text-align:center;padding:8px 4px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
            <div style="font-size:20px;font-weight:800;color:${fillColor};">${ndvi}</div>
            <div style="font-size:10px;color:#6b7280;margin-top:1px;">NDVI Proxy</div>
          </div>
          <div style="text-align:center;padding:8px 4px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
            <div style="font-size:14px;font-weight:700;color:#1d4ed8;">${waterNeeds}</div>
            <div style="font-size:10px;color:#6b7280;margin-top:1px;">Water Needs</div>
          </div>
          <div style="text-align:center;padding:8px 4px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
            <div style="font-size:14px;font-weight:700;color:${riskColor};">${riskLevel}</div>
            <div style="font-size:10px;color:#6b7280;margin-top:1px;">Risk Level</div>
          </div>
        </div>

        ${yieldRow}
        ${irrigationTip}
        ${topTask}

        <div style="margin-top:10px;padding-top:8px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af;text-align:center;">
          Click Advisory Reports for full precision guidance
        </div>
      </div>
    </div>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GisMapClient({
  center,
  plots,
  weather,
  farmName,
}: GisMapClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((module) => {
      if (cancelled || !containerRef.current) return;

      const L = module.default;

      // ── Initialize Map ────────────────────────────────────────────────────
      const map = L.map(containerRef.current!, {
        center,
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;

      // Zoom control — top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // ── Base Tile Layers ──────────────────────────────────────────────────
      const baseLayers: Record<string, any> = {};
      Object.entries(TILE_LAYERS).forEach(([name, cfg]) => {
        const layer = L.tileLayer(cfg.url, {
          attribution: cfg.attribution,
          maxZoom: cfg.maxZoom,
        });
        baseLayers[name] = layer;
        if (name === "Standard") layer.addTo(map);
      });

      // Layer switcher control
      L.control.layers(baseLayers, {}, { position: "topright", collapsed: false }).addTo(map);

      // ── Plot Polygons ─────────────────────────────────────────────────────
      const polygonLayers: any[] = [];

      plots.forEach((plot, idx) => {
        const advisory = plot.latestAdvisory;
        const soilHealth =
          advisory?.soilHealthSummary?.score ?? defaultSoilHealth(plot.soilType);
        const riskLevel = advisory?.riskSummary?.level ?? "Low";
        const isHighRisk = riskLevel === "High" || riskLevel === "Critical";

        const fillColor = healthToColor(soilHealth);
        const ndvi = ndviProxy(soilHealth);

        const coords = generatePlotPolygon(
          center[0],
          center[1],
          plot.area || 1,
          idx,
          plots.length
        );

        // Polygon styling
        const polygon = L.polygon(coords as any, {
          color: isHighRisk ? "#dc2626" : "#334155",
          fillColor,
          fillOpacity: 0.42,
          weight: isHighRisk ? 3 : 1.5,
          dashArray: isHighRisk ? "8 4" : undefined,
        });

        // Rich popup
        polygon.bindPopup(buildPopupHtml(plot, idx), {
          maxWidth: 320,
          className: "yieldiq-popup",
        });

        // Persistent label tooltip
        polygon.bindTooltip(
          `<strong>${plot.name || `Plot ${idx + 1}`}</strong> · NDVI ${ndvi}`,
          {
            permanent: true,
            direction: "center",
            className: "plot-tooltip",
          }
        );

        polygon.addTo(map);
        polygonLayers.push(polygon);

        // Risk warning badge at polygon centre
        if (isHighRisk) {
          const c = polygon.getBounds().getCenter();
          const warnIcon = L.divIcon({
            html: `<div style="background:#dc2626;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;box-shadow:0 2px 8px rgba(220,38,38,0.55);border:2px solid #fff;">!</div>`,
            className: "",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          L.marker([c.lat, c.lng], { icon: warnIcon })
            .bindTooltip(`⚠ ${riskLevel} Risk — see advisory`, { direction: "top" })
            .addTo(map);
        }
      });

      // ── Farm Centre Marker ────────────────────────────────────────────────
      const farmIcon = L.divIcon({
        html: `<div title="${farmName || "Farm Centre"}" style="background:#15803d;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 10px rgba(21,128,61,0.5);border:3px solid #fff;">🌾</div>`,
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker(center, { icon: farmIcon })
        .bindTooltip(farmName || "Farm Centre", { direction: "top", permanent: false })
        .addTo(map);

      // ── Fit Bounds ────────────────────────────────────────────────────────
      if (polygonLayers.length > 0) {
        const group = L.featureGroup(polygonLayers);
        map.fitBounds(group.getBounds().pad(0.35));
      }

      // ── Scale Control ─────────────────────────────────────────────────────
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ minHeight: "560px", height: "100%" }}
    />
  );
}
