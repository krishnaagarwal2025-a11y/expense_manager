
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, History, TrendingDown, CreditCard, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Expense } from "@/types";

export default function SettlementPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: expenses = [] } = useCollection<Expense>(expensesQuery);

  // Calculate Net Balances between top-level nodes: Sanjeev's Family vs Nitin's Clan
  // node_sanjeev_family, node_nitin_clan
  
  let sanjeevOwesNitin = 0;
  let nitinOwesSanjeev = 0;

  expenses.forEach(exp => {
    const sanjeevAlloc = exp.allocations.find(a => a.node_id === "node_sanjeev_family")?.amount || 0;
    const nitinAlloc = exp.allocations.find(a => a.node_id === "node_nitin_clan")?.amount || 0;

    if (exp.payer_id === "node_sanjeev_family") {
      // Sanjeev paid, Nitin owes his share
      nitinOwesSanjeev += nitinAlloc;
    } else if (exp.payer_id === "node_nitin_clan") {
      // Nitin paid, Sanjeev owes his share
      sanjeevOwesNitin += sanjeevAlloc;
    }
  });

  const netDiff = sanjeevOwesNitin - nitinOwesSanjeev;
  const settlementPath = netDiff > 0 
    ? { from: "Sanjeev's Family", to: "Nitin's Clan", amount: netDiff }
    : netDiff < 0 
    ? { from: "Nitin's Clan", to: "Sanjeev's Family", amount: Math.abs(netDiff) }
    : null;

  const handleConfirmAll = () => {
    toast({
      title: "Settlement Initiated",
      description: "Marking all pending transfers as complete across all clans.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Settlement Engine</h1>
        <p className="text-muted-foreground">Minimal transfer algorithm based on real-time ledger</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-emerald-500" />
              </div>
              <CardTitle className="text-lg font-headline">Optimized Path</CardTitle>
            </div>
            <CardDescription>Calculated from {expenses.length} ledger entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settlementPath ? (
              <div className="flex items-center justify-between p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">From</span>
                  <span className="font-headline font-semibold text-sm">{settlementPath.from}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-12 bg-border relative">
                    <ArrowRight className="h-3 w-3 absolute -right-1 -top-1.5 text-muted-foreground" />
                  </div>
                  <span className="text-2xl font-bold font-headline text-emerald-500 mt-2">₹{settlementPath.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">To</span>
                  <span className="font-headline font-semibold text-sm">{settlementPath.to}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-card border border-border/50 rounded-2xl">
                <Scale className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Everything is balanced!</p>
                <p className="text-[10px] text-muted-foreground">No cross-clan transfers required.</p>
              </div>
            )}
            
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl mt-4"
              onClick={handleConfirmAll}
              disabled={!settlementPath}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Confirm Settlement
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-headline">Summary Logs</CardTitle>
            </div>
            <CardDescription>Breakdown of group liabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Sanjeev's Contributions</p>
                  <p className="text-sm font-semibold">Total paid by Sanjeev's Family</p>
                </div>
                <p className="font-bold font-headline text-primary">₹{expenses.filter(e => e.payer_id === "node_sanjeev_family").reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
             </div>
             <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Nitin's Contributions</p>
                  <p className="text-sm font-semibold">Total paid by Nitin's Clan</p>
                </div>
                <p className="font-bold font-headline text-accent">₹{expenses.filter(e => e.payer_id === "node_nitin_clan").reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
             </div>
             
             <div className="pt-6">
               <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20 border border-border/50 opacity-60">
                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-medium">Automatic balancing algorithm active</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
