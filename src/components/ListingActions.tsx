"use client";

import { useEffect, useState } from "react";

type Props = {
  listingId: string;
  className?: string;
};

export default function ListingActions({ listingId, className }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // 初期ロード：localStorage から状態を復元
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("auth:favs") ?? "[]") as string[];
      const joined = JSON.parse(localStorage.getItem("auth:joined") ?? "[]") as string[];
      setIsFav(favs.includes(listingId));
      setIsJoined(joined.includes(listingId));
    } catch {
      // 壊れていたら初期化
      setIsFav(false);
      setIsJoined(false);
    }
  }, [listingId]);

  const toggleFav = () => {
    try {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("auth:favs") ?? "[]") as string[]
      );
      if (favs.has(listingId)) {
        favs.delete(listingId);
        setIsFav(false);
      } else {
        favs.add(listingId);
        setIsFav(true);
      }
      localStorage.setItem("auth:favs", JSON.stringify([...favs]));
    } catch {
      // no-op
    }
  };

  const toggleJoin = () => {
    try {
      const joined = new Set<string>(
        JSON.parse(localStorage.getItem("auth:joined") ?? "[]") as string[]
      );
      if (joined.has(listingId)) {
        joined.delete(listingId);
        setIsJoined(false);
      } else {
        joined.add(listingId);
        setIsJoined(true);
      }
      localStorage.setItem("auth:joined", JSON.stringify([...joined]));
    } catch {
      // no-op
    }
  };

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <button
        onClick={toggleJoin}
        className={
          isJoined
            ? "px-4 py-2 rounded-full text-sm bg-green-600 text-white hover:bg-green-700 transition"
            : "px-4 py-2 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
        }
        aria-pressed={isJoined}
      >
        {isJoined ? "参加中" : "参加する"}
      </button>

      <button
        onClick={toggleFav}
        className={
          isFav
            ? "px-4 py-2 rounded-full text-sm bg-pink-600 text-white hover:bg-pink-700 transition"
            : "px-4 py-2 rounded-full text-sm bg-white text-gray-900 shadow-sm hover:bg-blue-50 hover:text-blue-700 transition"
        }
        aria-pressed={isFav}
        title={isFav ? "お気に入り解除" : "お気に入りに追加"}
      >
        {isFav ? "お気に入り済み" : "お気に入り"}
      </button>
    </div>
  );
}