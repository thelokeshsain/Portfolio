"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { NAV_SECTIONS } from '../config/navigation';

/**
 * useActiveSection
 * 
 * Deterministic active section tracking for Midnight Blueprint.
 * 
 * Guarantees:
 * 1. Single source of truth for active navigation state.
 * 2. Exactly ONE active section at all times matching the actual visible semantic section.
 * 3. Top of page (scrollY <= 70px) forces 'home'.
 * 4. Bottom of page (near document bottom) forces 'contact'.
 * 5. Deterministic activation line: 64px navbar + 22% viewport height.
 * 6. Smooth-scroll click locking with instant release on user manual interaction (wheel/touch).
 * 7. requestAnimationFrame-throttled passive scroll listener for 60fps performance.
 * 8. Respects prefers-reduced-motion for instant scrolling.
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState('home');
  const activeSectionRef = useRef('home');
  const clickLockRef = useRef(false);
  const clickLockTimerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Keep ref in sync with state for callbacks
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const calculateActiveSection = useCallback(() => {
    if (typeof window === 'undefined') return 'home';

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    // 1. Top of page boundary rule
    if (scrollY <= 70) {
      return 'home';
    }

    // 2. Bottom of page boundary rule
    if (windowHeight + scrollY >= scrollHeight - 70) {
      return 'contact';
    }

    // 3. Deterministic Activation Line: 64px navbar + 22% of viewport
    const activationLine = 64 + Math.round(windowHeight * 0.22);

    let containingSection = null;
    let closestAboveSection = null;
    let closestAboveTop = -Infinity;

    for (let i = 0; i < NAV_SECTIONS.length; i++) {
      const { id } = NAV_SECTIONS[i];
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      // Check if activation line falls strictly within section bounds
      if (rect.top <= activationLine && rect.bottom > activationLine) {
        containingSection = id;
        break;
      }

      // Track section whose top edge is closest above the activation line
      if (rect.top <= activationLine && rect.top > closestAboveTop) {
        closestAboveTop = rect.top;
        closestAboveSection = id;
      }
    }

    return containingSection || closestAboveSection || 'home';
  }, []);

  const handleScroll = useCallback(() => {
    // If click lock is active during smooth scroll, ignore passive updates
    if (clickLockRef.current) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const nextActive = calculateActiveSection();
      if (nextActive && nextActive !== activeSectionRef.current) {
        setActiveSection(nextActive);
      }
    });
  }, [calculateActiveSection]);

  // Release lock immediately on user manual wheel or touch input
  const releaseLock = useCallback(() => {
    if (clickLockRef.current) {
      clickLockRef.current = false;
      if (clickLockTimerRef.current) {
        clearTimeout(clickLockTimerRef.current);
        clickLockTimerRef.current = null;
      }
      handleScroll();
    }
  }, [handleScroll]);

  // Click & smooth scroll with lock
  const scrollToSection = useCallback((id) => {
    if (typeof window === 'undefined') return;

    // Immediately reflect selected section in UI
    setActiveSection(id);
    activeSectionRef.current = id;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (scrollBehavior === 'auto') {
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        const targetEl = document.getElementById(id);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'auto' });
      }
      const final = calculateActiveSection();
      setActiveSection(final);
      return;
    }

    // Set click lock to prevent intermediate section flickering
    clickLockRef.current = true;
    if (clickLockTimerRef.current) {
      clearTimeout(clickLockTimerRef.current);
    }

    // Perform smooth scroll
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetEl = document.getElementById(id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Auto-release after scroll completes
    clickLockTimerRef.current = setTimeout(() => {
      clickLockRef.current = false;
      clickLockTimerRef.current = null;
      const finalSection = calculateActiveSection();
      if (finalSection) {
        setActiveSection(finalSection);
      }
    }, 700);
  }, [calculateActiveSection]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', releaseLock, { passive: true });
    window.addEventListener('touchmove', releaseLock, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', releaseLock);
      window.removeEventListener('touchmove', releaseLock);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
    };
  }, [handleScroll, releaseLock]);

  return {
    activeSection,
    scrollToSection,
  };
}
