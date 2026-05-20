"use client";

import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { MOCK_TRIP, MOCK_EXPENSES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, ArrowRight, User, Users, LogOut, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";

export default function Dashboard() {
  const { user, setUser, userId } = useUser();

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">Who is logging in?</h1>
          <p className="text-muted-foreground text-lg">Select your profile to manage your group's shares and expenses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 bg-card/50"
            onClick={() => setUser("sanjeev")}
          >
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <User className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline">Sanjeev</h2>
                <p className="text-muted-foreground text-sm">Manager: Sanjeev's Family</p>
              </div>
              <Button className="w-full font-semibold">Login as Sanjeev</Button>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/10 bg-card/50"
            onClick={() => setUser("nitin")}
          >
            <CardContent className="flex flex-col items-center p-12 space-y-6">
              <div className="h-24 w-24 rounded-3xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <Users className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-headline">Nitin</h2>
                <p className="text-muted-foreground text-sm">Manager: Nitin's Clan</p>
              </div>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold">Login as Nitin</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userName = user === "sanjeev" ? "Sanjeev" : "Nitin";
  const ownClanId = user === "sanjeev" ? "node_sanjeev_family" : "node_nitin_clan";

  // Filter expenses where this user's clan is involved and needs further sub-allocation
  const needsAllocation = MOCK_EXPENSES.filter(exp => 
    exp.allocations.some(a => a.node_id === ownClanId) && 
    user === "nitin" // Nitin has sub-nodes to allocate to
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Clan Dashboard</h1>
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

      <BalanceOverview />

      {user === "nitin" && needsAllocation.length > 0 && (
        <section className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Info className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-bold text-accent">Pending Clan Allocations</p>
              <p className="text-xs text-muted-foreground">You have {needsAllocation.length} expenses to distribute within your core family and cousins.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
            Allocate Now
          </Button>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Family Tree</h2>
            <Button variant="link" size="sm" asChild>
              <Link href="/hierarchy" className="gap-1">
                Edit Structure <ArrowRight className="h-3 w-3" />
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
          <h2 className="text-xl font-bold font-headline">Recent Allocation</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Live Log</CardTitle>
              <CardDescription>Real-time expense stream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_EXPENSES.map((expense) => (
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
              <Button variant="outline" className="w-full mt-4 text-xs font-semibold" asChild>
                <Link href="/expenses">View All Expenses</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
