// src/app/legal/page.tsx
export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h1>

      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          本サービス「Linkle」における特定商取引法に基づく表記は以下の通りです。
        </p>

        <div>
          <h2 className="font-semibold">販売事業者</h2>
          <p>Linkle運営事務局</p>
        </div>

        <div>
          <h2 className="font-semibold">所在地</h2>
          <p>東京都〇〇区〇〇1-2-3（ダミー住所）</p>
        </div>

        <div>
          <h2 className="font-semibold">連絡先</h2>
          <p>Email: support@example.com（ダミー）</p>
          <p>電話番号: 03-1234-5678（ダミー）</p>
        </div>

        <div>
          <h2 className="font-semibold">販売価格</h2>
          <p>
            各募集ページに表示された金額（現在は有料サービスなし／将来的に有料機能を提供する場合に記載）。
          </p>
        </div>

        <div>
          <h2 className="font-semibold">商品代金以外の必要料金</h2>
          <p>通信料（インターネット接続料金・パケット料金など）はお客様負担となります。</p>
        </div>

        <div>
          <h2 className="font-semibold">支払い方法</h2>
          <p>現時点では無料でご利用いただけます。有料機能提供時にはクレジットカード等に対応予定です。</p>
        </div>

        <div>
          <h2 className="font-semibold">返品・キャンセル</h2>
          <p>
            デジタルサービスの性質上、購入後の返金・キャンセルは原則不可となります。
          </p>
        </div>

        <div>
          <h2 className="font-semibold">サービス提供時期</h2>
          <p>ユーザー登録完了後、直ちに利用可能です。</p>
        </div>
      </div>
    </div>
  );
}