"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Map as MapIcon, 
  TrendingUp, 
  Activity,
  Zap,
  Clock,
  ExternalLink
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminOverviewProps {
  farms: any[];
}

export function AdminOverview({ farms }: AdminOverviewProps) {
  // Compute Stats
  const totalUsers = farms.length;
  const totalHectares = farms.reduce((sum, f) => sum + (f.total_area_hectares || 0), 0);
  const totalPlots = farms.reduce((sum, f) => sum + (f.plots?.length || 0), 0);
  const totalAdvisories = farms.filter(f => f.latest_advisory).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 4 pillar stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Total Farmers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalUsers}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-blue-500" /> Total Area (Ha)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{totalHectares.toFixed(1)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Managed land across platform</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> AI Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">{totalAdvisories}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active precision reports</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-600">99.8%</div>
            <p className="text-[10px] text-muted-foreground mt-1">API & Edge runtime status</p>
          </CardContent>
        </Card>
      </div>

      {/* Global User Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle>Global Farm Registry</CardTitle>
             <CardDescription>Real-time view of all farms and their current AI engagement status.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Activity className="h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer / Location</TableHead>
                <TableHead>Scale</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>AI Status</TableHead>
                <TableHead className="text-right">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-semibold">{farm.owner_name || "Unknown Farmer"}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{farm.owner_email} | {farm.location || "No Location"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold">{farm.total_area_hectares} Ha</div>
                    <div className="text-[10px] text-muted-foreground">{farm.plots?.length || 0} plots configured</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(farm.updated_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {farm.latest_advisory ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold">INSIGHTS_ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">PROVISIONING</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {farms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No farmers have successfully synced data to the cloud yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
