'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  journeySchema,
  journeyStepSchema,
  type JourneyInput,
  type JourneyStepInput,
} from '@/lib/validators/journey';

interface CreateJourneyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: JourneyInput) => Promise<void>;
  submitting: boolean;
}

export function CreateJourneyDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: CreateJourneyDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JourneyInput>({
    resolver: zodResolver(journeySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) reset({ name: '', description: '' });
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova jornada</DialogTitle>
          <DialogDescription>Crie uma trilha de missões (ex.: curso de Python).</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (v) => {
            await onSubmit(v);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="j-name">Nome</Label>
            <Input id="j-name" placeholder="Python — do zero ao herói" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="j-desc">Descrição (opcional)</Label>
            <Textarea id="j-desc" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar jornada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddStepDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  journeyId: string | null;
  onSubmit: (data: JourneyStepInput) => Promise<void>;
  submitting: boolean;
}

export function AddStepDialog({
  open,
  onOpenChange,
  journeyId,
  onSubmit,
  submitting,
}: AddStepDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JourneyStepInput>({
    resolver: zodResolver(journeyStepSchema),
    defaultValues: {
      journeyId: '',
      title: '',
      description: '',
      url: '',
      instructor: '',
      difficulty: 1,
      xpReward: 100,
    },
  });

  useEffect(() => {
    if (open && journeyId) {
      reset({
        journeyId,
        title: '',
        description: '',
        url: '',
        instructor: '',
        difficulty: 3,
        xpReward: 100,
      });
    }
  }, [open, journeyId, reset]);

  if (!journeyId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo passo</DialogTitle>
          <DialogDescription>Adicione uma missão à trilha.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (v) => {
            await onSubmit({ ...v, journeyId });
          })}
        >
          <input type="hidden" {...register('journeyId')} />
          <div className="space-y-2">
            <Label htmlFor="s-title">Título</Label>
            <Input id="s-title" placeholder="Variáveis e tipos" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-inst">Instrutor</Label>
            <Input id="s-inst" placeholder="Guanabara" {...register('instructor')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-desc">Frase / descrição</Label>
            <Textarea
              id="s-desc"
              rows={2}
              placeholder="Todo herói começa..."
              {...register('description')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-url">Link do curso</Label>
            <Input id="s-url" type="url" placeholder="https://..." {...register('url')} />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="s-diff">Dificuldade (1-5)</Label>
              <Input
                id="s-diff"
                type="number"
                min={1}
                max={5}
                {...register('difficulty', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-xp">XP</Label>
              <Input
                id="s-xp"
                type="number"
                min={1}
                {...register('xpReward', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-order">Ordem</Label>
              <Input
                id="s-order"
                type="number"
                min={1}
                placeholder="Auto"
                {...register('order', { valueAsNumber: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Adicionar passo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
