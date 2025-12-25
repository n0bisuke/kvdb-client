const DEFAULT_BASE_URL = "https://kvdb.io";

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/$/, "");
}

function normalizeKey(key) {
  if (typeof key !== "string" || key.trim() === "") {
    throw new TypeError("key must be a non-empty string");
  }
  return key.replace(/^\/+/, "");
}

function buildAuthHeaders(authType, token) {
  if (!token) return {};
  if (authType === "bearer") {
    return { Authorization: `Bearer ${token}` };
  }
  if (authType === "basic") {
    const encoded = Buffer.from(`${token}:`, "utf8").toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

function appendAccessToken(url, authType, token) {
  if (!token || authType !== "query") return url;
  const hasQuery = url.includes("?");
  const separator = hasQuery ? "&" : "?";
  return `${url}${separator}access_token=${encodeURIComponent(token)}`;
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

async function throwIfNotOk(response) {
  if (response.ok) return response;
  const body = await response.text();
  const error = new Error(`KVdb request failed: ${response.status} ${response.statusText}`);
  error.status = response.status;
  error.body = body;
  throw error;
}

export class KVdbClient {
  constructor({ bucket, token, authType = "basic", baseUrl = DEFAULT_BASE_URL } = {}) {
    if (!bucket) throw new TypeError("bucket is required");
    this.bucket = bucket;
    this.token = token;
    this.authType = authType;
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  static async createBucket(email, {
    baseUrl = DEFAULT_BASE_URL,
    secretKey,
    writeKey,
    readKey,
    signingKey,
    defaultTtl
  } = {}) {
    if (!email) throw new TypeError("email is required");
    const body = new URLSearchParams({ email });
    if (secretKey) body.set("secret_key", secretKey);
    if (writeKey) body.set("write_key", writeKey);
    if (readKey) body.set("read_key", readKey);
    if (signingKey) body.set("signing_key", signingKey);
    if (typeof defaultTtl === "number") body.set("default_ttl", String(defaultTtl));
    const response = await fetch(normalizeBaseUrl(baseUrl), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });
    await throwIfNotOk(response);
    return response.text();
  }

  _urlForKey(key, query = "") {
    const safeKey = normalizeKey(key);
    const suffix = query ? `?${query}` : "";
    return `${this.baseUrl}/${this.bucket}/${safeKey}${suffix}`;
  }

  _urlForBucket(query = "") {
    const suffix = query ? `?${query}` : "";
    return `${this.baseUrl}/${this.bucket}${suffix}`;
  }

  _urlForBucketList(query = "") {
    const suffix = query ? `/?${query}` : "/";
    return `${this.baseUrl}/${this.bucket}${suffix}`;
  }

  _buildUrl(url) {
    return appendAccessToken(url, this.authType, this.token);
  }

  _authHeaders() {
    return buildAuthHeaders(this.authType, this.token);
  }

  async _request({ method, url, headers, body }) {
    const response = await fetch(this._buildUrl(url), {
      method,
      headers: {
        ...headers,
        ...this._authHeaders()
      },
      body
    });
    await throwIfNotOk(response);
    return readResponseBody(response);
  }

  async get(key, { parseJson } = {}) {
    const body = await this._request({
      method: "GET",
      url: this._urlForKey(key)
    });
    if (parseJson && typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  async set(key, value, { json, contentType, ttl } = {}) {
    const { body, headers } = this._serializeValue(value, { json, contentType });
    const query = typeof ttl === "number" ? `ttl=${ttl}` : "";
    return this._request({
      method: "POST",
      url: this._urlForKey(key, query),
      headers,
      body
    });
  }

  async update(key, value, { json, contentType, ttl } = {}) {
    const { body, headers } = this._serializeValue(value, { json, contentType });
    const query = typeof ttl === "number" ? `ttl=${ttl}` : "";
    return this._request({
      method: "PATCH",
      url: this._urlForKey(key, query),
      headers,
      body
    });
  }

  async increment(key, amount = 1, { ttl } = {}) {
    if (typeof amount !== "number") throw new TypeError("amount must be a number");
    const sign = amount >= 0 ? "+" : "";
    const query = typeof ttl === "number" ? `ttl=${ttl}` : "";
    return this._request({
      method: "PATCH",
      url: this._urlForKey(key, query),
      headers: { "content-type": "text/plain" },
      body: `${sign}${amount}`
    });
  }

  async decrement(key, amount = 1, { ttl } = {}) {
    return this.increment(key, -Math.abs(amount), { ttl });
  }

  async delete(key) {
    return this._request({
      method: "DELETE",
      url: this._urlForKey(key)
    });
  }

  async list({
    values = false,
    format = "json",
    limit,
    skip,
    prefix,
    reverse
  } = {}) {
    const query = new URLSearchParams();
    if (values) query.set("values", "true");
    if (format) query.set("format", format);
    if (typeof limit === "number") query.set("limit", String(limit));
    if (typeof skip === "number") query.set("skip", String(skip));
    if (prefix) query.set("prefix", prefix);
    if (reverse) query.set("reverse", "true");
    const body = await this._request({
      method: "GET",
      url: this._urlForBucketList(query.toString())
    });
    if (format === "json" && typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  async transaction(operations) {
    if (!Array.isArray(operations)) throw new TypeError("operations must be an array");
    const body = JSON.stringify({ txn: operations });
    return this._request({
      method: "POST",
      url: this._urlForBucket(),
      headers: { "content-type": "application/json" },
      body
    });
  }

  async createAccessToken({ prefix, permissions, ttl } = {}) {
    const body = new URLSearchParams();
    if (prefix) body.set("prefix", prefix);
    if (permissions) body.set("permissions", permissions);
    if (typeof ttl === "number") body.set("ttl", String(ttl));
    return this._request({
      method: "POST",
      url: `${this.baseUrl}/${this.bucket}/tokens/`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });
  }

  async updateBucketPolicy({ secretKey, writeKey, readKey, signingKey, defaultTtl } = {}) {
    const body = new URLSearchParams();
    if (secretKey) body.set("secret_key", secretKey);
    if (writeKey) body.set("write_key", writeKey);
    if (readKey) body.set("read_key", readKey);
    if (signingKey) body.set("signing_key", signingKey);
    if (typeof defaultTtl === "number") body.set("default_ttl", String(defaultTtl));
    return this._request({
      method: "PATCH",
      url: this._urlForBucket(),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });
  }

  async deleteBucket() {
    return this._request({
      method: "DELETE",
      url: `${this.baseUrl}/${this.bucket}/`
    });
  }

  _serializeValue(value, { json, contentType } = {}) {
    const headers = {};
    if (contentType) headers["content-type"] = contentType;
    if (json || value instanceof Object && !(value instanceof Buffer) && !(value instanceof ArrayBuffer) && !(value instanceof Uint8Array)) {
      headers["content-type"] = headers["content-type"] || "application/json";
      return { body: JSON.stringify(value), headers };
    }
    return { body: typeof value === "string" ? value : String(value), headers };
  }
}

export default KVdbClient;
