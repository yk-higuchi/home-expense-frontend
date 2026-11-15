# home-expense-frontend（アプリ）

家計の収入と支出を管理する画面（Next.js）。画面の部品は `packages/ui`（`@home-expense/ui`）にある。

## 開発

```sh
BACKEND_URL=http://localhost:8080 pnpm dev   # http://localhost:3000
pnpm lint                                     # Biome・Stylelint・型チェック
```

API はサーバー側（Server Components・Server Actions）からだけ呼び出す。`BACKEND_URL` はブラウザには渡らない。

## API のスキーマ（JTD）

API のリクエスト・レスポンスの JTD スキーマは、バックエンドが OpenAPI から生成した `openapi.jtd.json` を取り込んだもの（`src/lib/api/generated/jtd.ts`）を使う。手で書かない。

- 使うバックエンドの版は `api-version` に書く。
- `pnpm gen:api` で取得して `jtd.ts` を作り直し、コミットする。
- バックエンドの Release（v2.1.0〜）ができるまでは、手元のバックエンドのファイルから作る。

  ```sh
  API_JTD_SOURCE=../../home-expense-backend/docs/openapi.jtd.json pnpm gen:api
  ```

- CI で「`pnpm gen:api` の結果がコミット済みのファイルと同じか」を確かめる検査は、Release から取得できるようになってから入れる。
