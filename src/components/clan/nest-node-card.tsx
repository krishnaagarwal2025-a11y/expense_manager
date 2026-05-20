import { ClanNode } from "@/types";
import { ChevronRight, ChevronDown, User, Users, Shield, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";

interface NestNodeCardProps {
  node: ClanNode;
  depth?: number;
}

export function NestNodeCard({ node, depth = 0 }: NestNodeCardProps) {
  const { userId } = useUser();
  const [isOpen, setIsOpen] = useState(true);
  
  const hasSubNodes = node.sub_nodes && node.sub_nodes.length > 0;
  const hasMembers = node.members && node.members.length > 0;
  
  // Privacy logic: Only the manager can see sub-nodes or member names
  const isManager = node.manager_id === userId;
  const canSeeDetails = isManager || depth > 0;

  return (
    <div className={cn("space-y-2", depth > 0 && "indented-branch")}>
      <div 
        className={cn(
          "group flex items-center gap-3 p-3 rounded-xl border bg-card transition-all hover:border-primary/50 cursor-pointer",
          depth === 0 ? "border-primary/30 shadow-md" : "border-border"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center gap-3">
          {hasSubNodes ? (
            isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="w-4" />
          )}
          
          <div className={cn(
            "p-2 rounded-lg",
            depth === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {hasSubNodes ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          
          <div className="flex flex-col">
            <span className="font-headline font-semibold text-sm">{node.display_name}</span>
            {node.manager_id && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Managed by {node.manager_id.split('_')[1]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!canSeeDetails && depth === 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 opacity-60">
              <Lock className="h-2 w-2" /> Private Clan
            </Badge>
          )}
          {node.default_shares && (
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
              {node.default_shares} Shares
            </Badge>
          )}
          {hasMembers && canSeeDetails && (
            <Badge variant="outline" className="text-[10px]">
              {node.members?.length} Members
            </Badge>
          )}
        </div>
      </div>

      {isOpen && canSeeDetails && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {node.sub_nodes?.map((subNode) => (
            <NestNodeCard key={subNode.id} node={subNode} depth={depth + 1} />
          ))}
          {hasMembers && depth > 0 && (
            <div className="indented-branch grid grid-cols-2 gap-2 py-2">
              {node.members?.map((member, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {member}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
