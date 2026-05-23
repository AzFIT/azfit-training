import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  LayoutGrid,
  GitCompareArrows,
  Upload,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { PhotoGallery } from './PhotoGallery';
import { PhotoComparison } from './PhotoComparison';
import { PhotoUpload } from './PhotoUpload';
import { PhotoLightbox } from './PhotoLightbox';
import { PhotoFilterBar } from './PhotoFilterBar';
import { usePhotoStore } from './usePhotoStore';

import type { ProgressPhoto, SortOption } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProgressPhotosProps {
  clientId: string;
  clientName?: string;
  isTrainer?: boolean;
}

interface ViewConfig {
  id: 'gallery' | 'comparison' | 'upload';
  label: string;
  icon: React.ElementType;
  disabled?: (store: ReturnType<typeof usePhotoStore>) => boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VIEWS: ViewConfig[] = [
  { id: 'gallery', label: 'Gallery', icon: LayoutGrid },
  {
    id: 'comparison',
    label: 'Compare',
    icon: GitCompareArrows,
    disabled: (s) => !s.canCompare,
  },
  { id: 'upload', label: 'Upload', icon: Upload },
];

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function ProgressPhotos({
  clientId,
  clientName,
  isTrainer = false,
}: ProgressPhotosProps) {
  /* -- Store -- */
  const store = usePhotoStore();
  const {
    filteredPhotos,
    selectedPhotos,
    selectedPhotoIds,
    canCompare,
    viewMode,
    isLoading,
    error,
    filters,
    sortOption,
    loadPhotos,
    setViewMode,
    setFilters,
    setSortOption,
    toggleSelectedPhoto,
    clearSelectedPhotos,
    deletePhoto,
    resetFilters,
  } = store;

  /* -- Local state -- */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ProgressPhoto | null>(null);

  /* -- Load photos on mount / clientId change -- */
  useEffect(() => {
    if (clientId) {
      loadPhotos(clientId);
    }
  }, [clientId, loadPhotos]);

  /* -- Handlers -- */

  const handlePhotoView = useCallback(
    (photo: ProgressPhoto) => {
      setLightboxPhoto(photo);
      setLightboxOpen(true);
    },
    []
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
    setTimeout(() => setLightboxPhoto(null), 300);
  }, []);

  const handleLightboxNavigate = useCallback(
    (photo: ProgressPhoto) => {
      setLightboxPhoto(photo);
    },
    []
  );

  const handleToggleCompare = useCallback(
    (photo: ProgressPhoto) => {
      toggleSelectedPhoto(photo);
    },
    [toggleSelectedPhoto]
  );

  const handleEnterComparison = useCallback(
    (photos: [ProgressPhoto, ProgressPhoto]) => {
      clearSelectedPhotos();
      toggleSelectedPhoto(photos[0]);
      toggleSelectedPhoto(photos[1]);
      setViewMode('comparison');
    },
    [clearSelectedPhotos, toggleSelectedPhoto, setViewMode]
  );

  const handleChangeComparisonPhoto = useCallback(
    (index: 0 | 1, photo: ProgressPhoto) => {
      const current = selectedPhotos;
      const other = current[index === 0 ? 1 : 0];
      clearSelectedPhotos();
      toggleSelectedPhoto(photo);
      if (other) toggleSelectedPhoto(other);
    },
    [clearSelectedPhotos, toggleSelectedPhoto, selectedPhotos]
  );

  const handleSwitchView = useCallback(
    (mode: 'gallery' | 'comparison' | 'upload') => {
      setViewMode(mode);
      if (mode !== 'comparison') {
        clearSelectedPhotos();
      }
    },
    [setViewMode, clearSelectedPhotos]
  );

