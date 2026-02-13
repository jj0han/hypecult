import { prisma } from "../db/prisma";
import type { Address, AddressCreate } from "../schemas/address";

export async function list(userId: string) {
  const addresses = await prisma
  .address.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return addresses;
}

export async function create(userId: string, address: AddressCreate) {
  return await prisma.address.create({data: {userId: userId, ...address}})
}

export async function remove(userId: string, addressId: string) {
  const address = await prisma.address.findUnique({where: {id: addressId, userId: userId}})
  if (!address) {
    throw new Error("NOT_FOUND")
  }
  return await prisma.address.delete({where: {id: addressId, userId: userId}})
}

export async function update(userId: string, addressId: string, address: Address) {
  const existingAddress = await prisma.address.findUnique({where: {id: addressId, userId: userId}})
  if (!existingAddress) {
    throw new Error("NOT_FOUND")
  }
  return await prisma.address.update({where: {id: addressId, userId: userId}, data: address})
}