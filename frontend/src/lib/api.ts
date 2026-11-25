import { apiBaseUrl } from "./config";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number };
};

export type ApiFailure = {
  success: false;
  message: string;
  details?: Record<string, unknown>;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiSuccess<T>> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload && "message" in payload
        ? payload.message
        : `Request failed (${response.status})`;
    throw new ApiRequestError(
      message,
      response.status,
      payload && "details" in payload ? payload.details : undefined,
    );
  }

  return payload;
}