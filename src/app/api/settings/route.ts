import { settingRepository } from "@/repositories/content.repository";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const settings = await settingRepository.findAll();
  return successResponse(settings);
}
