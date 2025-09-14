export default function TermsPage() {
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">利用規約</h1>

        <section className="space-y-6 leading-7">
          <p>
            本利用規約（以下「本規約」といいます）は、Linkle運営事務局（以下「当事務局」といいます）が提供する
            「Linkle」（以下「本サービス」といいます）の利用条件を定めるものです。
          </p>

          <div>
            <h2 className="font-semibold mb-2">第1条（適用）</h2>
            <p>
              本規約は、本サービスの利用に関する一切に適用されます。当事務局は、本規約のほか、利用にあたりルール・
              ガイドライン等を定める場合があります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">第2条（利用登録）</h2>
            <p>
              ユーザーは、本規約に同意の上、当事務局の定める方法により利用登録を行うことができます。
              未成年の方は、必ず保護者の同意を得てご利用ください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">第3条（禁止事項）</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>誹謗中傷・差別・迷惑行為</li>
              <li>出会い系や金銭のやり取りを主目的とする行為</li>
              <li>その他、当事務局が不適切と判断する行為</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">第4条（免責事項）</h2>
            <p>
              本サービスにおけるユーザー間のトラブルについて、当事務局は一切の責任を負いません。
              また、サービスの中断・停止により生じたいかなる損害についても責任を負いません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">第5条（規約の変更）</h2>
            <p>
              当事務局は、必要と判断した場合、ユーザーへの通知なく本規約を変更することができます。
            </p>
          </div>

          <p className="text-sm text-gray-500">制定日: 2025年8月30日</p>
        </section>
      </div>
    </main>
  );
}