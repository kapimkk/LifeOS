import type { ResourceInput } from '@/lib/validators/resource';
import { resourceRepository } from '../../infrastructure/resource.repository';

export interface CreateResourceResult {
  id: string;
}

export async function createResourceCommand(
  userId: string,
  data: ResourceInput,
): Promise<CreateResourceResult> {
  const resource = await resourceRepository.create(userId, data);
  return { id: resource.id };
}
