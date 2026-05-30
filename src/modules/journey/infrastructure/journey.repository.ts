import 'server-only';
import type { JourneyStepStatus as PrismaStepStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  JourneyInput,
  JourneyStepInput,
  UpdateJourneyStepInput,
} from '@/lib/validators/journey';
import { compactStepOrders } from '../domain/reorder-steps';
import {
  assertCanCompleteStep,
  initialStatusForNewStep,
  resolveStepStatus,
  type StepOrderSnapshot,
} from '../domain/unlock-rules';

function syncStatuses(steps: StepOrderSnapshot[]): Map<number, PrismaStepStatus> {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const updates = new Map<number, PrismaStepStatus>();
  let prev: StepOrderSnapshot | null = null;
  for (const step of sorted) {
    const next = resolveStepStatus(step, prev);
    if (next !== step.status) updates.set(step.order, next);
    prev = { order: step.order, status: next };
  }
  return updates;
}

export const journeyRepository = {
  async findByUserId(userId: string) {
    const journeys = await prisma.journey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    for (const j of journeys) {
      await this.syncStepStatuses(j.id, j.steps);
    }
    return prisma.journey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  },

  async findByIdWithSteps(userId: string, journeyId: string) {
    const journey = await prisma.journey.findFirst({
      where: { id: journeyId, userId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    if (!journey) return null;
    await this.syncStepStatuses(journeyId, journey.steps);
    return prisma.journey.findFirst({
      where: { id: journeyId, userId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  },

  async syncStepStatuses(
    journeyId: string,
    steps?: { id: string; order: number; status: PrismaStepStatus }[],
  ) {
    const list =
      steps ??
      (await prisma.journeyStep.findMany({
        where: { journeyId },
        orderBy: { order: 'asc' },
      }));
    const snapshots: StepOrderSnapshot[] = list.map((s) => ({
      order: s.order,
      status: s.status as StepOrderSnapshot['status'],
    }));
    const updates = syncStatuses(snapshots);
    if (updates.size === 0) return;
    const byOrder = new Map(list.map((s) => [s.order, s]));
    await prisma.$transaction(
      [...updates.entries()].map(([order, status]) =>
        prisma.journeyStep.update({
          where: { id: byOrder.get(order)!.id },
          data: { status },
        }),
      ),
    );
  },

  async createJourney(userId: string, data: JourneyInput) {
    return prisma.journey.create({
      data: {
        userId,
        name: data.name,
        description: data.description ?? null,
      },
    });
  },

  async addStep(userId: string, data: JourneyStepInput) {
    await this.assertJourneyOwnership(userId, data.journeyId);
    const count = await prisma.journeyStep.count({ where: { journeyId: data.journeyId } });
    const maxOrder = await prisma.journeyStep.aggregate({
      where: { journeyId: data.journeyId },
      _max: { order: true },
    });
    const order = data.order ?? (maxOrder._max.order ?? 0) + 1;
    const status = initialStatusForNewStep(count);
    const row = await prisma.journeyStep.create({
      data: {
        journeyId: data.journeyId,
        title: data.title,
        description: data.description ?? null,
        url: data.url && data.url.length > 0 ? data.url : null,
        instructor: data.instructor ?? null,
        difficulty: data.difficulty,
        xpReward: data.xpReward,
        order,
        status,
      },
    });
    await this.syncStepStatuses(data.journeyId);
    return row;
  },

  async completeStep(userId: string, stepId: string) {
    const step = await prisma.journeyStep.findUnique({
      where: { id: stepId },
      include: { journey: { select: { userId: true, id: true } } },
    });
    if (!step || step.journey.userId !== userId) {
      const err = new Error('Passo não encontrado') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    await this.syncStepStatuses(step.journeyId);
    const siblings = await prisma.journeyStep.findMany({
      where: { journeyId: step.journeyId },
      orderBy: { order: 'asc' },
    });
    const fresh = siblings.find((s) => s.id === stepId)!;
    const idx = siblings.findIndex((s) => s.id === stepId);
    const previous = idx > 0 ? siblings[idx - 1] : null;
    assertCanCompleteStep(
      { order: fresh.order, status: fresh.status as StepOrderSnapshot['status'] },
      previous
        ? { order: previous.order, status: previous.status as StepOrderSnapshot['status'] }
        : null,
    );

    await prisma.journeyStep.update({
      where: { id: stepId },
      data: { status: 'COMPLETED' },
    });
    await this.syncStepStatuses(step.journeyId);
    return step.journeyId;
  },

  async updateJourney(userId: string, journeyId: string, data: JourneyInput) {
    await this.assertJourneyOwnership(userId, journeyId);
    return prisma.journey.update({
      where: { id: journeyId },
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  },

  async deleteJourney(userId: string, journeyId: string) {
    await this.assertJourneyOwnership(userId, journeyId);
    await prisma.journey.delete({ where: { id: journeyId } });
  },

  async updateStep(userId: string, stepId: string, data: UpdateJourneyStepInput) {
    const step = await this.assertStepOwnership(userId, stepId);
    return prisma.journeyStep.update({
      where: { id: stepId },
      data: {
        title: data.title,
        description: data.description ?? null,
        url: data.url && data.url.length > 0 ? data.url : null,
        instructor: data.instructor ?? null,
        difficulty: data.difficulty,
        xpReward: data.xpReward,
      },
    });
  },

  async deleteStep(userId: string, stepId: string): Promise<{ id: string; journeyId: string }> {
    const step = await this.assertStepOwnership(userId, stepId);
    const journeyId = step.journeyId;

    await prisma.journeyStep.delete({ where: { id: stepId } });

    const remaining = await prisma.journeyStep.findMany({
      where: { journeyId },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });

    const compacted = compactStepOrders(remaining);
    if (compacted.length > 0) {
      await prisma.$transaction(
        compacted.map(({ id, order }) =>
          prisma.journeyStep.update({ where: { id }, data: { order } }),
        ),
      );
    }

    await this.syncStepStatuses(journeyId);
    return { id: stepId, journeyId };
  },

  async assertJourneyOwnership(userId: string, journeyId: string) {
    const found = await prisma.journey.findFirst({
      where: { id: journeyId, userId },
      select: { id: true },
    });
    if (!found) {
      const err = new Error('Jornada não encontrada') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
  },

  async assertStepOwnership(userId: string, stepId: string) {
    const step = await prisma.journeyStep.findUnique({
      where: { id: stepId },
      include: { journey: { select: { userId: true } } },
    });
    if (!step || step.journey.userId !== userId) {
      const err = new Error('Passo não encontrado') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    return step;
  },
};
