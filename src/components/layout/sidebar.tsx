'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { mainNavItems, libraryNavItems } from "@/config/nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-300 bg-background",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col space-y-4 no-scrollbar">
        {/* Main Nav Items */}
        <div className="flex flex-col space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "justify-start rounded-lg transition-colors h-10 px-3 flex items-center",
                  isActive && "bg-secondary text-primary font-medium",
                  collapsed && "justify-center p-0"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
              </Link>
            );
          })}
        </div>

        <Separator className="my-2" />

        {/* Library Nav Items */}
        <div className="flex flex-col space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Library
            </div>
          )}
          {libraryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "justify-start rounded-lg transition-colors h-10 px-3 flex items-center",
                  isActive && "bg-secondary text-primary font-medium",
                  collapsed && "justify-center p-0"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-lg h-10 px-3"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 mx-auto" />
          ) : (
            <div className="flex items-center">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-3 text-sm">Collapse sidebar</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}
