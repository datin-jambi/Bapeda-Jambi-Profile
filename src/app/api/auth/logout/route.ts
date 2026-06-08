import { withErrorHandler } from "@/lib/with-error-handler";
import { POST_logout } from "@/services/auth.service";

export const POST = withErrorHandler(async () => {
  return POST_logout();
});
