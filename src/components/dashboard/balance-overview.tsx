"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Expense } from "@/types";
import { useUser } from "@/context/user-context";

interface BalanceOverviewProps {
  expenses: Expense[];
}

export function BalanceOverview({ expenses }: BalanceOverviewProps) {
  const { user } = useUser();
  const ownClanId = user === "sanjeev" ? "node_sanjeev_family" : "node_nitin_clan";

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  let owedToYou = 0;
  let youOwe = 0;

  expenses.filter(exp => !exp.settled).forEach(exp => {
    const userAllocation = exp.allocations.find(a => a.node_id === ownClanId)?.amount || 0;
    if (exp.payer_id === ownClanId) {
      owedToYou += exp.amount - userAllocation;
    } else {
      youOwe += userAllocation;
    }
  });

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <BalanceCard
        label="Spent"
        value={totalSpent}
        detail="Trip historical total"
        icon={<Wallet className="h-4 w-4 text-primary" />}
        valueClassName="text-secondary"
        className="border-primary/20 bg-primary/5"
      />
      <BalanceCard
        label="To You"
        value={owedToYou}
        detail="Outstanding from others"
        icon={<ArrowDownLeft className="h-4 w-4 text-emerald-600" />}
        valueClassName="text-emerald-600"
        className="border-emerald-500/20 bg-emerald-50/50"
      />
      <BalanceCard
        label="You Owe"
        value={youOwe}
        detail="Outstanding to others"
        icon={<ArrowUpRight className="h-4 w-4 text-destructive" />}
        valueClassName="text-destructive"
        className="border-destructive/20 bg-destructive/5"
      />
    </div>
  );
}

function BalanceCard({
  label,
  value,
  detail,
  icon,
  className,
  valueClassName,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  className: string;
  valueClassName: string;
}) {
  return (
    <Card className={`rounded-lg shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 sm:p-6 sm:pb-2">
        <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground sm:text-sm sm:tracking-wider">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-3 pt-1 sm:p-6 sm:pt-0">
        <div className={`font-headline text-lg font-bold sm:text-2xl ${valueClassName}`}>
          ₹{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <p className="mt-1 hidden text-[10px] font-medium text-muted-foreground sm:block">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}
