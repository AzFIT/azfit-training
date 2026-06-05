/**
 * AzFIT Progress Photos — Zustand Store
 * ============================================================
 * Centralised state management for the Progress Photos feature.
 *
 * Pattern: `create<StoreType>()(devtools(...))`
 * All dates stored YYYY-MM-DD; displayed DD/MM/YYYY in UI layer.
 *
 * Demo mode: auto-loads Alex Wong's 3-month transformation dataset.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ProgressPhoto,
  PhotoCategory,
  PhotoFilter,
  ViewMode,
  SortOption,
} from './types';
import { demoPhotos, demoClientId } from './demoPhotos';

/* ------------------------------------------------------------------ */
/*  Store state shape                                                   */
/* ------------------------------------------------------------------ */

interface PhotoStoreState {
  /* Data */
  /** All photos currently loaded in the store. */
  photos: ProgressPhoto[];

  /* Selection (comparison) */
  /** Photos selected for side-by-side comparison. */
  selectedPhotos: ProgressPhoto[];

  /* Filters & view */
  /** Active filter criteria applied to the photo list. */
  filters: PhotoFilter;
  /** Current UI view mode. */
  viewMode: ViewMode;
  /** Active sort option for the photo grid. */
  sortOption: SortOption;

  /* Async status */
  /** `true` while photos are being fetched from the API. */
  isLoading: boolean;
  /** Error message when the last operation failed; `null` otherwise. */
  error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Store actions                                                       */
/* ------------------------------------------------------------------ */

interface PhotoStoreActions {
  /** Load photos for a given client (mock implementation for demo). */
  loadPhotos: (clientId: string) => Promise<void>;

  /** Add a new photo to the collection.  ID and timestamps are auto-generated. */
  addPhoto: (photo: Omit<ProgressPhoto, 'id' | 'createdAt' | 'updatedAt'>) => void;

  /** Permanently remove a photo by ID. */
  deletePhoto: (id: string) => void;

  /** Partially update an existing photo record. */
  updatePhoto: (id: string, updates: Partial<ProgressPhoto>) => void;

  /** Toggle a photo in/out of the comparison selection (max 2). */
  toggleSelectedPhoto: (photo: ProgressPhoto) => void;

  /** Clear all selected comparison photos. */
  clearSelectedPhotos: () => void;

  /** Merge partial filter updates into the current filter state. */
  setFilters: (filters: Partial<PhotoFilter>) => void;

  /** Reset filters to their default wide-open state. */
  resetFilters: () => void;

  /** Switch the active UI view mode. */
  setViewMode: (mode: ViewMode) => void;

  /** Change the photo sort order. */
  setSortOption: (option: SortOption) => void;

  /** Append (or overwrite) a trainer note on a specific photo. */
  addTrainerNote: (id: string, note: string) => void;

  /** Toggle the milestone flag on a photo. */
  toggleMilestone: (id: string) => void;

  /** Toggle the goal-achieved flag on a photo. */
  toggleGoalAchieved: (id: string) => void;

  /** Explicitly set loading state (useful for external fetch orchestration). */
  setLoading: (loading: boolean) => void;

  /** Clear any active error message. */
  clearError: () => void;
}

/* ------------------------------------------------------------------ */
/*  Computed getters (defined as derived state + selectors)             */
/* ------------------------------------------------------------------ */

interface PhotoStoreGetters {
  /** Photos after applying active filters + time-period logic + sorting. */
  filteredPhotos: () => ProgressPhoto[];

  /** Filtered photos grouped by their category label. */
  photosByCategory: () => Record<PhotoCategory, ProgressPhoto[]>;

  /** Set of selected photo IDs for O(1) membership tests in the UI. */
  selectedPhotoIds: () => Set<string>;

  /** `true` when exactly 2 photos are selected — ready for comparison. */
  canCompare: () => boolean;

