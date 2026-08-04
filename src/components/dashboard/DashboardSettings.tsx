'use client';

import { useState } from 'react';
import { Settings, User, Mail, LogOut, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Props {
  name: string | null;
  email: string;
  department: string | null;
}

const DEPARTMENTS = [
  'Law',
  'Nursing',
  'Physiotherapy',
  'Commerce',
  'Mass Communication',
  'Computer Science',
  'Social Work',
  'Hotel Management',
  'Other',
];

export function DashboardSettings({ name, email, department }: Props) {
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name ?? '');
  const [editDept, setEditDept] = useState(department ?? '');
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-9 w-9"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-red-500" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account and preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Profile section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Display name
                </Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email (read-only)
                </Label>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 h-9">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">{email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept" className="text-xs text-muted-foreground">
                  Department
                </Label>
                <Select value={editDept} onValueChange={setEditDept}>
                  <SelectTrigger id="dept" className="h-9">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preferences section */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Preferences
              </div>

              <button
                onClick={() => setNotifications((n) => !n)}
                className="w-full flex items-center justify-between rounded-lg border border-border bg-background/40 p-3 hover:bg-background/60 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Event updates and club news</p>
                </div>
                <div className={`relative h-5 w-9 rounded-full transition-colors ${notifications ? 'bg-red-600' : 'bg-border'}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>

            {/* Account section */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Account
              </div>
              <Button variant="outline" size="sm" className="w-full h-9 text-red-400 border-red-500/30 hover:bg-red-500/10">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
