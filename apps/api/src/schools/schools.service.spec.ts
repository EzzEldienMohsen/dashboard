import { Test } from '@nestjs/testing';
import { SchoolsService } from './schools.service';
import {
  SCHOOL_REPOSITORY,
  type ISchoolRepository,
} from './interfaces/school-repository.interface';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import type { ListSchoolsQueryDto } from './dto/list-schools-query.dto';

describe('SchoolsService', () => {
  let service: SchoolsService;

  const schools: jest.Mocked<ISchoolRepository> = {
    findById: jest.fn(),
    findMany: jest.fn(),
  };

  const existingSchool = {
    id: 'school-1',
    name: 'Riverside High',
    address: '123 River Road',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SchoolsService,
        { provide: SCHOOL_REPOSITORY, useValue: schools },
      ],
    }).compile();

    service = moduleRef.get(SchoolsService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the mapped DTO when the school exists', async () => {
      schools.findById.mockResolvedValue(existingSchool);

      const result = await service.findById('school-1');

      expect(schools.findById).toHaveBeenCalledWith('school-1');
      expect(result).toEqual({
        id: 'school-1',
        name: 'Riverside High',
        address: '123 River Road',
      });
    });

    it('throws SchoolNotFoundException when the school does not exist', async () => {
      schools.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        SchoolNotFoundException,
      );
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      schools.findById.mockRejectedValue(dbError);

      await expect(service.findById('school-1')).rejects.toBe(dbError);
    });
  });

  describe('findMany', () => {
    it('passes pagination through and maps items to DTOs', async () => {
      schools.findMany.mockResolvedValue({
        items: [existingSchool],
        total: 1,
        page: 2,
        limit: 10,
      });
      const query: ListSchoolsQueryDto = { page: 2, limit: 10 };

      const result = await service.findMany(query);

      expect(schools.findMany).toHaveBeenCalledWith({ page: 2, limit: 10 });
      expect(result).toEqual({
        items: [
          { id: 'school-1', name: 'Riverside High', address: '123 River Road' },
        ],
        total: 1,
        page: 2,
        limit: 10,
      });
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      schools.findMany.mockRejectedValue(dbError);

      await expect(service.findMany({ page: 1, limit: 20 })).rejects.toBe(
        dbError,
      );
    });
  });
});
