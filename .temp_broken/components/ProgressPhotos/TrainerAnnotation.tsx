import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Trophy,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  PencilLine,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TrainerAnnotationProps {
  photoId: string;
  trainerNotes?: string;
  isMilestone?: boolean;
  isGoalAchieved?: boolean;
  onSave: (
    id: string,
    data: {
      trainerNotes: string;
      isMilestone: boolean;
      isGoalAchieved: boolean;
    }
  ) => void;
  compact?: boolean;
}

interface AnnotationFormData {
  trainerNotes: string;
  isMilestone: boolean;
  isGoalAchieved: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_NOTE_LENGTH = 500;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SaveToast({ show, message }: { show: boolean; message: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LastUpdated({ timestamp }: { timestamp?: string }) {
  if (!timestamp) return null;

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <Clock className="w-3 h-3" />
      <span>Last updated: {formatDateTime(timestamp)}</span>
    </div>
  );
}

function MilestoneToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5 border border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            checked
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          )}
        >
          <Star className={cn('w-4 h-4', checked && 'fill-current')} />
        </div>
        <Label
          htmlFor="milestone-toggle"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Mark as Milestone
        </Label>
      </div>
      <Switch
        id="milestone-toggle"
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-amber-500"
      />
    </div>
  );
}

function GoalAchievedToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5 border border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            checked
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          )}
        >
          <Trophy className={cn('w-4 h-4', checked && 'fill-current')} />
        </div>
        <Label
          htmlFor="goal-toggle"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Goal Achieved
        </Label>
      </div>
      <Switch
        id="goal-toggle"
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  );
}

