import { gestaoRepository } from '../../infrastructure/gestao.repository';

export async function listGestaoBoardQuery(userId: string) {
  const [customers, servers, projects] = await Promise.all([
    gestaoRepository.listCustomers(userId),
    gestaoRepository.listServers(userId),
    gestaoRepository.listProjects(userId),
  ]);
  return { customers, servers, projects };
}
