import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { ResourceInput } from '@/lib/validators/resource';

export interface SerializedResource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  status: 'TO_READ' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

function serialize(r: {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  status: 'TO_READ' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}): SerializedResource {
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    description: r.description,
    category: r.category,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export const resourcesService = {
  async list(userId: string): Promise<SerializedResource[]> {
    const items = await prisma.resource.findMany({
      where: { userId },
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

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.resource.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.resource.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Recurso não encontrado');
  },

  async categories(userId: string): Promise<string[]> {
    const rows = await prisma.resource.findMany({
      where: { userId, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return rows.map((r) => r.category!).sort();
  },
};
