
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

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Basic calculation for "Owed to You" vs "You Owe"
  // If user paid, others owe them. If others paid, user owes.
  let owedToYou = 0;
  let youOwe = 0;

  expenses.forEach(exp => {
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">₹{totalSpent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {expenses.length} logged expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-emerald-500">₹{owedToYou.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From other family branches
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">You Owe</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-destructive">₹{youOwe.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            To other family branches
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
