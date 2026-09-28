import type { MetadataRoute } from "next";
import { getUpcomingEvents } from "@/lib/queries";

const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: baseUrl, changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/events`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/gallery`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const events = await getUpcomingEvents();
  const eventPages = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...eventPages];
}
