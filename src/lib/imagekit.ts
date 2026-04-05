/**
 * ImageKit Integration Module
 * Handles image uploads to ImageKit and returns the secure URL
 */

export const IMAGEKIT_CONFIG = {
  publicKey: 'public_lT+S//48BmQ2epbCM9ZrfTzcGw4=',
  urlEndpoint: 'https://ik.imagekit.io/qjg532nyu',
  authenticatorUrl: '/api/imagekit-auth', // Backend endpoint to get auth token
};

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  filePath: string;
  url: string;
  secure_url: string;
  width?: number;
  height?: number;
  size: number;
  hasAlpha?: boolean;
  mime: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload an image file to ImageKit
 * @param file - The image file to upload
 * @param folderPath - Optional folder path in ImageKit (default: '/ai-tools')
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadToImageKit(
  file: File,
  folderPath: string = '/ai-tools'
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name.split('.')[0]);
    formData.append('folder', folderPath);

    // Using ImageKit Backend API (requires backend implementation)
    // For now, we'll use a direct approach (in production, use backend auth)
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa('private_TRKZBgfKT88S5U00rExoZ8GwZgo:')}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImageKit upload failed: ${response.statusText}`);
    }

    const data: ImageKitUploadResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
}

/**
 * Generate ImageKit URL with transformations
 * @param imagePath - The filePath or URL from ImageKit
 * @param transformations - Optional transformation parameters
 * @returns The transformed ImageKit URL
 */
export function getImageKitUrl(
  imagePath: string,
  transformations?: Record<string, string | number>
): string {
  if (!imagePath) return '';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const baseUrl = IMAGEKIT_CONFIG.urlEndpoint;
  let url = `${baseUrl}${imagePath}`;

  // Add transformations if provided
  if (transformations) {
    const params = new URLSearchParams();
    Object.entries(transformations).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url += `?${params.toString()}`;
  }

  return url;
}

/**
 * Get optimized image URL with width/height
 * @param imagePath - The file path or URL
 * @param width - Image width
 * @param height - Image height
 * @returns Optimized ImageKit URL
 */
export function getOptimizedImageUrl(
  imagePath: string,
  width?: number,
  height?: number
): string {
  const transformations: Record<string, string | number> = {};

  if (width) transformations.w = width;
  if (height) transformations.h = height;
  if (width || height) transformations.c = 'scale';

  return getImageKitUrl(imagePath, transformations);
}

export default {
  uploadToImageKit,
  getImageKitUrl,
  getOptimizedImageUrl,
  IMAGEKIT_CONFIG,
};
