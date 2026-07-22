import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES: Array<{
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}> = [
  { name: 'Alimentação', color: '#f97316', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', type: 'EXPENSE' },
  { name: 'Lazer', color: '#a855f7', icon: 'gamepad-2', type: 'EXPENSE' },
  { name: 'Estudos', color: '#06b6d4', icon: 'book-open', type: 'EXPENSE' },
  { name: 'Moradia', color: '#ef4444', icon: 'home', type: 'EXPENSE' },
  { name: 'Saúde', color: '#10b981', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Investimentos', color: '#22c55e', icon: 'trending-up', type: 'EXPENSE' },
  { name: 'Salário', color: '#16a34a', icon: 'wallet', type: 'INCOME' },
  { name: 'Freelance', color: '#0ea5e9', icon: 'briefcase', type: 'INCOME' },
  { name: 'Rendimentos', color: '#84cc16', icon: 'coins', type: 'INCOME' },
];

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@lifeos.app' },
    update: { isApproved: true, role: 'ADMIN' },
    create: {
      name: 'Usuário Demo',
      email: 'demo@lifeos.app',
      passwordHash,
      role: 'ADMIN',
      isApproved: true,
      onboardedAt: new Date(),
    },
  });

  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name: c.name, type: c.type } },
      update: {},
      create: { ...c, userId: user.id },
    });
  }

  const investmentsExist = await prisma.investment.count({ where: { userId: user.id } });
  if (investmentsExist === 0) {
    await prisma.investment.createMany({
      data: [
        {
          userId: user.id,
          name: 'CDB Banco X 110% CDI',
          amount: 8500,
          type: 'CDB',
          color: '#22c55e',
        },
        {
          userId: user.id,
          name: 'Tesouro IPCA+ 2035',
          amount: 12000,
          type: 'Tesouro Direto',
          color: '#10b981',
        },
        { userId: user.id, name: 'ITSA4', amount: 3200, type: 'Ações', color: '#3b82f6' },
        { userId: user.id, name: 'HGLG11', amount: 4800, type: 'FIIs', color: '#a855f7' },
        { userId: user.id, name: 'Bitcoin', amount: 1500, type: 'Cripto', color: '#f97316' },
      ],
    });
  }

  const resourcesExist = await prisma.resource.count({ where: { userId: user.id } });
  if (resourcesExist === 0) {
    await prisma.resource.createMany({
      data: [
        {
          userId: user.id,
          title: 'Next.js 15 — Documentação oficial',
          url: 'https://nextjs.org/docs',
          description: 'Referência completa do App Router, Server Actions e RSC.',
          category: 'Documentação',
          status: 'IN_PROGRESS',
        },
        {
          userId: user.id,
          title: 'Atomic Habits — James Clear',
          url: 'https://jamesclear.com/atomic-habits',
          description: 'Por que pequenas mudanças geram resultados extraordinários.',
          category: 'Livro',
          status: 'TO_READ',
        },
        {
          userId: user.id,
          title: 'Prisma com PostgreSQL na prática',
          url: 'https://www.prisma.io/docs/orm/overview/databases/postgresql',
          description: 'Setup, migrations e relations.',
          category: 'Tutorial',
          status: 'DONE',
        },
      ],
    });
  }

  console.log(
    'Seed concluído. Admin aprovado: demo@lifeos.app / demo1234 (isApproved=true, role=ADMIN)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
