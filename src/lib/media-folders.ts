export const MediaFolder = {
  PROFILE:      "/bapenda/profile",
  BANNER:       "/bapenda/banner",
  GALLERY:      "/bapenda/gallery",
  NEWS:         "/bapenda/news",
  PUBLICATION:  "/bapenda/publication",
  DOCUMENT:     "/bapenda/document",
  ORGANIZATION: "/bapenda/organization",
  SERVICE:      "/bapenda/service",
  REGULATION:   "/bapenda/regulation",
} as const;

export type MediaFolderKey = keyof typeof MediaFolder;
export type MediaFolderPath = (typeof MediaFolder)[MediaFolderKey];
