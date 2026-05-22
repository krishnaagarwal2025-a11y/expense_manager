"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { Expense } from "@/types";
import { useUser } from "@/context/user-context";

interface BalanceOverviewProps {
  expenses: Expense[];
}

export function BalanceOverview({ expenses }: BalanceOverviewProps) {
  const { user } = useUser();
  const ownClanId = user === "sanjeev" ? "node_sanjeev_family" : "node_nitin_clan";

  // Total spent includes everything (historical + active)
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Balances only include unsettled expenses
  let owedToYou = 0;
  let youOwe = 0;

  expenses.filter(exp => !exp.settled).forEach(exp => {
    const userAllocation = exp.allocations.find(a => a.node_id === ownClanId)?.amount || 0;
    if (exp.payer_id === ownClanId) {
      // User paid, others owe their shares
      owedToYou += (exp.amount - userAllocation);
    } else {
      // Others paid, user owes their share
      youOwe += userAllocation;
    }
  });

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lifetime Spent</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-secondary">₹{totalSpent.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Trip historical total
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/20 bg-emerald-50/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Owed</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-emerald-600">₹{owedToYou.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Outstanding from others
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active You Owe</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-destructive">₹{youOwe.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Outstanding to others
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
