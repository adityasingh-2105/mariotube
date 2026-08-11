'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/features/auth/components/user-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Search, Menu, Home, TrendingUp, Library, History, Clock, Heart, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { VoiceSearchModal } from "@/features/search/components/voice-search-modal";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Mobile menu trigger */}
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "md:hidden mr-2 cursor-pointer outline-none"
          )}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] pr-0">
            <div className="px-1 py-6 flex flex-col space-y-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-2"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <Play className="h-5 w-5 fill-primary stroke-none" />
                <span className="flex items-center font-display font-extrabold text-lg uppercase tracking-tighter drop-shadow-[0_1.5px_0_rgba(0,0,0,1)]">
                  <span className="text-[#f83800]">M</span>
                  <span className="text-[#f8b800] -ml-0.5">a</span>
                  <span className="text-[#002cf8] -ml-0.5">r</span>
                  <span className="text-[#00b02f] -ml-0.5">i</span>
                  <span className="text-[#f83800] -ml-0.5">o</span>
                  <span className="text-[#002cf8] ml-1">T</span>
                  <span className="text-[#f8b800] -ml-0.5">u</span>
                  <span className="text-[#00b02f] -ml-0.5">b</span>
                  <span className="text-[#f83800] -ml-0.5">e</span>
                </span>
              </Link>
              <div className="flex flex-col space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/trending"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Link>
                {session && (
                  <>
                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Library
                    </div>
                    <Link
                      href="/library"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <Library className="h-4 w-4" />
                      Library Hub
                    </Link>
                    <Link
                      href="/library/history"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <History className="h-4 w-4" />
                      History
                    </Link>
                    <Link
                      href="/library/favorites"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                    <Link
                      href="/library/watch-later"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <Clock className="h-4 w-4" />
                      Watch Later
                    </Link>
                    <Link
                      href="/library/subscriptions"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      Subscriptions
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* MarioTube logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <svg viewBox="0 0 100 100" className="h-8 w-8 hover:rotate-12 transition-transform duration-300 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" className="text-zinc-800 dark:text-zinc-200" />
            <path d="M 50,8 A 42,42 0 0,1 92,50" stroke="#f83800" strokeWidth="10" fill="none" />
            <path d="M 8,50 A 42,42 0 0,1 50,8" stroke="#f83800" strokeWidth="10" fill="none" />
            <path d="M 50,50 L 50,15" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
            <path d="M 50,50 L 20,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
            <path d="M 50,50 L 80,68" stroke="currentColor" strokeWidth="8" className="text-zinc-400 dark:text-zinc-600" />
            <circle cx="50" cy="50" r="18" fill="#f83800" stroke="#ffffff" strokeWidth="3" />
            <polygon points="46,41 60,50 46,59" fill="#ffffff" />
          </svg>
          <span className="hidden sm:inline-flex items-center font-display font-extrabold text-xl uppercase tracking-tighter drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            <span className="text-[#f83800] hover:scale-110 transition-transform">M</span>
            <span className="text-[#f8b800] hover:scale-110 transition-transform -ml-0.5">a</span>
            <span className="text-[#002cf8] hover:scale-110 transition-transform -ml-0.5">r</span>
            <span className="text-[#00b02f] hover:scale-110 transition-transform -ml-0.5">i</span>
            <span className="text-[#f83800] hover:scale-110 transition-transform -ml-0.5">o</span>
            <span className="text-[#002cf8] hover:scale-110 transition-transform ml-1">T</span>
            <span className="text-[#f8b800] hover:scale-110 transition-transform -ml-0.5">u</span>
            <span className="text-[#00b02f] hover:scale-110 transition-transform -ml-0.5">b</span>
            <span className="text-[#f83800] hover:scale-110 transition-transform -ml-0.5">e</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-auto flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search videos..."
                className="pr-10 w-full h-9 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9 rounded-full hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </form>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsVoiceSearchOpen(true)}
            className="h-9 w-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground shrink-0 cursor-pointer"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <VoiceSearchModal open={isVoiceSearchOpen} onOpenChange={setIsVoiceSearchOpen} />

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 ml-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
