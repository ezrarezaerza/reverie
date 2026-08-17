import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Bell, 
  Volume2, 
  Mail, 
  Lock, 
  Sparkles, 
  FileText,
  CheckCircle,
  RefreshCw,
  Smartphone,
  WifiOff,
  Flame
} from 'lucide-react';
import { UserPreferences, MemoryEntry } from '../types';
import { memoryStorage } from '../utils/storage';
import { soundEngine } from '../utils/soundEngine';
import { pushNotificationService, PushSubscriptionData } from '../utils/pushNotifications';
import { getDailyPrompt } from '../lib/prompt-engine';
import { calculateNewStreak } from '../lib/streak-logic';

interface SettingsAndBackupProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: Partial<UserPreferences>) => void;
  entries: MemoryEntry[];
  onDataImported: () => void;
}

export const SettingsAndBackup: React.FC<SettingsAndBackupProps> = ({
  preferences,
  onSavePreferences,
  entries,
  onDataImported
}) => {
  const [userName, setUserName] = useState(preferences.userName);
  const [userEmail, setUserEmail] = useState(preferences.userEmail);
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime);
  const [enableNudges, setEnableNudges] = useState(preferences.enableNudges);
  const [ambientSound, setAmbientSound] = useState(preferences.ambientSound);
  const [ambientVolume, setAmbientVolume] = useState(preferences.ambientVolume);
  
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [notificationTestSent, setNotificationTestSent] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<PushSubscriptionData | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check push subscription & SW status
    const saved = pushNotificationService.getSavedSubscription();
    setActiveSubscription(saved);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true);
      }).catch(() => {
        setIsServiceWorkerReady(false);
      });
    }
  }, []);

  // Compute streak diagnostics
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRecordedDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date + 'T00:00:00') : null;
  const streakCalc = calculateNewStreak(
    lastRecordedDate,
    new Date(),
    sortedEntries.length > 0 ? Math.max(1, sortedEntries.length) : 0,
    false
  );

  const todayPrompt = getDailyPrompt(new Date());

  const handleSaveSettings = () => {
    soundEngine.playPencilScratchSound();
    onSavePreferences({
      userName,
      userEmail,
      reminderTime,
      enableNudges,
      ambientSound,
      ambientVolume
    });
  };

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    soundEngine.playPencilScratchSound();
    setMagicLinkSent(true);
    setTimeout(() => setMagicLinkSent(false), 5000);
  };

  const handleEnableWebPush = async () => {
    soundEngine.playPencilScratchSound();
    setPushStatusMessage('Requesting Web Push notification subscription...');
    const result = await pushNotificationService.requestPermissionAndSubscribe();
    if (result.success && result.subscription) {
      setActiveSubscription(result.subscription);
      setEnableNudges(true);
      setPushStatusMessage('✓ Web Push subscription successfully activated!');
    } else {
      setPushStatusMessage(`Notice: ${result.error || 'Permission not granted'}`);
    }
    setTimeout(() => setPushStatusMessage(null), 4500);
  };

  const handleTestNotification = async () => {
    soundEngine.playPaperTurnSound();
    await pushNotificationService.triggerGentleNudgeNotification(
      'Reverie • Evening Gentle Nudge',
      `Prompt #${todayPrompt.id}: ${todayPrompt.text}`
    );
    setNotificationTestSent(true);
    setTimeout(() => setNotificationTestSent(false), 4000);
  };

  const handleExportJSON = () => {
    soundEngine.playPaperTurnSound();
    const dataStr = memoryStorage.exportAllDataAsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverie-memories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    soundEngine.playPaperTurnSound();
    let md = `# Reverie — Private Memory Folio\nExported on: ${new Date().toLocaleDateString()}\n\n`;
    entries.forEach(e => {
      md += `## ${e.date}: ${e.title}\n`;
      if (e.location) md += `*Location:* ${e.location} | *Weather:* ${e.weather || 'N/A'}\n`;
      if (e.moodStamp) md += `*Stamp:* ${e.moodStamp}\n`;
      if (e.linkedNoveltyTitle) md += `*Micro-Novelty:* ${e.linkedNoveltyTitle}\n`;
      if (e.reflectionPrompt) md += `*Prompt:* "${e.reflectionPrompt}"\n\n`;
      md += `${e.body}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverie-scrapbook-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = memoryStorage.importDataFromJSON(content);
      if (success) {
        setImportStatus('Successfully imported archive!');
        onDataImported();
      } else {
        setImportStatus('Error importing archive. Please check the JSON format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-[#FAF7F0] flex items-center gap-2">
          <span>Sanctuary & Preferences</span>
        </h2>
        <p className="text-xs text-[#C8BDAE]">
          Privacy-first architecture. All thoughts and reflections remain completely encrypted on your device.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile & Magic Link Auth & Web Push */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Privacy Guarantee Card */}
          <div className="bg-[#FAF8F2] paper-shadow rounded-xl border border-[#D9CEBA] p-6 relative">
            <div className="washi-tape washi-sage absolute -top-2.5 right-6 w-24 h-5 flex items-center justify-center text-[9px] font-mono text-[#2B4B32] font-bold">
              ZERO TELEMETRY
            </div>

            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#2E6B4E]" />
              <h3 className="font-display font-bold text-base text-[#2C2926]">
                Absolute Data Privacy
              </h3>
            </div>
            
            <p className="text-xs text-[#5C5243] leading-relaxed mb-4">
              Reverie has <strong>no cloud trackers, no AI training crawlers, and no telemetry</strong>. Your reflections are stored strictly in your local browser sandbox and only synced via your private Magic Link key.
            </p>

            <form onSubmit={handleSendMagicLink} className="space-y-3 pt-3 border-t border-[#E5DAC7]">
              <div>
                <label className="block text-xs font-semibold text-[#4A4235] mb-1">
                  Email Magic Link (Passwordless Access)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7E6C]" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F2ECE0] border border-[#D5C9B4] rounded-lg text-xs text-[#2C2926] outline-none focus:ring-1 focus:ring-[#2E6B4E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#1C355E] hover:bg-[#152847] text-[#FAF7F0] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Send Link
                  </button>
                </div>
              </div>

              {magicLinkSent && (
                <div className="text-[11px] font-medium text-[#2E6B4E] bg-[#E5EFE7] p-2.5 rounded-md flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Magic link dispatch simulated! Check your inbox for secret entry token.</span>
                </div>
              )}
            </form>
          </div>

          {/* Web Push & Nightly Nudges */}
          <div className="bg-[#FAF8F2] paper-shadow rounded-xl border border-[#D9CEBA] p-6 relative">
            <div className="washi-tape washi-terracotta absolute -top-2.5 right-6 w-28 h-5 flex items-center justify-center text-[9px] font-mono text-[#4A1E17] font-bold">
              WEB PUSH API
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-[#A8382A]" />
              <h3 className="font-display font-bold text-base text-[#2C2926]">
                Nightly Gentle Nudge
              </h3>
            </div>

            <p className="text-xs text-[#5C5243] leading-relaxed mb-4">
              A quiet, unobtrusive inquiry sent each evening via the Web Push API before bedtime sleep-consolidation begins.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#4A4235]">Enable Daily Push Nudges</span>
                <input
                  type="checkbox"
                  checked={enableNudges}
                  onChange={e => setEnableNudges(e.target.checked)}
                  className="w-4 h-4 accent-[#2E6B4E] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#4A4235]">Preferred Evening Time</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="bg-[#F2ECE0] border border-[#D5C9B4] rounded-lg px-2.5 py-1 text-xs text-[#2C2926] outline-none"
                />
              </div>

              {/* Web Push Subscription Action */}
              <div className="pt-2 border-t border-[#E5DAC7] space-y-2">
                <button
                  type="button"
                  onClick={handleEnableWebPush}
                  className="w-full py-2 bg-[#2E6B4E] hover:bg-[#24543D] text-[#FAF7F0] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{activeSubscription ? 'Web Push Subscription Active' : 'Subscribe to Web Push Nudges'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="w-full py-2 bg-[#EFE7D8] hover:bg-[#E5DBC8] text-[#4A4134] border border-[#D9CEBA] rounded-lg text-xs font-medium transition-colors"
                >
                  Test Sample Evening Nudge Notification
                </button>

                {pushStatusMessage && (
                  <p className="text-[11px] text-[#2E6B4E] text-center font-medium bg-[#E8F0EA] p-1.5 rounded">
                    {pushStatusMessage}
                  </p>
                )}

                {notificationTestSent && (
                  <p className="text-[11px] text-[#2E6B4E] text-center font-medium">
                    ✓ Notification dispatched to device
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Audio Ambience & PWA Status & Backup/Export */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* PWA & Offline Offline Capability Card */}
          <div className="bg-[#FAF8F2] paper-shadow rounded-xl border border-[#D9CEBA] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-[#2E6B4E]" />
              <h3 className="font-display font-bold text-base text-[#2C2926]">
                PWA & Offline Architecture
              </h3>
            </div>

            <p className="text-xs text-[#5C5243] leading-relaxed mb-3">
              Reverie functions 100% offline. All micro-novelty prompts, deterministic calendars, and journal entries are cached in your browser.
            </p>

            <div className="bg-[#F2ECE0] rounded-lg p-3 text-xs space-y-2 border border-[#DDD0BC]">
              <div className="flex items-center justify-between">
                <span className="text-[#635746] font-medium">Service Worker Cache:</span>
                <span className="font-semibold text-[#2E6B4E]">
                  {isServiceWorkerReady ? 'Active & Ready' : 'Standby / Registered'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#635746] font-medium">Daily Prompt Engine:</span>
                <span className="font-semibold text-[#1C355E]">
                  Prompt #{todayPrompt.id} (Day {todayPrompt.dayOfYear} of 365)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#635746] font-medium">Current Streak:</span>
                <span className="font-semibold text-[#A8382A]">
                  {streakCalc.currentStreak} Days ({streakCalc.graceDayUsed ? 'Grace Used' : 'Grace Available'})
                </span>
              </div>
            </div>
          </div>

          {/* Ambient Sound Preferences */}
          <div className="bg-[#FAF8F2] paper-shadow rounded-xl border border-[#D9CEBA] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-5 h-5 text-[#3B6A99]" />
              <h3 className="font-display font-bold text-base text-[#2C2926]">
                Tactile Audio Ambience
              </h3>
            </div>

            <p className="text-xs text-[#5C5243] leading-relaxed mb-4">
              Synthesized analog white-noise soundscapes generated mathematically in real-time.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A4235] mb-1.5">
                  Default Soundscape
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'Mute (Silent)' },
                    { id: 'rain', label: '🌧️ Window Rain' },
                    { id: 'clock', label: '🕰️ Antique Clock' },
                    { id: 'hearth', label: '🔥 Warm Hearth' },
                  ].map(snd => (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() => {
                        setAmbientSound(snd.id as any);
                        soundEngine.playAmbience(snd.id as any);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                        ambientSound === snd.id
                          ? 'bg-[#1C355E] text-[#FAF7F0] border-[#1C355E]'
                          : 'bg-[#F2ECE0] text-[#4A4235] border-[#D5C9B4] hover:bg-[#E5DBCA]'
                      }`}
                    >
                      {snd.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#4A4235] mb-1">
                  <span>Ambience Volume</span>
                  <span className="font-mono">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setAmbientVolume(val);
                    soundEngine.setVolume(val);
                  }}
                  className="w-full accent-[#2E6B4E]"
                />
              </div>
            </div>
          </div>

          {/* Backup & Local Data Export */}
          <div className="bg-[#FAF8F2] paper-shadow rounded-xl border border-[#D9CEBA] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-[#8C5D30]" />
              <h3 className="font-display font-bold text-base text-[#2C2926]">
                Folio Backup & Ledger Export
              </h3>
            </div>

            <p className="text-xs text-[#5C5243] leading-relaxed mb-4">
              Download your entire memory vault to keep locally as JSON or formatted Markdown for physical printing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Vault</span>
              </button>

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-[#8C5D30] hover:bg-[#724B25] text-[#FAF7F0] text-xs font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="pt-3 border-t border-[#E5DAC7]">
              <label className="block text-xs font-semibold text-[#4A4235] mb-1.5">
                Restore From Backup File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-[#6B604F] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EAE0CE] file:text-[#4A3E2F] hover:file:bg-[#DFD3BF] cursor-pointer"
              />
              {importStatus && (
                <p className="text-xs font-semibold text-[#2E6B4E] mt-2">
                  {importStatus}
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Save Settings Footer */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-6 py-2.5 rounded-lg bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0] text-sm font-semibold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#A8382A]"
        >
          Save Preferences
        </button>
      </div>

    </div>
  );
};
