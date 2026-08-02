import { createWriteStream, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { DATA_DIR } from './paths';

const BASE_URL = 'https://cdn.rebrickable.com/media/downloads';
const DOWNLOAD_TIMEOUT_MS = 300_000;
const MAX_RETRIES = 3;

export const REBRICKABLE_FILES = [
  'part_categories',
  'colors',
  'themes',
  'parts',
  'sets',
  'inventories',
  'inventory_parts',
  'inventory_minifigs',
] as const;

export type RebrickableFile = (typeof REBRICKABLE_FILES)[number];

type LogFn = (message: string) => void;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, log: LogFn): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });

      if (response.ok && response.body) {
        return response;
      }

      const message = `Failed to download ${url}: ${response.status} ${response.statusText}`;
      if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
        throw new Error(message);
      }

      lastError = new Error(message);
    } catch (err) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const retryable =
        err instanceof Error &&
        (err.name === 'AbortError' ||
          err.name === 'TimeoutError' ||
          err.message.includes('fetch failed'));

      if (!retryable || isLastAttempt) {
        throw err instanceof Error ? err : new Error(String(err));
      }

      lastError = err instanceof Error ? err : new Error(String(err));
    }

    const delayMs = 1000 * attempt;
    log(
      `Retrying ${url} in ${delayMs}ms (attempt ${attempt}/${MAX_RETRIES})...`,
    );
    await sleep(delayMs);
  }

  throw lastError ?? new Error(`Failed to download ${url}`);
}

async function downloadFile(
  name: RebrickableFile,
  destDir: string,
  log: LogFn,
): Promise<string> {
  const dest = join(destDir, `${name}.csv.gz`);
  const tmpDest = `${dest}.tmp`;
  const url = `${BASE_URL}/${name}.csv.gz`;

  log(`Downloading ${url}...`);
  const response = await fetchWithRetry(url, log);

  try {
    await pipeline(
      Readable.fromWeb(response.body as WebReadableStream),
      createWriteStream(tmpDest),
    );
    renameSync(tmpDest, dest);
  } catch (err) {
    try {
      unlinkSync(tmpDest);
    } catch {
      // Ignore cleanup errors for a partial temp file.
    }
    throw err;
  }

  log(`Successfully downloaded ${name}.csv.gz`);
  return dest;
}

export async function downloadCsvFiles(
  filenames: readonly RebrickableFile[] = REBRICKABLE_FILES,
  destDir: string = DATA_DIR,
  log: LogFn = console.log,
): Promise<Record<RebrickableFile, string>> {
  mkdirSync(destDir, { recursive: true });
  log(`Downloading ${filenames.length} CSV archives to ${destDir}...`);

  const paths = {} as Record<RebrickableFile, string>;
  for (const name of filenames) {
    paths[name] = await downloadFile(name, destDir, log);
  }

  log('Finished downloading CSV files.');
  return paths;
}
