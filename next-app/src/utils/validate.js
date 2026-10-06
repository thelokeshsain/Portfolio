// Safe URL validator — allows http:, https:, and safe root-relative paths (/...)
// blocks dangerous protocols (javascript:, vbscript:, etc.) and protocol-relative (//) URLs
export function isSafeUrl(val) {
  if (!val) return true; // optional field
  if (typeof val !== "string") return false;

  const trimmed = val.trim();

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }

  // Safe internal relative URL: begins with a single slash, not double slash (//)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const u = new URL(trimmed);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

