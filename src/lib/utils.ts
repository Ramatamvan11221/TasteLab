import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a 1-5 rating average to a single decimal, e.g. 4.3, 5.0.
 * Returns "Belum ada rating" text upstream when count is 0 — this util
 * only formats the number itself.
 */
export function formatRating(value: number): string {
  return value.toFixed(1);
}

/**
 * Formats an ISO/Date value into Indonesian long-form date, e.g. "22 Juli 2026".
 */
export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * URL-safe slug generator used as a fallback when slugify isn't imported
 * directly in a given module (kept dependency-light for small util calls).
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
