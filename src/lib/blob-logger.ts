/**
 * Netlify Blob-based Logger
 *
 * Writes structured logs (NDJSON) to Netlify Blobs for durable storage.
 * Partitioned by time, auto-flushes in batches, works in local dev and production.
 */

import { getStore } from '@netlify/blobs';
import { randomUUID } from 'crypto';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogRecord = Record<string, unknown>;

interface LoggerOptions {
  app?: string;
  service?: string;
  env?: 'prod' | 'preview' | 'dev';
  namespace?: string;
  maxBatchSize?: number;
  flushOnError?: boolean;
}

export class BlobLogger {
  private buffer: string[] = [];
  private readonly ns: string;
  private readonly maxBatch: number;
  private readonly common: Record<string, string | undefined>;
  private readonly deployId: string | undefined;
  private flushed = false;
  private static exitHandlerRegistered = false;
  private static instances: BlobLogger[] = [];

  constructor(opts: LoggerOptions = {}) {
    this.ns = opts.namespace || 'app-logs';
    this.maxBatch = opts.maxBatchSize ?? 50;
    this.deployId = process.env.DEPLOY_ID || process.env.NETLIFY_DEPLOY_ID;

    this.common = {
      app: opts.app || 'dream-app',
      service: opts.service,
      env: opts.env || (process.env.CONTEXT as 'prod' | 'preview' | 'dev') || 'dev',
      deployId: this.deployId,
    };

    // Register this instance
    BlobLogger.instances.push(this);

    // Register exit handler only once for all instances
    if (typeof process !== 'undefined' && !BlobLogger.exitHandlerRegistered) {
      BlobLogger.exitHandlerRegistered = true;
      process.on('beforeExit', () => {
        // Flush all instances
        for (const instance of BlobLogger.instances) {
          if (!instance.flushed) {
            instance.flush().catch(() => {});
          }
        }
      });
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

  debug(rec: LogRecord) {
    return this.log('debug', rec);
  }

  info(rec: LogRecord) {
    return this.log('info', rec);
  }

  warn(rec: LogRecord) {
    return this.log('warn', rec);
  }

  error(rec: LogRecord) {
    // Mirror ERROR level to console for Netlify UI visibility
    console.error('[BlobLogger]', rec);
    return this.log('error', rec);
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const when = new Date();
    const yyyy = when.getUTCFullYear();
    const mm = String(when.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(when.getUTCDate()).padStart(2, '0');
    const hh = String(when.getUTCHours()).padStart(2, '0');

    const path = [
      'logs',
      yyyy,
      mm,
      dd,
      hh,
      `${this.common.service ?? 'svc'}-${this.common.env ?? 'dev'}-${this.deployId ?? 'local'}-${when.getTime()}-${randomUUID()}.ndjson`,
    ].join('/');

    const data = this.buffer.join('\n') + '\n';
    this.buffer = [];
    this.flushed = true;

    // Check if Netlify Blobs environment is configured
    const hasBlobs = process.env.NETLIFY_SITE_ID && process.env.NETLIFY_BLOB_STORE_TOKEN;

    if (!hasBlobs) {
      // Fallback to console logging in local dev without blob store
      if (this.common.env === 'dev') {
        // In dev mode, just log to console silently (don't spam with warnings)
        return;
      }
      console.log('[BlobLogger] Log data:', data);
      return;
    }

    try {
      const store = getStore({
        name: this.ns,
        siteID: process.env.NETLIFY_SITE_ID!,
        token: process.env.NETLIFY_BLOB_STORE_TOKEN!,
      });
      await store.set(path, data, {
        metadata: {
          contentType: 'application/x-ndjson',
        },
      });
    } catch (err) {
      // Fallback to console if blob write fails
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[BlobLogger] Failed to write to blob store:', errorMessage);
      console.log('[BlobLogger] Log data:', data);
    }
  }
}
