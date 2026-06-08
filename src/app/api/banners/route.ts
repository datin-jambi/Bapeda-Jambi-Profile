import { NextRequest } from "next/server";
import { bannerRepository } from "@/repositories/content.repository";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const activeOnly = searchParams.get("active") === "true";
  const banners = await bannerRepository.findAll(activeOnly);
  return successResponse(banners);
}
