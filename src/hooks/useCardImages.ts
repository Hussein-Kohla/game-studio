import { useEffect, useState } from 'react';
import { CARD_WIKI_TITLES } from '../store/cardWikiTitles';

/**
 * Fetches Wikipedia thumbnail images for a list of card labels.
 * Returns a map of label → image URL (or undefined if not found).
 */
export function useCardImages(labels: string[]): Record<string, string> {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!labels.length) return;

    let cancelled = false;

    const fetchAll = async () => {
      const results: Record<string, string> = {};

      await Promise.all(
        labels.map(async (label) => {
          const wikiTitle = CARD_WIKI_TITLES[label];
          if (!wikiTitle) return;

          try {
            const res = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
              { headers: { 'Api-User-Agent': 'game-studio/1.0' } }
            );
            if (!res.ok) return;
            const data = await res.json();
            if (data.thumbnail?.source) {
              results[label] = data.thumbnail.source;
            }
            if (!results[label]) {
              // Use a generic fallback image when Wikipedia thumbnail is unavailable.
              results[label] = '/fallback.png';
            }
          } catch {
            // silently skip — card will fall back to emoji
          }
        })
      );

      if (!cancelled) setImages(results);
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  // Run once when the set of labels changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels.join(',')]);

  return images;
}
