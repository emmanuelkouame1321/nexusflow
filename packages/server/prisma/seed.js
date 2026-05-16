import prisma from '../src/lib/prisma.js';
import { hashPassword } from '../src/modules/auth/auth.service.js';

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });
  await prisma.role.upsert({ where: { name: 'manager' }, update: {}, create: { name: 'manager' } });
  await prisma.role.upsert({
    where: { name: 'commercial' },
    update: {},
    create: { name: 'commercial' },
  });
  await prisma.role.upsert({
    where: { name: 'project_manager' },
    update: {},
    create: { name: 'project_manager' },
  });
  await prisma.role.upsert({
    where: { name: 'consultant' },
    update: {},
    create: { name: 'consultant' },
  });

  const adminPassword = await hashPassword('Admin1234!');
  await prisma.user.upsert({
    where: { email: 'admin@nexusflow.dev' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'NexusFlow',
      email: 'admin@nexusflow.dev',
      passwordHash: adminPassword,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Seed exécuté : rôles et admin créés');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
