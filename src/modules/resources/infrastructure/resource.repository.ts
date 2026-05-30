import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedResource } from '../domain/entities';
import type { ResourceInput } from '@/lib/validators/resource';

function serialize(r: {
  id: string;
  title: string;
  url: string;
  description: string | null;
  vaultCategory: 'ESTUDOS' | 'LAZER' | 'FERRAMENTAS';
  category: string | null;
  status: 'TO_READ' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}): SerializedResource {
  return { ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() };
}

export const resourceRepository = {
  async findByUserId(
    userId: string,
    vaultCategory?: 'ESTUDOS' | 'LAZER' | 'FERRAMENTAS',
  ): Promise<SerializedResource[]> {
    const items = await prisma.resource.findMany({
      where: { userId, ...(vaultCategory && { vaultCategory }) },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
    return items.map(serialize);
  },

  async create(userId: string, data: ResourceInput): Promise<SerializedResource> {
    const created = await prisma.resource.create({
      data: {
        userId,
        title: data.title,
        url: data.url,
        description: data.description ?? null,
        vaultCategory: data.vaultCategory,
        category: data.category ?? null,
        status: data.status,
      },
    });
    return serialize(created);
  },

  async update(
    userId: string,
    id: string,
    data: Partial<ResourceInput>,
  ): Promise<SerializedResource> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.vaultCategory !== undefined && { vaultCategory: data.vaultCategory }),
        ...(data.category !== undefined && { category: data.category ?? null }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
    return serialize(updated);
  },

  async toggleDone(userId: string, id: string): Promise<SerializedResource> {
    await this.assertOwnership(userId, id);
    const current = await prisma.resource.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, 'Recurso não encontrado');
    const updated = await prisma.resource.update({
      where: { id },
      data: { status: current.status === 'DONE' ? 'TO_READ' : 'DONE' },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.resource.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.resource.findFirst({ where: { id, userId }, select: { id: true } });
    if (!found) throw new ApiError(404, 'Recurso não encontrado');
  },
};
