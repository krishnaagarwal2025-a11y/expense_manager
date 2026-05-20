"use client";

import { useState } from "react";
import { MOCK_TRIP, MOCK_EXPENSES } from "@/lib/mock-data";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ReceiptText, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AllocatePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [allocationShares, setAllocationShares] = useState<Record<string, Record<string, number>>>({});

  if (user !== "nitin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Only Nitin's Clan managers can access internal allocations.</p>
        <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const nitinClan = MOCK_TRIP.nodes.find(n => n.id === "node_nitin_clan");
  const pendingExpenses = MOCK_EXPENSES.filter(exp => 
    exp.allocations.some(a => a.node_id === "node_nitin_clan")
  );

  const handleShareChange = (expId: string, nodeId: string, val: string) => {
    setAllocationShares(prev => ({
      ...prev,
      [expId]: {
        ...(prev[expId] || {}),
        [nodeId]: parseInt(val) || 0
      }
    }));
  };

  const submitAllocation = (expId: string) => {
    toast({
      title: "Allocation Saved",
      description: "Successfully distributed expense among your clan members.",
    });
    // In a real app, this would update the backend
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-primary">Internal Clan Allocations</h1>
        <p className="text-muted-foreground">Divide your clan's ₹ shares among core family and cousins</p>
      </header>

      <div className="grid gap-6">
        {pendingExpenses.map(expense => {
          const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const amountToSplit = clanAllocation?.amount || 0;

          return (
            <Card key={expense.id} className="border-accent/20 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded">
                      <ReceiptText className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{expense.description}</CardTitle>
                      <CardDescription>{expense.date}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Clan Total</p>
                    <p className="text-2xl font-bold font-headline text-accent">₹{amountToSplit.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                  {nitinClan?.sub_nodes?.map(subNode => (
                    <div key={subNode.id} className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {subNode.display_name} (Shares)
                      </Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={allocationShares[expense.id]?.[subNode.id] || ""}
                        onChange={(e) => handleShareChange(expense.id, subNode.id, e.target.value)}
                        className="bg-background"
                      />
                      <p className="text-[10px] text-muted-foreground italic">
                        {subNode.members?.length} members included
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Allocation will be private to your clan</span>
                  </div>
                  <Button 
                    onClick={() => submitAllocation(expense.id)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                  >
                    Confirm Sub-Allocation
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pendingExpenses.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">All clan expenses are fully allocated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
