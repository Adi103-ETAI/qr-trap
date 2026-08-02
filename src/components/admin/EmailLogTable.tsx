'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailItem {
  id: string;
  toEmail: string;
  subject: string;
  status: string;
  tokenUsed: string;
  createdAt: string;
}

interface Props {
  emails: EmailItem[];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function EmailLogTable({ emails }: Props) {
  return (
    <Card className="bg-card/70 backdrop-blur p-5 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold">Email Log</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {emails.length} recent
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Mock-sent emails. Use the copy / open buttons to test a
        participant's simulation link.
      </p>

      <ScrollArea className="h-96 w-full pr-2 cyber-scroll">
        {emails.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            No emails sent yet. Launch the simulation to send notifications.
          </div>
        ) : (
          <ul className="space-y-2">
            {emails.map((em) => (
              <EmailRow key={em.id} email={em} />
            ))}
          </ul>
        )}
      </ScrollArea>
    </Card>
  );
}

function EmailRow({ email }: { email: EmailItem }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const simUrl = `${APP_URL}/simulation/${email.tokenUsed}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(simUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: 'Link copied', description: email.toEmail });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed' });
    }
  };

  return (
    <li className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {email.toEmail}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {email.subject}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider',
            email.status === 'sent'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
              : 'border-red-500/30 bg-red-500/10 text-red-500',
          )}
        >
          {email.status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={copy} className="h-7 text-xs">
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
          <a href={simUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        </Button>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
          {new Date(email.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </li>
  );
}
