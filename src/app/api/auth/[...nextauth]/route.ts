// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import { type JWT } from "next-auth/jwt";

// --- 必須ENVの存在チェック（ログ出力のみ）
const requiredEnv = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
] as const;

for (const k of requiredEnv) {
  if (!process.env[k]) {
    console.error(`[auth] Missing env: ${k}`);
  }
}

// ルート外へ export しないこと！
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account, profile }) {
      // provider を保持
      const t = token as JWT & { provider?: string; picture?: string | null };
      if (account) t.provider = account.provider;

      if (profile && typeof profile === "object") {
        const p = profile as Record<string, unknown>;
        if (!t.name && typeof p.name === "string") t.name = p.name;
        if (!t.name && typeof (p as { screen_name?: string }).screen_name === "string") {
          t.name = (p as { screen_name: string }).screen_name;
        }
        if (!t.picture && typeof (p as { picture?: string }).picture === "string") {
          t.picture = (p as { picture: string }).picture;
        }
        if (!t.picture && typeof (p as { avatar_url?: string }).avatar_url === "string") {
          t.picture = (p as { avatar_url: string }).avatar_url;
        }
        if (!t.picture && typeof (p as { profile_image_url?: string }).profile_image_url === "string") {
          t.picture = (p as { profile_image_url: string }).profile_image_url;
        }
      }
      return t;
    },

    async session({ session, token }) {
      type ExtendedSession = Session & {
        provider?: string;
        user: NonNullable<Session["user"]> & { id?: string | null };
      };

      const s = session as ExtendedSession;

      if (s.user) {
        s.user.id = token.sub ?? null;
        if (!s.user.name && typeof token.name === "string") s.user.name = token.name;
        const pic = (token as JWT & { picture?: string | null }).picture;
        if (!s.user.image && typeof pic === "string") s.user.image = pic;
      }

      s.provider = (token as JWT & { provider?: string }).provider;
      return s;
    },
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };