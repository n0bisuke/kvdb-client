# kvdb-client

A simple Node.js client for KVdb.io. This is a third-party, unofficial SDK.

## Install

```bash
npm install kvdb-client
```

## Quick Start

### 1) Create a bucket

```js
import { KVdbClient } from "kvdb-client";

const email = process.env.KVDB_EMAIL; // your email

if (!email) {
  throw new Error("KVDB_EMAIL is required");
}

const bucket = await KVdbClient.createBucket(email);
console.log("bucket:", bucket);
```

You can create a bucket just by providing an email address.

### 2) Read & write data

```js
import { KVdbClient } from "kvdb-client";

const bucket = process.env.KVDB_BUCKET; // your bucket id
const token = process.env.KVDB_TOKEN; // optional

if (!bucket) {
  throw new Error("KVDB_BUCKET is required");
}

const kv = new KVdbClient({ bucket, token });

await kv.set("myName", "n0bisuke");
const name = await kv.get("myName");
console.log("myName:", name);

await kv.set("myData", { name: "test", value: 123 }, { json: true });
const data = await kv.get("myData", { parseJson: true });
console.log("myData:", data);

const keys = await kv.list();
console.log("keys:", keys);
```

### 3) Transaction (batch operations)

```js
import { KVdbClient } from "kvdb-client";

const bucket = process.env.KVDB_BUCKET;
const token = process.env.KVDB_TOKEN; // optional

if (!bucket) {
  throw new Error("KVDB_BUCKET is required");
}

const kv = new KVdbClient({ bucket, token });

await kv.transaction([
  { set: "users:email:new@example.com", value: "user 1" },
  { delete: "users:email:old@example.com" }
]);

console.log("transaction done");
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

## Related Article

- `https://qiita.com/n0bisuke/items/540478c314a09ee14ba9`

## Language

- English (this file)
- Japanese: `README.ja.md`
- Japanese (GitHub): `https://github.com/n0bisuke/kvdb-client/blob/main/README.ja.md`
