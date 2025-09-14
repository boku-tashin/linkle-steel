"use client";

import Image from "next/image";
import React from "react";

function isEmptyImage(src?: string | null) {
  if (!src) return true;
  const s = String(src).trim().toLowerCase();
  return !s || s === "/sample/new.svg" || s === "noimage" || s === "no-image";
}

export default function ListingImage({
  src,
  alt,
  ratio = "3/2", // "16/9" などにも差し替え可
  className = "",
  rounded = "rounded-xl",
}: {
  src?: string;
  alt: string;
  ratio?: "3/2" | "16/9" | "1/1";
  className?: string;
  rounded?: string;
}) {
  const [broken, setBroken] = React.useState(false);
  const showFallback = isEmptyImage(src) || broken;

  const ratioClass =
    ratio === "16/9" ? "aspect-[16/9]" : ratio === "1/1" ? "aspect-square" : "aspect-[3/2]";

  return (
    <div className={`relative w-full ${ratioClass} overflow-hidden ${rounded} bg-gray-100 ${className}`}>
      {!showFallback ? (
        <Image
          src={src!}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width:640px) 100vw, 33vw"
          unoptimized
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-gray-500 font-semibold tracking-widest text-xs sm:text-sm">
            NO IMAGE
          </span>
        </div>
      )}
    </div>
  );
}