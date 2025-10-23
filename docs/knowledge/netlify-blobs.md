# Netlify Blobs – Engineering Guidelines (Local & Netlify)

> Purpose: give our team a single, durable playbook for using Netlify Blobs across local dev, CI, and production deploys. Opinionated where it helps; lightweight where it shouldn’t matter.

---

## 1) Quick Primer

**What Blobs is:** a simple object/kv store integrated with Netlify. Great for binary assets and small JSON/state. Not a relational DB.

**Typical use cases:** user uploads, generated thumbnails, cached API responses, feature flags, ephemeral state.

**Two common scopes:**

* **Site store** – persistent across deploys.
* **Deploy store** – namespaced to a deploy (good for immutable snapshots/caching).

---

## 2) Project Setup

```bash
# install once per repo
npm i @netlify/blobs

# ensure the site is linked locally
netlify link

# local dev server (function/edge emulation)
netlify dev
```

**Minimal usage (Node/TypeScript):**

```ts
import { getStore } from "@netlify/blobs";

export async function putGreeting(userId: string) {
  const store = getStore("greetings");
  await store.set(`user:${userId}`, JSON.stringify({ msg: "hello" }));
}

export async function getGreeting(userId: string) {
  const store = getStore("greetings");
  const raw = await store.get(`user:${userId}`);
  return raw ? JSON.parse(raw) : null;
}
```

---

## 3) Local Development

### 3.1 Running locally

* Use `netlify dev` to emulate functions/edge handlers and interact with a local Blobs sandbox.
* Keep expectations realistic: local == convenient sandbox, **not** a mirror of production data/latency.

### 3.2 Recommended abstraction

Wrap the blobs client so we can swap in a mock (memory or local-fs) during tests or if local emulation has limits.

```ts
// src/storage/index.ts
export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string | ArrayBuffer | Uint8Array): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// Netlify implementation
import { getStore } from "@netlify/blobs";
export function netlifyKV(storeName: string): KV {
  const store = getStore(storeName);
  return {
    async get(key) { return store.get(key); },
    async set(key, value) { await store.set(key, value as any); },
    async del(key) { await store.delete(key); },
    async list(prefix = "") {
      const { blobs } = await store.list({ prefix });
      return blobs.map(b => b.key);
    }
  };
}

// In-memory fallback
export function memoryKV(): KV {
  const m = new Map<string, string>();
  return {
    async get(k) { return m.get(k) ?? null; },
    async set(k, v) { m.set(k, typeof v === "string" ? v : Buffer.from(v as any).toString("base64")); },
    async del(k) { m.delete(k); },
    async list(prefix = "") { return [...m.keys()].filter(k => k.startsWith(prefix)); }
  };
}
```

Usage:

```ts
import { netlifyKV, memoryKV } from "./storage";

const isLocal = process.env.NODE_ENV !== "production";
export const kv = isLocal ? memoryKV() : netlifyKV("app-store");
```

### 3.3 Local data hygiene

* Assume local blob data is **ephemeral**. Don’t rely on it between runs.
* If a teammate needs seeded data, provide a seed script (see §8).

---

## 4) Environments & Configuration

| Env        | How we run              | Store                    | Notes                                                  |
| ---------- | ----------------------- | ------------------------ | ------------------------------------------------------ |
| Local dev  | `netlify dev`           | **mock or real**         | Prefer mock for unit tests; real for manual e2e checks |
| CI         | `netlify build` / tests | **mock**                 | Deterministic tests; no side effects                   |
| Preview    | Netlify Deploy Preview  | **site or deploy store** | Good for QA; namespace with a preview prefix           |
| Production | Netlify Prod            | **site store**           | Set retention/backups/alerts                           |

**Env toggles:**

* `NODE_ENV` (`development`, `test`, `production`)
* Optional: `BLOBS_STORE_NAME`, `BLOBS_PREFIX` (for multi-tenant or per-branch scoping)

---

## 5) Key Design & Namespacing

Treat keys like file paths:

* Use clear prefixes: `user:{id}:profile.json`, `asset:avatars:{id}.png`
* Avoid deep nesting that’s hard to list; be deliberate with `:` or `/` separators
* Reserve a short set of **top-level prefixes** per domain: `user:`, `session:`, `cache:`, `flag:`, `upload:`
* If multi-tenant, prefix by tenant/org: `org:{orgId}:...`

**Checklist:**

* [ ] Stable, URL-safe charset
* [ ] No PII in keys (values are ok if encrypted)
* [ ] Predictable listing strategy (prefix-based)

---

## 6) Data Formats & Limits

* Prefer **JSON** for small structured state; store **binary** as raw bytes.
* Keep individual objects small where possible (a few MB or less). For larger media, keep originals in durable storage (e.g., external asset pipeline) and use Blobs for metadata/derivatives.
* Compress where helpful; don’t pre-optimize prematurely.

---

## 7) Common Operations (Patterns)

### 7.1 JSON state

```ts
async function setJSON(kv: KV, key: string, value: unknown) {
  await kv.set(key, JSON.stringify(value));
}
async function getJSON<T>(kv: KV, key: string): Promise<T | null> {
  const raw = await kv.get(key);
  return raw ? JSON.parse(raw) as T : null;
}
```

### 7.2 Binary uploads (from an HTTP handler)

```ts
export async function POST(req: Request) {
  const buf = new Uint8Array(await req.arrayBuffer());
  const key = `upload:${crypto.randomUUID()}`;
  await kv.set(key, buf);
  return new Response(JSON.stringify({ key }), { status: 201 });
}
```

