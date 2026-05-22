
"use client";

import { useState } from "react";
import { MOCK_TRIP } from "@/lib/mock-data";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ReceiptText, Users, CheckCircle2, ListChecks, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Expense } from "@/types";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AllocatePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: allExpenses = [] } = useCollection<Expense>(expensesQuery);

  // Filter expenses that have a Nitin Clan allocation but haven't been internally allocated yet
  const pendingExpenses = allExpenses.filter(exp => 
    exp.allocations.some(a => a.node_id === "node_nitin_clan" && (!a.internal_allocations || a.internal_allocations.length === 0))
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
  const allNitinMembers = nitinClan?.sub_nodes?.flatMap(sn => sn.members || []) || [];

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

  const handleSelectAllGroup = (expId: string, members: string[], select: boolean) => {
    setSelectedMembers(prev => {
      const currentExp = { ...(prev[expId] || {}) };
      members.forEach(m => {
        currentExp[m] = select;
      });
      return {
        ...prev,
        [expId]: currentExp
      };
    });
  };

  const submitAllocation = (expense: Expense) => {
    if (!db) return;
    const selected = selectedMembers[expense.id] || {};
    const selectedList = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([name]) => name);

    // Strict validation: Exactly 7 members
    if (selectedList.length !== 7) {
      toast({
        variant: "destructive",
        title: "Invalid Member Count",
        description: `You must select exactly 7 members for the split. Currently selected: ${selectedList.length}.`,
      });
      return;
    }

    // Update the expense in Firestore
    const expenseRef = doc(db, "trips", "trip-2026", "expenses", expense.id);
    const updatedAllocations = expense.allocations.map(a => {
      if (a.node_id === "node_nitin_clan") {
        return { ...a, internal_allocations: selectedList };
      }
      return a;
    });

    updateDoc(expenseRef, { allocations: updatedAllocations })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: expenseRef.path,
          operation: 'update',
          requestResourceData: { allocations: updatedAllocations },
        }));
      });
    
    toast({
      title: "Allocation Confirmed",
      description: `Successfully distributed equally across ${selectedList.length} clan members.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Internal Clan Allocations</h1>
        <p className="text-muted-foreground">Divide your clan's ₹ shares equally among core family and cousins</p>
      </header>

      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Selection Rule</AlertTitle>
        <AlertDescription>
          For every allocation, you must select **exactly 7 members** from your clan to participate in the split.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {pendingExpenses.map(expense => {
          const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const amountToSplit = clanAllocation?.amount || 0;
          
          const currentExpSelected = selectedMembers[expense.id] || {};
          const selectedCount = Object.values(currentExpSelected).filter(Boolean).length;
          const memberAmount = selectedCount > 0 ? (amountToSplit / selectedCount) : 0;

          const allSelected = allNitinMembers.every(m => currentExpSelected[m]);

          return (
            <Card key={expense.id} className="border-accent/20 bg-card/50 overflow-hidden shadow-xl">
              <CardHeader className="pb-4 bg-secondary/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <ReceiptText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{expense.description}</CardTitle>
                      <CardDescription>{expense.date}</CardDescription>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Clan Total</p>
                    <p className="text-3xl font-bold font-headline text-accent">₹{amountToSplit.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Global Select All */}
                <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-accent" />
                    <span className="text-sm font-bold">Select All Clan (8 Members)</span>
                  </div>
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAllGroup(expense.id, allNitinMembers, !!checked)}
                    className="h-6 w-6"
                  />
                </div>

                <div className="grid gap-8">
                  {nitinClan?.sub_nodes?.map(subNode => {
                    const groupMembers = subNode.members || [];
                    const groupAllSelected = groupMembers.every(m => currentExpSelected[m]);

                    return (
                      <div key={subNode.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-primary">{subNode.display_name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Select All {subNode.display_name.split(' ')[0]}</span>
                            <Checkbox 
                              checked={groupAllSelected}
                              onCheckedChange={(checked) => handleSelectAllGroup(expense.id, groupMembers, !!checked)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {groupMembers.map(member => {
                            const isSelected = !!currentExpSelected[member];

                            return (
                              <div 
                                key={member} 
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                  isSelected ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' : 'bg-background border-border hover:border-border/80'
                                }`}
                              >
                                <div className="flex items-center gap-3">
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
                    );
                  })}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedCount === 7 ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                      {selectedCount === 7 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${selectedCount === 7 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {selectedCount} of 7 Selected
                      </p>
                      <p className="text-[10px] text-muted-foreground">Exactly 7 members must be selected to split.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => submitAllocation(expense)}
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
            <Button variant="link" className="mt-2 text-primary" onClick={() => router.push("/")}>Return to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
