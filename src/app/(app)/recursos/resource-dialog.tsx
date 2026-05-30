'use client';

import { useEffect, useState, useTransition } from 'react';
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
import {
  RESOURCE_VAULT_CATEGORIES,
  RESOURCE_VAULT_LABELS,
  resourceSchema,
  type ResourceInput,
  type ResourceVaultCategory,
} from '@/lib/validators/resource';
import { createResourceAction, updateResourceAction } from '@/modules/resources/interfaces/actions';
import type { SerializedResource } from '@/modules/resources/domain/entities';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedResource | null;
  defaultVaultCategory: ResourceVaultCategory;
  onSaved: (resource: SerializedResource) => void;
}

const STATUS_OPTIONS: Array<{ value: ResourceInput['status']; label: string }> = [
  { value: 'TO_READ', label: 'Para ler' },
  { value: 'IN_PROGRESS', label: 'Lendo' },
  { value: 'DONE', label: 'Concluído' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

export function ResourceDialog({
  open,
  onOpenChange,
  editing,
  defaultVaultCategory,
  onSaved,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResourceInput>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      url: '',
      description: '',
      vaultCategory: defaultVaultCategory,
      status: 'TO_READ',
    },
  });

  const status = watch('status');
  const vaultCategory = watch('vaultCategory');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? {
              title: editing.title,
              url: editing.url,
              description: editing.description ?? '',
              vaultCategory: editing.vaultCategory,
              category: editing.category ?? null,
              status: editing.status,
            }
          : {
              title: '',
              url: '',
              description: '',
              vaultCategory: defaultVaultCategory,
              category: null,
              status: 'TO_READ',
            },
      );
    }
  }, [open, editing, reset, defaultVaultCategory]);

  function onSubmit(values: ResourceInput) {
    setSubmitError(null);
    const payload: ResourceInput = {
      ...values,
      description: values.description?.trim() ? values.description.trim() : null,
      category: values.category?.trim() ? values.category.trim() : null,
    };
    startTransition(async () => {
      const result = editing
        ? await updateResourceAction(editing.id, payload)
        : await createResourceAction(payload);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Recurso atualizado' : 'Recurso adicionado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar recurso' : 'Novo recurso'}</DialogTitle>
          <DialogDescription>
            Salve um link, artigo, vídeo ou material para depois
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex.: Guia completo de Next.js 15"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              autoComplete="off"
              {...register('url')}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={vaultCategory}
                onValueChange={(v) => setValue('vaultCategory', v as ResourceVaultCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_VAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {RESOURCE_VAULT_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue('status', v as ResourceInput['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Anotações (opcional)</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Por que vale a pena ver?"
              {...register('description')}
            />
          </div>

          {submitError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
