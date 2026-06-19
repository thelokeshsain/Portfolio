// Safe URL validator — blocks javascript:, data:, and relative URLs
export function isSafeUrl(val) {
  if (!val) return true; // optional field
  try {
    const u = new URL(val);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}
