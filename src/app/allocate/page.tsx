"use client";

import { useState, useEffect } from "react";
import { MOCK_TRIP, MOCK_EXPENSES } from "@/lib/mock-data";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ReceiptText, Users, CheckCircle2, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AllocatePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  // State for member-level allocation: { [expenseId]: { [memberName]: { selected: boolean, shares: number } } }
  const [memberAllocations, setMemberAllocations] = useState<Record<string, Record<string, { selected: boolean, shares: number }>>>({});

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

  const handleToggleMember = (expId: string, member: string) => {
    setMemberAllocations(prev => {
      const currentExp = prev[expId] || {};
      const currentMember = currentExp[member] || { selected: false, shares: 1 };
      
      return {
        ...prev,
        [expId]: {
          ...currentExp,
          [member]: {
            ...currentMember,
            selected: !currentMember.selected
          }
        }
      };
    });
  };

  const handleShareChange = (expId: string, member: string, shares: string) => {
    const shareVal = parseInt(shares) || 0;
    setMemberAllocations(prev => ({
      ...prev,
      [expId]: {
        ...(prev[expId] || {}),
        [member]: {
          ...(prev[expId]?.[member] || { selected: true }),
          shares: shareVal
        }
      }
    }));
  };

  const submitAllocation = (expId: string) => {
    const allocations = memberAllocations[expId] || {};
    const selectedCount = Object.values(allocations).filter(a => a.selected).length;

    if (selectedCount === 0) {
      toast({
        variant: "destructive",
        title: "No Members Selected",
        description: "Please select at least one clan member to allocate the expense.",
      });
      return;
    }

    toast({
      title: "Allocation Confirmed",
      description: `Successfully distributed within Nitin's Clan across ${selectedCount} members.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Internal Clan Allocations</h1>
        <p className="text-muted-foreground">Divide your clan's ₹ shares among core family and cousins</p>
      </header>

      <div className="grid gap-6">
        {pendingExpenses.map(expense => {
          const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const amountToSplit = clanAllocation?.amount || 0;
          
          const currentExpAlloc = memberAllocations[expense.id] || {};
          const totalShares = Object.values(currentExpAlloc)
            .filter(a => a.selected)
            .reduce((sum, a) => sum + a.shares, 0);

          return (
            <Card key={expense.id} className="border-accent/20 bg-card/50 overflow-hidden shadow-xl">
              <CardHeader className="pb-4 bg-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <ReceiptText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{expense.description}</CardTitle>
                      <CardDescription>{expense.date}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Clan Total</p>
                    <p className="text-3xl font-bold font-headline text-accent">₹{amountToSplit.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {nitinClan?.sub_nodes?.map(subNode => (
                  <div key={subNode.id} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm uppercase tracking-widest text-primary">{subNode.display_name}</h3>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {subNode.members?.map(member => {
                        const isSelected = currentExpAlloc[member]?.selected || false;
                        const shares = currentExpAlloc[member]?.shares ?? 1;
                        const memberAmount = totalShares > 0 && isSelected 
                          ? (amountToSplit * (shares / totalShares)) 
                          : 0;

                        return (
                          <div 
                            key={member} 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                              isSelected ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' : 'bg-background border-border hover:border-border/80'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox 
                                id={`${expense.id}-${member}`}
                                checked={isSelected}
                                onCheckedChange={() => handleToggleMember(expense.id, member)}
                                className="h-5 w-5"
                              />
                              <div className="space-y-0.5">
                                <Label 
                                  htmlFor={`${expense.id}-${member}`}
                                  className="text-sm font-semibold cursor-pointer"
                                >
                                  {member}
                                </Label>
                                {isSelected && (
                                   <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                                     <Badge variant="outline" className="h-4 px-1 text-[9px] border-emerald-500/30 text-emerald-500">
                                       ₹{memberAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                     </Badge>
                                   </div>
                                )}
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="flex flex-col items-end gap-1">
                                <Label className="text-[9px] text-muted-foreground uppercase">Shares</Label>
                                <Input 
                                  type="number"
                                  className="w-16 h-8 text-right bg-background border-primary/20"
                                  value={shares}
                                  onChange={(e) => handleShareChange(expense.id, member, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Internal Settlement</p>
                      <p className="text-[10px] text-muted-foreground">Values are visible only to your clan managers.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => submitAllocation(expense.id)}
                    className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 py-6 rounded-xl shadow-lg shadow-accent/20"
                  >
                    Confirm Sub-Allocation
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pendingExpenses.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/50">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">All clan expenses are fully allocated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
