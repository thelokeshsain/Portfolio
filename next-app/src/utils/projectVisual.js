/**
 * Project Visual Resolver
 * Authoritative normalized priority chain for project visuals:
 * 1. Valid backend image (p.image or p.imageUrl)
 * 2. Valid backend logo (p.logo or p.logoUrl)
 * 3. Valid backend thumbnail (p.thumbnail)
 * 4. Stored server-generated live capture (p.livePreviewImageUrl)
 * 5. Safe local project-specific fallback
 * 6. Neutral branded placeholder
 *
 * Guarantees:
 * - Never returns a broken image or null
 * - Distinguishes logos vs screenshots for appropriate aspect/padding
 * - Complete visual visibility with object-fit: contain (no cropping, no distortion)
 */

const LOCAL_PROJECT_FALLBACKS = [
  { match: /apna\s*backup/i, src: '/images/project_apna_backup.webp' },
  { match: /food\s*court/i, src: '/images/project_foodcourt.webp' },
  { match: /sizzling/i, src: '/images/project_sizzling.webp' },
];

const NEUTRAL_PLACEHOLDER = '/images/social_preview.webp';

function isValidVisualString(val) {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < 5) return false;
  // Valid base64 image data URI
  if (trimmed.startsWith('data:image/')) return true;
  // Valid absolute URL
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return true;
  // Valid local relative path
  if (trimmed.startsWith('/')) return true;
  return false;
}

export function resolveProjectVisual(project) {
  if (!project) {
    return {
      src: NEUTRAL_PLACEHOLDER,
      alt: 'Project visual',
      isLogo: false,
      source: 'placeholder',
    };
  }

  const title = project.title || 'Project';
  const alt = `${title} interface`;

  // 1. Authoritative Backend Image
  if (isValidVisualString(project.image)) {
    return {
      src: project.image,
      alt,
      isLogo: false,
      source: 'backend-image',
    };
  }
  if (isValidVisualString(project.imageUrl)) {
    return {
      src: project.imageUrl,
      alt,
      isLogo: false,
      source: 'backend-image',
    };
  }

  // 2. Authoritative Backend Logo
  if (isValidVisualString(project.logo)) {
    return {
      src: project.logo,
      alt: `${title} logo`,
      isLogo: true,
      source: 'backend-logo',
    };
  }
  if (isValidVisualString(project.logoUrl)) {
    return {
      src: project.logoUrl,
      alt: `${title} logo`,
      isLogo: true,
      source: 'backend-logo',
    };
  }

  // 3. Backend Thumbnail
  if (isValidVisualString(project.thumbnail)) {
    return {
      src: project.thumbnail,
      alt,
      isLogo: false,
      source: 'backend-thumbnail',
    };
  }

  // 4. Stored Server-Generated Live Capture
  if (isValidVisualString(project.livePreviewImageUrl)) {
    return {
      src: project.livePreviewImageUrl,
      alt: `${title} live preview`,
      isLogo: false,
      source: 'live-capture',
    };
  }

  // 5. Safe Local Project Fallback
  for (const fallback of LOCAL_PROJECT_FALLBACKS) {
    if (fallback.match.test(title)) {
      return {
        src: fallback.src,
        alt,
        isLogo: false,
        source: 'local-fallback',
      };
    }
  }

  // 6. Neutral Branded Fallback
  return {
    src: NEUTRAL_PLACEHOLDER,
    alt: `${title} preview`,
    isLogo: false,
    source: 'placeholder',
  };
}
