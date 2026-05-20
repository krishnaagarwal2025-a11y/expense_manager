"use client";

import { useState } from "react";
import { allocateExpense } from "@/ai/flows/smart-expense-allocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { MOCK_TRIP } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export function AIAllocationTool({ onAllocated }: { onAllocated: (nodeId: string) => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAIAllocate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const flattenedNodes = MOCK_TRIP.nodes.flatMap(n => {
        const results = [{ id: n.id, display_name: n.display_name }];
        if (n.sub_nodes) {
          n.sub_nodes.forEach(sn => results.push({ id: sn.id, display_name: sn.display_name }));
        }
        return results;
      });

      const result = await allocateExpense({
        expenseDescription: description,
        availableNodes: flattenedNodes
      });

      onAllocated(result.allocatedNodeId);
      toast({
        title: "AI Suggestion",
        description: result.reasoning,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not suggest allocation. Try manually."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
      </div>
      <div className="flex gap-2">
        <Input 
          placeholder="e.g. Starbucks for Sanjeev's kids" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-background border-primary/20 focus-visible:ring-primary"
        />
        <Button 
          onClick={handleAIAllocate} 
          disabled={loading || !description}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest"}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        "I'll analyze previous logs to find the right family node for this charge."
      </p>
    </div>
  );
}
