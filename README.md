# kvdb-client

A simple Node.js client for KVdb.io. This is a third-party, unofficial SDK.

## Install

```bash
npm install kvdb-client
```

## Quick Start

```js
import { KVdbClient } from "kvdb-client";

const kv = new KVdbClient({ bucket: "YOUR_BUCKET" });

await kv.set("myName", "n0bisuke");
const name = await kv.get("myName");
console.log(name);
```

## Authentication

```js
// Basic auth (default)
const basic = new KVdbClient({ bucket: "YOUR_BUCKET", token: "supersecret" });

// Bearer token
const bearer = new KVdbClient({
  bucket: "YOUR_BUCKET",
  token: "ACCESS_TOKEN",
  authType: "bearer"
});

// Query string token
const query = new KVdbClient({
  bucket: "YOUR_BUCKET",
  token: "ACCESS_TOKEN",
  authType: "query"
});
```

## Examples

See the `examples/` folder on GitHub for runnable scripts.

## Usage

### Create a bucket

```js
const bucket = await KVdbClient.createBucket("you@example.com");
```

### Set / Get values

```js
await kv.set("myName", "n0bisuke");
const name = await kv.get("myName");
```

### JSON values

```js
await kv.set("myData", { name: "test", value: 123 }, { json: true });
const data = await kv.get("myData", { parseJson: true });
```

### List keys

```js
const keys = await kv.list();
const items = await kv.list({ values: true, format: "json" });
```

### Update (PATCH)

```js
await kv.update("myName", "Sugawara");
```

### Counters

```js
await kv.increment("visits");
await kv.decrement("visits", 2);
```

### Transactions

```js
await kv.transaction([
  { set: "users:email:new@example.com", value: "user 1" },
  { delete: "users:email:old@example.com" }
]);
```

### Create access token

```js
const token = await kv.createAccessToken({
  prefix: "user:123:",
  permissions: "read,write",
  ttl: 3600
});
```

### Delete a key

```js
await kv.delete("myName");
```

### Delete a bucket

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

## Notes

- KVdb buckets can be public; avoid storing sensitive data.
- `token` for Basic auth is sent as `curl -u 'token:'`.
- The SDK author (n0bisuke) has no knowledge of how data stored in KVdb is handled; use at your own risk. The author is not responsible for any issues or damages.

## Language

- English (this file)
- Japanese: `README.ja.md`
