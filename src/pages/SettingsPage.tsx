/**
 * SettingsPage - Comprehensive settings with 7 tabbed sections
 */
import { useState, useCallback } from 'react';
import {
  Monitor,
  Bell,
  Palette,
  Lock,
  UserCircle,
  Database,
  Plug,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Smartphone,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  MonitorDot,
  Type,
  LayoutTemplate,
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  useUIStore,
  type DisplayPreferences,
  type NotificationSettings,
  type PrivacySettings,
  type IntegrationSettings,
  type AccentColor,
  type Theme,
  type FontSize,
  type SidebarMode,
  type DashboardDensity,
  type NotificationFrequency,
} from '@/stores/useUIStore';

/* ------------------------------------------------------------------ */
/*  Tab definition                                                     */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'account', label: 'Account', icon: UserCircle },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Plug },
] as const;

type TabId = typeof TABS[number]['id'];

/* ------------------------------------------------------------------ */
/*  Save indicator                                                     */
/* ------------------------------------------------------------------ */

function AutoSaveIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-body-sm text-success"
    >
      <Save size={14} />
      <span>Saved automatically</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle row helper                                                  */
/* ------------------------------------------------------------------ */

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-body-md font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-body-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Select row helper                                                  */
/* ------------------------------------------------------------------ */

interface SelectRowProps {
  label: string;
  description?: string;
  value: string;
  onValueChange: (val: string) => void;
  options: { value: string; label: string }[];
}

