'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function JourneyHeaderControls({ onEdit, onDelete, disabled }: Props) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={disabled}
        onClick={onEdit}
        aria-label="Editar jornada"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Excluir jornada"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
