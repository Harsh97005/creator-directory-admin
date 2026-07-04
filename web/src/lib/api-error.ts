import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    const details = error.response?.data as { error?: string; details?: string[] } | undefined;
    if (details?.details?.length) return details.details.join(", ");
    if (details?.error) return details.error;
    if (error.code === "ERR_NETWORK") {
      return "Can't reach the server. Check that the API is running and try again.";
    }
    if (error.response?.status === 404) return "That creator no longer exists.";
  }
  return fallback;
}
