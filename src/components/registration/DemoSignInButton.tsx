'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { startDemoRegistration } from '@/app/register/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * Sandbox-only: a button that creates a fake "authenticated" session
 * (name + email in a cookie) and redirects to /register/details, where
 * the user picks their department. Mirrors the Google OAuth flow.
 *
 * In production with Google OAuth configured, this button still works
 * as a fallback for users who don't want to use Google.
 */
export function DemoSignInButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDemo = () => {
    startTransition(async () => {
      const result = await startDemoRegistration();
      if (result.success) {
        router.push('/register/details');
      } else {
        toast({
          title: 'Could not start demo',
          description: result.error ?? 'Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      onClick={handleDemo}
      disabled={isPending}
      variant="outline"
      className="w-full h-12 text-base"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Sparkles className="h-5 w-5 text-red-500" />
      )}
      Continue as Demo Participant
    </Button>
  );
}
