"use client";

import { useState } from "react";
import { MOCK_EXPENSES, MOCK_TRIP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReceiptText, Search, Download, Users, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";

export default function ExpensesPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [shares, setShares] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleShareChange = (nodeId: string, val: string) => {
    setShares(prev => ({ ...prev, [nodeId]: parseInt(val) || 0 }));
  };

  const handleCreateEntry = () => {
    const activeNodes = Object.entries(shares).filter(([_, s]) => s > 0);
    
    if (!amount || !description || activeNodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a description, amount, and at least one share allocation."
      });
      return;
    }

    toast({
      title: "Expense Logged",
      description: `Successfully logged "${description}" for ₹${parseFloat(amount).toLocaleString()}. Split across ${activeNodes.length} nodes.`,
    });
    
    // Reset form
    setAmount("");
    setDescription("");
    setShares({});
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Generating your CSV export of the trip ledger...",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Expense Logs</h1>
          <p className="text-muted-foreground">Historical ledger of all trip transactions</p>
        </div>
        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-xl bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Log New Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="e.g. Dinner at the Grand Hotel" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border-border/50" 
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background border-border/50 pl-7" 
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Split Allocation (Shares)
                </Label>
                <div className="space-y-3 bg-secondary/10 p-4 rounded-xl border border-border/50">
                  {MOCK_TRIP.nodes.map(n => (
                    <div key={n.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold truncate text-foreground">{n.display_name}</span>
                      <Input 
                        type="number" 
                        placeholder="0"
                        className="w-20 h-8 text-right text-xs bg-background border-border/30"
                        value={shares[n.id] || ""}
                        onChange={(e) => handleShareChange(n.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">
                  * Totals are automatically calculated based on total shares entered.
                </p>
              </div>

              <Button className="w-full mt-2 font-bold py-6 text-base" onClick={handleCreateEntry}>
                Create Entry
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-card/50 border border-border/50 rounded-xl shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search expenses by vendor or description..." 
              className="border-0 bg-transparent focus-visible:ring-0 text-sm"
            />
          </div>

          <Card className="border-border/50 overflow-hidden shadow-lg">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold">Split Details</TableHead>
                  <TableHead className="font-bold">Payer</TableHead>
                  <TableHead className="text-right font-bold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXPENSES.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <ReceiptText className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{expense.description}</span>
                          <span className="text-[10px] text-muted-foreground">{expense.date}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        {expense.allocations.map(a => (
                          <div key={a.node_id} className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px] h-4 font-bold bg-primary/10 text-primary border-primary/20">
                              {a.node_id.split('_')[1].toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {a.shares} shares (₹{a.amount.toLocaleString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {expense.payer_id.split('_')[1]}
                    </TableCell>
                    <TableCell className="text-right font-bold font-headline text-accent text-lg">
                      ₹{expense.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
