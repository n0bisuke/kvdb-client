# kvdb-client

KVdb.io 用のシンプルな Node.js クライアントです。

## インストール

```bash
npm install kvdb-client
```

## クイックスタート

```js
import { KVdbClient } from "kvdb-client";

const kv = new KVdbClient({ bucket: "YOUR_BUCKET" });

await kv.set("myName", "n0bisuke");
const name = await kv.get("myName");
console.log(name);
```

## 認証

```js
// Basic 認証（デフォルト）
const basic = new KVdbClient({ bucket: "YOUR_BUCKET", token: "supersecret" });

// Bearer トークン
const bearer = new KVdbClient({
  bucket: "YOUR_BUCKET",
  token: "ACCESS_TOKEN",
  authType: "bearer"
});

// クエリ文字列でトークン指定
const query = new KVdbClient({
  bucket: "YOUR_BUCKET",
  token: "ACCESS_TOKEN",
  authType: "query"
});
```

## サンプル

実行可能なスクリプトは GitHub の `examples/` フォルダを参照してください。

## 使い方

### バケット作成

```js
const bucket = await KVdbClient.createBucket("you@example.com");
```

### 値の保存・取得

```js
await kv.set("myName", "n0bisuke");
const name = await kv.get("myName");
```

### JSON の保存・取得

```js
await kv.set("myData", { name: "test", value: 123 }, { json: true });
const data = await kv.get("myData", { parseJson: true });
```

### キー一覧

```js
const keys = await kv.list();
const items = await kv.list({ values: true, format: "json" });
```

### 更新（PATCH）

```js
await kv.update("myName", "Sugawara");
```

### カウンター操作

```js
await kv.increment("visits");
await kv.decrement("visits", 2);
```

### トランザクション

```js
await kv.transaction([
  { set: "users:email:new@example.com", value: "user 1" },
  { delete: "users:email:old@example.com" }
]);
```

### アクセストークン作成

```js
const token = await kv.createAccessToken({
  prefix: "user:123:",
  permissions: "read,write",
  ttl: 3600
});
```

### キー削除

```js
await kv.delete("myName");
```

### バケット削除

```js
await kv.deleteBucket();
```

## API

- `new KVdbClient({ bucket, token?, authType?, baseUrl? })`
- `KVdbClient.createBucket(email, { baseUrl?, secretKey?, writeKey?, readKey?, signingKey?, defaultTtl? })`
- `get(key, { parseJson? })`
- `set(key, value, { json?, contentType?, ttl? })`
- `update(key, value, { json?, contentType?, ttl? })`
- `increment(key, amount?, { ttl? })`
- `decrement(key, amount?, { ttl? })`
- `delete(key)`
- `list({ values?, format?, limit?, skip?, prefix?, reverse? })`
- `transaction(operations)`
- `createAccessToken({ prefix?, permissions?, ttl? })`
- `updateBucketPolicy({ secretKey?, writeKey?, readKey?, signingKey?, defaultTtl? })`
- `deleteBucket()`

## 注意

- KVdb は公開される可能性があるため、重要な情報は保存しないでください。
- `token` は `curl -u 'token:'` と同じ形式で送信されます。
- KVdb に保存した情報がどのように扱われるかについて、SDK 開発者（n0bisuke）は一切把握していません。利用は自己責任とし、トラブル等について開発者は責任を負いません。

## Language

- English: `README.md`
- Japanese (this file)
