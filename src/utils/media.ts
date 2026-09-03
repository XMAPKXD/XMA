import { Category, Nominee } from '../types';

/**
 * Extracts a valid YouTube Video ID from any YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - Or raw 11-char ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const clean = url.trim();
  if (!clean) return null;

  // Direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Regex matching all common YouTube URL variations
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = clean.match(regExp);
  return match ? match[1] : null;
}

/**
 * Returns a privacy-enhanced YouTube embed URL or null if invalid
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

/**
 * Checks if a category is music-oriented (Music of the Year, Hit Musical, etc.)
 */
export function isMusicCategory(category?: Category | null): boolean {
  if (!category) return false;
  const text = `${category.title} ${category.subtitle} ${category.description} ${category.id}`.toLowerCase();
  return (
    text.includes('music') ||
    text.includes('música') ||
    text.includes('musica') ||
    text.includes('hit') ||
    text.includes('canção') ||
    text.includes('cancao') ||
    text.includes('song') ||
    text.includes('faixa')
  );
}

/**
 * Checks if a category is thumbnail-oriented (Thumbnail of the Year, Capa, etc.)
 */
export function isThumbnailCategory(category?: Category | null): boolean {
  if (!category) return false;
  const text = `${category.title} ${category.subtitle} ${category.description} ${category.id}`.toLowerCase();
  return (
    text.includes('thumb') ||
    text.includes('capa') ||
    text.includes('banner')
  );
}

/**
 * Checks if a nominee has music attached (either via youtubeUrl, projectMediaUrl or music clip type)
 */
export function getNomineeYouTubeUrl(nominee?: Nominee | null): string | null {
  if (!nominee) return null;
  if (nominee.youtubeUrl && extractYouTubeId(nominee.youtubeUrl)) {
    return nominee.youtubeUrl;
  }
  if (nominee.projectMediaUrl && extractYouTubeId(nominee.projectMediaUrl)) {
    return nominee.projectMediaUrl;
  }
  return null;
}

/**
 * Checks if a nominee has a 16:9 thumbnail attached
 */
export function getNomineeThumbnailUrl(nominee?: Nominee | null): string | null {
  if (!nominee) return null;
  if (nominee.thumbnailUrl && nominee.thumbnailUrl.trim()) {
    return nominee.thumbnailUrl.trim();
  }
  return null;
}
