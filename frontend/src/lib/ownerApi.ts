import { supabase } from "./supabase";
import { apiRequest } from "./api";

export async function ownerApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return apiRequest<T>(path, {
    ...init,
    headers,
  });
}
