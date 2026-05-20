
"use client";

import { Home, ListOrdered, TreePine, CreditCard, Settings, PlusCircle, Split, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useUser } from "@/context/user-context";

export function ClanSidebar() {
  const { user, setUser } = useUser();
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: TreePine, label: "Hierarchy", href: "/hierarchy" },
    { icon: ListOrdered, label: "Expenses", href: "/expenses" },
    { icon: CreditCard, label: "Settlements", href: "/settle" },
  ];

  if (user === "nitin") {
    navItems.splice(2, 0, { icon: Split, label: "Allocations", href: "/allocate" });
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            C
          </div>
          <span className="font-headline text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            ClanSplit
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {user && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-primary hover:text-primary" asChild>
                      <Link href="/expenses">
                        <PlusCircle className="h-4 w-4" />
                        <span>New Expense</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      {user && (
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setUser(null)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

import { Button } from "@/components/ui/button";
