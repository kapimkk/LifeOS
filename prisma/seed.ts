import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Credenciais do usuário semeado são configuráveis por env var para evitar
  // publicar um admin com senha previsível em qualquer ambiente que não seja
  // dev local. Em produção (NODE_ENV=production) o seed só roda se as duas
  // variáveis forem definidas explicitamente.
  const seedEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@lifeos.local';
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;

  if (process.env.NODE_ENV === 'production' && !seedPassword) {
    console.log('SEED_ADMIN_PASSWORD não definida em produção — pulando criação de usuário admin.');
    return;
  }

  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(seedPassword ?? 'troque-esta-senha', 10);

  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: {},
    create: {
      name: 'Administrador',
      email: seedEmail,
      passwordHash,
      role: 'ADMIN',
      isApproved: true,
      onboardedAt: new Date(),
    },
  });

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
    `Seed concluído. Admin aprovado: ${seedEmail} (isApproved=true, role=ADMIN). ` +
      (seedPassword ? 'Senha definida via SEED_ADMIN_PASSWORD.' : 'Senha padrão de dev local.'),
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
