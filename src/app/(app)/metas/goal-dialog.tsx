'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';
import { goalSchema, type GoalInput } from '@/lib/validators/goal';
import type { GoalItem } from './goals-client';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: GoalItem | null;
  onSaved: (goal: GoalItem) => void;
}

export function GoalDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'PERSONAL',
      progress: 0,
      currentValue: 0,
      priority: 'MEDIUM',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              title: editing.title,
              description: editing.description ?? '',
              category: editing.category,
              targetValue: editing.targetValue ?? undefined,
              currentValue: editing.currentValue,
              progress: editing.progress,
              priority: editing.priority,
              status: editing.status,
              deadline: editing.deadline ? editing.deadline.slice(0, 10) : undefined,
            }
          : {
              title: '',
              description: '',
              category: 'PERSONAL',
              progress: 0,
              currentValue: 0,
              priority: 'MEDIUM',
              status: 'ACTIVE',
            },
      );
    }
  }, [open, editing, reset]);

  async function onSubmit(values: GoalInput) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        deadline: values.deadline ? new Date(values.deadline as string).toISOString() : null,
      };
      const result = editing
        ? await apiFetch<GoalItem>(`/api/goals/${editing.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch<GoalItem>('/api/goals', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      toast.success(editing ? 'Meta atualizada' : 'Meta criada');
      onSaved({
        ...result,
        targetValue: result.targetValue ? Number(result.targetValue) : null,
        currentValue: Number(result.currentValue),
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar meta' : 'Nova meta'}</DialogTitle>
          <DialogDescription>Defina um objetivo claro e mensurável</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex.: Ler 12 livros em 2026" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v as GoalInput['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINANCIAL">Financeira</SelectItem>
                  <SelectItem value="PERSONAL">Pessoal</SelectItem>
                  <SelectItem value="STUDIES">Estudos</SelectItem>
                  <SelectItem value="FITNESS">Fitness</SelectItem>
                  <SelectItem value="CAREER">Carreira</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v as GoalInput['priority'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Meta (qtd/valor)</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.01"
                min="0"
                {...register('targetValue', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">Atual</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                min="0"
                {...register('currentValue', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progresso (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                {...register('progress', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input id="deadline" type="date" {...register('deadline')} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as GoalInput['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativa</SelectItem>
                  <SelectItem value="PAUSED">Pausada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
