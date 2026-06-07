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
  WISH_CATEGORIES,
  WISH_CATEGORY_LABELS,
  wishSchema,
  type WishCategory,
  type WishInput,
} from '@/lib/validators/wish';
import { createWishAction, updateWishAction } from '@/modules/wishes/interfaces/actions';
import type { SerializedWishItem } from '@/modules/wishes/domain/entities';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedWishItem | null;
  defaultCategory: WishCategory;
  onSaved: (item: SerializedWishItem) => void;
}

export function WishDialog({ open, onOpenChange, editing, defaultCategory, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WishInput>({
    resolver: zodResolver(wishSchema),
    defaultValues: {
      name: '',
      price: 0,
      link: '',
      description: '',
      category: defaultCategory,
    },
  });

  const category = watch('category');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? {
              name: editing.name,
              price: editing.price,
              link: editing.link ?? '',
              description: editing.description ?? '',
              category: editing.category,
            }
          : {
              name: '',
              price: 0,
              link: '',
              description: '',
              category: defaultCategory,
            },
      );
    }
  }, [open, editing, reset, defaultCategory]);

  function onSubmit(values: WishInput) {
    setSubmitError(null);
    const payload: WishInput = {
      ...values,
      link: values.link?.trim() ? values.link.trim() : null,
      description: values.description?.trim() ? values.description.trim() : null,
    };
    startTransition(async () => {
      const result = editing
        ? await updateWishAction(editing.id, payload)
        : await createWishAction(payload);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Desejo atualizado' : 'Desejo adicionado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar desejo' : 'Novo desejo'}</DialogTitle>
          <DialogDescription>Item de consumo que você pretende comprar</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="wish-name">Nome</Label>
            <Input id="wish-name" placeholder="Ex.: Monitor ultrawide" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="wish-price">Preço (R$)</Label>
              <Input
                id="wish-price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue('category', v as WishCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WISH_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {WISH_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wish-link">Link (opcional)</Label>
            <Input id="wish-link" type="url" placeholder="https://..." {...register('link')} />
            {errors.link && <p className="text-xs text-destructive">{errors.link.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wish-desc">Descrição (opcional)</Label>
            <Textarea id="wish-desc" rows={3} {...register('description')} />
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
              {editing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