  /** Photos flagged as milestone or goal-achieved, sorted newest first. */
  milestonePhotos: () => ProgressPhoto[];
}

/* ------------------------------------------------------------------ */
/*  Combined store type                                                 */
/* ------------------------------------------------------------------ */

type PhotoStore = PhotoStoreState & PhotoStoreActions & PhotoStoreGetters;

/* ------------------------------------------------------------------ */
/*  Default / initial state                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_FILTERS: PhotoFilter = {
  dateRange: { from: undefined, to: undefined },
  category: 'All',
  timePeriod: 'All',
};

const initialState: PhotoStoreState = {
  photos: [],
  selectedPhotos: [],
  filters: { ...DEFAULT_FILTERS },
  viewMode: 'gallery',
  sortOption: 'date-desc',
  isLoading: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/*  Time-period helpers                                                 */
/* ------------------------------------------------------------------ */

/**
 * Compute the start date (YYYY-MM-DD) for a given quick-select time period
 * relative to a reference date (defaults to today).
 */
function getPeriodStart(period: PhotoFilter['timePeriod'], reference = new Date()): string | null {
  const d = new Date(reference);
  switch (period) {
    case 'Week':
      d.setDate(d.getDate() - 7);
      break;
    case 'Month':
      d.setMonth(d.getMonth() - 1);
      break;
    case 'Year':
      d.setFullYear(d.getFullYear() - 1);
      break;
    case 'All':
    default:
      return null;
  }
  return toISODate(d);
}

/** Format a Date as YYYY-MM-DD in local time (consistent with storage format). */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Compare two YYYY-MM-DD strings.  Returns negative if a < b, zero if equal, positive if a > b. */
function compareISODates(a: string, b: string): number {
  return a.localeCompare(b);
}

/* ------------------------------------------------------------------ */
/*  ID generator                                                        */
/* ------------------------------------------------------------------ */

/**
 * Generate a lexicographically-sortable unique photo ID.
 * Format: `photo_<timestamp>_<random>`
 */
function generatePhotoId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `photo_${ts}_${rand}`;
}

/* ------------------------------------------------------------------ */
/*  Store factory                                                       */
/* ------------------------------------------------------------------ */

