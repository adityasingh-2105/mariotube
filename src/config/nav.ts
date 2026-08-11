import {
  Home,
  TrendingUp,
  Library,
  Clock,
  Heart,
  History,
  ListVideo,
  Users,
  Film,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
}

export const mainNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Shorts", href: "/shorts", icon: Film },
  { title: "Trending", href: "/trending", icon: TrendingUp },
];

export const libraryNavItems: NavItem[] = [
  { title: "Library", href: "/library", icon: Library, requiresAuth: true },
  { title: "History", href: "/library/history", icon: History, requiresAuth: true },
  { title: "Watch Later", href: "/library/watch-later", icon: Clock, requiresAuth: true },
  { title: "Favorites", href: "/library/favorites", icon: Heart, requiresAuth: true },
  { title: "Playlists", href: "/library/playlists", icon: ListVideo, requiresAuth: true },
  { title: "Subscriptions", href: "/library/subscriptions", icon: Users, requiresAuth: true },
];
