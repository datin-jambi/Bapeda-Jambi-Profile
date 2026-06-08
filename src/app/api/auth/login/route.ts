import { NextRequest } from "next/server";
import { POST_login } from "@/services/auth.service";
import { withErrorHandler } from "@/lib/with-error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  return POST_login(request);
});