function SelectRow({ label, description, value, onValueChange, options }: SelectRowProps) {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-body-md font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-body-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1: Display Preferences                                     */
/* ------------------------------------------------------------------ */

function DisplaySection() {
  const display = useUIStore((s) => s.display);
  const setDisplay = useUIStore((s) => s.setDisplay);
  const resetDisplay = useUIStore((s) => s.resetDisplay);

  const toggle = useCallback(
    (key: keyof DisplayPreferences) => (val: boolean) => setDisplay({ [key]: val }),
    [setDisplay]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={20} className="text-[#00AEEF]" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Control which dashboard widgets and elements are visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="KPI Cards"
            description="Revenue, clients, sessions summary cards"
            checked={display.showKPICards}
            onCheckedChange={toggle('showKPICards')}
          />
          <ToggleRow
            label="Today's Schedule Widget"
            description="Upcoming sessions and appointments for today"
            checked={display.showTodaySchedule}
            onCheckedChange={toggle('showTodaySchedule')}
          />
          <ToggleRow
            label="Follow-ups & Reminders Panel"
            description="Pending client follow-ups and reminders"
            checked={display.showFollowUps}
            onCheckedChange={toggle('showFollowUps')}
          />
          <ToggleRow
            label="Client Activity Sparklines"
            description="Mini trend charts for client activity"
            checked={display.showSparklines}
            onCheckedChange={toggle('showSparklines')}
          />
          <ToggleRow
            label="Recent Notifications"
            description="Latest alerts and system notifications"
            checked={display.showRecentNotifications}
            onCheckedChange={toggle('showRecentNotifications')}
          />
          <ToggleRow
            label="Quick Action FABs"
            description="Floating action buttons for common tasks"
            checked={display.showQuickActionFABs}
            onCheckedChange={toggle('showQuickActionFABs')}
          />
          <ToggleRow
            label="Multi-Client Bar"
            description="Quick-switch bar for multi-client view"
            checked={display.showMultiClientBar}
            onCheckedChange={toggle('showMultiClientBar')}
          />
          <ToggleRow
            label="AI Chat Bubble"
            description="AI assistant chat widget"
            checked={display.showAIChatBubble}
            onCheckedChange={toggle('showAIChatBubble')}
          />
          <ToggleRow
            label="Birthday Reminders"
            description="Notifications for client birthdays"
            checked={display.showBirthdayReminders}
            onCheckedChange={toggle('showBirthdayReminders')}
          />
          <ToggleRow
            label="Progress Alerts"
            description="Alerts when clients hit milestones"
            checked={display.showProgressAlerts}
            onCheckedChange={toggle('showProgressAlerts')}
          />
          <ToggleRow
            label="Marketing Analytics"
            description="Campaign performance and lead metrics"
            checked={display.showMarketingAnalytics}
            onCheckedChange={toggle('showMarketingAnalytics')}
          />
          <ToggleRow
            label="Team Performance"
            description="Trainer and staff performance metrics"
            checked={display.showTeamPerformance}
            onCheckedChange={toggle('showTeamPerformance')}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetDisplay} className="text-gray-600">
          Reset to Defaults
        </Button>
      </div>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Notifications                                           */
/* ------------------------------------------------------------------ */

function NotificationsSection() {
  const notifications = useUIStore((s) => s.notifications);
  const setNotifications = useUIStore((s) => s.setNotifications);
  const resetNotifications = useUIStore((s) => s.resetNotifications);

  const toggle = useCallback(
    (key: keyof NotificationSettings) => (val: boolean) => setNotifications({ [key]: val }),
    [setNotifications]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} className="text-[#00AEEF]" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="New Client Signup"
            description="Get notified when a new client registers"
            checked={notifications.emailNewClient}
            onCheckedChange={toggle('emailNewClient')}
          />
          <ToggleRow
            label="Session Reminders"
            description="Receive email reminders before scheduled sessions"
            checked={notifications.emailSessionReminder}
            onCheckedChange={toggle('emailSessionReminder')}
          />
          <ToggleRow
            label="Goal Milestones"
            description="Celebrate when clients reach their goals"
            checked={notifications.emailGoalMilestone}
            onCheckedChange={toggle('emailGoalMilestone')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#00AEEF]" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="Session Reminders"
            description="Text reminders before upcoming sessions"
            checked={notifications.smsSessionReminder}
            onCheckedChange={toggle('smsSessionReminder')}
          />
          <ToggleRow
            label="Cancellations"
            description="Alert when a client cancels a session"
            checked={notifications.smsCancellation}
            onCheckedChange={toggle('smsCancellation')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} className="text-[#00AEEF]" />
            Push & In-App
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="Browser Push Notifications"
            description="Receive push notifications in your browser"
            checked={notifications.pushNotifications}
            onCheckedChange={toggle('pushNotifications')}
          />
          <ToggleRow
            label="In-App Sound"
            description="Play a sound for new notifications"
            checked={notifications.inAppSound}
            onCheckedChange={toggle('inAppSound')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-[#00AEEF]" />
            Delivery Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SelectRow
            label="Notification Frequency"
            description="How often you receive digest notifications"
            value={notifications.frequency}
            onValueChange={(v) => setNotifications({ frequency: v as NotificationFrequency })}
            options={[
              { value: 'immediate', label: 'Immediate' },
              { value: 'daily', label: 'Daily Digest' },
              { value: 'weekly', label: 'Weekly Digest' },
            ]}
          />
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start" className="text-body-md font-medium">
                Quiet Hours Start
              </Label>
              <Input
                id="quiet-start"
                type="time"
                value={notifications.quietHoursStart}
                onChange={(e) => setNotifications({ quietHoursStart: e.target.value })}
              />
              <p className="text-caption text-gray-500">No notifications after this time</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end" className="text-body-md font-medium">
                Quiet Hours End
              </Label>
              <Input
                id="quiet-end"
                type="time"
                value={notifications.quietHoursEnd}
                onChange={(e) => setNotifications({ quietHoursEnd: e.target.value })}
              />
              <p className="text-caption text-gray-500">Notifications resume after this time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetNotifications} className="text-gray-600">
          Reset to Defaults
        </Button>
      </div>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Appearance                                              */
/* ------------------------------------------------------------------ */

function AppearanceSection() {
  const appearance = useUIStore((s) => s.appearance);
  const setAppearance = useUIStore((s) => s.setAppearance);
  const resetAppearance = useUIStore((s) => s.resetAppearance);

  const accentColors: { id: AccentColor; label: string; class: string }[] = [
    { id: 'cyan', label: 'Cyan', class: 'bg-[#00AEEF]' },
    { id: 'green', label: 'Green', class: 'bg-emerald-500' },
    { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { id: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { id: 'pink', label: 'Pink', class: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun size={20} className="text-[#00AEEF]" />
            Theme
          </CardTitle>
          <CardDescription>Choose your preferred color theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: 'light' as Theme, icon: Sun, label: 'Light' },
              { id: 'dark' as Theme, icon: Moon, label: 'Dark' },
              { id: 'system' as Theme, icon: MonitorDot, label: 'System' },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setAppearance({ theme: t.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  appearance.theme === t.id
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.08)]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <t.icon size={24} className={appearance.theme === t.id ? 'text-[#00AEEF]' : 'text-gray-500'} />
                <span className={`text-body-sm font-medium ${appearance.theme === t.id ? 'text-[#00AEEF]' : 'text-gray-600'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={20} className="text-[#00AEEF]" />
            Accent Color
          </CardTitle>
          <CardDescription>Pick the primary accent color for buttons and highlights.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {accentColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setAppearance({ accentColor: c.id })}
                className={`w-10 h-10 rounded-full ${c.class} transition-all ${
                  appearance.accentColor === c.id
                    ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                    : 'hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>
          <p className="text-body-sm text-gray-500 mt-3">
            Selected: <span className="font-medium text-gray-700 capitalize">{appearance.accentColor}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type size={20} className="text-[#00AEEF]" />
            Typography & Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SelectRow
            label="Font Size"
            description="Adjust text size across the app"
            value={appearance.fontSize}
            onValueChange={(v) => setAppearance({ fontSize: v as FontSize })}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
          <Separator />
          <SelectRow
            label="Sidebar Mode"
            description="Control sidebar visibility behavior"
            value={appearance.sidebarMode}
            onValueChange={(v) => setAppearance({ sidebarMode: v as SidebarMode })}
            options={[
              { value: 'expanded', label: 'Always Expanded' },
              { value: 'collapsed', label: 'Always Collapsed' },
              { value: 'auto', label: 'Auto (on hover)' },
            ]}
          />
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-md font-medium text-gray-900">Dashboard Density</p>
                <p className="text-body-sm text-gray-500">How compact or spacious the layout feels</p>
              </div>
              <div className="flex items-center gap-2">
                <LayoutTemplate size={16} className="text-gray-400" />
                <span className="text-body-sm font-medium text-gray-700 capitalize w-24 text-right">
                  {appearance.dashboardDensity}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Slider
                value={[
                  appearance.dashboardDensity === 'compact'
                    ? 0
                    : appearance.dashboardDensity === 'comfortable'
                    ? 50
                    : 100,
                ]}
                onValueChange={([val]) => {
                  const density: DashboardDensity =
                    val < 33 ? 'compact' : val < 66 ? 'comfortable' : 'spacious';
                  setAppearance({ dashboardDensity: density });
                }}
                max={100}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-caption text-gray-400">Compact</span>
                <span className="text-caption text-gray-400">Comfortable</span>
                <span className="text-caption text-gray-400">Spacious</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetAppearance} className="text-gray-600">
          Reset to Defaults
        </Button>
      </div>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Privacy                                                 */
/* ------------------------------------------------------------------ */

function PrivacySection() {
  const privacy = useUIStore((s) => s.privacy);
  const setPrivacy = useUIStore((s) => s.setPrivacy);
  const resetPrivacy = useUIStore((s) => s.resetPrivacy);

  const toggle = useCallback(
    (key: keyof PrivacySettings) => (val: boolean) => setPrivacy({ [key]: val }),
    [setPrivacy]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} className="text-[#00AEEF]" />
            Data Sharing with Trainer
          </CardTitle>
          <CardDescription>
            Control what data your trainer can access.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="Workout Data"
            description="Share exercise logs, sets, reps, and workout history"
            checked={privacy.shareWorkoutWithTrainer}
            onCheckedChange={toggle('shareWorkoutWithTrainer')}
          />
          <ToggleRow
            label="Nutrition Data"
            description="Share food logs, macros, TDEE, and nutrition scores"
            checked={privacy.shareNutritionWithTrainer}
            onCheckedChange={toggle('shareNutritionWithTrainer')}
          />
          <ToggleRow
            label="Progress Photos"
            description="Allow trainer to view your progress photos"
            checked={privacy.allowProgressPhotoVisibility}
            onCheckedChange={toggle('allowProgressPhotoVisibility')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} className="text-[#00AEEF]" />
            Profile & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleRow
            label="Profile Discoverability"
            description="Allow other users to find your profile via search"
            checked={privacy.profileDiscoverable}
            onCheckedChange={toggle('profileDiscoverable')}
          />
          <ToggleRow
            label="Data Anonymization"
            description="Anonymize your data before it is used for analytics"
            checked={privacy.dataAnonymization}
            onCheckedChange={toggle('dataAnonymization')}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetPrivacy} className="text-gray-600">
          Reset to Defaults
        </Button>
      </div>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Account                                                 */
/* ------------------------------------------------------------------ */

function AccountSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} className="text-[#00AEEF]" />
            Email Address
          </CardTitle>
          <CardDescription>Change the email associated with your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-body-md font-medium">
              Current Email
            </Label>
            <Input id="email" type="email" defaultValue="trainer@aztechfit.hk" readOnly className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-body-md font-medium">
              New Email
            </Label>
            <Input id="new-email" type="email" placeholder="Enter new email address" />
          </div>
          <Button className="bg-[#00AEEF] hover:bg-[#0098D1] text-white">
            Update Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} className="text-[#00AEEF]" />
            Password
          </CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-body-md font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-body-md font-medium">
              New Password
            </Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-body-md font-medium">
              Confirm New Password
            </Label>
            <Input id="confirm-password" type="password" placeholder="Confirm new password" />
          </div>
          <Button className="bg-[#00AEEF] hover:bg-[#0098D1] text-white">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#00AEEF]" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-body-md font-medium text-gray-900">
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-body-sm text-gray-500 mt-1">
                {twoFAEnabled
                  ? 'Your account is protected with 2FA. You will need your authenticator app to sign in.'
                  : 'Enable 2FA to require a verification code when signing in.'}
              </p>
            </div>
            <Switch
              checked={twoFAEnabled}
              onCheckedChange={setTwoFAEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} className="text-[#00AEEF]" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices that are currently signed in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { device: 'Chrome on macOS', location: 'Hong Kong', current: true, time: 'Active now' },
            { device: 'Safari on iPhone', location: 'Hong Kong', current: false, time: '2 hours ago' },
          ].map((session) => (
            <div
              key={session.device}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center">
                  <Monitor size={18} className="text-[#00AEEF]" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-900">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-success bg-success-light px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-caption text-gray-500">
                    {session.location} &middot; {session.time}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger-light">
                  <LogOut size={16} className="mr-1" />
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle size={20} />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between p-4 rounded-xl border border-danger/20 bg-danger-light/30">
            <div>
              <p className="text-body-md font-medium text-gray-900">Delete Account</p>
              <p className="text-body-sm text-gray-500 mt-1">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-danger text-danger hover:bg-danger hover:text-white"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>

          {deleteDialogOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-6 rounded-xl border border-danger/30 bg-danger-light/50 space-y-4"
            >
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={20} />
                <p className="font-semibold">Are you absolutely sure?</p>
              </div>
              <p className="text-body-sm text-gray-600">
                Type <strong>DELETE</strong> below to confirm account deletion.
              </p>
              <Input placeholder="Type DELETE to confirm" />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-danger hover:bg-danger/90 text-white"
                >
                  Permanently Delete Account
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 6: Data Management                                         */
/* ------------------------------------------------------------------ */

function DataSection() {
  const resetAll = useUIStore((s) => s.resetAllSettings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = useCallback(() => {
    localStorage.removeItem('azfit-ui-store-v1');
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }, []);

  const exportButtons = [
    {
      label: 'Export All Data',
      description: 'Download a complete JSON export of all your data.',
      icon: Download,
      format: 'JSON',
      action: () => {
        const data = {
          exportDate: new Date().toISOString(),
          display: useUIStore.getState().display,
          notifications: useUIStore.getState().notifications,
          appearance: useUIStore.getState().appearance,
          privacy: useUIStore.getState().privacy,
          integrations: useUIStore.getState().integrations,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azfit-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      label: 'Export Workout History',
      description: 'Download workout logs in CSV format.',
      icon: Download,
      format: 'CSV',
      action: () => {
        const csv = 'Date,Exercise,Sets,Reps,Weight,Notes\n2024-01-15,Bench Press,4,10,80kg,Good form\n2024-01-15,Squat,4,8,100kg,Deep reps\n2024-01-13,Deadlift,3,5,140kg,New PR';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azfit-workouts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      label: 'Export Nutrition Logs',
      description: 'Download food and nutrition records in CSV format.',
      icon: Download,
      format: 'CSV',
      action: () => {
        const csv = 'Date,Meal,Food,Calories,Protein,Carbs,Fat\n2024-01-15,Breakfast,Oatmeal,350,12,60,6\n2024-01-15,Lunch,Chicken Salad,520,45,15,28\n2024-01-15,Dinner,Salmon & Rice,680,42,65,22';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azfit-nutrition-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      label: 'Export Client Reports',
      description: 'Generate PDF reports for your clients.',
      icon: Download,
      format: 'PDF',
      action: () => alert('PDF export would generate a comprehensive client report.'),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} className="text-[#00AEEF]" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data in various formats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportButtons.map((btn) => (
            <div
              key={btn.label}
              className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center shrink-0">
                  <btn.icon size={18} className="text-[#00AEEF]" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-900">{btn.label}</p>
                  <p className="text-caption text-gray-500 mt-1">{btn.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={btn.action}
                className="shrink-0"
              >
                <Download size={14} className="mr-1" />
                {btn.format}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} className="text-[#00AEEF]" />
            Import Data
          </CardTitle>
          <CardDescription>Import data from other platforms or a previous export.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#00AEEF]/40 transition-colors cursor-pointer">
            <Upload size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-body-sm font-medium text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-caption text-gray-400 mt-1">
              Supports JSON, CSV files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 size={20} className="text-danger" />
            Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div>
              <p className="text-body-sm font-medium text-gray-900">Clear Local Cache</p>
              <p className="text-caption text-gray-500 mt-1">
                Remove cached data stored in your browser. Does not affect server data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className={cacheCleared ? 'text-success border-success' : 'text-gray-600'}
            >
              {cacheCleared ? (
                <>
                  <CheckCircle2 size={14} className="mr-1" />
                  Cleared
                </>
              ) : (
                <>
                  <Trash2 size={14} className="mr-1" />
                  Clear
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start justify-between p-4 rounded-xl border border-danger/20 bg-danger-light/30">
            <div>
              <p className="text-body-sm font-medium text-gray-900">Reset All Settings</p>
              <p className="text-caption text-gray-500 mt-1">
                Restore all settings to their default values. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-danger text-danger hover:bg-danger hover:text-white"
              onClick={() => setShowResetConfirm(true)}
            >
              <Trash2 size={14} className="mr-1" />
              Reset
            </Button>
          </div>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl border border-danger/30 bg-danger-light/50 space-y-3">
                  <p className="text-body-sm text-gray-700">
                    Are you sure? All custom settings will be lost.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-danger hover:bg-danger/90 text-white"
                      onClick={() => {
                        resetAll();
                        setShowResetConfirm(false);
                      }}
                    >
                      Confirm Reset
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 7: Integrations                                            */
/* ------------------------------------------------------------------ */

function IntegrationsSection() {
  const integrations = useUIStore((s) => s.integrations);
  const setIntegrations = useUIStore((s) => s.setIntegrations);
  const resetIntegrations = useUIStore((s) => s.resetIntegrations);

  const toggle = useCallback(
    (key: keyof IntegrationSettings) => (val: boolean) => setIntegrations({ [key]: val }),
    [setIntegrations]
  );

  const healthIntegrations = [
    {
      key: 'appleHealthSync' as const,
      label: 'Apple Health',
      description: 'Sync workout and body metrics with Apple Health',
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50',
    },
    {
      key: 'googleFitSync' as const,
      label: 'Google Fit',
      description: 'Sync activity data with Google Fit',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      key: 'fitbitSync' as const,
      label: 'Fitbit',
      description: 'Import steps, heart rate, and sleep data',
      iconColor: 'text-sky-500',
      iconBg: 'bg-sky-50',
    },
    {
      key: 'garminSync' as const,
      label: 'Garmin Connect',
      description: 'Sync running, cycling, and training data',
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50',
    },
    {
      key: 'myFitnessPalSync' as const,
      label: 'MyFitnessPal',
      description: 'Sync nutrition and food diary entries',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
  ];

  const calendarIntegrations = [
    {
      key: 'calendarSyncGoogle' as const,
      label: 'Google Calendar',
      description: 'Sync sessions and appointments',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
    {
      key: 'calendarSyncOutlook' as const,
      label: 'Outlook Calendar',
      description: 'Sync with Microsoft Outlook',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#00AEEF]" />
            Health & Fitness Apps
          </CardTitle>
          <CardDescription>Connect your favorite fitness trackers and health apps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthIntegrations.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center`}>
                  <Plug size={18} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-caption text-gray-500">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={integrations[item.key]}
                onCheckedChange={toggle(item.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} className="text-[#00AEEF]" />
            Calendar Sync
          </CardTitle>
          <CardDescription>Sync your schedule with external calendars.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {calendarIntegrations.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center`}>
                  <Globe size={18} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-caption text-gray-500">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={integrations[item.key]}
                onCheckedChange={toggle(item.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#00AEEF]" />
            Webhooks
          </CardTitle>
          <CardDescription>Configure webhook URLs for real-time event notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-body-md font-medium">
              Webhook URL
            </Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-app.com/webhook"
              value={integrations.webhookUrl}
              onChange={(e) => setIntegrations({ webhookUrl: e.target.value })}
            />
            <p className="text-caption text-gray-500">
              Events will be sent as POST requests to this URL.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIntegrations({ webhookUrl: '' })}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="bg-[#00AEEF] hover:bg-[#0098D1] text-white"
              onClick={() => {
                /* Save is automatic via Zustand */
              }}
            >
              <CheckCircle2 size={14} className="mr-1" />
              Saved Automatically
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetIntegrations} className="text-gray-600">
          Reset to Defaults
        </Button>
      </div>

      <AutoSaveIndicator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab content dispatcher                                             */
/* ------------------------------------------------------------------ */

function TabContent({ activeTab }: { activeTab: TabId }) {
  switch (activeTab) {
    case 'display':
      return <DisplaySection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'appearance':
      return <AppearanceSection />;
    case 'privacy':
      return <PrivacySection />;
    case 'account':
      return <AccountSection />;
    case 'data':
      return <DataSection />;
    case 'integrations':
      return <IntegrationsSection />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('display');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center">
              <UserCircle size={20} className="text-[#00AEEF]" />
            </div>
            <div>
              <h1 className="text-heading-sm font-semibold text-gray-900">Settings</h1>
              <p className="text-caption text-gray-500 hidden sm:block">
                Manage your preferences and account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar tab navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <p className="text-caption uppercase tracking-[0.08em] text-gray-400 font-semibold">
                  Preferences
                </p>
              </div>
              <div className="p-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-[rgba(0,174,239,0.1)] text-[#00AEEF]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon
                        size={20}
                        className={isActive ? 'text-[#00AEEF]' : 'text-gray-400'}
                      />
                      <span className="text-body-sm font-medium flex-1">{tab.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          isActive ? 'rotate-90 text-[#00AEEF]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Mobile: horizontal scroll tabs */}
            <div className="lg:hidden mt-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
                <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex-1 min-w-[80px] data-[state=active]:bg-[#00AEEF] data-[state=active]:text-white rounded-lg text-body-sm py-2"
                    >
                      <tab.icon size={14} className="mr-1" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabContent activeTab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
