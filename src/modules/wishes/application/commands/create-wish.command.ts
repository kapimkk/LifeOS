import type { WishInput } from '@/lib/validators/wish';
import { wishRepository } from '../../infrastructure/wish.repository';

export async function createWishCommand(userId: string, data: WishInput) {
  const item = await wishRepository.create(userId, data);
  return { id: item.id, item };
}
