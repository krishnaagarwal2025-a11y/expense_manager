"use client";
import { Badge } from "@/components/ui/badge";
import { MOCK_TRIP } from "@/lib/mock-data";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TreePine, Plus, Info, LayoutTemplate, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function HierarchyPage() {
  const { toast } = useToast();

  const handleAddNode = () => {
    toast({
      title: "Feature Locked",
      description: "Hierarchy editing is currently in read-only mode for this trip.",
    });
  };

  const handleLoadTemplate = () => {
    toast({
      title: "Template Engine",
      description: "Fetching family structure templates from previous trips...",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
            <TreePine className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">Hierarchy Builder</h1>
            <p className="text-muted-foreground">Define the recursive family trees and group shares</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none border-primary/20" onClick={handleLoadTemplate}>
            <LayoutTemplate className="h-4 w-4" />
            Load Template
          </Button>
          <Button size="sm" className="gap-2 flex-1 sm:flex-none font-bold" onClick={handleAddNode}>
            <Plus className="h-4 w-4" />
            Add Top Node
          </Button>
        </div>
      </header>

      <Alert className="bg-accent/10 border-accent/20 shadow-sm">
        <Info className="h-5 w-5 text-accent" />
        <AlertTitle className="text-accent font-bold mb-1">Recursive Splitting Logic</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
          Expenses allocated to a parent node are automatically split among its children based on the 
          configured 'shares' or equal division. You can toggle specific sub-members during expense logging.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              Structural Tree
              <Badge variant="outline" className="text-[9px] font-bold py-0 h-4">STABLE</Badge>
            </h2>
            <p className="text-[10px] text-muted-foreground italic bg-secondary/20 px-2 py-1 rounded-md">Drag and drop nodes to re-organize (Coming Soon)</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {MOCK_TRIP.nodes.map((node) => (
              <Card key={node.id} className="border-border/50 bg-card/30 overflow-hidden shadow-lg hover:shadow-primary/5 transition-all">
                <CardHeader className="bg-secondary/10 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-headline">{node.display_name}</CardTitle>
                      <CardDescription className="text-[10px]">Primary branch for this trip</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 text-primary" onClick={handleAddNode}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <NestNodeCard node={node} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="ghost" className="text-muted-foreground text-xs gap-2" onClick={() => toast({ title: "Auto-save enabled", description: "All changes are saved in real-time." })}>
          <Save className="h-3 w-3" />
          Structure synced with trip-2026
        </Button>
      </div>
    </div>
  );
}
