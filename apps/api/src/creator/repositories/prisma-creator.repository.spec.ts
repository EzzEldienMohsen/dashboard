import { PrismaCreatorRepository } from './prisma-creator.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaCreatorRepository', () => {
  const creator = {
    findFirst: jest.fn(),
  };
  const prisma = { creator } as unknown as PrismaService;
  const repository = new PrismaCreatorRepository(prisma);
  const SELECT = {
    id: true,
    name: true,
    role: true,
    bio: true,
    skills: true,
    email: true,
    githubUrl: true,
    linkedinUrl: true,
    portfolioUrl: true,
    updatedAt: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('queries the first creator with the narrowed select', async () => {
      const record = {
        id: 'creator-1',
        name: 'Ezz Eldien Deghedy',
        role: 'Creator & Full-Stack Developer',
        bio: 'Frontend-focused developer specializing in Next.js, React, and TypeScript.',
        skills: ['React.js', 'Next.js', 'TypeScript'],
        email: 'ezzmohsend@gmail.com',
        githubUrl: 'https://github.com/EzzEldienMohsen',
        linkedinUrl: 'https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6',
        portfolioUrl: 'https://ezz-portfolio.vercel.app',
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      creator.findFirst.mockResolvedValue(record);

      const result = await repository.find();

      expect(creator.findFirst).toHaveBeenCalledWith({
        select: SELECT,
      });
      expect(result).toEqual(record);
    });

    it('returns null when unconfigured', async () => {
      creator.findFirst.mockResolvedValue(null);

      await expect(repository.find()).resolves.toBeNull();
    });
  });
});
