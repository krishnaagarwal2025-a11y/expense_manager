
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, History, TrendingDown, CreditCard, Scale, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Expense } from "@/types";
import { useUser } from "@/context/user-context";
import { Badge } from "@/components/ui/badge";

export default function SettlementPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: expenses = [] } = useCollection<Expense>(expensesQuery);

  // Calculate Net Balances between top-level nodes: Sanjeev's Family vs Nitin's Clan
  let sanjeevOwesNitin = 0;
  let nitinOwesSanjeev = 0;

  // For Nitin's internal view: How much each individual owes Nitin
  const internalBalances: Record<string, number> = {};

  expenses.forEach(exp => {
    const sanjeevAlloc = exp.allocations.find(a => a.node_id === "node_sanjeev_family")?.amount || 0;
    const nitinAlloc = exp.allocations.find(a => a.node_id === "node_nitin_clan");
    const nitinAllocAmount = nitinAlloc?.amount || 0;

    // Cross-Clan logic
    if (exp.payer_id === "node_sanjeev_family") {
      nitinOwesSanjeev += nitinAllocAmount;
    } else if (exp.payer_id === "node_nitin_clan") {
      sanjeevOwesNitin += sanjeevAlloc;
    }

    // Internal Clan logic for Nitin
    if (user === "nitin" && nitinAlloc && nitinAlloc.internal_allocations && nitinAlloc.internal_allocations.length > 0) {
      const perMemberShare = nitinAllocAmount / nitinAlloc.internal_allocations.length;
      nitinAlloc.internal_allocations.forEach(member => {
        internalBalances[member] = (internalBalances[member] || 0) + perMemberShare;
      });
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
      title: "Settlement Recorded",
      description: "Balance transfer confirmed. The ledger has been updated for this cycle.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Settlement Engine</h1>
        <p className="text-muted-foreground">Dynamic balancing based on your family's real-time expenses</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                </div>
                <CardTitle className="text-lg font-headline">Main Settlement</CardTitle>
              </div>
              <CardDescription>Cross-clan liability path</CardDescription>
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
                  <p className="text-sm font-medium text-muted-foreground">No cross-clan transfers needed.</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl mt-4"
                onClick={handleConfirmAll}
                disabled={!settlementPath && Object.keys(internalBalances).length === 0}
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
                <CardTitle className="text-lg font-headline">Liability Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Sanjeev's Family Total Paid</p>
                  </div>
                  <p className="font-bold font-headline text-primary">₹{expenses.filter(e => e.payer_id === "node_sanjeev_family").reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
               </div>
               <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Nitin's Clan Total Paid</p>
                  </div>
                  <p className="font-bold font-headline text-accent">₹{expenses.filter(e => e.payer_id === "node_nitin_clan").reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
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
                <CardTitle className="text-lg font-headline">Internal Clan Balances</CardTitle>
              </div>
              <CardDescription>What your cousins and family members owe you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(internalBalances).length > 0 ? (
                <div className="grid gap-2">
                  {Object.entries(internalBalances).map(([member, amount]) => (
                    <div key={member} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{member}</span>
                      </div>
                      <Badge variant="outline" className="font-bold text-accent border-accent/30 bg-accent/5">
                        ₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-border/50 flex justify-between items-center px-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Total Internal Receivable</span>
                    <span className="text-lg font-bold font-headline text-accent">
                      ₹{Object.values(internalBalances).reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground italic">No internal allocations made yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
