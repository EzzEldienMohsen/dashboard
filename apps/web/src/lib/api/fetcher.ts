import { REVALIDATE_SECONDS } from "@/lib/config/site";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(path: string): Promise<T | null> {
  const url = `${INTERNAL_API_URL}${path}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (res.ok) return (await res.json()) as T;
    console.error(`[api] ${res.status} ${res.statusText} — ${url}`);
  } catch (err) {
    console.error(`[api] fetch failed — ${url}`, err);
  }
  return null;
}
