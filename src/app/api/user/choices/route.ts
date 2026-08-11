import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser, successResponse, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const trackChoiceSchema = z.object({
  action: z.enum(["search", "watch", "like", "favorite", "short_swipe", "channel_visit", "category_filter"]),
  category: z.string().optional(),
  tag: z.string().optional(),
  videoId: z.string().optional(),
  channelId: z.string().optional(),
  duration: z.number().optional(),
  query: z.string().optional(),
});

// POST /api/user/choices - Records user interactions, searches, category clicks & updates preference scores
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const body = await req.json();
    const validated = trackChoiceSchema.parse(body);

    // Calculate dynamic weight based on interaction strength
    let weight = 1.0;
    if (validated.action === "like" || validated.action === "favorite") weight = 3.0;
    if (validated.action === "search") weight = 2.5;
    if (validated.action === "watch" && (validated.duration || 0) > 30) weight = 2.0;

    // 1. If user is authenticated, save directly to database
    if (authUser && authUser.id) {
      const uid = authUser.id;

      // Record choice
      await db.userChoice.create({
        data: {
          userId: uid,
          action: validated.action,
          category: validated.category,
          tag: validated.tag || validated.query,
          videoId: validated.videoId,
          channelId: validated.channelId,
          duration: validated.duration,
          weight,
        },
      });

      // If it was a search action, log to search history
      if (validated.action === "search" && validated.query) {
        await db.searchHistory.create({
          data: {
            userId: uid,
            query: validated.query.trim(),
            category: validated.category,
          },
        });
      }

      // Re-calculate and update top preferred categories
      const topChoices = await db.userChoice.groupBy({
        by: ["category"],
        where: {
          userId: uid,
          category: { not: null },
        },
        _sum: { weight: true },
        orderBy: { _sum: { weight: "desc" } },
        take: 5,
      });

      const topCategories = topChoices
        .map((c) => c.category)
        .filter((cat): cat is string => Boolean(cat));

      await db.userPreference.upsert({
        where: { userId: uid },
        update: {
          topCategories: JSON.stringify(topCategories),
        },
        create: {
          userId: uid,
          topCategories: JSON.stringify(topCategories),
        },
      });
    }

    return successResponse({
      tracked: true,
      action: validated.action,
      category: validated.category,
    });
  } catch (error: any) {
    console.error("Track choice error:", error);
    return errorResponse(error.message || "Failed to record choice", 400);
  }
}

// GET /api/user/choices - Returns user's top choices, stats, and search history
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return errorResponse("Unauthorized", 401);
    }

    const [preference, recentSearches, recentChoices, historyCount, favoritesCount] = await Promise.all([
      db.userPreference.findUnique({ where: { userId: authUser.id } }),
      db.searchHistory.findMany({
        where: { userId: authUser.id },
        orderBy: { searchedAt: "desc" },
        take: 10,
      }),
      db.userChoice.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.watchHistory.count({ where: { userId: authUser.id } }),
      db.favorite.count({ where: { userId: authUser.id } }),
    ]);

    const topCategories = preference?.topCategories
      ? JSON.parse(preference.topCategories)
      : [];

    return successResponse({
      topCategories,
      recentSearches: recentSearches.map((s) => s.query),
      recentChoices,
      stats: {
        totalWatched: historyCount,
        totalFavorites: favoritesCount,
        totalInteractions: recentChoices.length,
      },
    });
  } catch (error: any) {
    console.error("Get choices error:", error);
    return errorResponse("Failed to fetch choices", 500);
  }
}
