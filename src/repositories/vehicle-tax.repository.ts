import { prisma } from "@/lib/prisma";

interface CreateLogParams {
  userId: number;
  licensePlate: string;
  status: string;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  lokasi?: string | null;
}

interface FindAllParams {
  page: number;
  limit: number;
  skip: number;
  userId?: number;
  search?: string;
}

export const vehicleTaxRepository = {
  async create(data: CreateLogParams) {
    return prisma.vehicleTaxCheckLog.create({
      data: {
        userId: data.userId,
        licensePlate: data.licensePlate,
        status: data.status,
        notes: data.notes ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        lokasi: data.lokasi ?? null,
      },
    });
  },

  async findLatestByPlate(licensePlate: string) {
    return prisma.vehicleTaxCheckLog.findFirst({
      where: { licensePlate: { equals: licensePlate, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findAll({ page, limit, skip, userId, search }: FindAllParams) {
    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.licensePlate = { contains: search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      prisma.vehicleTaxCheckLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicleTaxCheckLog.count({ where }),
    ]);

    return { data, total };
  },
};
