/**
 * Neutralizes Excel Formula Injection vulnerability (CSV/XLSX Injection)
 * Prefixes any string starting with '=', '+', '-', '@', or '\t' with a single apostrophe `'`.
 */
export function sanitizeExcelField(value: any): any {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^[=\+\-@\t]/.test(trimmed)) {
      return `'${value}`;
    }
  }
  return value;
}

export function sanitizeExcelRow<T extends Record<string, any>>(row: T): T {
  const sanitized: any = {};
  for (const key of Object.keys(row)) {
    sanitized[key] = sanitizeExcelField(row[key]);
  }
  return sanitized;
}
