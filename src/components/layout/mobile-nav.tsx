'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Home, TrendingUp, Library, Film } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Shorts", href: "/shorts", icon: Film },
    { title: "Trending", href: "/trending", icon: TrendingUp },
    { title: "Library", href: session ? "/library" : "/login", icon: Library },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t flex h-16 pb-safe items-center justify-around px-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-muted-foreground transition-colors relative",
              isActive && "text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">{item.title}</span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
