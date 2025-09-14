export default function PrivacyPage() {
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

        <section className="space-y-6 leading-7">
          <p>
            Linkle運営事務局（以下「当事務局」といいます）は、ユーザーの個人情報を適切に取り扱います。
          </p>

          <div>
            <h2 className="font-semibold mb-2">1. 収集する情報</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ユーザーが入力する情報（ニックネーム、メールアドレスなど任意のもの）</li>
              <li>Cookie 等を利用したアクセスログ</li>
              <li>Google Analytics によるアクセス解析</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">2. 利用目的</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>サービス提供・改善</li>
              <li>お問い合わせ対応</li>
              <li>不正利用防止</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">3. 第三者提供</h2>
            <p>法令に基づく場合を除き、同意なく第三者に個人情報を提供しません。</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">4. お問い合わせ</h2>
            <p>本ポリシーに関するお問い合わせは、Linkle運営事務局までお願いいたします。</p>
          </div>

          <p className="text-sm text-gray-500">制定日: 2025年8月30日</p>
        </section>
      </div>
    </main>
  );
}