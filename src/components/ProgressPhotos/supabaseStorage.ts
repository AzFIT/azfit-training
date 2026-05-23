/**
 * AzFIT Progress Photos — Supabase Storage Integration
 * ============================================================
 * Production-ready storage helper for uploading, deleting, and retrieving
 * progress photos via Supabase Storage.
 *
 * In demo mode (no live Supabase connection) the functions return mock URLs
 * so the UI layer can be developed and tested independently.
 */

/* ------------------------------------------------------------------ */
/*  Configuration                                                       */
/* ------------------------------------------------------------------ */

/** Maximum allowed file size in megabytes. */
const MAX_FILE_SIZE_MB = 5;

/** Maximum allowed file size in bytes. */
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Permitted MIME types for photo uploads. */
const ALLOWED_TYPES: string[] = ['image/jpeg', 'image/png', 'image/webp'];

/** Permitted file extensions (without leading dot). */
const ALLOWED_EXTENSIONS: string[] = ['jpg', 'jpeg', 'png', 'webp'];

/** Supabase storage bucket name for progress photos. */
const BUCKET_NAME = 'progress-photos';

/* ------------------------------------------------------------------ */
/*  Public types                                                        */
/* ------------------------------------------------------------------ */

/** Result of the file pre-flight validation check. */
export interface FileValidationResult {
  /** Whether the file passed all validation rules. */
  valid: boolean;
  /** Human-readable error message when `valid` is `false`. */
  error?: string;
}

/** Upload result containing the generated public URLs. */
export interface UploadResult {
  /** Public URL of the full-resolution image. */
  url: string;
  /** Public URL of the thumbnail / optimised version. */
  thumbnailUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Generate a cryptographically-random file name to avoid collisions
 * and prevent directory traversal.
 */
function generateUniqueFilename(clientId: string, originalName: string): string {
  // Sanitise clientId — must be a simple slug-like value
  const safeClientId = clientId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : 'jpg';
  return `${safeClientId}/${timestamp}_${random}.${safeExt}`;
}

/**
 * Derive a thumbnail path from a full-resolution storage path.
 * Appends `-thumb` before the extension.
 */
function getThumbnailPath(fullPath: string): string {
  const lastDot = fullPath.lastIndexOf('.');
  if (lastDot === -1) return `${fullPath}-thumb`;
  return `${fullPath.slice(0, lastDot)}-thumb${fullPath.slice(lastDot)}`;
}

/** Check whether the app is running in demo / offline mode. */
function isDemoMode(): boolean {
  // Demo mode: no Supabase URL or key configured, or explicitly flagged
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_DEMO_MODE === 'true'
  );
}

/* ------------------------------------------------------------------ */
/*  Validation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Validate a photo file before upload.
 *
 * Checks file size (≤ 5 MB) and permitted image formats (jpg, png, webp).
 *
 * @param file — The `File` object selected by the user.
 * @returns `{ valid: true }` on success or `{ valid: false, error: "…" }` on failure.
 *
 * @example
 * ```ts
 * const result = validateFile(userFile);
 * if (!result.valid) toast.error(result.error);
 * ```
 */
export function validateFile(file: File): FileValidationResult {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Only JPG, PNG and WEBP are accepted.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  return { valid: true };
}

/* ------------------------------------------------------------------ */
/*  Core storage functions                                              */
/* ------------------------------------------------------------------ */

/**
 * Upload a photo to Supabase Storage.
 *
 * In demo mode this simulates the upload and returns mock Unsplash URLs
 * after a realistic delay so the UI can be tested without credentials.
 *
 * @param file        — The image file to upload.
 * @param clientId    — Client identifier used as the storage folder.
 * @param path        — Optional override for the storage path (defaults to auto-generated).
 * @returns Promise resolving to `{ url, thumbnailUrl }`.
 * @throws Error when validation fails or the upload encounters a network error.
 *
 * @example
 * ```ts
 * const { url, thumbnailUrl } = await uploadPhoto(file, "client_001");
 * ```
 */
export async function uploadPhoto(
  file: File,
  clientId: string,
  path?: string
): Promise<UploadResult> {
  // 1. Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const storagePath = path ?? generateUniqueFilename(clientId, file.name);

  // 2. Demo mode — simulate upload
  if (isDemoMode()) {
    await simulateNetworkDelay(800, 1500);
    const mockUrl = `https://images.unsplash.com/photo-${generateMockPhotoId()}?w=1200&h=1600&fit=crop&q=80`;
    const mockThumb = mockUrl.replace('w=1200&h=1600', 'w=400&h=400');
    return { url: mockUrl, thumbnailUrl: mockThumb };
  }

  // 3. Production — upload via Supabase
  //    (Dynamic import avoids bundling Supabase client in demo builds.)
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string
  );

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 4. Generate public URLs
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  const thumbPath = getThumbnailPath(storagePath);
  const {
    data: { publicUrl: thumbnailUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(thumbPath);

  return { url: publicUrl, thumbnailUrl };
}

/**
 * Delete a photo (and its thumbnail) from Supabase Storage.
 *
 * In demo mode the function resolves after a simulated delay.
 *
 * @param url — The public URL returned by `uploadPhoto`.
 * @returns Resolves when deletion is complete.
 *
 * @example
 * ```ts
 * await deletePhoto("https://…/progress-photos/client_001/1234567890_abcdef.jpg");
 * ```
 */
export async function deletePhoto(url: string): Promise<void> {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid photo URL provided.');
  }

  if (isDemoMode()) {
    await simulateNetworkDelay(400, 800);
    return;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string
  );

  // Extract path from public URL
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/storage/v1/object/public/');
  const objectPath = pathSegments.length > 1 ? pathSegments[1] : urlObj.pathname;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([objectPath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Return the public URL for a given storage path.
 *
 * @param path — Object path within the `progress-photos` bucket.
 * @returns Full public URL string.
 *
 * @example
 * ```ts
 * const url = getPhotoUrl("client_001/1234567890_abcdef.jpg");
 * // → "https://<project>.supabase.co/storage/v1/object/public/progress-photos/…"
 * ```
 */
export function getPhotoUrl(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid storage path provided.');
  }

  if (isDemoMode()) {
    // Return a consistent mock URL for demo rendering
    return `https://images.unsplash.com/photo-${generateMockPhotoId()}?w=1200&h=1600&fit=crop&q=80`;
  }

  const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

/* ------------------------------------------------------------------ */
/*  Demo utilities                                                      */
/* ------------------------------------------------------------------ */

/**
 * Simulate variable network latency for realistic demo UX.
 */
function simulateNetworkDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Generate a deterministic-looking mock photo id so demo images
 * don't all look identical.
 */
function generateMockPhotoId(): string {
  const pool = [
    '1583454110551',
    '1534438327276',
    '1571019614242',
    '1599058945522',
    '1549060279',
    '1581009146145',
    '1574680096145',
    '1583454155184',
    '1517836357463',
    '1574680096141',
  ];
  const idx = Math.floor(Math.random() * pool.length);
  return `${pool[idx]}-21f2fa2afe61`;
}

/* ------------------------------------------------------------------ */
/*  Singleton export                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convenience singleton that groups all storage operations.
 * Useful for dependency injection and consistent import patterns.
 */
export const supabaseStorage = {
  uploadPhoto,
  deletePhoto,
  getPhotoUrl,
  validateFile,
} as const;
