import { NextResponse } from "next/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FieldError {
  field: string;
  message: string;
}

export interface Meta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SuccessResponseBody<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta: Meta | null;
}

export interface ErrorResponseBody {
  success: false;
  message: string;
  errors: FieldError[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flattenErrors(errors?: Record<string, string[]>): FieldError[] {
  if (!errors) return [];
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message }))
  );
}

// ─── ApiResponse builder ─────────────────────────────────────────────────────

export const ApiResponse = {
  success<T>(data: T, message = "Data retrieved successfully") {
    return NextResponse.json<SuccessResponseBody<T>>(
      { success: true, message, data, meta: null },
      { status: 200 }
    );
  },

  created<T>(data: T, message = "Data created successfully") {
    return NextResponse.json<SuccessResponseBody<T>>(
      { success: true, message, data, meta: null },
      { status: 201 }
    );
  },

  updated<T>(data: T, message = "Data updated successfully") {
    return NextResponse.json<SuccessResponseBody<T>>(
      { success: true, message, data, meta: null },
      { status: 200 }
    );
  },

  deleted(message = "Data deleted successfully") {
    return NextResponse.json<SuccessResponseBody<null>>(
      { success: true, message, data: null, meta: null },
      { status: 200 }
    );
  },

  paginated<T>(data: T[], meta: Meta, message = "Data retrieved successfully") {
    return NextResponse.json<SuccessResponseBody<T[]>>(
      { success: true, message, data, meta },
      { status: 200 }
    );
  },

  error(message: string, status = 400, errors: FieldError[] = []) {
    return NextResponse.json<ErrorResponseBody>(
      { success: false, message, errors },
      { status }
    );
  },

  validationError(message = "Validation failed", fieldErrors?: Record<string, string[]>) {
    return NextResponse.json<ErrorResponseBody>(
      { success: false, message, errors: flattenErrors(fieldErrors) },
      { status: 422 }
    );
  },
};

// ─── Pagination helper ────────────────────────────────────────────────────────

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta(page: number, limit: number, totalItems: number): Meta {
  return { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) };
}

// ─── Legacy shims (keep existing callers working during migration) ────────────
// These will be removed once all routes are migrated.

export function successResponse<T>(data: T, message?: string, status = 200) {
  if (status === 201) return ApiResponse.created(data, message);
  return NextResponse.json(
    { success: true, message: message ?? "Data retrieved successfully", data, meta: null },
    { status }
  );
}

export function errorResponse(message: string, status = 400, errors?: Record<string, string[]>) {
  return NextResponse.json<ErrorResponseBody>(
    { success: false, message, errors: flattenErrors(errors) },
    { status }
  );
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
}
