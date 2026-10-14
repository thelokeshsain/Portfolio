'use client';

import toast from 'react-hot-toast';

/**
 * Triggers Google's official Privacy & Messaging revocation modal
 * for users in EEA/UK/Switzerland or US privacy states to update their consent choices.
 */
export function openConsentManager() {
  if (typeof window !== 'undefined' && window.googlefc) {
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
  } else {
    // If Google CMP is not loaded (e.g., user is outside regulated regions or AdSense is in review)
    toast(
      'Privacy & Cookie choices: Non-essential advertising cookies remain inactive until affirmative regional consent is initialized.',
      {
        icon: '🛡️',
        duration: 5000,
        style: {
          background: '#0F141D',
          color: '#F0F2F5',
          border: '1px solid #1E2638',
          fontSize: '13px',
          maxWidth: '420px',
        },
      }
    );
  }
}
