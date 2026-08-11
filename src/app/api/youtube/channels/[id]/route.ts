import { type NextRequest } from "next/server";
import { getChannelDetails, normalizeChannel } from "@/lib/youtube";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const response = await getChannelDetails(id);
    
    if (!response.items || response.items.length === 0) {
      return errorResponse("Channel not found", 404);
    }

    const channel = normalizeChannel(response.items[0]);
    return successResponse({ channel });
  }
);
