import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  GitCompareArrows,
  CheckSquare,
  Square,
  X,
  ImageIcon,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ProgressPhoto, PhotoFilter, SortOption } from './types';
import { PhotoFilterBar } from './PhotoFilterBar';
import { PhotoCard } from './PhotoCard';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PhotoGalleryProps {
  photos: ProgressPhoto[];
  selectedIds: string[];
  filter: PhotoFilter;
  sort: SortOption;
  onPhotoSelect: (photo: ProgressPhoto) => void;
  onPhotoView: (photo: ProgressPhoto) => void;
  onPhotoDelete: (id: string) => void;
  onFilterChange: (filter: Partial<PhotoFilter>) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  onEnterUpload: () => void;
  onEnterComparison: (photos: [ProgressPhoto, ProgressPhoto]) => void;
  isTrainer?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Sort helpers                                                       */
/* ------------------------------------------------------------------ */

function sortPhotos(photos: ProgressPhoto[], sort: SortOption): ProgressPhoto[] {
  const sorted = [...photos];
  switch (sort) {
    case 'date-desc':
      return sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'date-asc':
      return sorted.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case 'category':
      return sorted.sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    default:
      return sorted;
  }
}

/* ------------------------------------------------------------------ */
/*  hasActiveFilters helper                                            */
/* ------------------------------------------------------------------ */

function hasActiveFilters(filter: PhotoFilter): boolean {
  const hasDateRange =
    filter.dateRange?.from !== undefined || filter.dateRange?.to !== undefined;
  const hasCategory = filter.category !== 'All';
  const hasTimePeriod = filter.timePeriod !== 'All';
  return hasDateRange || hasCategory || hasTimePeriod;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PhotoGallery({
  photos,
  selectedIds,
  filter,
  sort,
  onPhotoSelect,
  onPhotoView,
  onPhotoDelete,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onEnterUpload,
  onEnterComparison,
  isTrainer = false,
}: PhotoGalleryProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* -- derived state -- */
  const filteredAndSorted = useMemo(
    () => sortPhotos([...photos], sort),
    [photos, sort]
  );

  const activeFilters = useMemo(() => hasActiveFilters(filter), [filter]);

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selectedIds.includes(p.id)),
    [photos, selectedIds]
  );

  const canCompare = selectedIds.length === 2;

  /* -- handlers -- */
  const handleToggleSelection = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        // Exiting selection mode: clear all selections
        selectedPhotos.forEach((photo) => onPhotoSelect(photo));
      }
      return !prev;
    });
  }, [selectedPhotos, onPhotoSelect]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    selectedPhotos.forEach((photo) => onPhotoSelect(photo));
  }, [selectedPhotos, onPhotoSelect]);

  const handleCompareSelected = useCallback(() => {
    if (canCompare && selectedPhotos.length === 2) {
      onEnterComparison([selectedPhotos[0], selectedPhotos[1]]);
      setSelectionMode(false);
    }
  }, [canCompare, selectedPhotos, onEnterComparison]);

  /* -- empty state (no photos at all) -- */
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Photos Yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Start tracking your progress by uploading your first progress
              photo.
            </p>
            <Button
              onClick={onEnterUpload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload First Photo
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* ====== Header ====== */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: title + actions */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Progress Photos
              </h1>
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {photos.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((p) => !p)}
                className={cn(
                  'gap-2 transition-colors',
                  activeFilters &&
                    'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilters && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </Button>

              {/* Sort dropdown trigger */}
              <div className="relative group">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {sort === 'date-desc'
                      ? 'Newest'
                      : sort === 'date-asc'
                        ? 'Oldest'
                        : 'Category'}
                  </span>
                </Button>
                {/* Sort options dropdown */}
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  {(
                    [
                      ['date-desc', 'Newest First'],
                      ['date-asc', 'Oldest First'],
                      ['category', 'Category'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => onSortChange(value)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm transition-colors',
                        sort === value
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection mode toggle */}
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleSelection}
                className={cn(
                  'gap-2',
                  selectionMode &&
                    'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                {selectionMode ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {selectionMode ? 'Done' : 'Select'}
                </span>
              </Button>

              {/* Compare button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareSelected}
                disabled={!canCompare}
                className={cn(
                  'gap-2 transition-all',
                  canCompare &&
                    'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                )}
              >
                <GitCompareArrows className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </Button>

              {/* Upload button */}
              <Button
                size="sm"
                onClick={onEnterUpload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>

          {/* Selection mode instruction bar */}
          <AnimatePresence>
            {selectionMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Select 2 photos to compare
                    </span>
                    <Badge
                      variant={
                        selectedIds.length === 2 ? 'default' : 'secondary'
                      }
                      className={cn(
                        selectedIds.length === 2 &&
                          'bg-emerald-600 text-white'
                      )}
                    >
                      {selectedIds.length} of 2 selected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCompare && (
                      <Button
                        size="sm"
                        onClick={handleCompareSelected}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <GitCompareArrows className="w-4 h-4" />
                        Compare Selected
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSelection}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====== Filter Bar (expanded, outside header) ====== */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <PhotoFilterBar
                filter={filter}
                sort={sort}
                resultCount={filteredAndSorted.length}
                onFilterChange={onFilterChange}
                onSortChange={onSortChange}
                onClearFilters={onClearFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Content ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active filter summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSorted.length} photo
            {filteredAndSorted.length !== 1 ? 's' : ''}
          </p>
          {activeFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 gap-1"
            >
              <X className="w-3 h-3" />
              Clear all filters
            </Button>
          )}
        </div>

        {/* Photo Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map((photo) => (
              <motion.div
                key={photo.id}
                variants={itemVariants}
                layout
                layoutId={photo.id}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.2 },
                }}
              >
                <PhotoCard
                  photo={photo}
                  isSelected={selectedIds.includes(photo.id)}
                  selectionMode={selectionMode}
                  isTrainer={isTrainer}
                  onSelect={() => onPhotoSelect(photo)}
                  onView={() => onPhotoView(photo)}
                  onDelete={() => onPhotoDelete(photo.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
