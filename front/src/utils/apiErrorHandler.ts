interface RateLimitError {
  error: string;
  retryAfter?: number;
}

export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export const handleApiError = async (
  response: Response
): Promise<never> => {
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("X-RateLimit-Reset");
    const retryAfter = retryAfterHeader
      ? Math.max(
          0,
          Math.ceil(parseInt(retryAfterHeader, 10) - Date.now() / 1000)
        )
      : undefined;

    let errorData: RateLimitError | null = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: "Too many requests" };
    }

    const retrySeconds = errorData.retryAfter ?? retryAfter ?? 60;
    const retryMinutes = Math.ceil(retrySeconds / 60);

    throw new ApiError(
      `Trop de requêtes. Réessayez dans ${retryMinutes} minute${
        retryMinutes > 1 ? "s" : ""
      }.`,
      429,
      retrySeconds
    );
  }

  if (!response.ok) {
    let errorMessage = `Erreur HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
    }

    throw new ApiError(errorMessage, response.status);
  }

  throw new ApiError("Erreur inconnue", response.status);
};

export const fetchWithErrorHandling = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    await handleApiError(response);
  }

  return response;
};

