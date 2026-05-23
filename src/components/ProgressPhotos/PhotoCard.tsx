import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Trophy,
  MessageCircle,
  MessageSquareText,
  Maximize2,
  Trash2,
  Award,
  MoreVertical,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { ProgressPhoto } from './types';

// ─── Types ───────────────────────────────────────────

interface PhotoCardProps {
  photo: ProgressPhoto;
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (photo: ProgressPhoto) => void;
  onView: (photo: ProgressPhoto) => void;
  onDelete: (id: string) => void;
  isTrainer?: boolean;
}

// ─── Helpers ─────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Front':
      return 'bg-blue-600/80 text-white';
    case 'Back':
      return 'bg-purple-600/80 text-white';
    case 'Side':
      return 'bg-amber-600/80 text-white';
    default:
      return 'bg-gray-600/80 text-white';
  }
}

function getCategoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Component ───────────────────────────────────────

export function PhotoCard({
  photo,
  isSelected,
  selectionMode,
  onSelect,
  onView,
  onDelete,
  isTrainer = false,
}: PhotoCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTrainerNoteDialog, setShowTrainerNoteDialog] = useState(false);
  const [trainerNoteDraft, setTrainerNoteDraft] = useState(photo.trainerNotes || '');

  // ── Handlers ──
  const handleImageError = () => {
    setImgError(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking checkbox or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-navigate]')) return;

    if (selectionMode) {
      onSelect(photo);
    } else {
      onView(photo);
    }
  };

  const handleToggleMilestone = () => {
    toast.success(
      photo.isMilestone ? 'Milestone removed from photo.' : 'Photo marked as milestone!'
    );
  };

  const handleSaveTrainerNote = () => {
    setShowTrainerNoteDialog(false);
    toast.success('Trainer note saved successfully.');
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete(photo.id);
    toast.success('Photo deleted successfully.');
  };

  const hasNotes = !!photo.notes && photo.notes.trim().length > 0;
  const hasTrainerNotes = !!photo.trainerNotes && photo.trainerNotes.trim().length > 0;

  // ── Render ──
  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: selectionMode ? 1 : 1.02 }}
        whileTap={{ scale: selectionMode ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800 ${
          isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-gray-900' : ''
        }`}
      >
        {/* ── Image Container ── */}
        <div className="relative aspect-square overflow-hidden bg-gray-900">
          {imgError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-800 text-gray-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                <Maximize2 className="h-5 w-5" />
              </div>
              <span className="text-xs">Image unavailable</span>
            </div>
          ) : (
            <>
              <img
                src={photo.thumbnailUrl}
                alt={`Progress photo - ${photo.category} - ${formatDisplayDate(photo.date)}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={handleImageError}
              />

              {/* ── Hover Overlay ── */}
              <motion.div
                initial={false}
                animate={{ opacity: isHovered && !selectionMode ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              >
                <div className="p-3">
                  {/* Date */}
                  <p className="text-sm font-semibold text-white">
                    {formatDisplayDate(photo.date)}
                  </p>

                  {/* Category Badge */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${getCategoryColor(photo.category)}`}
                    >
                      {getCategoryLabel(photo.category)}
                    </Badge>

                    {photo.weight !== undefined && (
                      <span className="text-xs text-gray-300">{photo.weight} kg</span>
                    )}

                    {photo.bodyFatPercentage !== undefined && (
                      <span className="text-xs text-gray-300">
                        {photo.bodyFatPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Notes Indicator */}
                  {hasNotes && (
                    <div className="mt-1.5 flex items-center gap-1 text-gray-400">
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-[10px] text-gray-400">Has notes</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* ── Selection Checkbox ── */}
          <AnimatePresence>
            {selectionMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                data-no-navigate
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(photo);
                }}
                className="absolute right-2 top-2 z-10"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-500 bg-black/50'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Milestone Badge ── */}
          {(photo.isMilestone || photo.isGoalAchieved) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute left-2 top-2 z-10 flex items-center gap-1"
            >
              {photo.isGoalAchieved && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/90 shadow-lg">
                  <Trophy className="h-3.5 w-3.5 text-yellow-950" />
                </div>
              )}
              {photo.isMilestone && !photo.isGoalAchieved && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/90 shadow-lg">
                  <Star className="h-3.5 w-3.5 text-yellow-950" />
                </div>
              )}
            </motion.div>
          )}

          {/* ── Trainer Notes Indicator ── */}
          {hasTrainerNotes && (
            <div className="absolute bottom-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/90 shadow-md">
              <MessageSquareText className="h-2.5 w-2.5 text-white" />
            </div>
          )}

          {/* ── Context Menu (Dropdown) ── */}
          {!selectionMode && (
            <div
              data-no-navigate
              className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-gray-700 bg-gray-800 text-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <DropdownMenuItem
                    onClick={() => onView(photo)}
                    className="cursor-pointer text-xs focus:bg-gray-700 focus:text-gray-100 dark:focus:bg-gray-700"
                  >
                    <Maximize2 className="mr-2 h-3.5 w-3.5" />
                    View Full Size
                  </DropdownMenuItem>

                  {isTrainer && (
                    <DropdownMenuItem
                      onClick={() => {
                        setTrainerNoteDraft(photo.trainerNotes || '');
                        setShowTrainerNoteDialog(true);
                      }}
                      className="cursor-pointer text-xs focus:bg-gray-700 focus:text-gray-100 dark:focus:bg-gray-700"
                    >
                      <MessageSquareText className="mr-2 h-3.5 w-3.5" />
                      {hasTrainerNotes ? 'Edit Trainer Note' : 'Add Trainer Note'}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleToggleMilestone}
                    className="cursor-pointer text-xs focus:bg-gray-700 focus:text-gray-100 dark:focus:bg-gray-700"
                  >
                    <Award className="mr-2 h-3.5 w-3.5" />
                    {photo.isMilestone ? 'Remove Milestone' : 'Mark as Milestone'}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700 dark:bg-gray-700" />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer text-xs text-red-400 focus:bg-gray-700 focus:text-red-300 dark:text-red-400 dark:focus:bg-gray-700"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* ── Bottom Info Bar ── */}
        <div className="flex items-center justify-between border-t border-gray-700/50 px-3 py-2 dark:border-gray-700/50">
          <span className="text-xs text-gray-400 dark:text-gray-400">
            {formatDisplayDate(photo.date)}
          </span>
          <Badge
            variant="outline"
            className="border-gray-600 bg-transparent text-[10px] text-gray-400 dark:border-gray-600 dark:text-gray-400"
          >
            {getCategoryLabel(photo.category)}
          </Badge>
        </div>
      </motion.div>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border-gray-700 bg-gray-800 text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-4 w-4 text-red-400" />
              Delete Photo
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 dark:text-gray-400">
              Are you sure you want to delete this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-gray-900/60 p-3 dark:bg-gray-900/60">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-400">Date:</span>{' '}
              {formatDisplayDate(photo.date)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium text-gray-400">Category:</span>{' '}
              {getCategoryLabel(photo.category)}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-gray-100 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Trainer Note Dialog ── */}
      {isTrainer && (
        <Dialog open={showTrainerNoteDialog} onOpenChange={setShowTrainerNoteDialog}>
          <DialogContent className="border-gray-700 bg-gray-800 text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4 text-emerald-400" />
                {hasTrainerNotes ? 'Edit Trainer Note' : 'Add Trainer Note'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 dark:text-gray-400">
                Photo from {formatDisplayDate(photo.date)} —{' '}
                {getCategoryLabel(photo.category)} view
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300 dark:text-gray-300">
                  Trainer Notes
                </label>
                <Textarea
                  value={trainerNoteDraft}
                  onChange={(e) => setTrainerNoteDraft(e.target.value)}
                  placeholder="Add your professional observations, feedback, or notes..."
                  className="min-h-[100px] resize-none border-gray-700 bg-gray-900 text-sm text-gray-200 placeholder:text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrainerNoteDialog(false)}
                className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-gray-100 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTrainerNote}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
