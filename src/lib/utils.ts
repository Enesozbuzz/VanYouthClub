export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const TR_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

export function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const TIME_ZONE = "Europe/Istanbul";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

const shortDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatFullDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Convert a Date/ISO string to a `datetime-local` input value (browser timezone). */
export function toDateTimeLocalValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
