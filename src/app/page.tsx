
"use client";
import { Badge } from "@/components/ui/badge"
import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { MOCK_TRIP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, ArrowRight, LogOut, Info, History } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { downloadExpensesCSV } from "@/lib/export";
import { useExpenses } from "@/lib/expense-store";

export default function Dashboard() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const { expenses } = useExpenses();

  if (!user) {
    return (
      <div className="flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center space-y-7 animate-in fade-in duration-500 md:min-h-[80vh] md:space-y-12">
        <div className="text-center space-y-3 max-w-lg">
          <img src="/logo.png" alt="Muneem Sahab" className="mx-auto mb-5 h-20 w-20 rounded-2xl object-cover shadow-2xl shadow-secondary/20 md:mb-8 md:h-24 md:w-24 md:rounded-3xl" />
          <h1 className="font-headline text-4xl font-bold tracking-tight text-secondary md:text-5xl">Muneem Sahab</h1>
          <p className="px-4 text-sm leading-6 text-muted-foreground md:text-lg">Manage religious trip expenses with your family and cousins with complete transparency.</p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 px-1 md:grid-cols-2 md:gap-8 md:px-4">
          <Card 
            className="group relative cursor-pointer overflow-hidden rounded-lg border-transparent bg-white shadow-md transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 md:rounded-xl"
            onClick={() => setUser("sanjeev")}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="flex items-center gap-4 p-4 md:flex-col md:p-12 md:space-y-6">
              <img src="/sanjeev.png" alt="Sanjeev" className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/10 object-cover shadow-sm transition-all duration-300 group-hover:border-primary/40 md:h-24 md:w-24" />
              <div className="min-w-0 flex-1 text-left md:text-center">
                <h2 className="font-headline text-xl font-bold text-secondary md:text-2xl">Sanjeev</h2>
                <p className="text-muted-foreground text-sm font-medium">Sanjeev's Family</p>
              </div>
              <Button className="hidden h-12 w-full rounded-lg bg-primary font-bold text-white hover:bg-primary/90 md:inline-flex">Continue as Sanjeev</Button>
              <ArrowRight className="h-5 w-5 text-primary md:hidden" />
            </CardContent>
          </Card>

          <Card 
            className="group relative cursor-pointer overflow-hidden rounded-lg border-transparent bg-white shadow-md transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 md:rounded-xl"
            onClick={() => setUser("nitin")}
          >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="flex items-center gap-4 p-4 md:flex-col md:p-12 md:space-y-6">
              <img src="/nitin.png" alt="Nitin" className="h-16 w-16 shrink-0 rounded-full border-2 border-primary/10 object-cover shadow-sm transition-all duration-300 group-hover:border-primary/40 md:h-24 md:w-24" />
              <div className="min-w-0 flex-1 text-left md:text-center">
                <h2 className="font-headline text-xl font-bold text-secondary md:text-2xl">Nitin</h2>
                <p className="text-muted-foreground text-sm font-medium">Nitin's Clan</p>
              </div>
              <Button variant="outline" className="hidden h-12 w-full rounded-lg border-primary font-bold text-primary hover:bg-primary hover:text-white md:inline-flex">Continue as Nitin</Button>
              <ArrowRight className="h-5 w-5 text-primary md:hidden" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userName = user === "sanjeev" ? "Sanjeev" : "Nitin";
  const ownClanId = user === "sanjeev" ? "node_sanjeev_family" : "node_nitin_clan";

  const needsAllocation = expenses.filter(exp => 
    exp.allocations.some(a => a.node_id === ownClanId && (!a.internal_allocations || a.internal_allocations.length === 0)) && 
    user === "nitin"
  );

  const handleExport = () => {
    if (expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There are no expenses recorded to export.",
      });
      return;
    }
    
    downloadExpensesCSV(expenses);
    toast({
      title: "Export Success",
      description: "Your trip expense CSV file has been downloaded.",
    });
  };

  return (
    <div className="space-y-5 pb-4 animate-in slide-in-from-bottom-2 duration-500 md:space-y-8 md:pb-12">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between md:pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {userName}'s Dashboard
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-destructive font-bold uppercase tracking-widest"
              onClick={() => setUser(null)}
            >
              <LogOut className="h-3 w-3" />
              Switch Profile
            </Button>
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-secondary md:text-4xl">Financial Overview</h1>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground md:text-base">
            Family Trip: <span className="text-primary font-bold">{MOCK_TRIP.name}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-11 gap-2 rounded-lg border-secondary/20 text-sm font-bold text-secondary hover:bg-secondary/5 md:rounded-xl"
            onClick={handleExport}
          >
            <Download className="h-5 w-5" />
            Export CSV
          </Button>
          <Button size="lg" className="h-11 gap-2 rounded-lg bg-primary text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 md:rounded-xl" asChild>
            <Link href="/expenses">
              <Plus className="h-5 w-5" />
              Record
            </Link>
          </Button>
        </div>
      </header>

      <BalanceOverview expenses={expenses} />

      {user === "nitin" && needsAllocation.length > 0 && (
        <section className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-lg shadow-primary/5 md:flex-row md:items-center md:justify-between md:rounded-2xl md:p-6">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="rounded-lg bg-primary/20 p-3 md:rounded-2xl md:p-4">
              <Info className="h-6 w-6 text-primary md:h-8 md:w-8" />
            </div>
            <div>
              <p className="text-base font-bold text-secondary md:text-xl">Pending Internal Allocations</p>
              <p className="text-sm text-muted-foreground font-medium">You have {needsAllocation.length} expenses waiting to be distributed within your clan members.</p>
            </div>
          </div>
          <Button size="lg" className="w-full rounded-lg bg-primary px-8 font-bold text-white hover:bg-primary/90 md:w-auto md:rounded-xl" asChild>
            <Link href="/allocate">Start Allocation</Link>
          </Button>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-10">
        <section className="space-y-4 lg:col-span-3 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-secondary md:text-2xl">Family Hierarchy</h2>
          </div>
          <div className="space-y-4">
            {MOCK_TRIP.nodes.map((node) => (
              <NestNodeCard key={node.id} node={node} />
            ))}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2 md:space-y-6">
          <h2 className="font-headline text-xl font-bold text-secondary md:text-2xl">Recent Charges</h2>
          <Card className="overflow-hidden rounded-lg border-none bg-white shadow-xl md:rounded-3xl">
            <CardHeader className="border-b border-secondary/10 bg-secondary/5 p-4 md:p-6 md:pb-6">
              <CardTitle className="text-sm font-bold flex items-center gap-3 text-secondary uppercase tracking-widest">
                <History className="h-5 w-5 text-primary" />
                Live Transaction Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:space-y-6 md:p-6">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-start justify-between border-b border-secondary/5 pb-6 last:border-0 last:pb-0">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-secondary">{expense.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary/10 px-2 py-0.5 rounded-full font-bold text-secondary/70">
                        {expense.date}
                      </span>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                        {expense.allocations.length} Group Split
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-headline text-secondary">₹{expense.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">By {expense.payer_id.split('_')[1]}</p>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 font-medium">No transactions recorded yet.</p>
              )}
              <Button variant="ghost" className="w-full mt-4 text-primary font-bold py-6 hover:bg-primary/5 rounded-xl text-sm" asChild>
                <Link href="/expenses">View Full Ledger</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
