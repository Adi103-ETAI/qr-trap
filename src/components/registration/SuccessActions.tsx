'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SuccessActions({ simulationUrl }: { simulationUrl: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(simulationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: 'Link copied', description: 'Paste in a new tab to test the simulation page.' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Select and copy the URL manually.' });
    }
  };

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <CardTitle className="text-base text-emerald-500 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Sandbox simulation link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          In production, the link below would arrive via email. For the
          sandbox demo, use it now to open your simulation page.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="sim-url" className="text-xs text-muted-foreground">
            Simulation URL
          </Label>
          <Input
            id="sim-url"
            readOnly
            value={simulationUrl}
            className="font-mono text-xs"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={copy} variant="outline" className="flex-1">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button asChild className="flex-1">
            <a href={simulationUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open simulation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
