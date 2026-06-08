import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const categories = await prisma.faqCategory.findMany({ orderBy: { name: "asc" } });
  return successResponse(categories);
}
