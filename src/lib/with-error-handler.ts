import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { ApiResponse } from "./api-response";

// Next.js 15 App Router: params is always a Promise
type RouteContext = { params: Promise<Record<string, string>> };

export type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof AppError) {
        return ApiResponse.error(err.message, err.statusCode, err.errors);
      }

      // Prisma known errors
      if (isObject(err) && err.code === "P2002") {
        return ApiResponse.error("Data sudah ada (duplikat)", 409);
      }
      if (isObject(err) && err.code === "P2025") {
        return ApiResponse.error("Data tidak ditemukan", 404);
      }

      console.error("[API Error]", err);
      return ApiResponse.error("Internal server error", 500);
    }
  };
}

export async function resolveParams(context: RouteContext): Promise<Record<string, number>> {
  const params = await context.params;
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, parseInt(v, 10)])
  );
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}
