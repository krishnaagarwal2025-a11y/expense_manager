
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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Expense } from "@/types";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { downloadExpensesCSV } from "@/lib/export";

export default function ExpensesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [shares, setShares] = useState<Record<string, number>>({});

  const expensesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "trips", "trip-2026", "expenses");
  }, [db]);

  const { data: expenses = [] } = useCollection<Expense>(expensesQuery);

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
    if (!db) return;
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
    const expenseRef = doc(db, "trips", "trip-2026", "expenses", expenseId);

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

    setDoc(expenseRef, newExpense)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: expenseRef.path,
          operation: 'create',
          requestResourceData: newExpense,
        }));
      });

    toast({
      title: "Expense Logged",
      description: `Successfully logged "${description}" for ₹${numAmount.toLocaleString()}.`,
    });
    
    setAmount("");
    setDescription("");
    setShares({});
  };

  const handleDeleteExpense = (id: string) => {
    if (!db) return;
    const expenseRef = doc(db, "trips", "trip-2026", "expenses", id);
    deleteDoc(expenseRef)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: expenseRef.path,
          operation: 'delete',
        }));
      });

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Expense Logs</h1>
          <p className="text-muted-foreground text-sm">Historical ledger of all trip transactions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 w-full sm:w-auto" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                <PlusCircle className="h-5 w-5 text-primary" />
                Log New Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
                <Input 
                  placeholder="e.g. Dinner at the Grand Hotel" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border-border/50 h-11" 
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
                    className="bg-background border-border/50 pl-7 h-11" 
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Split Allocation
                </Label>
                <div className="space-y-2 bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                  {MOCK_TRIP.nodes.map(n => (
                    <div key={n.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold truncate text-secondary">{n.display_name}</span>
                      <Input 
                        type="number" 
                        placeholder="0"
                        className="w-20 h-9 text-right text-xs bg-white border-border/30"
                        value={shares[n.id] || ""}
                        onChange={(e) => handleShareChange(n.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-2 font-bold py-6 text-base bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/10" onClick={handleCreateEntry}>
                Create Entry
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 p-2 bg-white border border-border/50 rounded-xl shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search expenses..." 
              className="border-0 bg-transparent focus-visible:ring-0 text-sm h-10"
            />
          </div>

          <div className="rounded-xl border border-border/50 overflow-hidden shadow-xl bg-white">
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
