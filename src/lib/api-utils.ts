import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z, ZodError, type ZodSchema } from "zod";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: z.ZodIssue[];
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  );
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status }
  );
}

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export function validateSearchParams<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw error;
  }
}

export function withErrorHandling<TArgs extends any[]>(
  handler: (req: Request, ...args: TArgs) => Promise<NextResponse>
) {
  return async (req: Request, ...args: TArgs) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Validation failed",
            errors: error.issues,
          },
          { status: 422 }
        );
      }
      console.error("API Error:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Internal Server Error",
        500
      );
    }
  };
}
