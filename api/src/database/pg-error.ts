export function getPostgresErrorCode(err: unknown): string | undefined {
  let current: unknown = err;
  while (current && typeof current === 'object') {
    const code = (current as { code?: string }).code;
    if (typeof code === 'string') {
      return code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export function isUniqueViolation(err: unknown): boolean {
  return getPostgresErrorCode(err) === '23505';
}

export function isFkViolation(err: unknown): boolean {
  return getPostgresErrorCode(err) === '23503';
}
