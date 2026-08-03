'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, Image, KeyRound, MessageCircle, CreditCard, FileText, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  token: string;
  onClicked: () => void;
  clicked: boolean;
}

// ============================================================================
// Fake exfiltration data — shown as bold readable cards (not a terminal).
// Numbers are randomized on each page load to feel "real" but are
// COMPLETELY FAKE. No real data is accessed, collected, or transmitted.
// ============================================================================
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ExfilItem {
  icon: typeof Image;
  label: string;
  value: string;
  detail?: string;
  delay: number;
}

function generateExfilData(): ExfilItem[] {
  return [
    {
      icon: Image,
      label: 'Photos',
      value: `${rand(1200, 8400).toLocaleString()} images`,
      detail: 'Camera roll, screenshots, downloads',
      delay: 0,
    },
    {
      icon: KeyRound,
      label: 'Google passwords',
      value: `${rand(45, 180)} credentials`,
      detail: 'gmail.com, accounts.google.com',
      delay: 400,
    },
    {
      icon: KeyRound,
      label: 'Instagram passwords',
      value: `${rand(1, 4)} credentials`,
      detail: 'instagram.com',
      delay: 800,
    },
    {
      icon: KeyRound,
      label: 'Snapchat passwords',
      value: `${rand(1, 3)} credentials`,
      detail: 'snapchat.com',
      delay: 1200,
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      value: `${rand(2000, 9500).toLocaleString()} chats`,
      detail: 'WhatsApp, Telegram, SMS',
      delay: 1600,
    },
    {
      icon: FileText,
      label: 'Documents',
      value: `${rand(80, 420)} files`,
      detail: 'PDFs, docs, spreadsheets',
      delay: 2000,
    },
    {
      icon: CreditCard,
      label: 'Payment methods',
      value: `${rand(2, 9)} cards`,
      detail: 'Visa, Mastercard, UPI',
      delay: 2400,
    },
    {
      icon: KeyRound,
      label: 'Banking sessions',
      value: `${rand(1, 5)} active`,
      detail: 'HDFC, SBI, ICICI',
      delay: 2800,
    },
  ];
}

// ============================================================================
// Device info interface — only browser, OS, IP, last access.
// Location and screen resolution are intentionally NOT shown.
// ============================================================================
interface DeviceInfo {
  browser: string;
  os: string;
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
    ip: '•••.•••.•••.•••',
    lastAccess,
  };
}

export function SecurityAlert({ token, onClicked, clicked }: Props) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseDeviceInfo();
  });
  const [exfilData] = useState<ExfilItem[]>(() => generateExfilData());
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Fetch IP address on mount
  useEffect(() => {
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

  // Reveal exfiltration items one by one
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    exfilData.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleItems((n) => Math.max(n, i + 1));
      }, exfilData[i].delay);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [exfilData]);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((s) => (s > 0 ? s - 1 : 0));
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
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
        className="relative w-full max-w-2xl my-auto"
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

            {/* Device info panel — only browser, OS, IP, last access */}
            {deviceInfo && (
              <div className="rounded-lg border border-red-500/30 bg-background/60 p-4">
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <AlertOctagon className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">
                    Your Device Information
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs sm:text-sm">
                  <InfoRow label="Browser" value={deviceInfo.browser} />
                  <InfoRow label="Operating System" value={deviceInfo.os} />
                  <InfoRow label="IP Address" value={deviceInfo.ip} icon={Wifi} />
                  <InfoRow label="Last Access" value={deviceInfo.lastAccess} />
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

            {/* Data being exfiltrated — bold readable cards, not a terminal */}
            <div className="rounded-lg border border-red-500/40 bg-background/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="h-4 w-4 text-red-500" />
                <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold">
                  Your data is being accessed right now
                </span>
              </div>
              <div className="space-y-2">
                {exfilData.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      i < visibleItems
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-2.5',
                      i < visibleItems
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-background/30 border border-border/50',
                    )}
                  >
                    <div className="shrink-0 h-8 w-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">
                        {item.label}
                      </p>
                      {item.detail && (
                        <p className="text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      )}
                    </div>
                    <p className="font-mono text-lg font-bold text-red-500 shrink-0">
                      {i < visibleItems ? item.value : '...'}
                    </p>
                  </motion.div>
                ))}
              </div>
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
  icon?: typeof Wifi;
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
