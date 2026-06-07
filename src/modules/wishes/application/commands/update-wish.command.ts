import type { WishInput } from '@/lib/validators/wish';
import { wishRepository } from '../../infrastructure/wish.repository';

export async function updateWishCommand(userId: string, id: string, data: Partial<WishInput>) {
  const item = await wishRepository.update(userId, id, data);
  return { item };
}
