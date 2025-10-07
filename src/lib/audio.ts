import { supabase } from './supabase';

/**
 * Get audio URL for a given category and filename
 * @param categorySlug - Category slug (e.g., 'daily-expression')
 * @param filename - Audio filename (e.g., 'Daily_Expressions_001_1.mp3')
 * @returns Full public URL to the audio file
 */
export function getAudioUrl(categorySlug: string, filename: string): string {
  const { data } = supabase.storage
    .from('audio-files')
    .getPublicUrl(`${categorySlug}/${filename}`);

  return data.publicUrl;
}

/**
 * Extract category slug and filename from a full audio path
 * @param audioPath - Full path (e.g., 'daily-expression/Daily_Expressions_001_1.mp3')
 * @returns Object with categorySlug and filename
 */
export function parseAudioPath(audioPath: string): { categorySlug: string; filename: string } {
  const parts = audioPath.split('/');
  if (parts.length < 2) {
    throw new Error(`Invalid audio path: ${audioPath}`);
  }

  return {
    categorySlug: parts[0],
    filename: parts.slice(1).join('/')
  };
}

/**
 * Build audio path for storage
 * @param categorySlug - Category slug
 * @param filename - Audio filename
 * @returns Path for storage (e.g., 'daily-expression/Daily_Expressions_001_1.mp3')
 */
export function buildAudioPath(categorySlug: string, filename: string): string {
  return `${categorySlug}/${filename}`;
}
