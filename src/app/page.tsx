
"use client";

import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { MOCK_TRIP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, ArrowRight, User, Users, LogOut, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Expense } from "@/types";

export default function Dashboard() {
  const { user, setUser } = useUser();
  const db = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: expenses = [] } = useCollection<Expense>(expensesQuery);

  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4 max-w-lg">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-4xl mb-6 shadow-2xl shadow-primary/20">
            C
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground font-headline">Welcome to ClanSplit</h1>
          <p className="text-muted-foreground text-lg">Select your role to manage nested group expenses and family shares.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 bg-card/50 overflow-hidden relative"
            onClick={() => setUser("sanjeev")}
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <User className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline">Sanjeev</h2>
                <p className="text-muted-foreground text-sm">Manager: Sanjeev's Family</p>
              </div>
              <Button className="w-full font-bold h-12">Login as Sanjeev</Button>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/10 bg-card/50 overflow-hidden relative"
            onClick={() => setUser("nitin")}
          >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-6 w-6 text-accent" />
            </div>
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-3xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <Users className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline">Nitin</h2>
                <p className="text-muted-foreground text-sm">Manager: Nitin's Clan</p>
              </div>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold h-12">Login as Nitin</Button>
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

  return (
    <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 py-0.5">
              Logged in as {userName}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setUser(null)}
            >
              <LogOut className="h-3 w-3" />
              Switch User
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Clan Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Managing <span className="text-accent font-semibold">{MOCK_TRIP.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Activity Log
          </Button>
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" asChild>
            <Link href="/expenses">
              <Plus className="h-4 w-4" />
              Log Expense
            </Link>
          </Button>
        </div>
      </header>

      <BalanceOverview expenses={expenses} />

      {user === "nitin" && needsAllocation.length > 0 && (
        <section className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-accent/5">
          <div className="flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-xl">
              <Info className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-bold text-accent text-lg">Pending Clan Allocations</p>
              <p className="text-xs text-muted-foreground">You have {needsAllocation.length} expenses to distribute within your core family and cousins.</p>
            </div>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-6" asChild>
            <Link href="/allocate">Allocate Now</Link>
          </Button>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Family Structure</h2>
            <Button variant="link" size="sm" asChild>
              <Link href="/hierarchy" className="gap-1">
                View Hierarchy <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {MOCK_TRIP.nodes.map((node) => (
              <NestNodeCard key={node.id} node={node} />
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-headline">Recent Activity</h2>
          <Card className="border-border/50 bg-card/50 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Live Transaction Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {expense.date}
                      </span>
                      <span className="text-[10px] text-accent">
                        Split with {expense.allocations.length} groups
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-headline">₹{expense.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Paid by {expense.payer_id.split('_')[1]}</p>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No recent activity.</p>
              )}
              <Button variant="outline" className="w-full mt-4 text-xs font-bold py-5" asChild>
                <Link href="/expenses">View All Expenses</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
