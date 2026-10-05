/**
 * Google AdSense Configuration
 * 
 * Centralized, isolated configuration for Google AdSense monetization.
 * Strictly adheres to Google Publisher Policies:
 * - Does not invent or hard-code placeholder publisher IDs.
 * - Safely disables ad rendering if NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is not configured.
 */

export const ADS_CONFIG = {
  // Enabled if publisher ID is supplied via environment variable
  enabled: Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID),
  
  // Publisher ID provided by Google AdSense (e.g., 'pub-XXXXXXXXXXXXXXXX' or 'ca-pub-XXXXXXXXXXXXXXXX')
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || null,

  /**
   * Returns sanitized Google AdSense client format ('ca-pub-XXXXXXXXXXXXXXXX')
   */
  getClientId() {
    if (!this.publisherId) return null;
    const clean = this.publisherId.trim();
    if (clean.startsWith('ca-pub-')) return clean;
    if (clean.startsWith('pub-')) return `ca-${clean}`;
    return `ca-pub-${clean}`;
  },

  /**
   * Returns sanitized ads.txt format ('pub-XXXXXXXXXXXXXXXX')
   */
  getAdsTxtPubId() {
    if (!this.publisherId) return null;
    const clean = this.publisherId.trim();
    if (clean.startsWith('ca-pub-')) return clean.replace(/^ca-/, '');
    if (clean.startsWith('pub-')) return clean;
    return `pub-${clean}`;
  }
};
