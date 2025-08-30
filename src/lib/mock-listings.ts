// src/lib/mock-listings.ts

export type Listing = {
  id: string;
  category: "スポーツ" | "学習" | "趣味";
  title: string;
  date: string; // YYYY-MM-DD
  place: string;
  capacityLeft: number;
  host: { name: string; avatarUrl?: string };
  imageUrl: string;
  feeType: "無料" | "有料";
  description?: string;
  tags: string[];
  views: number;
};

export const LISTINGS: Listing[] = [
  {
    id: "1",
    category: "スポーツ",
    title: "フットサルメンバー募集！（初心者歓迎）",
    date: "2025-08-24",
    place: "東京都 渋谷区",
    capacityLeft: 3,
    host: { name: "Taro" },
    imageUrl: "/sample/futsal.svg",
    feeType: "有料",
    description:
      "初心者OK。現地集合、スニーカーでもOKです。終了後は希望者で軽くご飯に行きます。",
    tags: ["フットサル", "初心者歓迎", "渋谷"],
    views: 521,
  },
  {
    id: "2",
    category: "学習",
    title: "英会話カフェ（初心者OK）",
    date: "2025-08-23",
    place: "神奈川県 横浜市",
    capacityLeft: 2,
    host: { name: "Mika" },
    imageUrl: "/sample/english.svg",
    feeType: "無料",
    description: "コーヒー片手にゆるく英会話を楽しみましょう。",
    tags: ["英会話", "初心者歓迎", "横浜"],
    views: 288,
  },
  {
    id: "3",
    category: "趣味",
    title: "ボードゲーム会：はじめて歓迎",
    date: "2025-08-30",
    place: "東京都 新宿区",
    capacityLeft: 5,
    host: { name: "Ken" },
    imageUrl: "/sample/boardgames.svg",
    feeType: "有料",
    description: "軽量級から中量級までいろいろ遊びます。途中参加・途中退出OK。",
    tags: ["ボドゲ", "新宿", "はじめて"],
    views: 612,
  },
  {
    id: "4",
    category: "スポーツ",
    title: "朝ラン 7km（ゆっくりペース）",
    date: "2025-08-22",
    place: "東京都 世田谷区",
    capacityLeft: 8,
    host: { name: "Aya" },
    imageUrl: "/sample/run.svg",
    feeType: "無料",
    description: "砧公園周辺をゆっくりジョグ。会話しながら走れるペースです。",
    tags: ["ランニング", "世田谷", "朝活"],
    views: 190,
  },
  {
    id: "5",
    category: "学習",
    title: "資格勉強自習会（静かに作業）",
    date: "2025-08-25",
    place: "千葉県 千葉市",
    capacityLeft: 4,
    host: { name: "Ryo" },
    imageUrl: "/sample/study.svg",
    feeType: "無料",
    description: "静かな会議室で各自勉強。軽い雑談OK、基本黙々と。",
    tags: ["資格", "自習", "千葉"],
    views: 402,
  },
  {
    id: "6",
    category: "趣味",
    title: "写真散歩：夜の街スナップ",
    date: "2025-08-26",
    place: "東京都 台東区",
    capacityLeft: 1,
    host: { name: "Saki" },
    imageUrl: "/sample/photowalk.svg",
    feeType: "有料",
    description: "浅草〜上野エリアで夜景スナップ。初心者歓迎。",
    tags: ["写真", "夜景", "台東区"],
    views: 344,
  },
];

// 追加：一覧取得（トップページなどから利用）
export function getAllListings(): Listing[] {
  return LISTINGS;
}

export function getListingById(id: string) {
  return LISTINGS.find((l) => l.id === id);
}

export function getSimilarListings(id: string, limit = 4) {
  const target = getListingById(id);
  if (!target) return LISTINGS.slice(0, limit);
  return LISTINGS.filter(
    (l) =>
      l.id !== id &&
      (l.category === target.category || l.tags.some((t) => target.tags.includes(t)))
  ).slice(0, limit);
}

// 作成用：description / tags にも対応
export type CreateListingInput = {
  category: "スポーツ" | "学習" | "趣味";
  title: string;
  date: string; // YYYY-MM-DD
  place: string;
  capacityLeft: number;
  feeType: "無料" | "有料";
  imageUrl?: string;
  description?: string;
  tags?: string[];
};

export function createListing(input: CreateListingInput): string {
  const id = String(Date.now()); // 簡易ID
  const imageUrl = input.imageUrl || "/sample/new.svg";

  LISTINGS.unshift({
    id,
    category: input.category,
    title: input.title,
    date: input.date,
    place: input.place,
    capacityLeft: input.capacityLeft,
    host: { name: "You" },
    imageUrl,
    views: 0,
    feeType: input.feeType,
    description: input.description,
    tags: input.tags ?? [],
  });

  return id;
}