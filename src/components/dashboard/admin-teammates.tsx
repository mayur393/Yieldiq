"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  ShieldCheck, 
  Mail,
  Loader2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { addAdminTeammate, removeAdminTeammate } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";

interface AdminTeammatesProps {
  initialTeammates: any[];
}

export function AdminTeammates({ initialTeammates }: AdminTeammatesProps) {
  const [teammates, setTeammates] = useState(initialTeammates);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newEmail.includes("@")) return;
    setIsAdding(true);
    try {
      await addAdminTeammate(newEmail);
      setTeammates(prev => [...prev, { email: newEmail.toLowerCase(), added_at: new Date().toISOString() }]);
      setNewEmail("");
      toast({ title: "Teammate Added", description: `${newEmail} now has admin access.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    setIsRemoving(email);
    try {
      await removeAdminTeammate(email);
      setTeammates(prev => prev.filter(t => t.email !== email));
      toast({ title: "Access Revoked", description: `${email} is no longer an admin.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Add New Teammate */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <UserPlus className="h-5 w-5 text-primary" />
             </div>
             <div>
                <CardTitle>Grant Admin Access</CardTitle>
                <CardDescription>Add teammate emails to authorize them for the control center.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="teammate@yieldiq.io" 
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} disabled={isAdding || !newEmail} className="gap-2">
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Authorized Personnel
          </CardTitle>
          <CardDescription>Only users in this list (and the root admin in .env) can bypass system restrictions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teammate Email</TableHead>
                <TableHead>Authorization Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teammates.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium tracking-tight">{t.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(t.added_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-white hover:bg-destructive"
                      onClick={() => handleRemove(t.email)}
                      disabled={isRemoving === t.email}
                    >
                      {isRemoving === t.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {teammates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic text-sm">
                    No teammate emails found in the database.
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
