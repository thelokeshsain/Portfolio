'use client';

import { Settings2 } from 'lucide-react';
import { openConsentManager } from '@/components/ads/consent';

export default function ConsentRevokeButton({ label = 'Manage Privacy & Cookie Preferences' }) {
  return (
    <button
      type="button"
      onClick={openConsentManager}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        backgroundColor: '#0F141D',
        color: '#38BDF8',
        border: '1px solid #1E2638',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'var(--font-body, inherit)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1E2638';
        e.currentTarget.style.borderColor = '#38BDF8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#0F141D';
        e.currentTarget.style.borderColor = '#1E2638';
      }}
      aria-label="Manage your advertising and privacy consent choices"
    >
      <Settings2 size={16} />
      <span>{label}</span>
    </button>
  );
}
