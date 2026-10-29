import { z } from 'zod';
import { sanitizeText } from '@/lib/sanitize';
import { safeOptionalText, safeText } from '@/lib/zod-sanitize';

export const GESTAO_COLORS = [
  '#6366f1',
  '#22c55e',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#f97316',
] as const;

export const clientStatusSchema = z.enum(['LEAD', 'ACTIVE', 'PAUSED', 'FORMER']);
export const projectStatusSchema = z.enum(['IDEA', 'ACTIVE', 'PAUSED', 'DELIVERED', 'ARCHIVED']);
export const serverStatusSchema = z.enum(['ONLINE', 'MAINTENANCE', 'OFFLINE']);

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida');

const optionalHttpUrl = z
  .string()
  .max(500)
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null || value.trim() === '') return null;
    return value.trim();
  })
  .refine((value) => value == null || /^https?:\/\//i.test(value), 'Use uma URL http ou https');

const optionalCuid = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value == null || value === '' || value === 'none' ? null : value))
  .refine((value) => value == null || /^c[a-z0-9]{20,}$/i.test(value), 'Vínculo inválido');

function optionalInt(max: number) {
  return z.preprocess(
    (value) => (value === '' || value == null || Number.isNaN(value) ? null : value),
    z.number().int().positive().max(max).nullable().optional(),
  );
}

function optionalMoney() {
  return z.preprocess(
    (value) => (value === '' || value == null || Number.isNaN(value) ? null : value),
    z.number().nonnegative().max(1_000_000_000).nullable().optional(),
  );
}

export const customerSchema = z.object({
  name: safeText(1, 120, 'Informe o nome'),
  company: safeOptionalText(120),
  email: z
    .string()
    .max(160)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null || value.trim() === '') return null;
      return value.trim().toLowerCase();
    })
    .refine(
      (value) => value == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'E-mail inválido',
    ),
  phone: safeOptionalText(40),
  website: optionalHttpUrl,
  status: clientStatusSchema,
  color: colorSchema,
  notes: safeOptionalText(4000),
});

export const vpsSchema = z.object({
  name: safeText(1, 120, 'Informe o nome'),
  provider: safeOptionalText(80),
  hostname: safeOptionalText(120),
  ipAddress: safeOptionalText(64),
  operatingSystem: safeOptionalText(80),
  region: safeOptionalText(80),
  cpu: safeOptionalText(80),
  ramGb: optionalInt(4096),
  diskGb: optionalInt(100000),
  status: serverStatusSchema,
  monthlyCost: optionalMoney(),
  panelUrl: optionalHttpUrl,
  color: colorSchema,
  backupNotes: safeOptionalText(4000),
  folderStructure: safeOptionalText(8000),
  hostedNotes: safeOptionalText(4000),
  notes: safeOptionalText(4000),
});

export const projectSchema = z.object({
  name: safeText(1, 120, 'Informe o nome'),
  summary: safeOptionalText(400),
  specification: safeOptionalText(8000),
  status: projectStatusSchema,
  color: colorSchema,
  customerId: optionalCuid,
  serverId: optionalCuid,
  stack: z
    .array(z.string().min(1).max(40))
    .max(12)
    .transform((items) => items.map((item) => sanitizeText(item)).filter(Boolean)),
  repoUrl: optionalHttpUrl,
  liveUrl: optionalHttpUrl,
  notes: safeOptionalText(4000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type VpsInput = z.infer<typeof vpsSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ClientStatus = z.infer<typeof clientStatusSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ServerStatus = z.infer<typeof serverStatusSchema>;
