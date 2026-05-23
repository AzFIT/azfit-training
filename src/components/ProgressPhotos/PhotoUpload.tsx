import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Camera, Check, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import type { PhotoCategory } from './types';

// ─── Types ───────────────────────────────────────────

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  date: Date;
  category: PhotoCategory;
  notes: string;
  isUploading: boolean;
  isUploaded: boolean;
}

interface PhotoUploadProps {
  clientId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CATEGORY_OPTIONS: { value: PhotoCategory; label: string }[] = [
  { value: 'Front', label: 'Front' },
  { value: 'Back', label: 'Back' },
  { value: 'Side', label: 'Side' },
  { value: 'Other', label: 'Other' },
];

// ─── Helpers ─────────────────────────────────────────

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Component ───────────────────────────────────────

export function PhotoUpload({ clientId: _clientId, onUploadComplete, maxFiles = 10 }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validation ──
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported format. Only JPEG, PNG, and WebP are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds 5MB limit.`;
    }
    return null;
  };

  // ── File Processing ──
  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = Array.from(files);

    if (selectedFiles.length + newFiles.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} photos at once.`);
      return;
    }

    const validFiles: SelectedFile[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        continue;
      }

      validFiles.push({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        date: new Date(),
        category: 'Front',
        notes: '',
        isUploading: false,
        isUploaded: false,
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} photo(s) added successfully.`);
    }
  };

  // ── Drag & Drop Handlers ──
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [selectedFiles.length]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleClickBrowse = () => {
    fileInputRef.current?.click();
  };

  // ── Remove File ──
  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // ── Update Metadata ──
  const updateFileMetadata = (id: string, updates: Partial<SelectedFile>) => {
    setSelectedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // ── Upload ──
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    // Mark all as uploading
    setSelectedFiles((prev) => prev.map((f) => ({ ...f, isUploading: true })));

    // Simulate upload for each file sequentially with stagger
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileId = selectedFiles[i].id;

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, isUploading: false, isUploaded: true } : f))
      );
    }

    toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);
    setIsUploading(false);

    // Cleanup previews after successful upload
    selectedFiles.forEach((f) => {
      URL.revokeObjectURL(f.previewUrl);
    });

    setSelectedFiles([]);
    onUploadComplete?.();
  };

  // ── Render ──
  return (
    <div className="w-full space-y-6">
      {/* ── Hidden File Input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ── Dropzone ── */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickBrowse}
        animate={{
          borderColor: isDragging ? '#10b981' : '#4b5563',
          backgroundColor: isDragging ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        className="group relative cursor-pointer rounded-xl border-2 border-dashed border-gray-600 p-10 text-center transition-colors hover:border-gray-500 dark:border-gray-600"
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{
              scale: isDragging ? 1.15 : 1,
              y: isDragging ? -5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 dark:bg-gray-800"
          >
            {isDragging ? (
              <Camera className="h-8 w-8 text-emerald-500" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 group-hover:text-gray-300" />
            )}
          </motion.div>

          <div>
            <p className="text-lg font-medium text-gray-200 dark:text-gray-200">
              {isDragging ? 'Drop photos here' : 'Drag & drop photos here'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              or click to browse files
            </p>
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <span>JPEG, PNG, WebP</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>Max 5MB each</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>Up to {maxFiles} files</span>
          </div>
        </div>
      </motion.div>

      {/* ── Preview Strip with Metadata ── */}
      <AnimatePresence mode="popLayout">
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-200">
                {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                  setSelectedFiles([]);
                }}
                className="h-8 text-xs text-gray-400 hover:text-gray-200"
              >
                Clear all
              </Button>
            </div>

            <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {selectedFiles.map((selectedFile) => (
                  <motion.div
                    key={selectedFile.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative flex gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-900">
                      <img
                        src={selectedFile.previewUrl}
                        alt={selectedFile.file.name}
                        className="h-full w-full object-cover"
                      />
                      {selectedFile.isUploaded && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60"
                        >
                          <Check className="h-8 w-8 text-emerald-400" />
                        </motion.div>
                      )}
                      {selectedFile.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent"
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata Form */}
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-200 dark:text-gray-200">
                          {selectedFile.file.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Date Picker */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-400 dark:text-gray-400">
                            Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-gray-700 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800 hover:text-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              >
                                <CalendarDays className="mr-2 h-3.5 w-3.5 text-gray-500" />
                                {formatDateInput(selectedFile.date)}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto border-gray-700 bg-gray-800 p-0 dark:border-gray-700 dark:bg-gray-800"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={selectedFile.date}
                                onSelect={(date) =>
                                  date && updateFileMetadata(selectedFile.id, { date })
                                }
                                initialFocus
                                className="rounded-md border-0 dark:bg-gray-800"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Category Select */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-400 dark:text-gray-400">
                            Category
                          </Label>
                          <Select
                            value={selectedFile.category}
                            onValueChange={(value: PhotoCategory) =>
                              updateFileMetadata(selectedFile.id, { category: value })
                            }
                          >
                            <SelectTrigger className="border-gray-700 bg-gray-900 text-xs text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-800">
                              {CATEGORY_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-gray-300 focus:bg-gray-700 focus:text-gray-100 dark:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-gray-100"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 dark:text-gray-400">
                          Notes <span className="text-gray-600">(optional)</span>
                        </Label>
                        <Textarea
                          placeholder="Add notes about this photo..."
                          value={selectedFile.notes}
                          onChange={(e) =>
                            updateFileMetadata(selectedFile.id, { notes: e.target.value })
                          }
                          className="min-h-[60px] resize-none border-gray-700 bg-gray-900 text-xs text-gray-200 placeholder:text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(selectedFile.id);
                      }}
                      disabled={selectedFile.isUploading || selectedFile.isUploaded}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Upload Button ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end"
            >
              <Button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="min-w-[160px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700"
              >
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`} Photos
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty State ── */}
      {selectedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-500"
        >
          <Image className="h-4 w-4" />
          <span>No photos selected. Drag files above or click to browse.</span>
        </motion.div>
      )}
    </div>
  );
}
