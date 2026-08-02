'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import { submitDepartment } from '@/app/register/actions';

interface DepartmentFormProps {
  departments: string[];
  defaultName: string;
}

export function DepartmentForm({ departments }: DepartmentFormProps) {
  const [department, setDepartment] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!department) return;
    const formData = new FormData();
    formData.set('department', department);
    startTransition(() => {
      submitDepartment(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium">
          Your department
        </Label>
        <Select value={department} onValueChange={setDepartment} disabled={isPending}>
          <SelectTrigger id="department" className="w-full h-11">
            <SelectValue placeholder="Select your department..." />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isPending || !department}
        className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Complete Registration
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
