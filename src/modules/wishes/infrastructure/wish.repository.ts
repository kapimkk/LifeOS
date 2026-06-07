import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedWishItem } from '../domain/entities';
import type { WishInput } from '@/lib/validators/wish';

function serialize(row: {
  id: string;
  name: string;
  price: Prisma.Decimal;
  link: string | null;
  description: string | null;
  category: 'ASSINATURAS' | 'ELETRONICOS' | 'JOGOS' | 'LAZER';
  createdAt: Date;
  updatedAt: Date;
}): SerializedWishItem {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    link: row.link,
    description: row.description,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const wishRepository = {
  async findByUserId(userId: string): Promise<SerializedWishItem[]> {
    const items = await prisma.wishItem.findMany({
      where: { userId },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
    return items.map(serialize);
  },

  async create(userId: string, data: WishInput): Promise<SerializedWishItem> {
    const created = await prisma.wishItem.create({
      data: {
        userId,
        name: data.name,
        price: new Prisma.Decimal(data.price),
        link: data.link && data.link.length > 0 ? data.link : null,
        description: data.description ?? null,
        category: data.category,
      },
    });
    return serialize(created);
  },

  async update(userId: string, id: string, data: Partial<WishInput>): Promise<SerializedWishItem> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.wishItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
        ...(data.link !== undefined && {
          link: data.link && data.link.length > 0 ? data.link : null,
        }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.category !== undefined && { category: data.category }),
      },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.wishItem.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.wishItem.findFirst({ where: { id, userId }, select: { id: true } });
    if (!found) throw new ApiError(404, 'Desejo não encontrado');
  },
};
