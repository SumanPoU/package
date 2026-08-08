import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
      )}
      <div className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload file"
          className="h-8 text-sm flex-1"
        />
        <div className="relative overflow-hidden inline-block">
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 relative overflow-hidden text-xs"
          >
            Upload
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer text-[0]"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
