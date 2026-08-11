'use client';

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "./sign-in-button";
import Link from "next/link";
import { History, Heart, Clock, ListVideo, LogOut, Users, Award, UserCircle2 } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return <SignInButton variant="outline" size="sm" />;
  }

  const user = session.user;
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-8 w-8 rounded-full p-0 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.image || ""} alt={user?.name || "User Avatar"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/library" className="flex w-full items-center">
            <ListVideo className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Library</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/library/history" className="flex w-full items-center">
            <History className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>History</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/library/favorites" className="flex w-full items-center">
            <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Favorites</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/library/watch-later" className="flex w-full items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Watch Later</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/library/subscriptions" className="flex w-full items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Subscriptions</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/studio" className="flex w-full items-center">
            <Award className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Creator Studio</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/login" className="flex w-full items-center">
            <UserCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Switch account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <span className="flex w-full items-center cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4 text-destructive" />
            <span>Sign out</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
