import type { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ApiError, handleApiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

/**
 * Allowlist of accepted MIME types mapped to a safe, fixed extension.
 * Extension is derived from the MIME type — never from the original filename —
 * to prevent path-traversal / LFI via crafted filenames like "../../evil.php".
 */
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Magic byte signatures for image formats.
 * We read the first few bytes of the file to confirm the content really is
 * the image type it claims to be, regardless of what the Content-Type says.
 */
const MAGIC_CHECKS: Array<{ mime: string; offset: number; bytes: number[] }> = [
  { mime: 'image/png', offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
];

function detectMime(buf: Buffer): string | null {
  for (const { mime, offset, bytes } of MAGIC_CHECKS) {
    if (bytes.every((b, i) => buf[offset + i] === b)) return mime;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) throw new ApiError(400, 'Arquivo inválido');
    if (file.size > MAX_BYTES) throw new ApiError(400, 'Imagem maior que 4 MB');

    // Read file contents once
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    // Verify real content via magic bytes — content-type header is attacker-controlled
    const detectedMime = detectMime(buf);
    if (!detectedMime || !(detectedMime in MIME_TO_EXT)) {
      throw new ApiError(400, 'Formato de imagem não suportado ou inválido');
    }

    // Extension comes from the detected MIME, never from the original filename
    const ext = MIME_TO_EXT[detectedMime];

    // Filename is deterministic per user+timestamp — no user input in path
    const filename = `${user.id}-${Date.now()}.${ext}`;

    // Resolve final path and assert it's inside the expected directory
    const dir = path.resolve(process.cwd(), 'public', 'uploads', 'avatars');
    const dest = path.resolve(dir, filename);
    if (!dest.startsWith(dir + path.sep)) {
      // Should never happen given the filename construction above, but guard anyway
      throw new ApiError(400, 'Caminho de arquivo inválido');
    }

    await mkdir(dir, { recursive: true });
    await writeFile(dest, buf);

    const avatarUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

    return ok({ avatarUrl });
  } catch (err) {
    return handleApiError(err);
  }
}
