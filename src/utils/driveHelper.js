/**
 * driveHelper.js
 * Google Drive share URL → direct streaming URL converter
 */

/**
 * Extracts FILE_ID from a Google Drive share URL and returns a direct download/stream URL.
 * Supports:
 *   - https://drive.google.com/file/d/{FILE_ID}/view
 *   - https://drive.google.com/open?id={FILE_ID}
 *   - Already a direct URL (returned as-is)
 */
export function driveToDirectUrl(shareUrl) {
  if (!shareUrl) return '';

  if (shareUrl.includes('dropbox.com')) {
    return shareUrl.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
  }

  // Already a direct stream URL
  if (shareUrl.includes('docs.google.com/uc')) return shareUrl;

  // Match /file/d/{FILE_ID}/
  const fileIdMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://docs.google.com/uc?export=download&id=${fileIdMatch[1]}`;
  }

  // Match open?id={FILE_ID}
  const openIdMatch = shareUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) {
    return `https://docs.google.com/uc?export=download&id=${openIdMatch[1]}`;
  }

  // Return as-is if no pattern matched (might be a raw URL)
  return shareUrl;
}

/**
 * Extracts just the FILE_ID from a Google Drive share URL.
 */
export function extractDriveFileId(shareUrl) {
  if (!shareUrl) return null;
  const fileIdMatch = shareUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) return fileIdMatch[1];
  const openIdMatch = shareUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) return openIdMatch[1];
  return null;
}