export const usePhotoStore = create<PhotoStore>()(
  devtools(
    (set, get) => ({
      /* ── initial state ─────────────────────────────────────────── */
      ...initialState,

      /* ── async actions ─────────────────────────────────────────── */

      /**
       * Load photos for the specified client.
       *
       * In production this would fetch from Supabase.  For demo purposes
       * it filters the embedded `demoPhotos` array by `clientId`.
       */
      loadPhotos: async (clientId: string) => {
        set({ isLoading: true, error: null }, false, 'photos/loadPhotos/pending');

        try {
          // Simulate network latency for realistic UX
          await new Promise((resolve) => setTimeout(resolve, 600));

          const clientPhotos = demoPhotos.filter((p) => p.clientId === clientId);

          set(
            {
              photos: clientPhotos,
              isLoading: false,
              selectedPhotos: [], // reset selection on client switch
            },
            false,
            'photos/loadPhotos/fulfilled'
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load photos.';
          set({ isLoading: false, error: message }, false, 'photos/loadPhotos/rejected');
        }
      },

      /**
       * Add a new photo record.
       *
       * Auto-generates a unique ID and stamps `createdAt` / `updatedAt`.
       * The photo object is prepended so newest appears first by default.
       */
      addPhoto: (photo) => {
        const now = new Date().toISOString();
        const newPhoto: ProgressPhoto = {
          ...photo,
          id: generatePhotoId(),
          createdAt: now,
          updatedAt: now,
        };

        set(
          (state) => ({ photos: [newPhoto, ...state.photos] }),
          false,
          'photos/addPhoto'
        );
      },

      /**
       * Delete a photo by its unique identifier.
       *
       * Also removes it from the comparison selection if present.
       */
      deletePhoto: (id: string) => {
        set(
          (state) => ({
            photos: state.photos.filter((p) => p.id !== id),
            selectedPhotos: state.selectedPhotos.filter((p) => p.id !== id),
          }),
          false,
          'photos/deletePhoto'
        );
      },

      /**
       * Apply partial updates to an existing photo.
       *
       * The `updatedAt` timestamp is automatically refreshed.
       */
      updatePhoto: (id: string, updates: Partial<ProgressPhoto>) => {
        const now = new Date().toISOString();

        set(
          (state) => ({
            photos: state.photos.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: now } : p
            ),
            // Keep selectedPhotos in sync if the updated photo is selected
            selectedPhotos: state.selectedPhotos.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: now } : p
            ),
          }),
          false,
          'photos/updatePhoto'
        );
      },

      /* ── selection actions ─────────────────────────────────────── */

      /**
       * Toggle a photo in the comparison selection.
       *
       * - If already selected → remove it.
       * - If not selected and < 2 photos selected → add it.
       * - If 2 already selected → ignore (UI should gate this).
       */
      toggleSelectedPhoto: (photo: ProgressPhoto) => {
        set(
          (state) => {
            const isAlreadySelected = state.selectedPhotos.some((p) => p.id === photo.id);
            if (isAlreadySelected) {
              return {
                selectedPhotos: state.selectedPhotos.filter((p) => p.id !== photo.id),
              };
            }
            if (state.selectedPhotos.length >= 2) {
              // Enforce max 2 selection — no-op
              return {};
            }
            return { selectedPhotos: [...state.selectedPhotos, photo] };
          },
          false,
          'photos/toggleSelectedPhoto'
        );
      },

      /** Remove all photos from the comparison selection. */
      clearSelectedPhotos: () => {
        set({ selectedPhotos: [] }, false, 'photos/clearSelectedPhotos');
      },

      /* ── filter & view actions ─────────────────────────────────── */

      /** Merge partial filter values into the current filter state. */
      setFilters: (filters: Partial<PhotoFilter>) => {
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          'photos/setFilters'
        );
      },

      /** Reset all filters to their wide-open defaults. */
      resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } }, false, 'photos/resetFilters');
      },

      /** Switch the active view mode (gallery / comparison / upload). */
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode }, false, 'photos/setViewMode');
      },

      /** Change the sort order applied to filtered photos. */
      setSortOption: (option: SortOption) => {
        set({ sortOption: option }, false, 'photos/setSortOption');
      },

      /* ── annotation actions ────────────────────────────────────── */

      /**
       * Append a trainer note to a photo.
       *
       * If a note already exists, the new text is appended with a separator.
       */
      addTrainerNote: (id: string, note: string) => {
        const now = new Date().toISOString();
        set(
          (state) => ({
            photos: state.photos.map((p) => {
              if (p.id !== id) return p;
              const existing = p.trainerNotes ? p.trainerNotes.trim() : '';
              const separator = existing ? '\n---\n' : '';
              return {
                ...p,
                trainerNotes: `${existing}${separator}${note}`,
                updatedAt: now,
              };
            }),
          }),
          false,
          'photos/addTrainerNote'
        );
      },

      /** Toggle the `isMilestone` flag on a photo. */
      toggleMilestone: (id: string) => {
        const now = new Date().toISOString();
        set(
          (state) => ({
            photos: state.photos.map((p) =>
              p.id === id ? { ...p, isMilestone: !p.isMilestone, updatedAt: now } : p
            ),
          }),
          false,
          'photos/toggleMilestone'
        );
      },

      /** Toggle the `isGoalAchieved` flag on a photo. */
      toggleGoalAchieved: (id: string) => {
        const now = new Date().toISOString();
        set(
          (state) => ({
            photos: state.photos.map((p) =>
              p.id === id ? { ...p, isGoalAchieved: !p.isGoalAchieved, updatedAt: now } : p
            ),
          }),
          false,
          'photos/toggleGoalAchieved'
        );
      },

      /* ── utility actions ───────────────────────────────────────── */

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'photos/setLoading');
      },

      clearError: () => {
        set({ error: null }, false, 'photos/clearError');
      },

      /* ═════════════════════════════════════════════════════════════
         Computed getters
         These are defined as functions so they re-evaluate on every
         read using Zustand's stable selector pattern.
         ═════════════════════════════════════════════════════════════ */

      /**
       * Return the photo list after applying:
       *   1. Category filter
       *   2. Custom date-range filter
       *   3. Quick-select time-period filter
       *   4. Active sort option
       */
      filteredPhotos: () => {
        const state = get();
        const { photos, filters, sortOption } = state;

        let result = [...photos];

        // 1. Category filter
        if (filters.category !== 'All') {
          result = result.filter((p) => p.category === filters.category);
        }

        // 2. Custom date range
        if (filters.dateRange.from) {
          result = result.filter((p) => p.date >= filters.dateRange.from!);
        }
        if (filters.dateRange.to) {
          result = result.filter((p) => p.date <= filters.dateRange.to!);
        }

        // 3. Time-period quick filter
        if (filters.timePeriod !== 'All') {
          const periodStart = getPeriodStart(filters.timePeriod);
          if (periodStart) {
            result = result.filter((p) => p.date >= periodStart);
          }
        }

        // 4. Sort
        result.sort((a, b) => {
          switch (sortOption) {
            case 'date-desc':
              return compareISODates(b.date, a.date);
            case 'date-asc':
              return compareISODates(a.date, b.date);
            case 'category':
              return a.category.localeCompare(b.category) || compareISODates(b.date, a.date);
            default:
              return 0;
          }
        });

        return result;
      },

      /**
       * Group the *filtered* photos by their category.
       * Useful for tabbed gallery layouts.
       */
      photosByCategory: () => {
        const filtered = get().filteredPhotos();
        const groups: Record<PhotoCategory, ProgressPhoto[]> = {
          Front: [],
          Back: [],
          Side: [],
          Other: [],
        };
        for (const photo of filtered) {
          groups[photo.category].push(photo);
        }
        return groups;
      },

      /** Return a `Set` of selected photo IDs for fast UI lookup. */
      selectedPhotoIds: () => {
        return new Set(get().selectedPhotos.map((p) => p.id));
      },

      /** `true` when exactly two photos are selected — comparison ready. */
      canCompare: () => {
        return get().selectedPhotos.length === 2;
      },

      /** Photos marked as milestones or goals achieved, sorted newest → oldest. */
      milestonePhotos: () => {
        return get()
          .photos.filter((p) => p.isMilestone || p.isGoalAchieved)
          .sort((a, b) => compareISODates(b.date, a.date));
      },
    }),
    { name: 'PhotoStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

/* ------------------------------------------------------------------ */
/*  Demo auto-load                                                      */
/* ------------------------------------------------------------------ */

/**
 * Immediately initialise the store with demo data so the UI renders
 * content on first mount without requiring an explicit `loadPhotos()` call.
 *
 * In production this block would be removed or guarded behind a feature flag.
 */
if (demoPhotos.length > 0) {
  usePhotoStore.setState(
    {
      photos: demoPhotos,
      isLoading: false,
      error: null,
    },
    false,
    'photos/demoAutoLoad'
  );
}

/* ------------------------------------------------------------------ */
/*  Standalone selectors (for use outside components / in callbacks)    */
/* ------------------------------------------------------------------ */

/**
 * Selector: get filtered photos without subscribing to the entire store.
 *
 * @example
 * ```ts
 * const photos = selectFilteredPhotos();
 * ```
 */
export function selectFilteredPhotos(): ProgressPhoto[] {
  return usePhotoStore.getState().filteredPhotos();
}

/**
 * Selector: get photos grouped by category.
 */
export function selectPhotosByCategory(): Record<PhotoCategory, ProgressPhoto[]> {
  return usePhotoStore.getState().photosByCategory();
}

/**
 * Selector: check if exactly 2 photos are selected.
 */
export function selectCanCompare(): boolean {
  return usePhotoStore.getState().canCompare();
}

/**
 * Selector: get milestone / goal-achieved photos.
 */
export function selectMilestonePhotos(): ProgressPhoto[] {
  return usePhotoStore.getState().milestonePhotos();
}

/**
 * Convenience hook: reset the entire store to its initial empty state.
 * Useful for logout / client-switch scenarios.
 */
export function resetPhotoStore(): void {
  usePhotoStore.setState(
    {
      ...initialState,
    },
    false,
    'photos/resetStore'
  );
}
