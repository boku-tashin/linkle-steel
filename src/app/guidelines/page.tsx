// src/app/guidelines/page.tsx
export default function GuidelinesPage() {
  return (
    <main className="prose mx-auto px-4 py-10">
      <h1>コミュニティガイドライン</h1>
      <p>Linkleは、ユーザー同士が安心して交流できる場を目指します。</p>

      <h2>1. 禁止事項</h2>
      <ul>
        <li>誹謗中傷や差別的発言</li>
        <li>アダルト・暴力・違法コンテンツ</li>
        <li>出会い系や金銭トラブルを目的とした投稿</li>
        <li>スパム・広告・勧誘</li>
      </ul>

      <h2>2. 推奨行動</h2>
      <ul>
        <li>相手を尊重し、丁寧なコミュニケーション</li>
        <li>不適切なコンテンツを見かけたら通報</li>
        <li>初めての人でも安心できる雰囲気づくり</li>
      </ul>

      <h2>3. 違反対応</h2>
      <p>違反が確認された場合、アカウント停止や投稿削除等の措置を行います。</p>

      <p className="mt-10 text-sm text-gray-500">制定日: 2025年8月30日</p>
    </main>
  );
}