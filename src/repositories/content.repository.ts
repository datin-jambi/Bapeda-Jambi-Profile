import { prisma } from "@/lib/prisma";

export const faqRepository = {
  async findAll(params: { skip: number; limit: number; categoryId?: number; isPublished?: boolean }) {
    const where = {
      deletedAt: null,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
    };
    const [data, total] = await Promise.all([
      prisma.faq.findMany({
        where, skip: params.skip, take: params.limit,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.faq.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.faq.findUnique({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  },

  async create(data: {
    categoryId: number; authorId: number; question: string;
    answer: string; sortOrder?: number; isPublished?: boolean;
  }) {
    return prisma.faq.create({ data });
  },

  async update(id: number, data: Partial<{
    categoryId: number; question: string; answer: string;
    sortOrder: number; isPublished: boolean;
  }>) {
    return prisma.faq.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const pageRepository = {
  async findAll() {
    return prisma.page.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  },

  async findBySlug(slug: string) {
    return prisma.page.findUnique({ where: { slug, deletedAt: null } });
  },

  async findById(id: number) {
    return prisma.page.findUnique({ where: { id, deletedAt: null } });
  },

  async update(id: number, data: Partial<{
    title: string; content: string; seoTitle: string | null;
    seoDescription: string | null; isPublished: boolean;
  }>) {
    return prisma.page.update({ where: { id }, data });
  },
};

export const bannerRepository = {
  async findAll(activeOnly = false) {
    return prisma.banner.findMany({
      where: { deletedAt: null, ...(activeOnly && { isActive: true }) },
      orderBy: { sortOrder: "asc" },
    });
  },

  async findById(id: number) {
    return prisma.banner.findUnique({ where: { id, deletedAt: null } });
  },

  async create(data: {
    title: string; description?: string | null; imageUrl: string;
    buttonText?: string | null; buttonUrl?: string | null;
    sortOrder?: number; isActive?: boolean;
  }) {
    return prisma.banner.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; description: string | null; imageUrl: string;
    buttonText: string | null; buttonUrl: string | null;
    sortOrder: number; isActive: boolean;
  }>) {
    return prisma.banner.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.banner.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const regulationRepository = {
  async findAll(params: { skip: number; limit: number; search?: string }) {
    const where = {
      deletedAt: null,
      ...(params.search && { title: { contains: params.search, mode: "insensitive" as const } }),
    };
    const [data, total] = await Promise.all([
      prisma.regulation.findMany({
        where, skip: params.skip, take: params.limit,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.regulation.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id: number) {
    return prisma.regulation.findUnique({ where: { id, deletedAt: null } });
  },

  async create(data: {
    title: string; description?: string | null;
    fileUrl: string; publishedAt?: Date | null;
  }) {
    return prisma.regulation.create({ data });
  },

  async update(id: number, data: Partial<{
    title: string; description: string | null;
    fileUrl: string; publishedAt: Date | null;
  }>) {
    return prisma.regulation.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.regulation.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

export const settingRepository = {
  async findAll() {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  },

  async upsert(key: string, value: string) {
    return prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async upsertMany(data: Record<string, string>) {
    return Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
  },
};

export const uptdRepository = {
  async findAll(params?: { activeOnly?: boolean }) {
    return prisma.uptd.findMany({
      where: { deletedAt: null, ...(params?.activeOnly && { isActive: true }) },
      orderBy: { code: "asc" },
    });
  },

  async findById(id: number) {
    return prisma.uptd.findUnique({
      where: { id, deletedAt: null },
      include: { _count: { select: { users: true } } },
    });
  },

  async create(data: {
    code: string; name: string; address?: string | null;
    phone?: string | null; email?: string | null;
    headName?: string | null; isActive?: boolean;
  }) {
    return prisma.uptd.create({ data });
  },

  async update(id: number, data: Partial<{
    code: string; name: string; address: string | null;
    phone: string | null; email: string | null;
    headName: string | null; isActive: boolean;
  }>) {
    return prisma.uptd.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.uptd.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
