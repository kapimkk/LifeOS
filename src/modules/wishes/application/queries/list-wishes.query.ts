import { wishRepository } from '../../infrastructure/wish.repository';

export async function listWishesQuery(userId: string) {
  return wishRepository.findByUserId(userId);
}
