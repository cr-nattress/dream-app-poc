Application Logging to Netlify Blobs — Guidelines

TL;DR: Write structured logs (NDJSON) to a Blobs namespace from Functions/Edge, partition by time, auto-flush in small batches, and never log secrets. Future-you will thank past-you.

1) Why Blobs for Logs?

Serverless-friendly: Write from Netlify Functions and Edge Functions without managing infra.

Durable + cheap-ish: Object storage semantics; good for append-style logging.

Queryable later: Store as newline-delimited JSON (NDJSON) so you can stream/ingest to analytics when needed.

Local dev works: netlify dev emulates Blobs, so your logger behaves consistently.

2) High-level Design

Write path (production & preview):

Use a single namespace per site/app, e.g. app-logs.

Partition keys by date/hour:
logs/YYYY/MM/DD/HH/<service>-<region>-<deployId>-<timestamp>-<uuid>.ndjson

Batch within an invocation (10–100 records), flush on exit.

NDJSON lines with a stable schema (see §4).

Read path:

Ad-hoc debugging: list + fetch blobs by prefix.

Scheduled compaction/export: daily job reads previous day’s prefix and pushes to S3/BigQuery/etc. (optional).

3) Minimal Setup
Install
npm i @netlify/blobs uuid

Environment

No extra env vars required for server-side writes in Functions/Edge.

(Optional) LOG_LEVEL, LOG_NAMESPACE to control behavior across envs.

4) Log Schema (recommendation)

Use fields that make correlation and filtering painless:

{
  "ts": "2025-10-23T13:37:21.123Z",
  "level": "info",
  "msg": "user signed in",
  "app": "your-app",
  "service": "api",
  "env": "prod|preview|dev",
  "deployId": "Dpl_abc123",
  "requestId": "req_xxx",
  "traceId": "trc_xxx",
  "userId": "u_123 (hashed)",
  "route": "/v1/login",
  "method": "POST",
  "status": 200,
  "latencyMs": 87,
  "ip": "anonymized",
  "region": "us-east-1",
  "extra": { "provider": "password" }
}


Rules

ISO timestamp in UTC.

No secrets/PII; hash or drop. IPs → /24 truncation or hash.

Put unstructured stuff in extra to keep the top-level flat & stable.

5) Reference Logger (Node/Edge-friendly)

Create a tiny util you can reuse everywhere.

/lib/blob-logger.ts

import { createBlob, list, get, type ListBlobResult } from "@netlify/blobs";
import { randomUUID } from "crypto";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogRecord = Record<string, unknown>;

interface LoggerOptions {
  app?: string;
  service?: string;
  env?: "prod" | "preview" | "dev";
  namespace?: string; // defaults to "app-logs"
  maxBatchSize?: number; // lines before flush
  flushOnError?: boolean;
}

export class BlobLogger {
  private buffer: string[] = [];
  private readonly ns: string;
  private readonly maxBatch: number;
  private readonly common: Record<string, string | undefined>;
  private readonly deployId = process.env.DEPLOY_ID || process.env.DEPLOY_ID ?? process.env.NETLIFY_DEPLOY_ID;

  constructor(opts: LoggerOptions = {}) {
    this.ns = opts.namespace || "app-logs";
    this.maxBatch = opts.maxBatchSize ?? 50;
    this.common = {
      app: opts.app,
      service: opts.service,
      env: opts.env || (process.env.CONTEXT as any) || "dev",
      deployId: this.deployId,
    };

    // Flush on process end when running in Node
    if (typeof process !== "undefined") {
      process.on("beforeExit", () => this.flush().catch(() => {}));
    }
  }

  log(level: LogLevel, rec: LogRecord) {
    const now = new Date().toISOString();
    const line = JSON.stringify({ ts: now, level, ...this.common, ...rec });
    this.buffer.push(line);
    if (this.buffer.length >= this.maxBatch) {
      return this.flush();
    }
  }

  debug(rec: LogRecord) { return this.log("debug", rec); }
  info(rec: LogRecord)  { return this.log("info", rec); }
  warn(rec: LogRecord)  { return this.log("warn", rec); }
  error(rec: LogRecord) { return this.log("error", rec); }

  async flush() {
    if (this.buffer.length === 0) return;

    const when = new Date();
    const yyyy = when.getUTCFullYear();
    const mm   = String(when.getUTCMonth() + 1).padStart(2, "0");
    const dd   = String(when.getUTCDate()).padStart(2, "0");
    const hh   = String(when.getUTCHours()).padStart(2, "0");

    const path = [
      "logs", yyyy, mm, dd, hh,
      `${this.common.service ?? "svc"}-${this.common.env ?? "dev"}-${this.common.deployId ?? "local"}-${when.getTime()}-${randomUUID()}.ndjson`
    ].join("/");

    const data = this.buffer.join("\n") + "\n";
    this.buffer = [];

    // Optional: gzip before write if your volumes are large
    await createBlob({
      data,
      name: path,
      contentType: "application/x-ndjson",
      // contentEncoding: "gzip", // if you gzip yourself first
      namespace: this.ns,
    });
  }
}


Usage in a Netlify Function (Node):

// netlify/functions/hello.ts
import { BlobLogger } from "../../lib/blob-logger";

export default async (req: Request, _ctx: any) => {
  const logger = new BlobLogger({ app: "my-app", service: "hello", env: process.env.CONTEXT as any });
  const start = Date.now();

  try {
    logger.info({ msg: "function.start", route: "/.netlify/functions/hello", method: "GET" });

    const body = { ok: true, time: new Date().toISOString() };

    logger.info({
      msg: "function.end",
      status: 200,
      latencyMs: Date.now() - start,
    });

    await logger.flush(); // explicit flush is good practice
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }});
  } catch (err: any) {
    logger.error({ msg: "function.error", error: err?.message, stack: err?.stack });
    await logger.flush();
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};


