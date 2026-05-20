
"use client";

import { useState } from "react";
import { MOCK_EXPENSES, MOCK_TRIP } from "@/lib/mock-data";
import { AIAllocationTool } from "@/components/expenses/ai-allocation-tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReceiptText, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleCreateEntry = () => {
    if (!amount || !selectedNode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide an amount and select a target node."
      });
      return;
    }

    toast({
      title: "Expense Logged",
      description: "Your entry has been added to the historical ledger.",
    });
    
    // Reset form
    setAmount("");
    setSelectedNode(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Expense Logs</h1>
          <p className="text-muted-foreground">Historical ledger of all trip transactions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Log New Charge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIAllocationTool onAllocated={(id) => setSelectedNode(id)} />
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allocation Target</Label>
                <Select value={selectedNode || ""} onValueChange={setSelectedNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target node" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TRIP.nodes.map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.display_name}</SelectItem>
                    ))}
                    {MOCK_TRIP.nodes.flatMap(n => n.sub_nodes || []).map(sn => (
                      <SelectItem key={sn.id} value={sn.id}>{sn.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleCreateEntry}>Create Entry</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 p-2 bg-card border rounded-lg">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <Input 
              placeholder="Search expenses by vendor or description..." 
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXPENSES.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded">
                          <ReceiptText className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex flex-col">
                          <span>{expense.description}</span>
                          <span className="text-[10px] text-muted-foreground">{expense.date}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {expense.allocated_to.map(id => (
                          <Badge key={id} variant="secondary" className="text-[9px]">
                            {id.split('_').slice(1).join(' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {expense.payer_id.split('_')[1]}
                    </TableCell>
                    <TableCell className="text-right font-bold font-headline">
                      ${expense.amount.toFixed(2)}
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
