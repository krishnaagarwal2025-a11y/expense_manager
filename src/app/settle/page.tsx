"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, History, TrendingDown } from "lucide-react";

export default function SettlementPage() {
  const calculations = [
    { from: "Sanjeev's Family", to: "Nitin's Clan", amount: 242.20, status: "pending" },
    { from: "Nitin Core", to: "Cousins", amount: 45.00, status: "pending" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-primary">Settlement Engine</h1>
        <p className="text-muted-foreground">Minimal transfer algorithm across nested nodes</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">Optimized Path</CardTitle>
            </div>
            <CardDescription>We've reduced 12 potential transfers down to 2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {calculations.map((calc, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background border rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Transfer From</span>
                  <span className="font-headline font-semibold">{calc.from}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-8 bg-border relative">
                    <ArrowRight className="h-3 w-3 absolute -right-1 -top-1.5 text-muted-foreground" />
                  </div>
                  <span className="text-lg font-bold font-headline text-emerald-500">${calc.amount.toFixed(2)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Pay To</span>
                  <span className="font-headline font-semibold">{calc.to}</span>
                </div>
              </div>
            ))}
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm All Transfers</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Settlement History</CardTitle>
            </div>
            <CardDescription>Completed group repayments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border-b last:border-0 opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Sanjeev → Nitin</p>
                    <p className="text-[10px] text-muted-foreground">Completed Mar 12, 2024</p>
                  </div>
                </div>
                <p className="font-bold">$1,200.00</p>
             </div>
             <div className="flex items-center justify-between p-3 border-b last:border-0 opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Cousins → Nitin Core</p>
                    <p className="text-[10px] text-muted-foreground">Completed Mar 10, 2024</p>
                  </div>
                </div>
                <p className="font-bold">$340.50</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
