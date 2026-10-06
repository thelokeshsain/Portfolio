'use client';

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
