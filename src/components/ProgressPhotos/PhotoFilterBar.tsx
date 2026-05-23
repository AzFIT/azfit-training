import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  LayoutGrid,
  List,
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import type { PhotoFilter, SortOption, PhotoCategory, ViewMode } from './types';

// ─── Types ───────────────────────────────────────────

interface PhotoFilterBarProps {
  filter: PhotoFilter;
  sort: SortOption;
  resultCount: number;
  onFilterChange: (filter: Partial<PhotoFilter>) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

type TimePeriod = 'week' | 'month' | 'year' | 'all';

interface TimeOption {
  value: TimePeriod;
  label: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All' },
];

const CATEGORY_OPTIONS: { value: PhotoCategory | 'All'; label: string }[] = [
  { value: 'All', label: 'All Categories' },
  { value: 'Front', label: 'Front' },
  { value: 'Back', label: 'Back' },
  { value: 'Side', label: 'Side' },
  { value: 'Other', label: 'Other' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (newest)' },
  { value: 'date-asc', label: 'Date (oldest)' },
  { value: 'category', label: 'Category' },
];

// ─── Helpers ─────────────────────────────────────────

export function formatDisplayDate(date: string | undefined): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function parseISODate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return undefined;
  return date;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getActiveTimePeriod(filter: PhotoFilter): TimePeriod {
  switch (filter.timePeriod) {
    case 'Week': return 'week';
    case 'Month': return 'month';
    case 'Year': return 'year';
    case 'All':
    default: return 'all';
  }
}

function hasActiveFilters(filter: PhotoFilter): boolean {
  return !!(
    (filter.dateRange?.from || filter.dateRange?.to) ||
    (filter.category && filter.category !== 'All') ||
    (filter.timePeriod && filter.timePeriod !== 'All')
  );
}

function getPeriodDates(period: TimePeriod): { from: string; to: string } | null {
  const now = new Date();
  const to = toISODate(now);
  const from = new Date(now);

  switch (period) {
    case 'week':
      from.setDate(now.getDate() - 7);
      break;
    case 'month':
      from.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return null;
    default:
      return null;
  }

  return { from: toISODate(from), to };
}

// ─── Component ───────────────────────────────────────

export function PhotoFilterBar({
  filter,
  sort,
  resultCount,
  onFilterChange,
  onSortChange,
  onClearFilters,
  viewMode = 'grid',
  onViewModeChange,
}: PhotoFilterBarProps) {
  const activePeriod = getActiveTimePeriod(filter);
  const filtersActive = hasActiveFilters(filter);

  const handleTimePeriodChange = (value: string) => {
    const period = value as TimePeriod;
    const periodMap: Record<TimePeriod, PhotoFilter['timePeriod']> = {
      week: 'Week',
      month: 'Month',
      year: 'Year',
      all: 'All',
    };
    onFilterChange({ timePeriod: periodMap[period] });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      category: value === 'All' ? 'All' : (value as PhotoCategory),
    });
  };

  const handleSortChange = (value: string) => {
    onSortChange(value as SortOption);
  };

  const handleDateFromSelect = (date: Date | undefined) => {
    onFilterChange({ dateRange: { ...filter.dateRange, from: date ? toISODate(date) : undefined } });
  };

  const handleDateToSelect = (date: Date | undefined) => {
    onFilterChange({ dateRange: { ...filter.dateRange, to: date ? toISODate(date) : undefined } });
  };

  // ── Render ──
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-700/50 bg-gray-800/80 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
      {/* ── Top Row: Time Periods + Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Time Period Pills */}
        <ToggleGroup
          type="single"
          value={activePeriod}
          onValueChange={(value) => value && handleTimePeriodChange(value)}
          className="flex flex-wrap gap-1"
        >
          {TIME_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              className="h-8 rounded-lg border border-gray-700 bg-gray-800 px-3 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200 data-[state=on]:border-emerald-600 data-[state=on]:bg-emerald-600 data-[state=on]:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:data-[state=on]:bg-emerald-600 dark:data-[state=on]:text-white"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Right Side: View Mode + Sort + Filters */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center rounded-lg border border-gray-700 bg-gray-900 p-0.5 dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-700 text-gray-200'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-700 text-gray-200'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-8 w-[150px] border-gray-700 bg-gray-900 text-xs text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-800">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs text-gray-300 focus:bg-gray-700 focus:text-gray-100 dark:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-gray-100"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <AnimatePresence>
            {filtersActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 gap-1 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom Row: Category + Date Range ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Select */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
          <Select
            value={filter.category || 'All'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-8 w-[150px] border-gray-700 bg-gray-900 text-xs text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-800">
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs text-gray-300 focus:bg-gray-700 focus:text-gray-100 dark:text-gray-300 dark:focus:bg-gray-700 dark:focus:text-gray-100"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">From</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-[130px] border-gray-700 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                {filter.dateRange?.from ? formatDisplayDate(filter.dateRange.from) : 'DD/MM/YYYY'}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto border-gray-700 bg-gray-800 p-0 dark:border-gray-700 dark:bg-gray-800"
              align="start"
            >
              <Calendar
                mode="single"
                selected={parseISODate(filter.dateRange?.from)}
                onSelect={handleDateFromSelect}
                initialFocus
                className="rounded-md border-0 dark:bg-gray-800"
              />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-gray-500 dark:text-gray-500">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-[130px] border-gray-700 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                {filter.dateRange?.to ? formatDisplayDate(filter.dateRange.to) : 'DD/MM/YYYY'}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto border-gray-700 bg-gray-800 p-0 dark:border-gray-700 dark:bg-gray-800"
              align="start"
            >
              <Calendar
                mode="single"
                selected={parseISODate(filter.dateRange?.to)}
                onSelect={handleDateToSelect}
                initialFocus
                className="rounded-md border-0 dark:bg-gray-800"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Result Count */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
          <Image className="h-3.5 w-3.5" />
          <span>
            {resultCount} photo{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
