import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const userFields = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
}

export const userModel = {
  findAll() {
    return prisma.user.findMany({
      select: userFields,
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, select: userFields })
  },

  create(data) {
    return prisma.user.create({ data, select: userFields })
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data, select: userFields })
  },

  delete(id) {
    return prisma.user.delete({ where: { id }, select: userFields })
  },
}

export function disconnectDatabase() {
  return prisma.$disconnect()
}
