import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  GitCompareArrows,
  Star,
  Trophy,
  CalendarDays,
  Weight,
  Percent,
  MessageCircle,
  MessageSquareText,
  Award,
  PanelRightOpen,
  PanelRightClose,
  ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import type { ProgressPhoto } from './types';

// ─── Types ───────────────────────────────────────────

interface PhotoLightboxProps {
  photo: ProgressPhoto | null;
  photos: ProgressPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (photo: ProgressPhoto) => void;
  onToggleCompare: (photo: ProgressPhoto) => void;
  isInCompare: boolean;
}

// ─── Helpers ─────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Front':
      return 'bg-blue-600 text-white';
    case 'Back':
      return 'bg-purple-600 text-white';
    case 'Side':
      return 'bg-amber-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

function getCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

// ─── Component ───────────────────────────────────────

export function PhotoLightbox({
  photo,
  photos,
  isOpen,
  onClose,
  onNavigate,
  onToggleCompare,
  isInCompare,
}: PhotoLightboxProps) {
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Navigation ──
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setImageLoaded(false);
      setImgError(false);
      onNavigate(photos[currentIndex - 1]);
    }
  }, [hasPrevious, currentIndex, photos, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setImageLoaded(false);
      setImgError(false);
      onNavigate(photos[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, photos, onNavigate]);

  // ── Keyboard Support ──
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'i':
        case 'I':
          if (e.ctrlKey || e.metaKey) return;
          setShowInfoPanel((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  // ── Body Scroll Lock ──
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ── Reset state on open/photo change ──
  useEffect(() => {
    if (isOpen && photo) {
      setImageLoaded(false);
      setImgError(false);
    }
  }, [isOpen, photo?.id]);

  // ── Download ──
  const handleDownload = async () => {
    if (!photo) return;
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `azfit-progress-${photo.date}-${photo.category}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download image.');
    }
  };

  // ── Swipe Support ──
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  // ── Render ──
  if (!isOpen || !photo) return null;

  const hasNotes = !!photo.notes && photo.notes.trim().length > 0;
  const hasTrainerNotes = !!photo.trainerNotes && photo.trainerNotes.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ═══════════ TOP TOOLBAR ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center justify-between border-b border-white/10 px-4 py-3"
          >
            {/* Left: Counter + Info Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400">
                {currentIndex + 1} / {photos.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfoPanel((prev) => !prev)}
                className="h-8 gap-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200"
              >
                {showInfoPanel ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightOpen className="h-3.5 w-3.5" />
                )}
                Info
              </Button>
            </div>

            {/* Center: Quick Badges */}
            <div className="hidden items-center gap-2 sm:flex">
              {photo.isGoalAchieved && (
                <Badge className="border-yellow-500/50 bg-yellow-500/20 text-yellow-400">
                  <Trophy className="mr-1 h-3 w-3" />
                  Goal Achieved
                </Badge>
              )}
              {photo.isMilestone && (
                <Badge className="border-purple-500/50 bg-purple-500/20 text-purple-400">
                  <Star className="mr-1 h-3 w-3" />
                  Milestone
                </Badge>
              )}
            </div>

            {/* Right: Actions + Close */}
            <div className="flex items-center gap-1">
              {/* Compare Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleCompare(photo)}
                className={`h-8 gap-1.5 text-xs transition-colors ${
                  isInCompare
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                {isInCompare ? 'Comparing' : 'Compare'}
              </Button>

              {/* Download */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 gap-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>

              <Separator orientation="vertical" className="mx-1 h-5 bg-white/10" />

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* ═══════════ MAIN CONTENT ═══════════ */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* ── Image Area ── */}
            <div
              ref={imageContainerRef}
              className="relative flex flex-1 items-center justify-center"
            >
              {/* Loading Spinner */}
              {!imageLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-10 w-10 rounded-full border-[3px] border-gray-600 border-t-white"
                  />
                </div>
              )}

              {/* Error State */}
              {imgError && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <ZoomIn className="h-12 w-12" />
                  <p className="text-sm">Failed to load image</p>
                </div>
              )}

              {/* Image */}
              <motion.img
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: imageLoaded && !imgError ? 1 : 0,
                  scale: imageLoaded && !imgError ? 1 : 0.95,
                }}
                transition={{ duration: 0.3 }}
                src={photo.url}
                alt={`Progress photo - ${photo.category} - ${formatDisplayDate(photo.date)}`}
                className="max-h-[90vh] max-w-full object-contain"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImgError(true);
                  setImageLoaded(true);
                }}
              />

              {/* ── Navigation Arrows ── */}
              {hasPrevious && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>
              )}

              {hasNext && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              )}

              {/* ── Mobile Info Toggle (bottom center) ── */}
              <button
                onClick={() => setShowInfoPanel((prev) => !prev)}
                className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-gray-300 backdrop-blur-sm sm:hidden"
              >
                {showInfoPanel ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
                {showInfoPanel ? 'Hide Info' : 'Show Info'}
              </button>
            </div>

            {/* ── Info Panel ── */}
            <AnimatePresence>
              {showInfoPanel && (
                <motion.div
                  initial={{ opacity: 0, x: 60, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 60, width: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute right-0 top-0 h-full border-l border-white/10 bg-gray-900/95 backdrop-blur-md sm:relative sm:w-80 sm:min-w-[320px]"
                >
                  <ScrollArea className="h-full">
                    <div className="space-y-5 p-5">
                      {/* Header */}
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {formatDisplayDate(photo.date)}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-400">
                          {getDayOfWeek(photo.date)}
                        </p>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Category</span>
                        <Badge className={getCategoryColor(photo.category)}>
                          {getCategoryLabel(photo.category)}
                        </Badge>
                      </div>

                      {/* Measurements */}
                      {(photo.weight !== undefined || photo.bodyFatPercentage !== undefined) && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="space-y-3">
                            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              Measurements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {photo.weight !== undefined && (
                                <div className="rounded-lg bg-gray-800 p-3">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Weight className="h-3.5 w-3.5" />
                                    <span className="text-xs">Weight</span>
                                  </div>
                                  <p className="mt-1 text-lg font-semibold text-white">
                                    {photo.weight}
                                    <span className="ml-0.5 text-sm font-normal text-gray-400">
                                      kg
                                    </span>
                                  </p>
                                </div>
                              )}
                              {photo.bodyFatPercentage !== undefined && (
                                <div className="rounded-lg bg-gray-800 p-3">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Percent className="h-3.5 w-3.5" />
                                    <span className="text-xs">Body Fat</span>
                                  </div>
                                  <p className="mt-1 text-lg font-semibold text-white">
                                    {photo.bodyFatPercentage}
                                    <span className="ml-0.5 text-sm font-normal text-gray-400">
                                      %
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Client Notes */}
                      {hasNotes && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                Client Notes
                              </span>
                            </div>
                            <p className="rounded-lg bg-gray-800 p-3 text-sm leading-relaxed text-gray-300">
                              {photo.notes}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Trainer Notes */}
                      {hasTrainerNotes && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <MessageSquareText className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium uppercase tracking-wider text-emerald-500">
                                Trainer Notes
                              </span>
                            </div>
                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm leading-relaxed text-emerald-100">
                              {photo.trainerNotes}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Badges Section */}
                      <Separator className="bg-white/10" />
                      <div className="space-y-3">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Recognition
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {photo.isGoalAchieved && (
                            <Badge className="border-yellow-500/30 bg-yellow-500/15 text-yellow-400">
                              <Trophy className="mr-1 h-3 w-3" />
                              Goal Achieved
                            </Badge>
                          )}
                          {photo.isMilestone && (
                            <Badge className="border-purple-500/30 bg-purple-500/15 text-purple-400">
                              <Award className="mr-1 h-3 w-3" />
                              Milestone
                            </Badge>
                          )}
                          {!photo.isGoalAchieved && !photo.isMilestone && (
                            <span className="text-xs text-gray-600">No special badges</span>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Strip */}
                      {photos.length > 1 && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="space-y-2">
                            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              All Photos ({photos.length})
                            </h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {photos.map((p, idx) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setImageLoaded(false);
                                    setImgError(false);
                                    onNavigate(p);
                                  }}
                                  className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                                    idx === currentIndex
                                      ? 'border-emerald-500 opacity-100'
                                      : 'border-transparent opacity-50 hover:opacity-80'
                                  }`}
                                >
                                  <img
                                    src={p.thumbnailUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Metadata Footer */}
                      <div className="pt-2 text-xs text-gray-600">
                        <p>Photo ID: {photo.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══════════ BOTTOM BAR ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center justify-between border-t border-white/10 px-4 py-2"
          >
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDisplayDate(photo.date)}</span>
              <Badge
                variant="outline"
                className="border-gray-600 bg-transparent text-[10px] text-gray-400"
              >
                {getCategoryLabel(photo.category)}
              </Badge>
              {photo.weight !== undefined && (
                <span className="hidden sm:inline">{photo.weight} kg</span>
              )}
            </div>

            {/* Keyboard Hints */}
            <div className="hidden items-center gap-3 text-[10px] text-gray-600 lg:flex">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-400">
                  ←
                </kbd>
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-400">
                  →
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-400">
                  I
                </kbd>
                Info
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-400">
                  ESC
                </kbd>
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
