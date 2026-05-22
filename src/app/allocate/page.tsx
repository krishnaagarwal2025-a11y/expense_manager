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

  const pendingExpenses = allExpenses.filter(exp => 
    exp.allocations.some(a => a.node_id === "node_nitin_clan" && (!a.internal_allocations || a.internal_allocations.length === 0)) && !exp.settled
  );

  const [selectedMembers, setSelectedMembers] = useState<Record<string, Record<string, boolean>>>({});

  if (user !== "nitin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-secondary">Access Denied</h1>
        <p className="text-muted-foreground">Only Nitin's Clan managers can access internal allocations.</p>
        <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">Back to Dashboard</Button>
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
    
    const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
    const requiredSelections = clanAllocation?.shares || 0;
    
    const selected = selectedMembers[expense.id] || {};
    const selectedList = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([name]) => name);

    if (selectedList.length !== requiredSelections) {
      toast({
        variant: "destructive",
        title: `Exactly ${requiredSelections} Required`,
        description: `You must select exactly ${requiredSelections} members based on the shares assigned. (Currently: ${selectedList.length})`,
      });
      return;
    }

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
      description: `Task completed. Split saved for ${expense.description}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Internal Split</h1>
        <p className="text-muted-foreground text-sm">Select members for each charge based on the recorded shares</p>
      </header>

      <div className="grid gap-6">
        {pendingExpenses.map(expense => {
          const clanAllocation = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const amountToSplit = clanAllocation?.amount || 0;
          const requiredCount = clanAllocation?.shares || 0;
          
          const currentExpSelected = selectedMembers[expense.id] || {};
          const selectedCount = Object.values(currentExpSelected).filter(Boolean).length;
          const memberAmount = selectedCount > 0 ? (amountToSplit / selectedCount) : 0;

          const allSelected = allNitinMembers.length > 0 && allNitinMembers.every(m => currentExpSelected[m]);

          return (
            <Card key={expense.id} className="border-border/50 bg-white overflow-hidden shadow-xl rounded-2xl">
              <CardHeader className="pb-4 bg-secondary/5 border-b border-secondary/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <ReceiptText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-secondary font-headline leading-tight">{expense.description}</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-wider">{expense.date}</CardDescription>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clan Share ({requiredCount} Members)</p>
                    <p className="text-2xl font-bold font-headline text-primary">₹{amountToSplit.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Master Select All */}
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-secondary">Toggle All Members</span>
                  </div>
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAllGroup(expense.id, allNitinMembers, !!checked)}
                    className="h-5 w-5"
                  />
                </div>

                <div className="space-y-6">
                  {nitinClan?.sub_nodes?.map(subNode => {
                    const groupMembers = subNode.members || [];
                    const groupAllSelected = groupMembers.length > 0 && groupMembers.every(m => currentExpSelected[m]);

                    return (
                      <div key={subNode.id} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-secondary" />
                            <h3 className="font-bold text-[10px] uppercase tracking-widest text-secondary">{subNode.display_name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">All</span>
                            <Checkbox 
                              checked={groupAllSelected}
                              onCheckedChange={(checked) => handleSelectAllGroup(expense.id, groupMembers, !!checked)}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {groupMembers.map(member => {
                            const isSelected = !!currentExpSelected[member];

                            return (
                              <div 
                                key={member} 
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                  isSelected ? 'bg-primary/5 border-primary/40' : 'bg-background border-border/50'
                                }`}
                                onClick={() => handleToggleMember(expense.id, member)}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Checkbox 
                                    id={`${expense.id}-${member}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleToggleMember(expense.id, member)}
                                    className="h-4 w-4"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <Label 
                                      htmlFor={`${expense.id}-${member}`}
                                      className="text-xs font-bold text-secondary truncate cursor-pointer"
                                    >
                                      {member}
                                    </Label>
                                    {isSelected && (
                                       <span className="text-[9px] font-bold text-primary">
                                         ₹{memberAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                       </span>
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
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedCount === requiredCount ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                      {selectedCount === requiredCount ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${selectedCount === requiredCount ? 'text-emerald-600' : 'text-destructive'}`}>
                        {selectedCount} of {requiredCount} Selected
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">Selection must match original shares ({requiredCount}).</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => submitAllocation(expense)}
                    className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6 rounded-xl shadow-lg shadow-primary/20"
                  >
                    Confirm Split
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pendingExpenses.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-secondary/10 px-6">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-secondary font-bold">All clan expenses are fully split.</p>
            <Button variant="link" className="mt-2 text-primary font-bold" onClick={() => router.push("/")}>Return to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
