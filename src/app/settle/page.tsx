"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, History, TrendingDown, CreditCard, Users, User, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useState } from "react";
import { useExpenses } from "@/lib/expense-store";

export default function SettlementPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { expenses: allExpenses, updateExpenses } = useExpenses();

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
    if (!mainSettlement) return;
    setLoadingStates(prev => ({ ...prev, main: true }));
    
    try {
      const activeExpenseIds = new Set(activeMainExpenses.map((expense) => expense.id));
      updateExpenses((current) =>
        current.map((expense) =>
          activeExpenseIds.has(expense.id) ? { ...expense, settled: true } : expense
        )
      );
      toast({ title: "Cross-Clan Settlement Finalized" });
    } finally {
      setLoadingStates(prev => ({ ...prev, main: false }));
    }
  };

  const handleMemberSettlement = async (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));

    const membersToSettle = key === "Nitin Core Family" ? coreMembers : [key];
    
    try {
      updateExpenses((current) =>
        current.map((expense) => {
          const nitinAlloc = expense.allocations.find(a => a.node_id === "node_nitin_clan");
          const shouldSettle = nitinAlloc?.internal_allocations?.some(m => membersToSettle.includes(m)) &&
            !membersToSettle.every(m => (expense.settled_internal_members || []).includes(m));

          if (!shouldSettle) return expense;

          return {
            ...expense,
            settled_internal_members: Array.from(new Set([
              ...(expense.settled_internal_members || []),
              ...membersToSettle,
            ])),
          };
        })
      );
      toast({ title: `${key} Balance Cleared` });
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-4 md:space-y-6 md:pb-20">
      <header>
        <h1 className="font-headline text-3xl font-bold text-primary">Settlements</h1>
        <p className="text-muted-foreground text-sm">Finalize balances and clear family dues</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-5 md:space-y-6">
          <Card className="rounded-lg border-emerald-500/20 bg-emerald-50/50 shadow-lg md:rounded-2xl">
            <CardHeader className="p-4 pb-3 md:p-6 md:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-headline text-secondary">Main Settlement</CardTitle>
              </div>
              <CardDescription className="text-xs font-medium">Final balance between Saffron and Navy clans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-5 sm:px-6 md:pb-6">
              {mainSettlement ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-4 shadow-sm sm:p-6 md:rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">From</span>
                    <span className="font-bold text-xs sm:text-sm text-secondary truncate max-w-[80px] sm:max-w-none">{mainSettlement.from}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-px w-10 sm:w-16 bg-emerald-200 relative">
                      <ArrowRight className="h-3 w-3 absolute -right-1 -top-1.5 text-emerald-400" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold font-headline text-emerald-600 mt-2">₹{mainSettlement.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">To</span>
                    <span className="font-bold text-xs sm:text-sm text-secondary truncate max-w-[80px] sm:max-w-none">{mainSettlement.to}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 bg-white/50 rounded-2xl border border-dashed border-emerald-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
                  <p className="text-xs font-bold uppercase text-emerald-600/60">Cross-clan accounts clear</p>
                </div>
              )}
              
              <Button 
                className="mt-2 h-12 w-full rounded-lg bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 md:rounded-xl"
                onClick={handleMainSettlement}
                disabled={loadingStates.main || !mainSettlement}
              >
                {loadingStates.main ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Finalize Settlement
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-primary/10 bg-white shadow-lg md:rounded-2xl">
            <CardHeader className="p-4 pb-3 md:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-headline text-secondary">Trip Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
               <div className="flex items-center justify-between p-3 border-b border-border/30 last:border-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Historical Entries</p>
                  <p className="font-bold font-headline text-secondary">{allExpenses.length}</p>
               </div>
               <div className="flex items-center justify-between p-3 border-b border-border/30 last:border-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Spend</p>
                  <p className="font-bold font-headline text-primary">₹{allExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
               </div>
            </CardContent>
          </Card>
        </div>

        {user === "nitin" && (
          <Card className="h-fit overflow-hidden rounded-lg border-primary/10 bg-white shadow-xl md:rounded-2xl">
            <CardHeader className="border-b border-secondary/10 bg-secondary/5 p-4 md:p-6 md:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-headline text-secondary">Clan Repayments</CardTitle>
              </div>
              <CardDescription className="text-xs font-medium">Settle core family and individual cousins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
              {Object.keys(internalBalances).length > 0 ? (
                <div className="grid gap-3">
                  {Object.entries(internalBalances).map(([key, amount]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3 shadow-sm transition-all hover:border-primary/30 sm:p-4 md:rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                          {key === "Nitin Core Family" ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs sm:text-sm font-bold text-secondary truncate">{key}</span>
                          <span className="text-[10px] sm:text-xs text-primary font-bold">Owes ₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2 h-9 rounded-lg border-primary/30 px-4 text-[10px] font-bold text-primary hover:bg-primary hover:text-white"
                        onClick={() => handleMemberSettlement(key)}
                        disabled={loadingStates[key]}
                      >
                        {loadingStates[key] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Settle"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 py-16 text-center md:rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-primary/30 mx-auto mb-3" />
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Internal accounts clear</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
