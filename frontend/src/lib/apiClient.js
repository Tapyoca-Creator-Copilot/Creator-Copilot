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

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

/**
 * Fetch helper for non-JSON responses (e.g., CSV downloads).
 * Returns the raw Response after performing the same auth/error handling.
 */
export async function apiFetchResponse(path, options = {}) {
  const token = await getAccessToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : options.body != null ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const cloned = res.clone();

    const body = await cloned.json().catch(async () => {
      const text = await cloned.text().catch(() => "");
      return text ? { error: text } : null;
    });

    const message = body?.error || body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res;
}
