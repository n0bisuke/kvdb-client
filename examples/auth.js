import { KVdbClient } from "../src/index.js";

const bucket = process.env.KVDB_BUCKET;
const token = process.env.KVDB_TOKEN;

if (!bucket || !token) {
  throw new Error("KVDB_BUCKET and KVDB_TOKEN are required");
}

const basic = new KVdbClient({ bucket, token, authType: "basic" });
const bearer = new KVdbClient({ bucket, token, authType: "bearer" });
const query = new KVdbClient({ bucket, token, authType: "query" });

console.log("basic:", await basic.get("myName"));
console.log("bearer:", await bearer.get("myName"));
console.log("query:", await query.get("myName"));
