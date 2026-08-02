'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FlaskConical, ShieldQuestion } from 'lucide-react';
import { demoRegister } from '@/app/register/actions';
import { useToast } from '@/hooks/use-toast';

export function DemoRegisterCard() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Card className="border-dashed border-border bg-card/40 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <FlaskConical className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base">No Google account?</CardTitle>
            <CardDescription>Use the sandbox demo flow.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="demo-name" className="text-xs text-muted-foreground">
            Display name (optional)
          </Label>
          <Input
            id="demo-name"
            placeholder="Demo Participant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            disabled={isPending}
          />
        </div>
        <Button
          type="button"
          className="w-full h-11"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const r = await demoRegister(name);
              if (!r.success) {
                toast({
                  variant: 'destructive',
                  title: 'Registration failed',
                  description: r.error,
                });
                return;
              }
              // Reload to /register?status=success — server component
              // will read the demo cookie and show the success page.
              window.location.href = '/register?status=success';
            });
          }}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldQuestion className="h-4 w-4" />}
          Continue as Demo Participant
        </Button>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A throwaway identity <code className="font-mono text-foreground">demo-{Math.random().toString(36).slice(2, 6)}@cyberclub.local</code> will be created just for this exercise.
        </p>
      </CardContent>
    </Card>
  );
}
