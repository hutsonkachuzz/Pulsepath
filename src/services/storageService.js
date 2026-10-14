import { api } from './api';

/**
 * Upload a photo to the backend server
 * @param {File} file - Browser File object
 * @param {string} [path] - Optional contextual path or tag
 * @returns {Promise<string>} Uploaded file URL
 */
export async function uploadImage(file, path) {
  if (!file) throw new Error('No file provided');

  // If file is already a string URL, return it
  if (typeof file === 'string') return file;

  const result = await api.uploadFile(file);
  return result.url;
}
