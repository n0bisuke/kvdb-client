import { KVdbClient } from "../src/index.js";

const bucket = process.env.KVDB_BUCKET;
const token = process.env.KVDB_TOKEN;

if (!bucket) {
  throw new Error("KVDB_BUCKET is required");
}

const kv = new KVdbClient({ bucket, token });

await kv.transaction([
  { set: "users:email:new@example.com", value: "user 1" },
  { delete: "users:email:old@example.com" }
]);

console.log("transaction done");
