import { KVdbClient } from "../src/index.js";

const email = process.env.KVDB_EMAIL;

if (!email) {
  throw new Error("KVDB_EMAIL is required");
}

const bucket = await KVdbClient.createBucket(email);
console.log("bucket:", bucket);
