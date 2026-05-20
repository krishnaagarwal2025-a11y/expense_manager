"use client";

import { MOCK_TRIP } from "@/lib/mock-data";
import { NestNodeCard } from "@/components/clan/nest-node-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TreePine, Plus, Info, LayoutTemplate } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HierarchyPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <TreePine className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Hierarchy Builder</h1>
            <p className="text-muted-foreground">Define the recursive family trees and group shares</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Load Template
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Top-Level Node
          </Button>
        </div>
      </header>

      <Alert className="bg-accent/10 border-accent/20">
        <Info className="h-4 w-4 text-accent" />
        <AlertTitle className="text-accent font-semibold">Recursive Splitting Logic</AlertTitle>
        <AlertDescription className="text-xs">
          Expenses allocated to a parent node are automatically split among its children based on the 
          configured 'shares' or equal division. You can toggle specific sub-members during expense logging.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-1">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Structural Tree</h2>
            <p className="text-xs text-muted-foreground italic">Drag and drop nodes to re-organize (Coming Soon)</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {MOCK_TRIP.nodes.map((node) => (
              <Card key={node.id} className="border-border/50 bg-card/50 overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{node.display_name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>Primary branch for this trip</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <NestNodeCard node={node} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
