import { userRepository } from '../../infrastructure/user.repository';

export async function getUserByIdQuery(id: string) {
  return userRepository.findById(id);
}

export async function getUserByEmailQuery(email: string) {
  return userRepository.findByEmail(email);
}
