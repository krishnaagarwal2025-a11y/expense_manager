"use client";

import { useState } from "react";
import { MOCK_TRIP, MOCK_EXPENSES } from "@/lib/mock-data";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ReceiptText, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AllocatePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  // Local state for expenses to handle "closing" items after allocation
  const [localExpenses, setLocalExpenses] = useState(
    MOCK_EXPENSES.filter(exp => exp.allocations.some(a => a.node_id === "node_nitin_clan"))
  );

  // State for member-level selection: { [expenseId]: { [memberName]: boolean } }
  const [selectedMembers, setSelectedMembers] = useState<Record<string, Record<string, boolean>>>({});

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

  const handleToggleMember = (expId: string, member: string) => {
    setSelectedMembers(prev => {
      const currentExp = prev[expId] || {};
      return {
        ...prev,
        [expId]: {
          ...currentExp,
          [member]: !currentExp[member]
        }
      };
    });
  };

  const submitAllocation = (expId: string) => {
    const selected = selectedMembers[expId] || {};
    const selectedCount = Object.values(selected).filter(Boolean).length;

    if (selectedCount === 0) {
      toast({
        variant: "destructive",
        title: "No Members Selected",
        description: "Please select at least one clan member to allocate the expense.",
      });
      return;
    }

    // Remove the expense from the pending list (it "closes")
    setLocalExpenses(prev => prev.filter(e => e.id !== expId));
    
    toast({
      title: "Allocation Confirmed",
      description: `Successfully distributed equally across ${selectedCount} clan members.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Internal Clan Allocations</h1>
        <p className="text-muted-foreground">Divide your clan's ₹ shares equally among core family and cousins</p>
      </header>

      <div className="grid gap-6">
        {localExpenses.map(expense => {
          const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const amountToSplit = clanAllocation?.amount || 0;
          
          const currentExpSelected = selectedMembers[expense.id] || {};
          const selectedCount = Object.values(currentExpSelected).filter(Boolean).length;
          const memberAmount = selectedCount > 0 ? (amountToSplit / selectedCount) : 0;

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
                        const isSelected = !!currentExpSelected[member];

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
                                   <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium mt-1">
                                     <Badge variant="outline" className="h-4 px-1 text-[9px] border-emerald-500/30 text-emerald-500">
                                       ₹{memberAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                     </Badge>
                                   </div>
                                )}
                              </div>
                            </div>
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
                      <p className="text-xs font-bold text-foreground">Equal Distribution</p>
                      <p className="text-[10px] text-muted-foreground">Amount is split equally among selected members.</p>
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

        {localExpenses.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border/50">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">All clan expenses are fully allocated.</p>
            <Button variant="link" className="mt-2 text-primary" onClick={() => router.push("/")}>Return to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
