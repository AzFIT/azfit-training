import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  ChevronDown,
  Calendar,
  Weight,
  Activity,
  Tag,
  MessageSquare,
  ChevronUp,
  ArrowLeftRight,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ProgressPhoto } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PhotoComparisonProps {
  photo1: ProgressPhoto;
  photo2: ProgressPhoto;
  allPhotos: ProgressPhoto[];
  onBack: () => void;
  onChangePhoto1: (photo: ProgressPhoto) => void;
  onChangePhoto2: (photo: ProgressPhoto) => void;
  isTrainer?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function calculateDiff(
  value1?: number,
  value2?: number
): { diff: number; direction: 'up' | 'down' | 'same' } {
  if (value1 === undefined || value2 === undefined || value1 === null || value2 === null) {
    return { diff: 0, direction: 'same' };
  }
  const diff = value1 - value2;
  if (Math.abs(diff) < 0.05) return { diff: 0, direction: 'same' };
  return { diff: Math.abs(diff), direction: diff > 0 ? 'up' : 'down' };
}

function getWeeksApart(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24 * 7));
}

function getDaysApart(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatWeight(weight?: number): string {
  if (weight === undefined || weight === null) return '--';
  return `${weight.toFixed(1)} kg`;
}

function formatBodyFat(bf?: number): string {
  if (bf === undefined || bf === null) return '--';
  return `${bf.toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PhotoChangeDropdown({
  label,
  currentPhoto,
  allPhotos,
  onChange,
}: {
  label: string;
  currentPhoto: ProgressPhoto;
  allPhotos: ProgressPhoto[];
  onChange: (photo: ProgressPhoto) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        className="gap-2 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}:</span>
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[100px] truncate">
          {formatDate(currentPhoto.date)} — {currentPhoto.category}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
            >
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                Select a photo
              </div>
              {allPhotos
                .filter((p) => p.id !== currentPhoto.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      onChange(photo);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      className="w-10 h-10 rounded object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {formatDate(photo.date)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {photo.category}
                        {photo.weight !== undefined && ` • ${formatWeight(photo.weight)}`}
                      </p>
                    </div>
                  </button>
                ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComparisonPhotoPanel({
  photo,
  side,
  allPhotos,
  onChange,
  otherPhoto,
}: {
  photo: ProgressPhoto;
  side: 'left' | 'right';
  allPhotos: ProgressPhoto[];
  onChange: (photo: ProgressPhoto) => void;
  otherPhoto: ProgressPhoto;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const isLeft = side === 'left';

  const weightDiff = useMemo(
    () => calculateDiff(photo.weight, otherPhoto.weight),
    [photo.weight, otherPhoto.weight]
  );

  const bodyFatDiff = useMemo(
    () => calculateDiff(photo.bodyFatPercentage, otherPhoto.bodyFatPercentage),
    [photo.bodyFatPercentage, otherPhoto.bodyFatPercentage]
  );

  const sideLabel = isLeft ? 'Before' : 'After';
  const sideColor = isLeft ? 'bg-amber-600' : 'bg-emerald-600';

  return (
    <motion.div
      layout
      className="flex flex-col h-full flex-1"
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Photo */}
      <div className="relative flex-1 min-h-0 bg-gray-950 rounded-t-xl overflow-hidden flex items-center justify-center">
        <img
          src={photo.url}
          alt={`Progress photo ${formatDate(photo.date)}`}
          className="max-w-full max-h-full object-contain"
        />
        {/* Side badge */}
        <div
          className={cn(
            'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white',
            sideColor
          )}
        >
          {sideLabel}
        </div>
        {/* Category badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
          {photo.category}
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-xl p-4 space-y-3">
        {/* Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{formatDate(photo.date)}</span>
          </div>
          <PhotoChangeDropdown
            label={sideLabel}
            currentPhoto={photo}
            allPhotos={allPhotos}
            onChange={onChange}
          />
        </div>

        <Separator className="bg-gray-100 dark:bg-gray-800" />

        {/* Weight */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatWeight(photo.weight)}
            </span>
            {weightDiff.direction !== 'same' && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  weightDiff.direction === 'down'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                )}
              >
                {weightDiff.direction === 'down' ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUp className="w-3 h-3" />
                )}
                {weightDiff.diff.toFixed(1)} kg
              </span>
            )}
            {weightDiff.direction === 'same' && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Minus className="w-3 h-3" />
                0
              </span>
            )}
          </div>
        </div>

        {/* Body fat */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Body Fat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatBodyFat(photo.bodyFatPercentage)}
            </span>
            {bodyFatDiff.direction !== 'same' && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  bodyFatDiff.direction === 'down'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                )}
              >
                {bodyFatDiff.direction === 'down' ? (
                  <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUp className="w-3 h-3" />
                )}
                {bodyFatDiff.diff.toFixed(1)}%
              </span>
            )}
            {bodyFatDiff.direction === 'same' && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Minus className="w-3 h-3" />
                0
              </span>
            )}
          </div>
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <Badge
            variant="outline"
            className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
          >
            {photo.category}
          </Badge>
          {photo.isMilestone && (
            <Badge
              variant="default"
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
            >
              Milestone
            </Badge>
          )}
          {photo.isGoalAchieved && (
            <Badge
              variant="default"
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Goal Achieved
            </Badge>
          )}
        </div>

        {/* Notes toggle */}
        {(photo.notes || photo.trainerNotes) && (
          <div>
            <button
              onClick={() => setShowNotes((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notes</span>
              {showNotes ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2">
                    {photo.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-2.5">
                        <span className="font-medium text-gray-500 dark:text-gray-500">
                          Client note:{' '}
                        </span>
                        {photo.notes}
                      </p>
                    )}
                    {photo.trainerNotes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-md p-2.5">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          Trainer note:{' '}
                        </span>
                        {photo.trainerNotes}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ComparisonStats({
  photo1,
  photo2,
}: {
  photo1: ProgressPhoto;
  photo2: ProgressPhoto;
}) {
  const weightDiff = useMemo(
    () => calculateDiff(photo2.weight, photo1.weight),
    [photo1.weight, photo2.weight]
  );

  const bodyFatDiff = useMemo(
    () => calculateDiff(photo2.bodyFatPercentage, photo1.bodyFatPercentage),
    [photo1.bodyFatPercentage, photo2.bodyFatPercentage]
  );

  const weeksApart = useMemo(
    () => getWeeksApart(photo1.date, photo2.date),
    [photo1.date, photo2.date]
  );

  const daysApart = useMemo(
    () => getDaysApart(photo1.date, photo2.date),
    [photo1.date, photo2.date]
  );

  const stats = [
    {
      label: 'Weight Change',
      value:
        weightDiff.direction === 'same'
          ? 'No change'
          : `${weightDiff.direction === 'down' ? '-' : '+'}${weightDiff.diff.toFixed(1)} kg`,
      icon: Weight,
      positive: weightDiff.direction === 'down',
      neutral: weightDiff.direction === 'same',
      raw: `${formatWeight(photo1.weight)} → ${formatWeight(photo2.weight)}`,
    },
    {
      label: 'Body Fat Change',
      value:
        bodyFatDiff.direction === 'same'
          ? 'No change'
          : `${bodyFatDiff.direction === 'down' ? '-' : '+'}${bodyFatDiff.diff.toFixed(1)}%`,
      icon: Activity,
      positive: bodyFatDiff.direction === 'down',
      neutral: bodyFatDiff.direction === 'same',
      raw: `${formatBodyFat(photo1.bodyFatPercentage)} → ${formatBodyFat(photo2.bodyFatPercentage)}`,
    },
    {
      label: 'Time Elapsed',
      value: weeksApart > 0 ? `${weeksApart} week${weeksApart !== 1 ? 's' : ''}` : `${daysApart} day${daysApart !== 1 ? 's' : ''}`,
      icon: Clock,
      positive: true,
      neutral: false,
      raw: `${formatDate(photo1.date)} → ${formatDate(photo2.date)}`,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-400" />
        Comparison Summary
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
            <p
              className={cn(
                'text-base font-bold',
                stat.neutral
                  ? 'text-gray-600 dark:text-gray-400'
                  : stat.positive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
              )}
            >
              {stat.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {stat.raw}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function PhotoComparison({
  photo1: initialPhoto1,
  photo2: initialPhoto2,
  allPhotos,
  onBack,
  onChangePhoto1,
  onChangePhoto2,
}: PhotoComparisonProps) {
  const [swapped, setSwapped] = useState(false);
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  /* Swap without affecting parent state */
  const leftPhoto = swapped ? initialPhoto2 : initialPhoto1;
  const rightPhoto = swapped ? initialPhoto1 : initialPhoto2;

  const handleSwap = useCallback(() => {
    setSwapped((p) => !p);
  }, []);

  const handleDownload = useCallback(() => {
    setShowDownloadToast(true);
    setTimeout(() => setShowDownloadToast(false), 2500);
  }, []);

  const weeksApart = useMemo(
    () => getWeeksApart(initialPhoto1.date, initialPhoto2.date),
    [initialPhoto1.date, initialPhoto2.date]
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* ====== Top Toolbar ====== */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back + title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Gallery</span>
              </Button>
              <Separator
                orientation="vertical"
                className="h-5 bg-gray-200 dark:bg-gray-700"
              />
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                Photo Comparison
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Swap button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span className="hidden sm:inline">Swap</span>
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Download toast */}
        <AnimatePresence>
          {showDownloadToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg"
            >
              Comparison downloaded
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====== Main Content ====== */}
      <div className="flex-1 flex flex-col">
        {/* Comparison area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left panel */}
          <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 p-3 md:p-4 md:pr-2">
            <ComparisonPhotoPanel
              photo={leftPhoto}
              side="left"
              allPhotos={allPhotos}
              onChange={(photo) => {
                if (swapped) {
                  onChangePhoto2(photo);
                } else {
                  onChangePhoto1(photo);
                }
              }}
              otherPhoto={rightPhoto}
            />
          </div>

          {/* Center divider */}
          <div className="flex items-center justify-center py-2 md:py-0 md:px-1">
            <div className="flex md:flex-col items-center gap-2">
              <div className="w-16 md:w-px h-px md:h-12 bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  VS
                </span>
              </div>
              <div className="w-16 md:w-px h-px md:h-12 bg-gray-300 dark:bg-gray-700" />
              <Badge
                variant="outline"
                className="text-xs border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 md:mt-1 whitespace-nowrap"
              >
                {weeksApart > 0
                  ? `${weeksApart}w apart`
                  : `${getDaysApart(initialPhoto1.date, initialPhoto2.date)}d apart`}
              </Badge>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 p-3 md:p-4 md:pl-2">
            <ComparisonPhotoPanel
              photo={rightPhoto}
              side="right"
              allPhotos={allPhotos}
              onChange={(photo) => {
                if (swapped) {
                  onChangePhoto1(photo);
                } else {
                  onChangePhoto2(photo);
                }
              }}
              otherPhoto={leftPhoto}
            />
          </div>
        </div>

        {/* ====== Bottom Stats ====== */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <ComparisonStats photo1={initialPhoto1} photo2={initialPhoto2} />
        </div>
      </div>
    </div>
  );
}
