
"use client";

import { useState } from "react";
import { MOCK_TRIP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReceiptText, Search, Download, Users, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { Expense } from "@/types";
import { downloadExpensesCSV } from "@/lib/export";
import { useExpenses } from "@/lib/expense-store";

export default function ExpensesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [shares, setShares] = useState<Record<string, number>>({});

  const handleShareChange = (nodeId: string, val: string) => {
    const num = parseInt(val);
    if (num < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Share",
        description: "Shares cannot be negative."
      });
      return;
    }
    setShares(prev => ({ ...prev, [nodeId]: num || 0 }));
  };

  const handleCreateEntry = () => {
    const activeNodes = Object.entries(shares).filter(([_, s]) => s > 0);
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a positive amount for the expense."
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Description",
        description: "Please provide a brief description of the expense."
      });
      return;
    }

    if (activeNodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Allocation Required",
        description: "Please assign at least one share to a group."
      });
      return;
    }

    const totalShares = activeNodes.reduce((sum, [_, s]) => sum + s, 0);
    const expenseId = `exp_${Date.now()}`;

    const newExpense: Expense = {
      id: expenseId,
      trip_id: "trip-2026",
      description,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      allocations: activeNodes.map(([nodeId, s]) => ({
        node_id: nodeId,
        shares: s,
        amount: (numAmount * s) / totalShares
      })),
      payer_id: user === "sanjeev" ? "node_sanjeev_family" : "node_nitin_clan"
    };

    addExpense(newExpense);

    toast({
      title: "Expense Logged",
      description: `Successfully logged "${description}" for ₹${numAmount.toLocaleString()}.`,
    });
    
    setAmount("");
    setDescription("");
    setShares({});
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);

    toast({
      title: "Expense Deleted",
      description: "The transaction has been removed from the ledger.",
    });
  };

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
    <div className="space-y-5 animate-in fade-in duration-500 pb-4 md:space-y-6 md:pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center md:gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Expense Logs</h1>
          <p className="text-muted-foreground text-sm">Historical ledger of all trip transactions</p>
        </div>
        <Button variant="outline" size="sm" className="h-10 w-full gap-2 rounded-lg border-primary/20 hover:bg-primary/5 sm:w-auto" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-lg border-primary/20 bg-white shadow-lg md:rounded-xl">
            <CardHeader className="p-4 pb-3 md:p-6 md:pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                <PlusCircle className="h-5 w-5 text-primary" />
                Log New Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
                <Input 
                  placeholder="e.g. Dinner at the Grand Hotel" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 rounded-lg border-border/50 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-lg border-border/50 bg-background pl-7"
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Split Allocation
                </Label>
                <div className="space-y-2 rounded-lg border border-secondary/10 bg-secondary/5 p-3">
                  {MOCK_TRIP.nodes.map(n => (
                    <div key={n.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold truncate text-secondary">{n.display_name}</span>
                      <Input 
                        type="number" 
                        placeholder="0"
                        className="h-10 w-24 rounded-lg border-border/30 bg-white text-right text-sm"
                        value={shares[n.id] || ""}
                        onChange={(e) => handleShareChange(n.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="mt-2 h-12 w-full rounded-lg bg-primary text-base font-bold shadow-lg shadow-primary/10 hover:bg-primary/90" onClick={handleCreateEntry}>
                Create Entry
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-white p-2 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search expenses..." 
              className="border-0 bg-transparent focus-visible:ring-0 text-sm h-10"
            />
          </div>

          <div className="grid gap-3 md:hidden">
            {expenses.map((expense) => (
              <article key={expense.id} className="mobile-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-bold text-secondary">{expense.description}</p>
                    <p className="text-[11px] font-medium text-muted-foreground">{expense.date} · By {expense.payer_id.split('_')[1].toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-lg font-bold text-primary">₹{expense.amount.toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto mt-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteExpense(expense.id)}
                      aria-label={`Delete ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {expense.allocations.map(a => (
                    <Badge key={a.node_id} variant="secondary" className="h-6 rounded-md bg-primary/5 px-2 text-[10px] font-bold text-primary">
                      {a.node_id.split('_')[1].toUpperCase()} · ₹{a.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
            {expenses.length === 0 && (
              <div className="mobile-surface py-16 text-center text-sm font-medium text-muted-foreground">
                No transactions recorded yet.
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border/50 bg-white shadow-xl md:block md:rounded-xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/5">
                  <TableRow>
                    <TableHead className="font-bold text-secondary text-xs uppercase tracking-wider">Description</TableHead>
                    <TableHead className="font-bold text-secondary text-xs uppercase tracking-wider hidden sm:table-cell">Split</TableHead>
                    <TableHead className="font-bold text-secondary text-xs uppercase tracking-wider">Payer</TableHead>
                    <TableHead className="text-right font-bold text-secondary text-xs uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-primary/5 transition-colors border-b border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg hidden xs:block">
                            <ReceiptText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-secondary leading-tight">{expense.description}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{expense.date}</span>
                            {/* Inline split for mobile */}
                            <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                              {expense.allocations.map(a => (
                                <Badge key={a.node_id} variant="outline" className="text-[8px] h-3 px-1 border-primary/20 text-primary">
                                  {a.node_id.split('_')[1].toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                          {expense.allocations.map(a => (
                            <div key={a.node_id} className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[9px] h-4 font-bold bg-primary/5 text-primary border-primary/10">
                                {a.node_id.split('_')[1].toUpperCase()}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-bold">
                                ₹{a.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-secondary">
                        {expense.payer_id.split('_')[1].toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right font-bold font-headline text-primary text-base">
                        ₹{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {expenses.length === 0 && (
              <div className="text-center py-20 text-muted-foreground font-medium">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
