// src/components/ListingCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/mock-listings";
import { isListingClosed } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: Listing }) {
  const closed = isListingClosed(listing);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-blue-200 hover:shadow-md transition block overflow-hidden">
      <div className="relative aspect-[3/2]">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-[15px] line-clamp-2">{listing.title}</h3>
        <p className="mt-1 text-xs text-gray-500 truncate">
          {listing.date} ・ {listing.place}
        </p>

        {closed ? (
          <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
            募集終了
          </span>
        ) : (
          <Link
            href={`/listings/${listing.id}`}
            className="mt-2 inline-block px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
          >
            参加する
          </Link>
        )}
      </div>
    </div>
  );
}