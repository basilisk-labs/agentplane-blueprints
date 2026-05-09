import { sign } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const privateKey = process.env.BLUEPRINTS_INDEX_SIGNING_PRIVATE_KEY;
const keyId = process.env.BLUEPRINTS_INDEX_SIGNING_KEY_ID;

if (!privateKey || !keyId) {
  console.error("Set BLUEPRINTS_INDEX_SIGNING_PRIVATE_KEY and BLUEPRINTS_INDEX_SIGNING_KEY_ID.");
  process.exit(1);
}

const indexText = await readFile("index.json", "utf8");
const envelope = {
  schema_version: 1,
  key_id: keyId,
  algorithm: "ed25519",
  signature: sign(null, Buffer.from(indexText, "utf8"), privateKey).toString("base64"),
};
await writeFile("index.json.sig", `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
console.log(`Wrote index.json.sig with key_id=${keyId}.`);
