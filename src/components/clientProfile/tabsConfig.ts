import {
  LayoutDashboard, Scan, Scale, FileText, StickyNote, Calendar, CalendarDays,
  ClipboardList, Apple, Heart, Database, Target, Camera,
} from 'lucide-react';

export const COLORS = ['#00AEEF', '#8B5CF6', '#22C55E', '#F97316', '#EC4899', '#EAB308', '#EF4444', '#C0C0C0'];

export const tabsConfig = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'bioprint', label: 'BioPrint', icon: Scan },
  { key: 'bodystats', label: 'BodyStats', icon: Scale },
  { key: 'records', label: 'Records', icon: FileText },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'sessions', label: 'Sessions', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'programs', label: 'Programs', icon: ClipboardList },
  { key: 'diet', label: 'Diet/Nutrition', icon: Apple },
  { key: 'lifestyle', label: 'Lifestyle', icon: Heart },
  { key: 'database', label: 'Database', icon: Database },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'photos', label: 'Progress Photos', icon: Camera },
] as const;

export type TabKey = (typeof tabsConfig)[number]['key'];
