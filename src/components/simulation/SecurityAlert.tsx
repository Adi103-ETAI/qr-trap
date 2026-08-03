'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { AlertOctagon, ShieldAlert, ChevronRight, Monitor, MapPin, Clock, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  token: string;
  onClicked: () => void;
  clicked: boolean;
}

// ============================================================================
// Fake exfiltration log lines.
// Numbers are randomized on each page load to feel "real" but are
// COMPLETELY FAKE. No real data is accessed, collected, or transmitted.
// ============================================================================
const EXFIL_LINES = [
  { text: 'Establishing secure connection...', delay: 0 },
  { text: () => `Accessing contacts... ${rand(100, 500)} entries found`, delay: 800 },
  { text: () => `Scanning photo library... ${rand(500, 3000).toLocaleString()} images indexed`, delay: 1600 },
  { text: () => `Extracting messages... ${rand(1000, 8000).toLocaleString()} messages`, delay: 2400 },
  { text: () => `Reading browser history... ${rand(500, 5000).toLocaleString()} entries`, delay: 3200 },
  { text: () => `Accessing location data... ${locationString()}`, delay: 4000 },
  { text: () => `Indexing saved passwords... ${rand(20, 200)} credentials captured`, delay: 4800 },
  { text: () => `Accessing social media tokens... ${rand(3, 12)} accounts`, delay: 5600 },
  { text: () => `Scanning financial data... ${rand(2, 8)} payment methods found`, delay: 6400 },
  { text: () => `Compiling data package... ${(rand(1, 50) / 10).toFixed(1)} GB`, delay: 7200 },
  { text: 'Preparing upload to remote server...', delay: 8000 },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function locationString(): string {
  // Use the participant's timezone to show a plausible location
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Unknown';
  const lat = (Math.random() * 180 - 90).toFixed(4);
  const lon = (Math.random() * 360 - 180).toFixed(4);
  return `${lat}°N, ${lon}°E (${city})`;
}

// ============================================================================
// Device info interface
// ============================================================================
interface DeviceInfo {
  browser: string;
  os: string;
  screen: string;
  location: string;
  ip: string;
  lastAccess: string;
}

function parseDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Unknown';
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[_\.]\d+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  }
  else if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+[\.\d]*)/);
    os = match ? `Android ${match[1]}` : 'Android';
  }
  else if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS (\d+[_\.]\d+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  }
  else if (ua.includes('Linux')) os = 'Linux';

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Unknown';

  const now = new Date();
  const accessTime = new Date(now.getTime() - 2 * 60 * 1000);
  const lastAccess = accessTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    browser,
    os,
    screen: `${window.screen.width} × ${window.screen.height}`,
    location: `${city} (${tz})`,
    ip: '•••.•••.•••.•••',
    lastAccess,
  };
}

