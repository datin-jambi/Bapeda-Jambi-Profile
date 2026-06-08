import { withErrorHandler } from "@/lib/with-error-handler";
import { GET_me } from "@/services/auth.service";

export const GET = withErrorHandler(async () => {
  return GET_me();
});
