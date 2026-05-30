'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function StepCardActions({ onEdit, onDelete, disabled }: Props) {
  return (
    <div className="flex gap-0.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        aria-label="Editar missão"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-slate-400 hover:bg-destructive/20 hover:text-destructive"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Excluir missão"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
