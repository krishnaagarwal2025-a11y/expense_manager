"use client";

import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { MOCK_TRIP, MOCK_EXPENSES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
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
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Log Expense
          </Button>
        </div>
      </header>

      <BalanceOverview />

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
                        Split with {expense.allocated_to.length} nodes
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-headline">${expense.amount.toFixed(2)}</p>
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
