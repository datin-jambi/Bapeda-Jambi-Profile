import { pageRepository } from "@/repositories/content.repository";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const page = await pageRepository.findBySlug(params.slug);
  if (!page || !page.isPublished) return errorResponse("Halaman tidak ditemukan", 404);
  return successResponse(page);
}
