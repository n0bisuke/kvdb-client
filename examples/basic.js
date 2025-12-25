import { KVdbClient } from "../src/index.js";

const bucket = process.env.KVDB_BUCKET;
const token = process.env.KVDB_TOKEN;

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
