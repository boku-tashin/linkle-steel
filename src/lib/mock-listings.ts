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
  createdAt: number; // ★ 追記：新着順用
};

export const LISTINGS: Listing[] = [
  // 既存の初期データがあればここに残してください
];

/* =========================================================
   追加: ユーザー作成 Listing のローカルストレージ永続化
   ---------------------------------------------------------
   - LISTINGS（初期データ）はそのまま維持
   - ユーザー作成分は localStorage に保存
   - getAllListings / getListingById / createListing を拡張
   ========================================================= */

const LS_KEY_USER_LISTINGS = "mock:listings:user";

/* ============================
   ★ ここから追記（削除なし）
   ============================ */

// ★ 追加：名前の頭文字からSVGアバターを生成（プロフィール未設定のフォールバック）
function avatarFromName(name: string) {
  const ch = (name?.trim()?.[0] ?? "U");
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
      <rect width="100%" height="100%" rx="48" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
        font-size="44" fill="#6b7280">${ch}</text>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

// ★ 追加：レコードに必ず avatarUrl を持たせる補正
function ensureAvatar(l: Listing): Listing {
  const name = l?.host?.name || "You";
  const url = l?.host?.avatarUrl;
  const bad =
    url == null ||
    String(url).trim() === "" ||
    String(url).includes("undefined") ||
    String(url).includes("null");
  if (!bad) return l;
  return { ...l, host: { ...l.host, name, avatarUrl: avatarFromName(name) } };
}

function loadUserListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY_USER_LISTINGS);
    const arr = raw ? JSON.parse(raw) : [];
    let list = Array.isArray(arr) ? (arr as Listing[]) : [];

    // ★ avatar を自動補正（差分があれば保存）
    const patched = list.map(ensureAvatar);
    const changed = JSON.stringify(patched) !== JSON.stringify(list);
    if (changed) {
      try {
        localStorage.setItem(LS_KEY_USER_LISTINGS, JSON.stringify(patched));
      } catch {}
      list = patched;
    }
    return list;
  } catch {
    return [];
  }
}

function saveUserListings(list: Listing[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY_USER_LISTINGS, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

// 追加：一覧取得（トップページなどから利用）
// ★ 元の関数名・エクスポートは維持しつつ、ユーザー作成分をマージ
export function getAllListings(): Listing[] {
  const user = loadUserListings();

  // ★ createdAt が無い既存データへの補完（id が timestamp なら流用）＋ avatar 補正
  const hydrate = (l: Listing): Listing => {
    const createdAt =
      typeof l.createdAt === "number"
        ? l.createdAt
        : Number.isFinite(Number(l.id))
        ? Number(l.id)
        : 0;
    return ensureAvatar({ ...l, createdAt });
  };

  // 同じIDがあればユーザー側で上書きされるように、LISTINGS → user の順で投入
  const map = new Map<string, Listing>();
  for (const l of LISTINGS.map(hydrate)) map.set(l.id, l);
  for (const l of user.map(hydrate)) map.set(l.id, l);

  const all = Array.from(map.values());
  all.sort((a, b) => b.createdAt - a.createdAt); // 新着順
  return all;
}

export function getListingById(id: string) {
  // まずユーザー作成分を検索 → 見つからなければ既存から
  const inUser = loadUserListings().find((l) => l.id === id);
  if (inUser) return inUser;
  const base = LISTINGS.find((l) => l.id === id);
  return base ? ensureAvatar(base) : undefined;
}

export function getSimilarListings(id: string, limit = 4) {
  const target = getListingById(id);
  if (!target) return getAllListings().slice(0, limit);
  return getAllListings()
    .filter(
      (l) =>
        l.id !== id &&
        (l.category === target.category ||
          l.tags.some((t) => target.tags.includes(t)))
    )
    .slice(0, limit);
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
  const now = Date.now(); // ★ 新着順キー
  const id = String(now); // 簡易IDは timestamp 文字列
  const imageUrl = input.imageUrl?.trim() || "";

  // プロフィール（マイページ設定）読み取り
  let nickname = "You";
  let avatarUrl: string | undefined;
  let hostBio: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("linkle:settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.nickname && String(s.nickname).trim())
          nickname = String(s.nickname).trim();
        if (s?.avatarUrl && String(s.avatarUrl).trim())
          avatarUrl = String(s.avatarUrl).trim();
        if (s?.bio && String(s.bio).trim()) hostBio = String(s.bio).trim();
      }
    } catch {
      /* noop */
    }
  }

  // ★ フォールバック：avatarUrl が無ければ頭文字SVGを使う
  if (!avatarUrl) avatarUrl = avatarFromName(nickname);

  // 自己紹介を description に追記（UIは既存のまま反映）
  let description = input.description ?? "";
  if (hostBio) {
    description = description
      ? `${description}\n\n— 主催者自己紹介 —\n${hostBio}`
      : `— 主催者自己紹介 —\n${hostBio}`;
  }

  const listing: Listing = {
    id,
    category: input.category,
    title: input.title,
    date: input.date,
    place: input.place,
    capacityLeft: input.capacityLeft,
    host: { name: nickname, avatarUrl }, // ← ここにフォールバック済みのURLが入る
    imageUrl,
    views: 0,
    feeType: input.feeType,
    description,
    tags: input.tags ?? [],
    createdAt: now, // ★ 新着順ソート用
  };

  // 即時反映（開発用）※元の設計を維持
  LISTINGS.unshift(listing);

  // 永続化
  const user = loadUserListings();
  user.unshift(listing);
  saveUserListings(user);

  // MyPage「作成した募集」IDリストも同期
  try {
    if (typeof window !== "undefined") {
      let mine: string[] = JSON.parse(localStorage.getItem("auth:mine") || "[]");
      if (!Array.isArray(mine)) mine = [];
      if (!mine.includes(id)) {
        mine.unshift(id);
        localStorage.setItem("auth:mine", JSON.stringify(mine));
      }
    }
  } catch {
    /* noop */
  }

  return id;
}
/* =========================================================
   追加：削除系 API（ローカルストレージ＆LISTINGS 同期）
   ---------------------------------------------------------
   - isMine(id): 自分の募集かどうか判定
   - deleteListingById(id): 単一募集の削除
   - deleteAllMyListings(): 自分の募集を全削除
   ========================================================= */

