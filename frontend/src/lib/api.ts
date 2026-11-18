const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const configuredApiPort = process.env.NEXT_PUBLIC_API_PORT?.trim();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type TenantMembershipSummary = {
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  roleId: string;
  roleName: string;
};

export type AuthPrincipal = {
  userId: string;
  email: string;
  displayName: string;
};

export type AuthenticatedAccount = {
  user: AuthPrincipal;
  activeTenant: TenantMembershipSummary | null;
  availableTenants: TenantMembershipSummary[];
  requiresTenantSelection: boolean;
};

type CsrfTokenResponse = {
  token: string;
};

function resolveApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return configuredApiBaseUrl || "http://localhost:5000";
  }

  if (configuredApiBaseUrl) {
    if (configuredApiBaseUrl.includes("{host}")) {
      return configuredApiBaseUrl.replace("{host}", window.location.host);
    }

    return configuredApiBaseUrl;
  }

  if (configuredApiPort) {
    return `${window.location.protocol}//${window.location.hostname}:${configuredApiPort}`;
  }

  return `${window.location.protocol}//${window.location.host}`;
}

function mergeHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && !headers.has("content-type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: mergeHeaders(init.headers),
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let title: string | undefined;

    if (contentType.includes("json")) {
      const problem = (await response.json().catch(() => null)) as { title?: string } | null;
      title = problem?.title;
    } else {
      const text = await response.text().catch(() => "");
      title = text.trim() ? text.trim() : undefined;
    }

    throw new ApiError(response.status, title ?? `API request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getCsrfToken(): Promise<string> {
  const csrf = await apiRequest<CsrfTokenResponse>("/api/v1/auth/csrf", {
    method: "GET",
  });

  return csrf.token;
}

async function csrfApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrfToken = await getCsrfToken();
  return apiRequest<T>(path, {
    ...init,
    headers: {
      ...Object.fromEntries(new Headers(init.headers).entries()),
      "X-CSRF-TOKEN": csrfToken,
    },
  });
}

export const authApi = {
  register: (payload: {
    businessName: string;
    ownerName: string;
    phone?: string;
    email: string;
    password: string;
  }) =>
    apiRequest<AuthenticatedAccount>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: {
    email: string;
    password: string;
    preferredTenantHost?: string;
    preferredTenantSlug?: string;
  }) =>
    apiRequest<AuthenticatedAccount>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest<AuthenticatedAccount>("/api/v1/auth/me"),

  switchTenant: (targetTenantHost: string) =>
    csrfApiRequest<AuthenticatedAccount>("/api/v1/auth/tenant/switch", {
      method: "POST",
      body: JSON.stringify({ targetTenantHost }),
    }),

  logout: () =>
    csrfApiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
