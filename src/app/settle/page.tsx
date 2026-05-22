
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, History, TrendingDown, CreditCard, Scale, Users, User, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Expense } from "@/types";
import { useUser } from "@/context/user-context";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SettlementPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: allExpenses = [] } = useCollection<Expense>(expensesQuery);

  // Cross-clan balance logic
  const activeMainExpenses = allExpenses.filter(e => !e.settled);
  let sanjeevOwesNitin = 0;
  let nitinOwesSanjeev = 0;

  activeMainExpenses.forEach(exp => {
    const sanjeevAlloc = exp.allocations.find(a => a.node_id === "node_sanjeev_family")?.amount || 0;
    const nitinAlloc = exp.allocations.find(a => a.node_id === "node_nitin_clan")?.amount || 0;

    if (exp.payer_id === "node_sanjeev_family") {
      nitinOwesSanjeev += nitinAlloc;
    } else if (exp.payer_id === "node_nitin_clan") {
      sanjeevOwesNitin += sanjeevAlloc;
    }
  });

  const netDiff = sanjeevOwesNitin - nitinOwesSanjeev;
  const mainSettlement = netDiff > 0 
    ? { from: "Sanjeev's Family", to: "Nitin's Clan", amount: netDiff }
    : netDiff < 0 
    ? { from: "Nitin's Clan", to: "Sanjeev's Family", amount: Math.abs(netDiff) }
    : null;

  // Internal Nitin Clan balance logic
  const internalBalances: Record<string, number> = {};
  const coreMembers = ["Nitin", "Komal", "Khushi", "Krishna"];
  const individualCousins = ["Sunita", "Parul", "Payal", "Rajul"];

  allExpenses.forEach(exp => {
    const nitinAlloc = exp.allocations.find(a => a.node_id === "node_nitin_clan");
    if (user === "nitin" && nitinAlloc?.internal_allocations?.length) {
      const perMemberShare = nitinAlloc.amount / nitinAlloc.internal_allocations.length;
      const alreadySettledInExp = exp.settled_internal_members || [];

      nitinAlloc.internal_allocations.forEach(member => {
        if (!alreadySettledInExp.includes(member)) {
          if (coreMembers.includes(member)) {
            internalBalances["Nitin Core Family"] = (internalBalances["Nitin Core Family"] || 0) + perMemberShare;
          } else if (individualCousins.includes(member)) {
            internalBalances[member] = (internalBalances[member] || 0) + perMemberShare;
          }
        }
      });
    }
  });

  const handleMainSettlement = async () => {
    if (!db || !mainSettlement) return;
    setLoadingStates(prev => ({ ...prev, main: true }));
    
    try {
      const updates = activeMainExpenses.map(exp => {
        const ref = doc(db, "trips", "trip-2026", "expenses", exp.id);
        return updateDoc(ref, { settled: true });
      });
      await Promise.all(updates);
      toast({ title: "Cross-Clan Settlement Finalized" });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: "trips/trip-2026/expenses",
        operation: 'update',
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, main: false }));
    }
  };

  const handleMemberSettlement = async (key: string) => {
    if (!db) return;
    setLoadingStates(prev => ({ ...prev, [key]: true }));

    const membersToSettle = key === "Nitin Core Family" ? coreMembers : [key];
    
    try {
      // Find expenses where these members owe money
      const relevantExpenses = allExpenses.filter(exp => {
        const nitinAlloc = exp.allocations.find(a => a.node_id === "node_nitin_clan");
        return nitinAlloc?.internal_allocations?.some(m => membersToSettle.includes(m)) &&
               !membersToSettle.every(m => (exp.settled_internal_members || []).includes(m));
      });

      const updates = relevantExpenses.map(exp => {
        const ref = doc(db, "trips", "trip-2026", "expenses", exp.id);
        return updateDoc(ref, { 
          settled_internal_members: arrayUnion(...membersToSettle) 
        });
      });

      await Promise.all(updates);
      toast({ title: `${key} Balance Cleared` });
    } catch (e: any) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: "trips/trip-2026/expenses",
        operation: 'update',
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Settlement Engine</h1>
        <p className="text-muted-foreground">Finalize cross-clan balances and internal family dues</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                </div>
                <CardTitle className="text-lg font-headline">Cross-Clan Settlement</CardTitle>
              </div>
              <CardDescription>Final balance between Sanjeev and Nitin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainSettlement ? (
                <div className="flex items-center justify-between p-6 bg-card border border-border/50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">From</span>
                    <span className="font-semibold text-sm">{mainSettlement.from}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-px w-12 bg-border relative">
                      <ArrowRight className="h-3 w-3 absolute -right-1 -top-1.5 text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold font-headline text-emerald-500 mt-2">₹{mainSettlement.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">To</span>
                    <span className="font-semibold text-sm">{mainSettlement.to}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center space-y-3 bg-card/50 rounded-2xl border border-dashed">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/30" />
                  <p className="text-sm font-medium text-muted-foreground">Cross-clan accounts are fully settled.</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl mt-4"
                onClick={handleMainSettlement}
                disabled={loadingStates.main || !mainSettlement}
              >
                {loadingStates.main ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Finalize Main Settlement
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xl bg-card/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-headline">Lifetime Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Historical Entries</p>
                  <p className="font-bold font-headline text-primary">{allExpenses.length}</p>
               </div>
               <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Total Trip Spend</p>
                  <p className="font-bold font-headline">₹{allExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
               </div>
            </CardContent>
          </Card>
        </div>

        {user === "nitin" && (
          <Card className="border-accent/20 bg-accent/5 shadow-xl h-fit">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg font-headline">Internal Clan Repayments</CardTitle>
              </div>
              <CardDescription>Settle with the 5 clan entities (Core + 4 Cousins)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(internalBalances).length > 0 ? (
                <div className="grid gap-3">
                  {Object.entries(internalBalances).map(([key, amount]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          {key === "Nitin Core Family" ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{key}</span>
                          <span className="text-[10px] text-accent font-bold">Owes ₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground text-[10px] h-8 font-bold"
                        onClick={() => handleMemberSettlement(key)}
                        disabled={loadingStates[key]}
                      >
                        {loadingStates[key] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Settle"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-accent/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground italic">Internal clan accounts are clear.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
