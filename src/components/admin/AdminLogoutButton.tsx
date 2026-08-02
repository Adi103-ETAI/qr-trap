'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    setBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onLogout} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Logout
    </Button>
  );
}
