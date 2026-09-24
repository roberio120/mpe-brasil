import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = 'admin@mpebrasil.com.br';
const NAME = 'Administrador MPE Brasil';
const ROLE = 'superadmin';
const PASSWORD = 'Admin123!@#';

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`Admin já existe: ${EMAIL}`);
    return;
  }
  await prisma.adminUser.create({
    data: {
      email: EMAIL,
      name: NAME,
      role: ROLE,
      passwordHash: bcrypt.hashSync(PASSWORD, 10),
    },
  });
  console.log(`Admin criado: ${EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());