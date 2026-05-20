import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

export function BalanceOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">₹4,28,550</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across 24 logged expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-emerald-500">₹84,220</div>
          <p className="text-xs text-muted-foreground mt-1">
            From Sanjeev's Family
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">You Owe</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-destructive">₹12,000</div>
          <p className="text-xs text-muted-foreground mt-1">
            To Nitin Core Family
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