const LS_KEY_MINE = "auth:mine";
const LS_KEY_FAVS = "auth:favs";
const LS_KEY_JOINED = "auth:joined";
const LS_KEY_LOGGED_IN = "auth:loggedIn"; // ★ 追加：ログインフラグ

export function isMine(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const mine: string[] = JSON.parse(localStorage.getItem(LS_KEY_MINE) || "[]");
    return Array.isArray(mine) && mine.includes(id);
  } catch {
    return false;
  }
}

// ★ 追加：ログイン中かどうか
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LS_KEY_LOGGED_IN) === "1";
  } catch {
    return false;
  }
}

export function deleteListingById(id: string): boolean {
  if (typeof window === "undefined") return false;

  // ★ 追加：未ログインは削除不可
  const loggedIn = localStorage.getItem("auth:loggedIn") === "1";
  if (!loggedIn) return false;

  // ★ 既存：他人の募集は削除不可
  if (!isMine(id)) return false;

  let changed = false;
  // （以降は既存のまま）

  // 1) localStorage(mock:listings:user) から削除
  const before = loadUserListings();
  const after = before.filter((l) => l.id !== id);
  if (after.length !== before.length) {
    saveUserListings(after);
    changed = true;
  }

  // 2) ランタイム配列 LISTINGS からも削除（即時UI反映）
  const i = LISTINGS.findIndex((l) => l.id === id);
  if (i >= 0) {
    LISTINGS.splice(i, 1);
    changed = true;
  }

  // 3) 付随キーの掃除（mine/favs/joined から該当IDを除去）
  try {
    let mine: string[] = JSON.parse(localStorage.getItem(LS_KEY_MINE) || "[]");
    if (Array.isArray(mine)) {
      mine = mine.filter((x) => x !== id);
      localStorage.setItem(LS_KEY_MINE, JSON.stringify(mine));
    }
    let favs: string[] = JSON.parse(localStorage.getItem(LS_KEY_FAVS) || "[]");
    if (Array.isArray(favs)) {
      favs = favs.filter((x) => x !== id);
      localStorage.setItem(LS_KEY_FAVS, JSON.stringify(favs));
    }
    let joined: string[] = JSON.parse(localStorage.getItem(LS_KEY_JOINED) || "[]");
    if (Array.isArray(joined)) {
      joined = joined.filter((x) => x !== id);
      localStorage.setItem(LS_KEY_JOINED, JSON.stringify(joined));
    }
  } catch {}

  return changed;
}

// UI が import している名前に合わせたエイリアス
export const deleteListing = deleteListingById;
export function deleteAllMyListings(): number {
  if (typeof window === "undefined") return 0;

  // 1) 自分のID一覧
  let mine: string[] = [];
  try {
    const raw = localStorage.getItem(LS_KEY_MINE) || "[]";
    const arr = JSON.parse(raw);
    mine = Array.isArray(arr) ? arr : [];
  } catch {
    mine = [];
  }
  if (mine.length === 0) return 0;

  const mineSet = new Set(mine);

  // 2) user listings から自分の募集を除去
  const before = loadUserListings();
  const after = before.filter((l) => !mineSet.has(l.id));
  const deletedCount = before.length - after.length;
  saveUserListings(after);

  // 3) LISTINGS からも除去（即時UI反映）
  for (let i = LISTINGS.length - 1; i >= 0; i--) {
    if (mineSet.has(LISTINGS[i].id)) LISTINGS.splice(i, 1);
  }

  // 4) 付随キーの掃除
  try {
    localStorage.setItem(LS_KEY_MINE, JSON.stringify([]));

    let favs: string[] = JSON.parse(localStorage.getItem(LS_KEY_FAVS) || "[]");
    if (Array.isArray(favs)) {
      favs = favs.filter((id) => !mineSet.has(id));
      localStorage.setItem(LS_KEY_FAVS, JSON.stringify(favs));
    }
    let joined: string[] = JSON.parse(localStorage.getItem(LS_KEY_JOINED) || "[]");
    if (Array.isArray(joined)) {
      joined = joined.filter((id) => !mineSet.has(id));
      localStorage.setItem(LS_KEY_JOINED, JSON.stringify(joined));
    }
  } catch {}

  return deletedCount;
}