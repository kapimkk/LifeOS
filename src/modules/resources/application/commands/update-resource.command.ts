import type { ResourceInput } from '@/lib/validators/resource';
import { resourceRepository } from '../../infrastructure/resource.repository';

export interface UpdateResourceResult {
  id: string;
}

export async function updateResourceCommand(
  userId: string,
  id: string,
  data: Partial<ResourceInput>,
): Promise<UpdateResourceResult> {
  const resource = await resourceRepository.update(userId, id, data);
  return { id: resource.id };
}

export async function toggleResourceDoneCommand(
  userId: string,
  id: string,
): Promise<UpdateResourceResult> {
  const resource = await resourceRepository.toggleDone(userId, id);
  return { id: resource.id };
}
