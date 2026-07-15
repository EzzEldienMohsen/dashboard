import { Test } from '@nestjs/testing';
import { SchoolProfileService } from './school-profile.service';
import {
  SCHOOL_PROFILE_REPOSITORY,
  type ISchoolProfileRepository,
} from './interfaces/school-profile-repository.interface';
import { SchoolProfileNotFoundException } from '../common/exceptions/school-profile-not-found.exception';

describe('SchoolProfileService', () => {
  let service: SchoolProfileService;

  const schoolProfile: jest.Mocked<ISchoolProfileRepository> = {
    find: jest.fn(),
  };

  const existingProfile = {
    id: 'profile-1',
    name: 'Riverside International School',
    mission: 'To nurture curious, confident learners.',
    foundedYear: 1998,
    address: '42 Riverside Avenue, Springfield',
    contactEmail: 'info@riverside-school.example',
    contactPhone: '+1-555-0142',
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SchoolProfileService,
        { provide: SCHOOL_PROFILE_REPOSITORY, useValue: schoolProfile },
      ],
    }).compile();

    service = moduleRef.get(SchoolProfileService);
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('returns the mapped DTO when the profile exists', async () => {
      schoolProfile.find.mockResolvedValue(existingProfile);

      const result = await service.find();

      expect(schoolProfile.find).toHaveBeenCalledWith();
      expect(result).toEqual(existingProfile);
    });

    it('throws SchoolProfileNotFoundException when unconfigured', async () => {
      schoolProfile.find.mockResolvedValue(null);

      await expect(service.find()).rejects.toBeInstanceOf(
        SchoolProfileNotFoundException,
      );
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      schoolProfile.find.mockRejectedValue(dbError);

      await expect(service.find()).rejects.toBe(dbError);
    });
  });
});
