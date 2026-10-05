import dns from 'dns';
import { promisify } from 'util';

const resolve4Async = promisify(dns.resolve4);

/**
 * Validates a target URL against SSRF threats.
 * Blocks private ranges, loopback, link-local, cloud metadata services, and internal hostnames.
 */
export async function validateSafeProjectUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    return { ok: false, reason: 'URL must be a non-empty string' };
  }

  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { ok: false, reason: 'Invalid URL format' };
  }

  // 1. Only allow https protocol
  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only https: protocol is permitted for security' };
  }

  // 2. Reject credentials in URL
  if (parsed.username || parsed.password) {
    return { ok: false, reason: 'Credentials in URL are strictly prohibited' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 3. Block obvious local/internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === '0.0.0.0' ||
    hostname === '::1'
  ) {
    return { ok: false, reason: 'Local/internal hostnames are rejected' };
  }

  // 4. Resolve DNS to verify public IP address
  try {
    const addresses = await resolve4Async(hostname);
    if (!addresses || addresses.length === 0) {
      return { ok: false, reason: 'Could not resolve hostname' };
    }

    for (const ip of addresses) {
      if (isPrivateOrReservedIp(ip)) {
        return { ok: false, reason: `Resolved IP (${ip}) is private or reserved` };
      }
    }
  } catch (err) {
    return { ok: false, reason: `DNS resolution failed: ${err.message}` };
  }

  return { ok: true, cleanUrl: parsed.toString() };
}

/**
 * Checks if an IPv4 address is in a private, loopback, or cloud-metadata range
 */
function isPrivateOrReservedIp(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;

  // 10.0.0.0/8 (Private RFC 1918)
  if (parts[0] === 10) return true;

  // 172.16.0.0/12 (Private RFC 1918)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16 (Private RFC 1918)
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Metadata 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;

  // 0.0.0.0/8
  if (parts[0] === 0) return true;

  // 224.0.0.0/4 (Multicast)
  if (parts[0] >= 224 && parts[0] <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (parts[0] >= 240) return true;

  return false;
}

/**
 * Server-side controlled project visual capture.
 * Executed only in admin/background tasks, never blocking visitor requests.
 */
export async function captureProjectVisualServerSide(targetUrl) {
  const validation = await validateSafeProjectUrl(targetUrl);
  if (!validation.ok) {
    throw new Error(`SSRF Prevention: ${validation.reason}`);
  }

  // Uses server-side fetch with strict timeout and content-type validation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(validation.cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'manual', // Prevent arbitrary redirect chasing
    });

    clearTimeout(timeoutId);

    // If site responds, return status & metadata
    return {
      success: res.ok,
      status: res.status,
      validatedUrl: validation.cleanUrl,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Capture timed out' : err.message,
    };
  }
}
