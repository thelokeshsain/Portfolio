'use client';

import { useEffect, useRef } from 'react';
import { ADS_CONFIG } from '@/config/ads';

/**
 * Optional Manual Google AdSense Unit Component.
 * 
 * Note: Under Google Auto Ads, ad units are automatically placed by Google.
 * This component is only for explicit, manual ad slot placements and will
 * render NOTHING (returns null) unless an explicit slot ID is provided and
 * AdSense is enabled.
 */
export default function GoogleAd({
  slot,
  format = 'auto',
  responsive = true,
  style = {},
  className = '',
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);
  const clientId = ADS_CONFIG.getClientId();

  useEffect(() => {
    // If ads are disabled, no client ID is configured, or no explicit slot is provided, do nothing
    if (!ADS_CONFIG.enabled || !clientId || !slot) return;

    // Avoid pushing multiple times to the same slot
    if (pushedRef.current) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.warn('AdSense push error:', err);
    }
  }, [clientId, slot]);

  // Under Auto ads or when no explicit ad slot is configured, render nothing
  if (!ADS_CONFIG.enabled || !clientId || !slot) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        margin: '36px auto',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      <span
        style={{
          display: 'block',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#64748B',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        Advertisement
      </span>
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
          data-ad-client={clientId}
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
}

/**
 * Triggers Google's official Privacy & Messaging revocation modal
 * for users in EEA/UK/Switzerland or US privacy states to update their consent choices.
 */
export function openConsentManager() {
  if (typeof window !== 'undefined' && window.googlefc) {
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
  } else {
    // If Google CMP is not loaded (e.g., user is outside regulated regions or pub ID not loaded)
    alert(
      'Privacy & Cookie settings are managed by your browser and regional regulations. No advertising cookies are active unless consent has been granted.'
    );
  }
}
