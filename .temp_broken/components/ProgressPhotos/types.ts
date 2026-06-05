/**
 * AzFIT Progress Photos — Shared Type Definitions
 * ============================================================
 * Co-located type definitions for the Progress Photos feature.
 * All dates stored as YYYY-MM-DD strings; displayed as DD/MM/YYYY.
 */

/** Valid photo category labels used for categorising progress shots. */
export type PhotoCategory = 'Front' | 'Back' | 'Side' | 'Other';

/** Available sort options for photo listings. */
export type SortOption = 'date-desc' | 'date-asc' | 'category';

/** Available view modes for the progress photos UI. */
export type ViewMode = 'gallery' | 'comparison' | 'upload';

/**
 * Represents a single progress photo entry in the system.
 * All date fields use YYYY-MM-DD format for storage consistency.
 */
export interface ProgressPhoto {
  /** Unique identifier for the photo record. */
  id: string;
  /** Reference to the client this photo belongs to. */
  clientId: string;
  /** Full-resolution image URL. */
  url: string;
  /** Thumbnail image URL for gallery grids. */
  thumbnailUrl: string;
  /** Date the photo was taken (YYYY-MM-DD storage format). */
  date: string;
  /** Physical orientation / category of the photo. */
  category: PhotoCategory;
  /** Optional client-facing notes about this photo entry. */
  notes?: string;
  /** Client weight in kilograms at the time of the photo. */
  weight?: number;
  /** Estimated body fat percentage at the time of the photo. */
  bodyFatPercentage?: number;
  /** Internal trainer annotations (not visible to client). */
  trainerNotes?: string;
  /** Whether this photo marks a significant milestone. */
  isMilestone?: boolean;
  /** Whether this photo represents an achieved goal. */
  isGoalAchieved?: boolean;
  /** ISO timestamp when the record was created. */
  createdAt: string;
  /** ISO timestamp when the record was last updated. */
  updatedAt: string;
}

/**
 * Filter criteria for narrowing down photo collections.
 * Used by the store's `filteredPhotos` getter and UI filter controls.
 */
export interface PhotoFilter {
  /** Optional inclusive date range bound. */
  dateRange: { from?: string; to?: string };
  /** Category filter — `'All'` disables category filtering. */
  category: PhotoCategory | 'All';
  /** Quick-select time period for common date ranges. */
  timePeriod: 'Week' | 'Month' | 'Year' | 'All';
}

/**
 * Pair of photos selected for side-by-side comparison.
 */
export interface PhotoComparison {
  /** The "before" or left-side photo. */
  photo1: ProgressPhoto;
  /** The "after" or right-side photo. */
  photo2: ProgressPhoto;
}

/**
 * Groups all progress photos for a single client.
 * Useful for trainer dashboards and client overview screens.
 */
export interface ClientPhotoCollection {
  /** Client identifier. */
  clientId: string;
  /** Human-readable client name. */
  clientName: string;
  /** All photos belonging to this client. */
  photos: ProgressPhoto[];
  /** ISO timestamp of the most recent photo upload. */
  lastUpdated: string;
}

/**
 * Extends `ProgressPhoto` with denormalised client name information.
 * Used in trainer-facing lists where the client name must be displayed
 * alongside each photo without a separate lookup.
 */
export interface PhotoWithClientInfo extends ProgressPhoto {
  /** Display name of the associated client. */
  clientName: string;
}
