"use client";

import { useState } from "react";
import NextImage, { ImageProps } from "next/image";
import { PLACEHOLDERS, PlaceholderType } from "@/lib/image";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallback: PlaceholderType;
}

export function FallbackImage({ src, fallback, alt, ...props }: FallbackImageProps) {
  const placeholder = PLACEHOLDERS[fallback];
  const [imgSrc, setImgSrc] = useState<string>(
    src && src.trim() !== "" ? src : placeholder
  );

  return (
    <NextImage
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(placeholder)}
    />
  );
}
