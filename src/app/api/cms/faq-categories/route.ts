import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqCategorySchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import slugify from "slugify";

export const GET = withErrorHandler(async () => {
  const categories = await prisma.faqCategory.findMany({ orderBy: { name: "asc" } });
  return ApiResponse.success(categories);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (user.role !== "Super_Admin" && user.role !== "Admin") throw new ForbiddenError();

  const body = await request.json();
  const parsed = faqCategorySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug = parsed.data.slug || slugify(parsed.data.name, { lower: true, strict: true });
  const category = await prisma.faqCategory.create({ data: { name: parsed.data.name, slug } });
  return ApiResponse.created(category, "Kategori FAQ berhasil dibuat");
});
