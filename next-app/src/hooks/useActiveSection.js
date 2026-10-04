"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { NAV_SECTIONS } from '../config/navigation';

/**
 * useActiveSection
 * 
 * Deterministic active section tracking for Midnight Blueprint.
 * 
 * Guarantees:
 * 1. Single source of truth.
 * 2. Exactly ONE active section at all times.
 * 3. Top of page (< 80px) forces 'home'.
 * 4. Bottom of page forces 'contact'.
 * 5. Deterministic activation line (navbar height + 20% viewport).
 * 6. Smooth-scroll click locking eliminates intermediate section flickering.
 * 7. requestAnimationFrame-throttled passive scroll listener for 60fps performance.
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState('home');
  const activeSectionRef = useRef('home');
  const clickLockRef = useRef(false);
  const clickLockTimerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const calculateActiveSection = useCallback(() => {
    if (typeof window === 'undefined') return 'home';

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    // 1. Top of page rule
    if (scrollY <= 80) {
      return 'home';
    }

    // 2. Bottom of page rule
    if (windowHeight + scrollY >= scrollHeight - 60) {
      return 'contact';
    }

    // 3. Deterministic Activation Line: 64px navbar + 20% viewport
    const activationLine = 64 + Math.round(windowHeight * 0.20);

    let containingSection = null;
    let closestAboveSection = null;
    let closestAboveDistance = -Infinity;

    for (let i = 0; i < NAV_SECTIONS.length; i++) {
      const { id } = NAV_SECTIONS[i];
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      // Check if the activation line is within this section's vertical bounds
      if (rect.top <= activationLine && rect.bottom > activationLine) {
        containingSection = id;
        break;
      }

      // If top is at or above activation line, track the section closest to the activation line
      if (rect.top <= activationLine && rect.top > closestAboveDistance) {
        closestAboveDistance = rect.top;
        closestAboveSection = id;
      }
    }

    return containingSection || closestAboveSection || 'home';
  }, []);

  const handleScroll = useCallback(() => {
    // If user recently clicked a nav tab, do not recalculate during smooth scroll
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

  // Click & smooth scroll with lock
  const scrollToSection = useCallback((id) => {
    if (typeof window === 'undefined') return;

    // Immediately update active state to target
    setActiveSection(id);
    activeSectionRef.current = id;

    // Set click lock to prevent flickering during scroll
    clickLockRef.current = true;
    if (clickLockTimerRef.current) {
      clearTimeout(clickLockTimerRef.current);
    }

    // Unlock after scroll finishes
    clickLockTimerRef.current = setTimeout(() => {
      clickLockRef.current = false;
      // Re-verify actual resting position
      const finalSection = calculateActiveSection();
      if (finalSection) {
        setActiveSection(finalSection);
      }
    }, 850);

    // Perform smooth scroll
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [calculateActiveSection]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial determination
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
    };
  }, [handleScroll]);

  return {
    activeSection,
    scrollToSection,
  };
}
