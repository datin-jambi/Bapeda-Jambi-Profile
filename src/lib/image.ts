export const PLACEHOLDERS = {
  banner: "/images/placeholders/banner-default.svg",
  news: "/images/placeholders/news-default.svg",
  gallery: "/images/placeholders/gallery-default.svg",
  galleryItem: "/images/placeholders/gallery-item-default.svg",
  avatar: "/images/placeholders/avatar-default.svg",
} as const;

export type PlaceholderType = keyof typeof PLACEHOLDERS;

export function getImageSrc(
  url: string | null | undefined,
  type: PlaceholderType
): string {
  if (!url || url.trim() === "") return PLACEHOLDERS[type];
  return url;
}