export function SecurityAlert({ token, onClicked, clicked }: Props) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseDeviceInfo();
  });
  const [exfilLines, setExfilLines] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(2.3);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Fetch IP address on mount (device info is set via lazy initializer)
  useEffect(() => {
    // Fetch IP address (free, no auth)
    fetch('https://api.ipify.org?format=json')
      .then((r) => r.json())
      .then((data) => {
        if (data.ip) {
          setDeviceInfo((prev) => prev ? { ...prev, ip: data.ip } : prev);
        }
      })
      .catch(() => {
        // If IP fetch fails, keep the masked placeholder
      });
  }, []);

  // Animate exfiltration terminal
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    EXFIL_LINES.forEach((line) => {
      const t = setTimeout(() => {
        const text = typeof line.text === 'function' ? line.text() : line.text;
        setExfilLines((prev) => [...prev, text]);
      }, line.delay);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [exfilLines]);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Upload progress bar (fills over ~90 seconds)
  useEffect(() => {
    const id = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) return 100;
        const increment = Math.random() * 2 + 0.5;
        return Math.min(100, p + increment);
      });
      setUploadSpeed(Math.random() * 3 + 1.5);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen flex items-center justify-center px-4 py-8"
    >
      {/* Red ambient pulse */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 alert-bg-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.18), transparent 70%)',
        }}
      />

      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-3xl"
      >
        <Card className="relative overflow-hidden border-red-500/50 bg-card/90 backdrop-blur scanline">
          {/* Top stripe */}
          <div className="bg-red-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold tracking-wider">
              <AlertOctagon className="h-4 w-4" />
              SECURITY NOTIFICATION
            </div>
            <span className="font-mono text-xs opacity-80">
              {new Date().toLocaleString()}
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Big alert header */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex h-14 w-14 rounded-full bg-red-600/20 border-2 border-red-500 items-center justify-center pulse-red"
              >
                <ShieldAlert className="h-7 w-7 text-red-500" />
              </motion.div>
              <h1 className="font-mono text-2xl sm:text-4xl font-bold text-red-500 glitch tracking-tight">
                SECURITY ALERT
              </h1>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-500/40 px-3 py-1 text-xs font-mono uppercase tracking-wider text-red-400">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Status: HIGH RISK
              </div>
            </div>

            <p className="text-center text-sm sm:text-base text-foreground/90 leading-relaxed max-w-xl mx-auto">
              Unusual activity associated with your recent event registration
              has been detected. Your data is being exfiltrated.
            </p>

            {/* Device info panel */}
            {deviceInfo && (
              <div className="rounded-lg border border-red-500/30 bg-background/60 p-4">
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <Monitor className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">
                    Your Device Information
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs sm:text-sm">
                  <InfoRow label="Browser" value={deviceInfo.browser} />
                  <InfoRow label="Operating System" value={deviceInfo.os} />
                  <InfoRow label="Screen Resolution" value={deviceInfo.screen} />
                  <InfoRow label="Location" value={deviceInfo.location} icon={MapPin} />
                  <InfoRow label="IP Address" value={deviceInfo.ip} icon={Wifi} />
                  <InfoRow label="Last Access" value={deviceInfo.lastAccess} icon={Clock} />
                </div>
              </div>
            )}

            {/* Countdown timer */}
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-red-400 mb-1">
                ⏱ Data will be published in
              </p>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-red-500 tabular-nums">
                {timeStr}
              </p>
            </div>

            {/* Fake exfiltration terminal */}
            <div
              ref={terminalRef}
              className="rounded-lg border border-border bg-black/80 p-4 font-mono text-xs sm:text-sm h-48 overflow-y-auto"
            >
              <div className="text-emerald-400 mb-1">$ initializing data exfiltration...</div>
              {exfilLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-300/90"
                >
                  <span className="text-red-400">[+]</span> {line}
                </motion.div>
              ))}
              {exfilLines.length > 0 && (
                <div className="text-emerald-400 blink">_</div>
              )}
            </div>

            {/* Upload progress bar */}
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground">
                  UPLOADING TO REMOTE SERVER
                </span>
                <span className="font-mono text-xs text-red-400">
                  {uploadProgress.toFixed(0)}% · {uploadSpeed.toFixed(1)} MB/s
                </span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1.5">
                → 45.227.11.{rand(10, 250)}:8443 · encrypted channel
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 pt-2">
              {clicked ? (
                <div className="text-center space-y-1">
                  <p className="font-mono text-sm text-muted-foreground">
                    ✓ Notification acknowledged
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Awaiting further instructions from the simulation host...
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={onClicked}
                  className="h-12 px-8 text-base bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] w-full sm:w-auto"
                >
                  Review Security Notification
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-4 font-mono">
          ref: {token.slice(0, 8)}...{token.slice(-4)} · session active
        </p>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Monitor;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <span className="text-muted-foreground">{label}:</span>{' '}
        <span className="text-foreground break-all">{value}</span>
      </div>
    </div>
  );
}