### 7.3 Listing with a prefix

```ts
const keys = await kv.list("upload:");
```

### 7.4 Soft delete pattern

* Write a tombstone: `deleted:{key}` with metadata (who/when/why)
* Defer physical deletion to a scheduled job (see §11)

---

## 8) Seeding, Export, Migration

**Seed script (local only):**

```ts
// scripts/seed.ts
import { kv } from "../src/kv";
await setJSON(kv, "flag:new-homepage", { enabled: true, by: "seed" });
console.log("Seeded");
```

**Export:** iterate `list()` and stream objects to NDJSON or tar. Keep an **idempotent** importer.

**Migration:**

* Write a backfill job that copies keys to new prefixes
* Dual-read (read new, fallback old) for one deploy
* Cut over writers, then drop fallback

---

## 9) Testing Strategy

* **Unit tests:** use `memoryKV()` to avoid I/O flakiness.
* **Contract tests:** against `netlify dev` once per CI run (optional, behind a flag) to catch integration issues.
* **E2E:** smoke tests in Preview deploys that write/read a test key with a throwaway prefix.

Mocha/Vitest snippet:

```ts
import { describe, it, expect } from "vitest";
import { memoryKV } from "../src/storage";

describe("storage", () => {
  it("round-trips JSON", async () => {
    const kv = memoryKV();
    await kv.set("a", JSON.stringify({ n: 1 }));
    const got = await kv.get("a");
    expect(got && JSON.parse(got).n).toBe(1);
  });
});
```

---

## 10) Security & Compliance

* **Never** store secrets or credentials in Blobs.
* Treat any user-uploaded content as untrusted; validate and scan as needed.
* Encrypt sensitive values at rest (application-level where required).
* Avoid PII in keys and URLs.
* Set strict CORS and only expose signed/authorized download endpoints when serving user-specific data.

---

## 11) Operations & Lifecycle

* **Retention policy:** define per prefix (e.g., `cache:` 7 days, `upload:` 180 days)
* **Scheduled maintenance jobs:**

  * GC tombstones and expired caches
  * Compact or re-derive thumbnails
* **Backups:** export critical prefixes on a cadence (e.g., daily snapshot to external storage)

---

## 12) Observability

* Wrap all storage calls with a small helper that logs:

  * operation (`get/set/delete/list`), key prefix, duration, size
  * error category (timeout, not found, validation)
* Emit metrics and alerts: error rate by prefix, P95 latency of `get`/`set`.

---

## 13) CI/CD Integration

* Block merges if tests that touch storage abstractions fail.
* On deploy previews:

  * Use an **isolated prefix** (e.g., `pr:{number}:*`) to avoid polluting prod data.
  * Auto-clean preview data on close/merge.
* On production deploy:

  * Run migrations/backfills as separate, retryable steps.

---

## 14) Performance Notes

* Batch small writes when possible; coalesce frequent updates to a single key.
* Cache hot reads at the application layer (short TTL).
* Prefer listing by **short, purposeful prefixes** to keep scans fast.

---

## 15) Troubleshooting Playbook

**Symptom → Check → Fix**

* *Writes succeed locally, nothing in prod*
  → Are you using the mock locally? Are env toggles correct?
  → Ensure prod uses `netlifyKV("store")` and not `memoryKV()`.

* *403/Unauthorized*
  → Is the site linked (`netlify link`)? Are functions running in Netlify context?
  → Re-link or run under `netlify dev`.

* *`list()` returns fewer keys than expected*
  → Are your prefixes too deep or inconsistent?
  → Normalize key schema and re-migrate.

* *Binary looks corrupted*
  → Are you double-encoding? For binary, pass `Uint8Array|ArrayBuffer`; only base64 if you mean to.

* *Local behavior ≠ prod*
  → That’s expected; prefer contract/E2E tests and an abstraction layer.

---

## 16) Design FAQ

**Q: Should we use site store or deploy store?**

* Use **site** for app data that must persist across deploys. Use **deploy** for immutable build artifacts or caching tied to a build.

**Q: How big can objects be?**

* Keep individual objects reasonably small and split large data into chunks if needed.

**Q: Can we CDN-serve blobs?**

* Serve through your app with auth, or publish selected public assets behind routes. Avoid exposing raw keys unless intended to be public.

**Q: Do we need a database as well?**

* Use Blobs for objects/kv; pair with a DB if you need queries, relations, joins, or transactional semantics.

---

## 17) Adoption Checklist (per feature)

* [ ] Keys/prefixes designed and reviewed
* [ ] Storage client behind abstraction
* [ ] Unit tests with `memoryKV`
* [ ] E2E smoke for preview deploy
* [ ] Retention/backup policy defined
* [ ] Observability (logs/metrics) added
* [ ] Security review (PII/secrets)
* [ ] Runbook entry in §15 updated

---

## 18) Appendix – Example Netlify Function

```ts
// netlify/functions/upload.ts
import type { Handler } from "@netlify/functions";
import { netlifyKV } from "../../src/storage";

const kv = netlifyKV("uploads");

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const body = event.isBase64Encoded ? Buffer.from(event.body!, "base64") : Buffer.from(event.body!);
  const key = `upload:${crypto.randomUUID()}`;
  await kv.set(key, body);
  return { statusCode: 201, body: JSON.stringify({ key }) };
};
```

---

### Final Notes

* Treat local as a **simulation**; rely on mocks + preview tests to catch edge cases.
* Keep keys clean, prefixes intentional, and operations observable.
* When in doubt: wrap, test, and measure.
