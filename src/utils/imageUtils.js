/**
 * High-performance Client-side Image Compression & Binary/Base64 Conversion Utility
 * Specifically engineered for storing photos directly in Firestore documents within Firebase Free Tier (Spark Plan).
 * Keeps compressed images between 60KB - 200KB (well below Firestore's 1 MiB document limit).
 */

/**
 * Compresses an image File or Blob and converts it to a high-quality, web-optimized Base64 Data URL.
 * @param {File|Blob|string} fileInput - The file, blob, or image data URL to compress
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1200] - Max output width
 * @param {number} [options.maxHeight=1200] - Max output height
 * @param {number} [options.quality=0.78] - JPEG quality factor (0.1 to 1.0)
 * @param {number} [options.maxSizeBytes=450000] - Hard ceiling in bytes (~450KB max)
 * @returns {Promise<{ dataUrl: string, sizeBytes: number, width: number, height: number }>}
 */
export async function compressAndConvertToBase64(fileInput, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.78,
    maxSizeBytes = 450 * 1024 // 450KB limit to easily fit Firestore's 1MB cap
  } = options;

  if (!fileInput) {
    throw new Error('No image provided to compress');
  }

  // 1. Read input as source URL
  let sourceUrl = '';
  if (typeof fileInput === 'string') {
    sourceUrl = fileInput;
  } else {
    sourceUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileInput);
    });
  }

  // 2. Load into HTML Image
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error('Failed to load image for compression'));
    image.src = sourceUrl;
  });

  // 3. Compute proportional dimensions
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 4. Draw to Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill with dark romantic background in case of transparent PNG
  ctx.fillStyle = '#14081c';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(img, 0, 0, width, height);

  // 5. Convert to Base64 JPEG data URL
  let currentQuality = quality;
  let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

  // Estimate approximate byte size of base64
  let sizeBytes = Math.round((dataUrl.length * 3) / 4);

  // If still above threshold, step down quality slightly
  let attempts = 0;
  while (sizeBytes > maxSizeBytes && currentQuality > 0.45 && attempts < 4) {
    currentQuality -= 0.12;
    dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    sizeBytes = Math.round((dataUrl.length * 3) / 4);
    attempts++;
  }

  return {
    dataUrl,
    sizeBytes,
    width,
    height
  };
}

/**
 * Format bytes into human-readable string (e.g. "124 KB")
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validates if string is an image data URL or standard web URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:');
}

/**
 * Converts stored binary / Base64 data back to a web-renderable Image Data URL when fetching from Firestore.
 * Supports:
 * - Full Data URLs ("data:image/jpeg;base64,...")
 * - Raw Base64 strings ("/9j/4AAQSkZJRg...")
 * - Web URLs ("https://...")
 * - Binary ArrayBuffer / Uint8Array
 * @param {string|Uint8Array|ArrayBuffer|Blob} rawData
 * @param {string} [mimeType='image/jpeg']
 * @returns {string} Ready-to-render image src URL
 */
export function ensureImageDataUrl(rawData, mimeType = 'image/jpeg') {
  if (!rawData) return '';

  // Already a valid Data URL, Web URL, or Blob URL
  if (typeof rawData === 'string') {
    const trimmed = rawData.trim();
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    // Raw Base64 string from Firestore -> convert to Data URL
    return `data:${mimeType};base64,${trimmed}`;
  }

  // Uint8Array or ArrayBuffer binary stored data
  if (rawData instanceof Uint8Array || rawData instanceof ArrayBuffer) {
    const bytes = rawData instanceof Uint8Array ? rawData : new Uint8Array(rawData);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  }

  // Blob
  if (typeof Blob !== 'undefined' && rawData instanceof Blob) {
    return URL.createObjectURL(rawData);
  }

  return String(rawData);
}

/**
 * High-level helper for handling File picker inputs:
 * Compresses an uploaded image file, tracks size reduction statistics,
 * and produces a Firestore-ready Base64 string for the free tier.
 */
export async function processUploadedImage(file, options = {}) {
  if (!file) throw new Error('No file selected');
  const originalSize = file.size;

  const result = await compressAndConvertToBase64(file, options);
  const compressedSize = result.sizeBytes;
  const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

  return {
    ...result,
    originalSize,
    originalSizeFormatted: formatBytes(originalSize),
    compressedSizeFormatted: formatBytes(compressedSize),
    savingsPercent
  };
}

/**
 * Converts a Base64 data URL to a native binary Blob (useful if needed for downloads or canvas ops)
 */
export function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
