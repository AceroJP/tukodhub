const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

export type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  tenantId: string;
  tenantName: string;
  role: string;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as
      | { title?: string }
      | null;
    throw new Error(problem?.title ?? `API request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  me: () => apiRequest<AuthUser>("/api/v1/auth/me"),
  logout: () =>
    apiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
    }),
};
