import { RomanticWebsiteConfig } from '../types/romantic';

// Known broken Giphy IDs that return the 404 "THIS CONTENT IS NOT AVAILABLE" image
const BROKEN_OR_PLACEHOLDER_IDS = [
  'ICOgUNjpvO0PC',
  'TqPkvlZq8k4xW',
  'uw0KqTWZPAHuE',
  'yFQ0ywZVQKI6I',
  '5tmRHwTlHAA9WvKBDZ',
  'l4FGpP4lxGGgMqS5O',
  'L1f337BDme76NW95R3',
  'T1kH5A7yQv6VvX4Vq1',
];

const LOCAL_FALLBACKS: Record<string, string> = {
  opening: '/gifs/opening.gif',
  message: '/gifs/message.gif',
  question: '/gifs/question.gif',
  celebration: '/gifs/celebration.gif',
  letter: '/gifs/letter.gif',
  rejection: '/gifs/rejection.gif',
  floating: '/gifs/floating-hearts.gif',
};

/**
 * Cleans a GIF or image URL to ensure it never displays "This content is not available"
 * and functions reliably across Vercel, localhost, and static exports.
 */
export function cleanGifUrl(url: string | undefined | null, section: keyof typeof LOCAL_FALLBACKS = 'opening'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return LOCAL_FALLBACKS[section] || '/gifs/opening.gif';
  }

  const trimmed = url.trim();

  // If already a local bundled asset or data URL, it's 100% safe
  if (trimmed.startsWith('/gifs/') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Check if URL contains any known broken Giphy ID
  for (const brokenId of BROKEN_OR_PLACEHOLDER_IDS) {
    if (trimmed.includes(brokenId)) {
      return LOCAL_FALLBACKS[section] || '/gifs/opening.gif';
    }
  }

  // If URL has ephemeral v1.Y2lk tracking tokens from Giphy, clean it up to the stable i.giphy.com URL
  if (trimmed.includes('giphy.com')) {
    const match = trimmed.match(/\/([a-zA-Z0-9_-]{10,40})\/giphy\.gif/) ||
                  trimmed.match(/media\/([a-zA-Z0-9_-]{10,40})/);
    if (match && match[1]) {
      const id = match[1];
      if (BROKEN_OR_PLACEHOLDER_IDS.includes(id)) {
        return LOCAL_FALLBACKS[section] || '/gifs/opening.gif';
      }
      return `https://i.giphy.com/media/${id}/giphy.gif`;
    }
  }

  return trimmed;
}

/**
 * Sanitizes an entire romantic website configuration, fixing any broken Giphy
 * links in stored drafts, shared links, or default templates.
 */
export function sanitizeConfig(config: RomanticWebsiteConfig): RomanticWebsiteConfig {
  if (!config) return config;

  return {
    ...config,
    opening: {
      ...config.opening,
      gifUrl: cleanGifUrl(config.opening?.gifUrl, 'opening'),
    },
    personalMessage: {
      ...config.personalMessage,
      gifUrl: cleanGifUrl(config.personalMessage?.gifUrl, 'message'),
    },
    question: {
      ...config.question,
      gifUrl: cleanGifUrl(config.question?.gifUrl, 'question'),
      rejection: config.question?.rejection
        ? {
            ...config.question.rejection,
            gifUrl: cleanGifUrl(config.question.rejection.gifUrl, 'rejection'),
          }
        : config.question?.rejection,
    },
    celebration: {
      ...config.celebration,
      gifUrl: cleanGifUrl(config.celebration?.gifUrl, 'celebration'),
    },
    letter: {
      ...config.letter,
      gifUrl: cleanGifUrl(config.letter?.gifUrl, 'letter'),
    },
    floatingGifs: (config.floatingGifs || []).map((gif, idx) => {
      let fallbackKey: keyof typeof LOCAL_FALLBACKS = 'floating';
      if (idx === 1) fallbackKey = 'message';
      if (idx === 2) fallbackKey = 'celebration';
      return {
        ...gif,
        url: cleanGifUrl(gif.url, fallbackKey),
      };
    }),
  };
}
