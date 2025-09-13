//Evitar múltiplas instâncias do prisma em ambiente de desenvolvimento
import { PrismaClient } from '../src/generated/prisma';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;