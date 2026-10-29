import type { ClientStatus, ProjectStatus, ServerStatus } from '@/lib/validators/gestao';

export interface SerializedCustomer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: ClientStatus;
  color: string;
  notes: string | null;
}

export interface SerializedVps {
  id: string;
  name: string;
  provider: string | null;
  hostname: string | null;
  ipAddress: string | null;
  operatingSystem: string | null;
  region: string | null;
  cpu: string | null;
  ramGb: number | null;
  diskGb: number | null;
  status: ServerStatus;
  monthlyCost: number | null;
  panelUrl: string | null;
  color: string;
  backupNotes: string | null;
  folderStructure: string | null;
  hostedNotes: string | null;
  notes: string | null;
}

export interface SerializedProject {
  id: string;
  name: string;
  summary: string | null;
  specification: string | null;
  status: ProjectStatus;
  color: string;
  customerId: string | null;
  customerName: string | null;
  serverId: string | null;
  serverName: string | null;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  notes: string | null;
}
