import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inter.mx' },
    update: {},
    create: {
      email: 'admin@inter.mx',
      password: passwordHash,
      nombre: 'Administrador Maestro',
      rol: 'ADMIN',
    },
  });
  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });