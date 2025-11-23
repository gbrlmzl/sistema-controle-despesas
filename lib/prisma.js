//Evitar múltiplas instâncias do prisma em ambiente de desenvolvimento
/*import { PrismaClient } from '../src/generated/prisma';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;*/


// Prisma Client com adaptador PostgreSQL para Prisma 7
// Evitar múltiplas instâncias do prisma em ambiente de desenvolvimento
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;