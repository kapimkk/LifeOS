import { wishRepository } from '../../infrastructure/wish.repository';

export async function deleteWishCommand(userId: string, id: string) {
  await wishRepository.remove(userId, id);
  return { id };
}
