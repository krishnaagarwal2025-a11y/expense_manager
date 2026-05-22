
"use client";
import { Badge } from "@/components/ui/badge"
import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { MOCK_TRIP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, ArrowRight, User, Users, LogOut, Info, History } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Expense } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { downloadExpensesCSV } from "@/lib/export";

export default function Dashboard() {
  const { user, setUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: expenses = [] } = useCollection<Expense>(expensesQuery);

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4 max-w-lg">
          <div className="mx-auto h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center text-white font-bold text-5xl mb-8 shadow-2xl shadow-secondary/20">
            C
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-secondary font-headline">ClanSplit</h1>
          <p className="text-muted-foreground text-lg px-6">Manage religious trip expenses with your family and cousins with complete transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
          <Card 
            className="group cursor-pointer border-transparent hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 bg-white overflow-hidden relative shadow-md"
            onClick={() => setUser("sanjeev")}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <User className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline text-secondary">Sanjeev</h2>
                <p className="text-muted-foreground text-sm font-medium">Sanjeev's Family</p>
              </div>
              <Button className="w-full font-bold h-12 rounded-xl bg-primary text-white hover:bg-primary/90">Continue as Sanjeev</Button>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-transparent hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 bg-white overflow-hidden relative shadow-md"
            onClick={() => setUser("nitin")}
          >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline text-secondary">Nitin</h2>
                <p className="text-muted-foreground text-sm font-medium">Nitin's Clan</p>
              </div>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white font-bold h-12 rounded-xl">Continue as Nitin</Button>
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
    <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
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
          <h1 className="text-4xl font-bold tracking-tight text-secondary font-headline">Financial Overview</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 font-medium">
            Family Trip: <span className="text-primary font-bold">{MOCK_TRIP.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2 border-secondary/20 text-secondary hover:bg-secondary/5 font-bold rounded-xl"
            onClick={handleExport}
          >
            <Download className="h-5 w-5" />
            Export CSV
          </Button>
          <Button size="lg" className="gap-2 bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 font-bold rounded-xl" asChild>
            <Link href="/expenses">
              <Plus className="h-5 w-5" />
              Record Expense
            </Link>
          </Button>
        </div>
      </header>

      <BalanceOverview expenses={expenses} />

      {user === "nitin" && needsAllocation.length > 0 && (
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-primary/5">
          <div className="flex items-center gap-5">
            <div className="bg-primary/20 p-4 rounded-2xl">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-bold text-secondary text-xl">Pending Internal Allocations</p>
              <p className="text-sm text-muted-foreground font-medium">You have {needsAllocation.length} expenses waiting to be distributed within your clan members.</p>
            </div>
          </div>
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold px-8 rounded-xl" asChild>
            <Link href="/allocate">Start Allocation</Link>
          </Button>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline text-secondary">Family Hierarchy</h2>
          </div>
          <div className="space-y-4">
            {MOCK_TRIP.nodes.map((node) => (
              <NestNodeCard key={node.id} node={node} />
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-headline text-secondary">Recent Charges</h2>
          <Card className="border-none bg-white shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-secondary/5 pb-6 border-b border-secondary/10">
              <CardTitle className="text-sm font-bold flex items-center gap-3 text-secondary uppercase tracking-widest">
                <History className="h-5 w-5 text-primary" />
                Live Transaction Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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