function AnnotationForm({
  initialData,
  lastUpdated,
  onSave,
  onCancel,
}: {
  initialData: AnnotationFormData;
  lastUpdated?: string;
  onSave: (data: AnnotationFormData) => void;
  onCancel?: () => void;
}) {
  const [notes, setNotes] = useState(initialData.trainerNotes);
  const [isMilestone, setIsMilestone] = useState(initialData.isMilestone);
  const [isGoalAchieved, setIsGoalAchieved] = useState(initialData.isGoalAchieved);
  const [showSaved, setShowSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
    }
  }, [notes]);

  const characterCount = notes.length;
  const isOverLimit = characterCount > MAX_NOTE_LENGTH;

  const handleSave = useCallback(() => {
    if (isOverLimit) return;
    onSave({
      trainerNotes: notes,
      isMilestone,
      isGoalAchieved,
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  }, [notes, isMilestone, isGoalAchieved, isOverLimit, onSave]);

  /* Save on Ctrl+Enter */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <div className="space-y-4">
      <SaveToast show={showSaved} message="Annotation saved successfully" />

      {/* Textarea */}
      <div className="space-y-2">
        <Label
          htmlFor="trainer-notes"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Trainer Notes
        </Label>
        <Textarea
          ref={textareaRef}
          id="trainer-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your observations, feedback, or notes about this progress photo..."
          className={cn(
            'min-h-[96px] resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
            'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600',
            isOverLimit && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          )}
        />
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs',
              isOverLimit
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            {characterCount}/{MAX_NOTE_LENGTH}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Ctrl+Enter to save
          </span>
        </div>
      </div>

      <Separator className="bg-gray-100 dark:bg-gray-800" />

      {/* Toggles */}
      <div className="space-y-2.5">
        <MilestoneToggle checked={isMilestone} onChange={setIsMilestone} />
        <GoalAchievedToggle
          checked={isGoalAchieved}
          onChange={setIsGoalAchieved}
        />
      </div>

      {/* Timestamp */}
      <LastUpdated timestamp={lastUpdated} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isOverLimit}
          className={cn(
            'gap-2 bg-blue-600 hover:bg-blue-700 text-white',
            isOverLimit && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact Mode                                                       */
/* ------------------------------------------------------------------ */

function TrainerAnnotationCompact({
  trainerNotes,
  isMilestone,
  isGoalAchieved,
  onExpand,
}: {
  trainerNotes?: string;
  isMilestone?: boolean;
  isGoalAchieved?: boolean;
  onExpand: () => void;
}) {
  const hasContent =
    !!trainerNotes || !!isMilestone || !!isGoalAchieved;

  return (
    <Card
      className={cn(
        'p-2.5 cursor-pointer transition-all duration-200',
        'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
        'hover:shadow-sm'
      )}
      onClick={onExpand}
    >
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div
          className={cn(
            'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
            hasContent
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          )}
        >
          <PencilLine className="w-3.5 h-3.5" />
        </div>

        {/* Note preview */}
        <div className="flex-1 min-w-0">
          {trainerNotes ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {trainerNotes}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              Tap to add trainer notes...
            </p>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isMilestone && (
            <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Star className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-current" />
            </div>
          )}
          {isGoalAchieved && (
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-current" />
            </div>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Full Inline Mode                                                   */
/* ------------------------------------------------------------------ */

function TrainerAnnotationFull({
  photoId,
  trainerNotes,
  isMilestone,
  isGoalAchieved,
  onSave,
}: Omit<TrainerAnnotationProps, 'compact'>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Compact preview (always visible) */}
      <div onClick={() => setExpanded((p) => !p)}>
        <div className="p-3 flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
            Trainer Annotation
          </span>
          <div className="flex items-center gap-1.5">
            {isMilestone && (
              <Badge
                variant="outline"
                className="text-xs border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 gap-1"
              >
                <Star className="w-3 h-3 fill-current" />
                Milestone
              </Badge>
            )}
            {isGoalAchieved && (
              <Badge
                variant="outline"
                className="text-xs border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 gap-1"
              >
                <Trophy className="w-3 h-3 fill-current" />
                Goal
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1">
              <Separator className="mb-3 bg-gray-100 dark:bg-gray-800" />
              <AnnotationForm
                initialData={{
                  trainerNotes: trainerNotes ?? '',
                  isMilestone: isMilestone ?? false,
                  isGoalAchieved: isGoalAchieved ?? false,
                }}
                onSave={onSave}
                onCancel={() => setExpanded(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TrainerAnnotation({
  photoId,
  trainerNotes,
  isMilestone,
  isGoalAchieved,
  onSave,
  compact = false,
}: TrainerAnnotationProps) {
  const handleSave = useCallback(
    (data: AnnotationFormData) => {
      onSave(photoId, data);
    },
    [photoId, onSave]
  );

  if (compact) {
    return (
      <TrainerAnnotationCompact
        trainerNotes={trainerNotes}
        isMilestone={isMilestone}
        isGoalAchieved={isGoalAchieved}
        onExpand={() => {}}
      />
    );
  }

  return (
    <TrainerAnnotationFull
      photoId={photoId}
      trainerNotes={trainerNotes}
      isMilestone={isMilestone}
      isGoalAchieved={isGoalAchieved}
      onSave={handleSave}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog Wrapper                                                     */
/* ------------------------------------------------------------------ */

export function TrainerAnnotationDialog({
  photoId,
  photoDate,
  photoCategory,
  thumbnailUrl,
  trainerNotes,
  isMilestone,
  isGoalAchieved,
  onSave,
  open,
  onOpenChange,
}: {
  photoId: string;
  photoDate: string;
  photoCategory: string;
  thumbnailUrl: string;
  trainerNotes?: string;
  isMilestone?: boolean;
  isGoalAchieved?: boolean;
  onSave: (
    id: string,
    data: {
      trainerNotes: string;
      isMilestone: boolean;
      isGoalAchieved: boolean;
    }
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = useCallback(
    (data: AnnotationFormData) => {
      onSave(photoId, data);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    },
    [photoId, onSave]
  );

  const formatDate = (date: string): string => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Trainer Annotation
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Add notes and markers for this progress photo.
          </DialogDescription>
        </DialogHeader>

        {/* Photo preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
          <img
            src={thumbnailUrl}
            alt=""
            className="w-14 h-14 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(photoDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {photoCategory} view
            </p>
          </div>
        </div>

        <AnnotationForm
          initialData={{
            trainerNotes: trainerNotes ?? '',
            isMilestone: isMilestone ?? false,
            isGoalAchieved: isGoalAchieved ?? false,
          }}
          onSave={handleSave}
          lastUpdated={new Date().toISOString()}
        />

        <SaveToast show={showSaved} message="Annotation saved" />
      </DialogContent>
    </Dialog>
  );
}