Usage in an Edge Function:

// netlify/edge-functions/logger-example.ts
import { BlobLogger } from "../lib/blob-logger";

export default async (request: Request, context: any) => {
  const logger = new BlobLogger({ app: "my-app", service: "edge", env: process.env.CONTEXT as any });
  const start = Date.now();

  try {
    logger.info({ msg: "edge.request", url: request.url, method: request.method });

    const res = await context.next();

    logger.info({
      msg: "edge.response",
      status: res.status,
      latencyMs: Date.now() - start,
    });

    await logger.flush();
    return res;
  } catch (e: any) {
    logger.error({ msg: "edge.error", error: e?.message });
    await logger.flush();
    return new Response("Edge error", { status: 500 });
  }
}

6) Local Development

Run netlify dev; Blobs are emulated so @netlify/blobs writes to a local store (commonly under .netlify/blobs).

Keep a separate namespace for dev if you want (app-logs-dev) to avoid mixing with preview/prod exports.

Add a tiny tailer to view logs during dev:

find .netlify/blobs -type f -name '*.ndjson' -print0 | xargs -0 tail -f

7) Log Rotation & Retention

Rotation is handled by your key structure (time-partitioned files).

Retention policy: Decide up front (e.g., 30, 90, 365 days).

Implement a scheduled Netlify Function (cron) to:

list({ prefix: 'logs/YYYY/MM/DD/' })

delete anything older than your window

(optional) export yesterday’s partition to external storage or a warehouse.

Example cleaner (sketch):

import { list, del } from "@netlify/blobs";

export async function handler() {
  const keepAfter = Date.now() - 90 * 24*60*60*1000; // 90 days
  const prefixes = ["logs/"]; // iterate days if you want to be precise

  for (const prefix of prefixes) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, limit: 1000, cursor, namespace: "app-logs" });
      for (const b of page.blobs) {
        // parse date from key; fall back to createdAt if available
        const ts = extractTimestampFromKey(b.key);
        if (ts < keepAfter) {
          await del({ name: b.key, namespace: "app-logs" });
        }
      }
      cursor = page.cursor;
    } while (cursor);
  }

  return { statusCode: 200, body: "ok" };
}

function extractTimestampFromKey(key: string) {
  // logs/YYYY/MM/DD/HH/...-<epoch>-<uuid>.ndjson
  const m = key.match(/logs\/\d{4}\/\d{2}\/\d{2}\/\d{2}\/.*-(\d+)-/);
  return m ? Number(m[1]) : 0;
}

8) Querying & Export

Blobs are object storage, not a query engine. Options:

Quick grep: list + fetch a blob, then filter NDJSON locally.

Daily export: scheduled job streams yesterday’s prefix into:

BigQuery (bq load NDJSON)

S3 + Athena / DuckDB / MotherDuck

ClickHouse/Timescale

Keep line size small (e.g., < 16KB) and use gzip if volumes are heavy.

9) Performance & Reliability Tips

Batch: 10–50 logs per write is a sweet spot. Don’t write per line.

Async: Fire writes and await once per invocation (explicit flush()).

Back-pressure: If buffer grows too much (e.g., > 1000 lines), drop DEBUG entries first.

Idempotency: New file name per flush; don’t try to append to the same blob.

Gzip: Consider compressing the NDJSON payload before createBlob.

Time partitioning: Hourly folders keep list operations fast.

10) Security, Privacy, Compliance

No secrets in logs: redact tokens, cookies, Authorization headers.

PII minimization: hash user IDs and anonymize IPs.

Access: keep writes server-side only (Functions/Edge). If the client must log, send to your endpoint; don’t expose blob credentials client-side.

Data subject requests: make it possible to filter by a hashed user id; your export pipeline should support deletion/replay if required.

11) Observability & Correlation

Add requestId & traceId to each record; pass via headers and context.

Log latency for each handler and include status.

Include deployId and env so you can split by release and environment.

Mirror ERROR level logs to console.error so they also show up in Netlify’s function logs UI for fast triage.

12) Testing

Unit test the logger with a fake createBlob to ensure:

Batch triggers at the configured size

Paths are correct (prefix + file name)

Schema always includes ts and level

Load test peak flows; verify write latency and blob counts per hour.

13) Common Pitfalls (and fixes)

Logging too much (chatty DEBUG in prod): gate by LOG_LEVEL.

One giant daily file: don’t. Use hourly partitions and multiple files.

PII leakage: add a scrub(obj) pass before logger.*().

Forgetting to flush: call await logger.flush() at the end of handlers.

14) Quick Client → Server Logging Snippet

Never write to Blobs from the browser. Instead:

Client:

await fetch("/.netlify/functions/log-proxy", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ level: "info", msg: "client event", route: "/home" })
});


Function (log-proxy.ts):

import { BlobLogger } from "../../lib/blob-logger";

export default async (req: Request) => {
  const payload = await req.json().catch(() => ({}));
  const logger = new BlobLogger({ app: "my-app", service: "client-log" });

  // scrub here if needed
  logger.info({ ...payload, source: "client" });
  await logger.flush();
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

15) Operational Runbook (copy/paste)

Rotate: Scheduled function deletes logs older than N days.

Export: Nightly job moves logs/YYYY/MM/DD/ to your warehouse.

Oncall: Use Netlify UI function logs for hot errors; dig into Blobs for history.

Backfill: If export fails, re-run for the specific day prefix.

Audits: Sample records monthly to confirm redaction stays effective.