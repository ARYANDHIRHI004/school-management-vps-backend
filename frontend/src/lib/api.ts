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

/** JSON success payload including extra top-level fields (e.g. `summary`). */
export async function apiFetchRaw<T extends Record<string, unknown>>(
  path: string,
  init?: RequestInit,
): Promise<T & { success: true }> {
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
    | (T & { success: true })
    | ApiFailure
    | null;

  if (!response.ok || !payload || payload.success !== true) {
    const failure = payload as ApiFailure | null;
    const message = failure?.message ?? `Request failed (${response.status})`;
    throw new ApiRequestError(message, response.status, failure?.details);
  }

  return payload;
}

/** Multipart upload (do not set Content-Type; browser sets boundary). */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<ApiSuccess<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload && "message" in payload
        ? payload.message
        : `Upload failed (${response.status})`;
    throw new ApiRequestError(
      message,
      response.status,
      payload && "details" in payload ? payload.details : undefined,
    );
  }

  return payload;
}

export async function apiDownload(
  path: string,
  suggestedFileName: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiFailure | null;
    const message =
      payload && "message" in payload
        ? payload.message
        : `Download failed (${response.status})`;
    throw new ApiRequestError(message, response.status);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = suggestedFileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}