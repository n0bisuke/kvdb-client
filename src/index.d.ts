export type KVdbClientOptions = {
  bucket: string;
  token?: string;
  authType?: "basic" | "bearer" | "query";
  baseUrl?: string;
};

export type CreateBucketOptions = {
  baseUrl?: string;
  secretKey?: string;
  writeKey?: string;
  readKey?: string;
  signingKey?: string;
  defaultTtl?: number;
};

export type GetOptions = {
  parseJson?: boolean;
};

export type SetOptions = {
  json?: boolean;
  contentType?: string;
  ttl?: number;
};

export type ListOptions = {
  values?: boolean;
  format?: string;
  limit?: number;
  skip?: number;
  prefix?: string;
  reverse?: boolean;
};

export type TransactionOperation =
  | { set: string; value: unknown; ttl?: number }
  | { delete: string };

export type AccessTokenOptions = {
  prefix?: string;
  permissions?: string;
  ttl?: number;
};

export type UpdateBucketPolicyOptions = {
  secretKey?: string;
  writeKey?: string;
  readKey?: string;
  signingKey?: string;
  defaultTtl?: number;
};

export declare class KVdbClient {
  constructor(options: KVdbClientOptions);
  static createBucket(email: string, options?: CreateBucketOptions): Promise<string>;
  get(key: string, options?: GetOptions): Promise<unknown>;
  set(key: string, value: unknown, options?: SetOptions): Promise<unknown>;
  update(key: string, value: unknown, options?: SetOptions): Promise<unknown>;
  increment(key: string, amount?: number, options?: { ttl?: number }): Promise<unknown>;
  decrement(key: string, amount?: number, options?: { ttl?: number }): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  list(options?: ListOptions): Promise<unknown>;
  transaction(operations: TransactionOperation[]): Promise<unknown>;
  createAccessToken(options?: AccessTokenOptions): Promise<unknown>;
  updateBucketPolicy(options?: UpdateBucketPolicyOptions): Promise<unknown>;
  deleteBucket(): Promise<unknown>;
}

export default KVdbClient;
