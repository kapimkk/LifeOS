'use client';

import { GESTAO_COLORS } from '@/lib/validators/gestao';
import { cn } from '@/lib/utils';

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GESTAO_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Cor ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition',
            value.toLowerCase() === color ? 'border-foreground' : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
