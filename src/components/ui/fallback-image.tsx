"use client";

import { useState, useEffect } from "react";
import NextImage, { ImageProps } from "next/image";
import { PLACEHOLDERS, PlaceholderType } from "@/lib/image";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallback: PlaceholderType;
}

export function FallbackImage({ src, fallback, alt, ...props }: FallbackImageProps) {
  const placeholder = PLACEHOLDERS[fallback];
  const resolved = src && src.trim() !== "" ? src : placeholder;
  const [imgSrc, setImgSrc] = useState<string>(resolved);

  useEffect(() => {
    setImgSrc(resolved);
  }, [resolved]);

  return (
    <NextImage
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(placeholder)}
    />
  );
}
