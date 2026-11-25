export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : String(error);

  if (
    /connection terminated|ECONNREFUSED|ECONNRESET|ETIMEDOUT|Failed query/i.test(
      message,
    )
  ) {
    return true;
  }

  if ("cause" in error && error.cause) {
    return isDatabaseConnectionError(error.cause);
  }

  return false;
}