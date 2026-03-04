import { supabase } from "@/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

/**
 * Thin wrapper around fetch that:
 *  - Prepends the API base URL
 *  - Attaches the Supabase JWT as a Bearer token
 *  - Sends/receives JSON
 *  - Throws on non-2xx responses with the server's error message
 */
export async function apiFetch(path, options = {}) {
  const token = await getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error || body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}