  const handleFilterChange = useCallback(
    (filterUpdate: Partial<typeof filters>) => {
      setFilters(filterUpdate);
    },
    [setFilters]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setSortOption(sort);
    },
    [setSortOption]
  );

  const handlePhotoDelete = useCallback(
    (id: string) => {
      deletePhoto(id);
    },
    [deletePhoto]
  );

  /* -- Derived -- */
  const totalPhotos = filteredPhotos.length;
  const selectedCount = selectedPhotos.length;
  const comparisonPair: [ProgressPhoto, ProgressPhoto] | null =
    selectedPhotos.length === 2
      ? [selectedPhotos[0], selectedPhotos[1]]
      : null;

  /* -- Loading state -- */
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
        <p className="text-sm text-gray-400">Loading progress photos...</p>
      </div>
    );
  }

  /* -- Error state -- */
  if (error) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
        <div className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadPhotos(clientId)}
          className="border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gray-950 text-gray-100">
      {/* ============================================================ */}
      {/*  Header                                                       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-30 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
          {/* Left: Title + Client */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 ring-1 ring-teal-500/20">
              <Camera className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-50">
                Progress Photos
              </h1>
              {clientName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{clientName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: View Switcher */}
          <nav className="flex items-center gap-1 rounded-lg bg-gray-900/80 p-1 ring-1 ring-gray-800/60">
            {VIEWS.map((view) => {
              const isDisabled = view.disabled ? view.disabled(store) : false;
              const isActive = viewMode === view.id;
              const Icon = view.icon;

              return (
                <button
                  key={view.id}
                  disabled={isDisabled}
                  onClick={() => handleSwitchView(view.id)}
                  className={`
                    relative flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'text-gray-50'
                        : 'text-gray-500 hover:text-gray-300 disabled:text-gray-700'
                    }
                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeViewIndicator"
                      className="absolute inset-0 rounded-md bg-gray-800 shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{view.label}</span>
                  </span>

                  {/* Selected count badge on comparison tab */}
                  {view.id === 'comparison' && selectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="relative z-10 ml-0.5 h-5 min-w-5 justify-center border-0 bg-teal-500/20 p-0 px-1.5 text-[10px] font-bold text-teal-400"
                    >
                      {selectedCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sub-info bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-3 md:px-6">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              <span className="font-medium text-gray-300">{totalPhotos}</span>{' '}
              photo{totalPhotos !== 1 ? 's' : ''}
            </span>
            {selectedCount > 0 && (
              <>
                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                <span>
                  <span className="font-medium text-teal-400">{selectedCount}</span>{' '}
                  selected for compare
                </span>
              </>
            )}
          </div>

          {/* Photo count by category */}
          {totalPhotos > 0 && (
            <div className="hidden items-center gap-2 sm:flex">
              {(['Front', 'Back', 'Side', 'Other'] as const).map((cat) => {
                const count = filteredPhotos.filter(
                  (p) => p.category === cat
                ).length;
                if (count === 0) return null;
                return (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="border-gray-700/50 bg-gray-900/60 px-2 py-0.5 text-[10px] font-normal text-gray-500"
                  >
                    {cat}: {count}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/*  Filter Bar (Gallery & Comparison only)                       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {(viewMode === 'gallery' || viewMode === 'comparison') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-800/60"
          >
            <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
              <PhotoFilterBar
                filter={filters}
                sort={sortOption}
                resultCount={totalPhotos}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onClearFilters={resetFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  Main Content — View Switching                                */}
      {/* ============================================================ */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <AnimatePresence mode="wait">
          {viewMode === 'gallery' && (
            <motion.div key="gallery" {...VIEW_TRANSITION}>
              <PhotoGallery
                photos={filteredPhotos}
                selectedIds={selectedPhotoIds}
                filter={filters}
                sort={sortOption}
                onPhotoSelect={toggleSelectedPhoto}
                onPhotoView={handlePhotoView}
                onPhotoDelete={handlePhotoDelete}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onClearFilters={resetFilters}
                onEnterUpload={() => handleSwitchView('upload')}
                onEnterComparison={handleEnterComparison}
                isTrainer={isTrainer}
              />
            </motion.div>
          )}

          {viewMode === 'comparison' && comparisonPair && (
            <motion.div key="comparison" {...VIEW_TRANSITION}>
              <PhotoComparison
                photo1={comparisonPair[0]}
                photo2={comparisonPair[1]}
                allPhotos={filteredPhotos}
                onBack={() => handleSwitchView('gallery')}
                onChangePhoto1={(photo) => handleChangeComparisonPhoto(0, photo)}
                onChangePhoto2={(photo) => handleChangeComparisonPhoto(1, photo)}
                isTrainer={isTrainer}
              />
            </motion.div>
          )}

          {viewMode === 'upload' && (
            <motion.div key="upload" {...VIEW_TRANSITION}>
              <PhotoUpload
                clientId={clientId}
                onUploadComplete={() => handleSwitchView('gallery')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ============================================================ */}
      {/*  Lightbox (Portal-style overlay)                              */}
      {/* ============================================================ */}
      <AnimatePresence>
        {lightboxOpen && lightboxPhoto && (
          <PhotoLightbox
            photo={lightboxPhoto}
            photos={filteredPhotos}
            isOpen={lightboxOpen}
            onClose={handleCloseLightbox}
            onNavigate={handleLightboxNavigate}
            onToggleCompare={handleToggleCompare}
            isInCompare={selectedPhotoIds.includes(lightboxPhoto.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProgressPhotos;
