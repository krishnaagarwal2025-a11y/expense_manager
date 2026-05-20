"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, History, TrendingDown, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettlementPage() {
  const { toast } = useToast();
  
  const calculations = [
    { from: "Sanjeev's Family", to: "Nitin's Clan", amount: 24220, status: "pending" },
    { from: "Nitin Core", to: "Cousins", amount: 4500, status: "pending" },
  ];

  const handleConfirmAll = () => {
    toast({
      title: "Settlement Initiated",
      description: "Marking all pending transfers as complete across all clans.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-primary font-headline">Settlement Engine</h1>
        <p className="text-muted-foreground">Minimal transfer algorithm across nested nodes</p>
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
            <CardDescription>We've reduced 12 potential transfers down to 2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {calculations.map((calc, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-card border border-border/50 rounded-2xl shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">From</span>
                  <span className="font-headline font-semibold text-sm">{calc.from}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-10 bg-border relative">
                    <ArrowRight className="h-3 w-3 absolute -right-1 -top-1.5 text-muted-foreground" />
                  </div>
                  <span className="text-xl font-bold font-headline text-emerald-500 mt-2">₹{calc.amount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">To</span>
                  <span className="font-headline font-semibold text-sm">{calc.to}</span>
                </div>
              </div>
            ))}
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl mt-4"
              onClick={handleConfirmAll}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Confirm All Transfers
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-headline">Settlement History</CardTitle>
            </div>
            <CardDescription>Completed group repayments for this trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Sanjeev → Nitin</p>
                    <p className="text-[10px] text-muted-foreground">Completed Mar 12, 2024</p>
                  </div>
                </div>
                <p className="font-bold font-headline">₹1,20,000</p>
             </div>
             <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Cousins → Nitin Core</p>
                    <p className="text-[10px] text-muted-foreground">Completed Mar 10, 2024</p>
                  </div>
                </div>
                <p className="font-bold font-headline">₹34,050</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
