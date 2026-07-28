export const SITE_CONFIG = {
  name: "TasteLab",
  tagline: "Know What You Eat. Share What You Think.",
  description:
    "TasteLab membantu kamu mengenal produk makanan lebih transparan — lihat nutrisi, baca ulasan jujur, dan bagikan pendapatmu langsung dari kemasan.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  brandSlug: "tastelab",
  locale: "id-ID",
  defaultLocale: "id",
  supportedLocales: ["id", "en"] as const,
};

export const CUSTOMER_NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Cerita Kami", href: "/our-story" },
];

export const KITCHEN_NAV_LINKS = [
  { label: "Dashboard", href: "/kitchen/dashboard" },
  { label: "Produk", href: "/kitchen/foods" },
  { label: "Kategori", href: "/kitchen/categories" },
  { label: "Nutrisi", href: "/kitchen/nutrition-types" },
  { label: "Ulasan", href: "/kitchen/reviews" },
];

export const RATING_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Kurang Suka",
  2: "Cukup",
  3: "Lumayan",
  4: "Suka",
  5: "Sangat Suka",
};

export const MAX_REVIEW_LENGTH = 1000;
export const MIN_REVIEW_LENGTH = 5;
