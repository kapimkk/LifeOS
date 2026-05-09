'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

interface Props {
  name: string;
  avatarUrl: string | null;
}

export function AvatarUploader({ name, avatarUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(avatarUrl);

  async function handleFile(file: File) {
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/me/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? 'Erro no upload');
      }
      const json = await res.json();
      setPreview(json.data.avatarUrl);
      toast.success('Foto atualizada');
      router.refresh();
    } catch (err) {
      setPreview(avatarUrl);
      toast.error(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-28 w-28 border border-border">
          {preview && <AvatarImage src={preview} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-2xl text-primary">
            {getInitials(name) || 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 backdrop-blur">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="h-4 w-4" />
        Trocar foto
      </Button>
    </div>
  );
}
