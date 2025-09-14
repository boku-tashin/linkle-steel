export default function GuidelinesPage() {
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">コミュニティガイドライン</h1>

        <section className="space-y-6 leading-7">
          <p>Linkleは、ユーザー同士が安心して交流できる場を目指します。</p>

          <div>
            <h2 className="font-semibold mb-2">1. 禁止事項</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>誹謗中傷や差別的発言</li>
              <li>アダルト・暴力・違法コンテンツ</li>
              <li>出会い系や金銭トラブルを目的とした投稿</li>
              <li>スパム、広告、勧誘</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">2. 推奨行動</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>相手を尊重し、丁寧なコミュニケーション</li>
              <li>不適切なコンテンツを見かけたら通報</li>
              <li>初めての人でも安心できる雰囲気づくり</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">3. 違反対応</h2>
            <p>
              違反が確認された場合、アカウント停止や投稿削除等の措置を行います。
            </p>
          </div>

          <p className="text-sm text-gray-500">制定日: 2025年8月30日</p>
        </section>
      </div>
    </main>
  );
}