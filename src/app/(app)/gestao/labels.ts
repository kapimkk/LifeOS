import type { ClientStatus, ProjectStatus, ServerStatus } from '@/lib/validators/gestao';

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  LEAD: 'Lead',
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  FORMER: 'Encerrado',
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  IDEA: 'Ideia',
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  DELIVERED: 'Entregue',
  ARCHIVED: 'Arquivado',
};

export const SERVER_STATUS_LABEL: Record<ServerStatus, string> = {
  ONLINE: 'Online',
  MAINTENANCE: 'Manutenção',
  OFFLINE: 'Offline',
};
