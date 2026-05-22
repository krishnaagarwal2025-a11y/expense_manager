"use client";

import { Home, ListOrdered, CreditCard, Settings, PlusCircle, Split, LogOut } from "lucide-react";
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
import { Button } from "@/components/ui/button";

export function ClanSidebar() {
  const { user, setUser } = useUser();
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: ListOrdered, label: "Expenses", href: "/expenses" },
    { icon: CreditCard, label: "Settlements", href: "/settle" },
  ];

  if (user === "nitin") {
    navItems.splice(2, 0, { icon: Split, label: "Allocations", href: "/allocate" });
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-6 bg-secondary">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
            C
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-lg font-bold tracking-tight text-white">
              ClanSplit
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Family Trip Manager</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-secondary px-2 pt-4">
        {user && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/40 font-bold uppercase text-[10px] tracking-widest mb-2 group-data-[collapsible=icon]:hidden">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.label} className="hover:bg-white/10 text-white/90">
                        <Link href={item.href} className="flex items-center gap-3 py-6">
                          <item.icon className="h-5 w-5 text-primary" />
                          <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="text-white/40 font-bold uppercase text-[10px] tracking-widest mb-2">
                Quick Access
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-primary hover:text-primary hover:bg-white/10" asChild>
                      <Link href="/expenses">
                        <PlusCircle className="h-5 w-5" />
                        <span className="font-medium">New Expense</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-white/10 text-white/90">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      {user && (
        <SidebarFooter className="p-4 bg-secondary border-t border-white/5 group-data-[collapsible=icon]:hidden">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-white/60 hover:text-primary hover:bg-white/5 font-medium"
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
