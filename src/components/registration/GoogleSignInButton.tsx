'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register/details`,
      },
    });
    // No setLoading(false) — the browser redirects to Google.
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
<<<<<<< Updated upstream
      onClick={handleSignIn}
=======
      className="w-full h-12 px-4 rounded-md text-base font-medium bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 flex items-center justify-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
>>>>>>> Stashed changes
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-zinc-900" />
      ) : (
        <GoogleIcon />
      )}
      <span className="text-zinc-900">Continue with Google</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.58 2.68-3.91 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
