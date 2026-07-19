import { PrismaSchoolProfileRepository } from './prisma-school-profile.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaSchoolProfileRepository', () => {
  const schoolProfile = {
    findFirst: jest.fn(),
  };
  const prisma = { schoolProfile } as unknown as PrismaService;
  const repository = new PrismaSchoolProfileRepository(prisma);
  const SELECT = {
    id: true,
    name: true,
    nameAr: true,
    mission: true,
    missionAr: true,
    foundedYear: true,
    address: true,
    contactEmail: true,
    contactPhone: true,
    updatedAt: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('queries the first profile with the narrowed select', async () => {
      const profile = {
        id: 'profile-1',
        name: 'Riverside International School',
        nameAr: 'مدرسة ريفرسايد الدولية',
        mission: 'To nurture curious, confident learners.',
        missionAr: 'نسعى إلى رعاية متعلمين واثقين وشغوفين بالمعرفة.',
        foundedYear: 1998,
        address: '42 Riverside Avenue, Springfield',
        contactEmail: 'info@riverside-school.example',
        contactPhone: '+1-555-0142',
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      schoolProfile.findFirst.mockResolvedValue(profile);

      const result = await repository.find();

      expect(schoolProfile.findFirst).toHaveBeenCalledWith({
        select: SELECT,
      });
      expect(result).toEqual(profile);
    });

    it('returns null when unconfigured', async () => {
      schoolProfile.findFirst.mockResolvedValue(null);

      await expect(repository.find()).resolves.toBeNull();
    });
  });
});
