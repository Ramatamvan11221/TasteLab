import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG } from "@/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const foods = await prisma.food.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_CONFIG.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_CONFIG.url}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_CONFIG.url}/our-story`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_CONFIG.url}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_CONFIG.url}/register`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const foodRoutes: MetadataRoute.Sitemap = foods.map((food) => ({
    url: `${SITE_CONFIG.url}/food/${food.slug}`,
    lastModified: food.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...foodRoutes];
}
