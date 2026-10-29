import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedCustomer, SerializedProject, SerializedVps } from '../domain/entities';
import type { CustomerInput, ProjectInput, VpsInput } from '@/lib/validators/gestao';

function serializeCustomer(row: {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: SerializedCustomer['status'];
  color: string;
  notes: string | null;
}): SerializedCustomer {
  return row;
}

function serializeVps(row: {
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
  status: SerializedVps['status'];
  monthlyCost: Prisma.Decimal | null;
  panelUrl: string | null;
  color: string;
  backupNotes: string | null;
  folderStructure: string | null;
  hostedNotes: string | null;
  notes: string | null;
}): SerializedVps {
  return { ...row, monthlyCost: row.monthlyCost == null ? null : Number(row.monthlyCost) };
}

function serializeProject(row: {
  id: string;
  name: string;
  summary: string | null;
  specification: string | null;
  status: SerializedProject['status'];
  color: string;
  customerId: string | null;
  serverId: string | null;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  notes: string | null;
  customer: { name: string } | null;
  server: { name: string } | null;
}): SerializedProject {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    specification: row.specification,
    status: row.status,
    color: row.color,
    customerId: row.customerId,
    customerName: row.customer?.name ?? null,
    serverId: row.serverId,
    serverName: row.server?.name ?? null,
    stack: row.stack,
    repoUrl: row.repoUrl,
    liveUrl: row.liveUrl,
    notes: row.notes,
  };
}

async function assertCustomer(userId: string, id: string) {
  const found = await prisma.customer.findFirst({ where: { id, userId }, select: { id: true } });
  if (!found) throw new ApiError(404, 'Cliente não encontrado');
}

async function assertServer(userId: string, id: string) {
  const found = await prisma.vpsServer.findFirst({ where: { id, userId }, select: { id: true } });
  if (!found) throw new ApiError(404, 'Servidor não encontrado');
}

async function assertLinks(userId: string, customerId: string | null, serverId: string | null) {
  if (customerId) await assertCustomer(userId, customerId);
  if (serverId) await assertServer(userId, serverId);
}

export const gestaoRepository = {
  async listCustomers(userId: string) {
    const rows = await prisma.customer.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return rows.map(serializeCustomer);
  },

  async listServers(userId: string) {
    const rows = await prisma.vpsServer.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return rows.map(serializeVps);
  },

  async listProjects(userId: string) {
    const rows = await prisma.project.findMany({
      where: { userId },
      include: { customer: { select: { name: true } }, server: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(serializeProject);
  },

  async createCustomer(userId: string, data: CustomerInput) {
    const created = await prisma.customer.create({ data: { userId, ...data } });
    return serializeCustomer(created);
  },

  async updateCustomer(userId: string, id: string, data: CustomerInput) {
    await assertCustomer(userId, id);
    const updated = await prisma.customer.update({ where: { id }, data });
    return serializeCustomer(updated);
  },

  async deleteCustomer(userId: string, id: string) {
    await assertCustomer(userId, id);
    await prisma.customer.delete({ where: { id } });
  },

  async createServer(userId: string, data: VpsInput) {
    const created = await prisma.vpsServer.create({
      data: {
        userId,
        ...data,
        ramGb: data.ramGb ?? null,
        diskGb: data.diskGb ?? null,
        monthlyCost: data.monthlyCost == null ? null : new Prisma.Decimal(data.monthlyCost),
      },
    });
    return serializeVps(created);
  },

  async updateServer(userId: string, id: string, data: VpsInput) {
    await assertServer(userId, id);
    const updated = await prisma.vpsServer.update({
      where: { id },
      data: {
        ...data,
        ramGb: data.ramGb ?? null,
        diskGb: data.diskGb ?? null,
        monthlyCost: data.monthlyCost == null ? null : new Prisma.Decimal(data.monthlyCost),
      },
    });
    return serializeVps(updated);
  },

  async deleteServer(userId: string, id: string) {
    await assertServer(userId, id);
    await prisma.vpsServer.delete({ where: { id } });
  },

  async createProject(userId: string, data: ProjectInput) {
    await assertLinks(userId, data.customerId, data.serverId);
    const created = await prisma.project.create({
      data: { userId, ...data },
      include: { customer: { select: { name: true } }, server: { select: { name: true } } },
    });
    return serializeProject(created);
  },

  async updateProject(userId: string, id: string, data: ProjectInput) {
    const found = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
    if (!found) throw new ApiError(404, 'Projeto não encontrado');
    await assertLinks(userId, data.customerId, data.serverId);
    const updated = await prisma.project.update({
      where: { id },
      data,
      include: { customer: { select: { name: true } }, server: { select: { name: true } } },
    });
    return serializeProject(updated);
  },

  async deleteProject(userId: string, id: string) {
    const found = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
    if (!found) throw new ApiError(404, 'Projeto não encontrado');
    await prisma.project.delete({ where: { id } });
  },
};
