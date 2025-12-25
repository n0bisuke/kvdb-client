import { KVdbClient } from "../src/index.js";

const bucket = process.env.KVDB_BUCKET;
const token = process.env.KVDB_TOKEN;

if (!bucket) {
  throw new Error("KVDB_BUCKET is required");
}

const kv = new KVdbClient({ bucket, token });

const visits = await kv.increment("visits");
console.log("visits:", visits);

const visitsAfter = await kv.decrement("visits", 2);
console.log("visits after decrement:", visitsAfter);
