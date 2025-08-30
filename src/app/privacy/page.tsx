// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="prose mx-auto px-4 py-10">
      <h1>プライバシーポリシー</h1>
      <p>Linkle運営事務局（以下「当事務局」といいます）は、ユーザーの個人情報を適切に取り扱います。</p>

      <h2>1. 収集する情報</h2>
      <ul>
        <li>ユーザーが入力する情報（ニックネーム、メールアドレスなど任意のもの）</li>
        <li>Cookie等を利用したアクセスログ</li>
        <li>Google Analyticsによるアクセス解析</li>
      </ul>

      <h2>2. 利用目的</h2>
      <ul>
        <li>サービス提供・改善</li>
        <li>お問い合わせ対応</li>
        <li>不正利用防止</li>
      </ul>

      <h2>3. 第三者提供</h2>
      <p>法令に基づく場合を除き、同意なく第三者に個人情報を提供しません。</p>

      <h2>4. お問い合わせ</h2>
      <p>本ポリシーに関するお問い合わせは、Linkle運営事務局までお願いいたします。</p>

      <p className="mt-10 text-sm text-gray-500">制定日: 2025年8月30日</p>
    </main>
  );
}