/**
 * ProgressPhotos — barrel export
 *
 * Central entry-point for everything in the Progress Photos feature.
 * Import from here to avoid deep / brittle relative paths.
 *
 *   import { ProgressPhotosTab, usePhotoStore } from './ProgressPhotos';
 */

/* -- Main container -- */
export { default as ProgressPhotos } from './ProgressPhotos';

/* -- Tab wrapper (register this in ClientProfile tabs array) -- */
export { default as ProgressPhotosTab } from './ProgressPhotosTab';

/* -- Sub-components -- */
export { default as PhotoGallery } from './PhotoGallery';
export { default as PhotoComparison } from './PhotoComparison';
export { default as PhotoUpload } from './PhotoUpload';
export { default as PhotoCard } from './PhotoCard';
export { default as PhotoFilterBar } from './PhotoFilterBar';
export { default as PhotoLightbox } from './PhotoLightbox';
export { default as TrainerAnnotation } from './TrainerAnnotation';

/* -- Shared types -- */
export * from './types';

/* -- Zustand store -- */
export { default as usePhotoStore } from './usePhotoStore';

/* -- Demo / seed data -- */
export { demoPhotos } from './demoPhotos';
