import React from 'react';
import { Braces, Network, Smartphone, Code } from 'lucide-react';

/**
 * BRAND ASSET REGISTRY
 * Central repository for all verified official technology and brand assets.
 * 
 * Rules:
 * 1. Category A (Brand Logos): Must use official, recognizable brand assets from official sources.
 * 2. Category B (Generic Concepts): REST APIs, LLM APIs, Responsive use neutral Lucide icons.
 * 3. Never approximate or draw a logo manually with primitive shapes.
 */

export const BRAND_ASSETS = {
  'javascript': {
    name: 'JavaScript',
    asset: '/icons/brands/javascript.svg',
    source: 'Official JS / ECMAScript Community Standard',
    ariaLabel: 'Official JavaScript Logo',
    type: 'brand',
  },
  'react.js': {
    name: 'React.js',
    asset: '/icons/brands/react.svg',
    source: 'Meta / React.dev Official Brand Asset',
    ariaLabel: 'Official React.js Atom Logo',
    type: 'brand',
  },
  'react': {
    name: 'React.js',
    asset: '/icons/brands/react.svg',
    source: 'Meta / React.dev Official Brand Asset',
    ariaLabel: 'Official React.js Atom Logo',
    type: 'brand',
  },
  'python': {
    name: 'Python',
    asset: '/icons/brands/python.svg',
    source: 'Python Software Foundation Official Asset',
    ariaLabel: 'Official Python Two-Snakes Logo',
    type: 'brand',
  },
  'node.js': {
    name: 'Node.js',
    asset: '/icons/brands/nodejs.svg',
    source: 'OpenJS Foundation / Node.js Official Brand Asset',
    ariaLabel: 'Official Node.js Hexagon Logo',
    type: 'brand',
  },
  'nodejs': {
    name: 'Node.js',
    asset: '/icons/brands/nodejs.svg',
    source: 'OpenJS Foundation / Node.js Official Brand Asset',
    ariaLabel: 'Official Node.js Hexagon Logo',
    type: 'brand',
  },
  'html5': {
    name: 'HTML5',
    asset: '/icons/brands/html5.svg',
    source: 'W3C Official HTML5 Logo',
    ariaLabel: 'Official HTML5 Shield Logo',
    type: 'brand',
  },
  'css3': {
    name: 'CSS3',
    asset: '/icons/brands/css3.svg',
    source: 'W3C Official CSS3 Logo',
    ariaLabel: 'Official CSS3 Shield Logo',
    type: 'brand',
  },
  'mysql': {
    name: 'MySQL',
    asset: '/icons/brands/mysql.svg',
    source: 'Oracle / MySQL Sakila Dolphin Brand Asset',
    ariaLabel: 'Official MySQL Dolphin Logo',
    type: 'brand',
  },
  'mongodb': {
    name: 'MongoDB',
    asset: '/icons/brands/mongodb.svg',
    source: 'MongoDB Inc. Official Leaf Asset',
    ariaLabel: 'Official MongoDB Leaf Logo',
    type: 'brand',
  },
  'git': {
    name: 'Git',
    asset: '/icons/brands/git.svg',
    source: 'Git SCM Official Brand Asset (Jason Long)',
    ariaLabel: 'Official Git Diamond Logo',
    type: 'brand',
  },
  'vs code': {
    name: 'VS Code',
    asset: '/icons/brands/vscode.svg',
    source: 'Microsoft Visual Studio Code Official Asset',
    ariaLabel: 'Official Microsoft Visual Studio Code Logo',
    type: 'brand',
  },
  'vscode': {
    name: 'VS Code',
    asset: '/icons/brands/vscode.svg',
    source: 'Microsoft Visual Studio Code Official Asset',
    ariaLabel: 'Official Microsoft Visual Studio Code Logo',
    type: 'brand',
  },
  'android': {
    name: 'Android',
    asset: '/icons/brands/android.svg',
    source: 'Google Android Official Brand Asset',
    ariaLabel: 'Official Google Android Logo',
    type: 'brand',
  },
  'openai': {
    name: 'OpenAI',
    asset: '/icons/brands/openai.svg',
    source: 'OpenAI Official Brand Asset',
    ariaLabel: 'Official OpenAI Logo',
    type: 'brand',
  },
  'gemini': {
    name: 'Gemini',
    asset: '/icons/brands/gemini.svg',
    source: 'Google Gemini Official Brand Asset',
    ariaLabel: 'Official Google Gemini Spark Logo',
    type: 'brand',
  },
  'github': {
    name: 'GitHub',
    asset: '/icons/brands/github.svg',
    source: 'GitHub Official Octocat Silhouette Asset',
    ariaLabel: 'Official GitHub Logo',
    type: 'brand',
  },
  'linkedin': {
    name: 'LinkedIn',
    asset: '/icons/brands/linkedin.svg',
    source: 'LinkedIn Official In Bug Asset',
    ariaLabel: 'Official LinkedIn Logo',
    type: 'brand',
  },
  'java': {
    name: 'Java',
    asset: '/icons/brands/java.svg',
    source: 'Oracle Java Official Cup Asset',
    ariaLabel: 'Official Java Logo',
    type: 'brand',
  },

  /* ── Neutral Technical Concepts (Not fake company logos) ── */
  'rest apis': {
    name: 'REST APIs',
    renderIcon: (size) => <Braces size={size} strokeWidth={2} color="#38BDF8" aria-hidden="true" />,
    source: 'Lucide Technical UI Icon (Neutral Concept)',
    ariaLabel: 'REST APIs technical interface concept',
    type: 'concept',
  },
  'rest api': {
    name: 'REST APIs',
    renderIcon: (size) => <Braces size={size} strokeWidth={2} color="#38BDF8" aria-hidden="true" />,
    source: 'Lucide Technical UI Icon (Neutral Concept)',
    ariaLabel: 'REST APIs technical interface concept',
    type: 'concept',
  },
  'llm apis': {
    name: 'LLM APIs',
    renderIcon: (size) => <Network size={size} strokeWidth={2} color="#A78BFA" aria-hidden="true" />,
    source: 'Lucide Technical UI Icon (Neutral Concept)',
    ariaLabel: 'LLM APIs technical integration concept',
    type: 'concept',
  },
  'responsive': {
    name: 'Responsive',
    renderIcon: (size) => <Smartphone size={size} strokeWidth={2} color="#94A3B8" aria-hidden="true" />,
    source: 'Lucide Technical UI Icon (Neutral Concept)',
    ariaLabel: 'Responsive Multi-Device Layout',
    type: 'concept',
  },
  'xml': {
    name: 'XML',
    renderIcon: (size) => <Code size={size} strokeWidth={2} color="#F97316" aria-hidden="true" />,
    source: 'Lucide Technical UI Icon (Neutral Concept)',
    ariaLabel: 'XML Markup Format',
    type: 'concept',
  },
};

/**
 * Universal Brand & Tech Icon Renderer
 * Guarantees pixel perfection, proper sizing, aspect ratio preservation, and zero distortions.
 */
export function BrandIcon({ name, size = 24, className = '', style = {} }) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  const entry = BRAND_ASSETS[key];

  if (entry?.type === 'brand') {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- Scalable SVG vector icons are exempt from raster optimization to preserve sharpness */
      <img
        src={entry.asset}
        alt={entry.ariaLabel}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  if (entry?.renderIcon) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          flexShrink: 0,
          ...style,
        }}
        title={entry.name}
      >
        {entry.renderIcon(size)}
      </span>
    );
  }

  // Graceful fallback for any other tech item
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      <Code size={size * 0.85} strokeWidth={2} color="#94A3B8" aria-hidden="true" />
    </span>
  );
}
