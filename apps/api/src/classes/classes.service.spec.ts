import { Test } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import {
  CLASS_REPOSITORY,
  type IClassRepository,
} from './interfaces/class-repository.interface';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto';

describe('ClassesService', () => {
  let service: ClassesService;

  const classes: jest.Mocked<IClassRepository> = {
    findById: jest.fn(),
    findMany: jest.fn(),
  };

  const existingClass = {
    id: 'class-1',
    name: 'Grade 5-A',
    schoolId: 'school-1',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: CLASS_REPOSITORY, useValue: classes },
      ],
    }).compile();

    service = moduleRef.get(ClassesService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the mapped DTO when the class exists', async () => {
      classes.findById.mockResolvedValue(existingClass);

      const result = await service.findById('class-1', 'school-1');

      expect(classes.findById).toHaveBeenCalledWith('class-1', 'school-1');
      expect(result).toEqual({
        id: 'class-1',
        name: 'Grade 5-A',
        schoolId: 'school-1',
      });
    });

    it('throws ClassNotFoundException when the class does not exist', async () => {
      classes.findById.mockResolvedValue(null);

      await expect(
        service.findById('missing', 'school-1'),
      ).rejects.toBeInstanceOf(ClassNotFoundException);
    });

    it('throws ClassNotFoundException when the class belongs to another school', async () => {
      classes.findById.mockResolvedValue(null);

      await expect(
        service.findById('class-1', 'school-2'),
      ).rejects.toBeInstanceOf(ClassNotFoundException);
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      classes.findById.mockRejectedValue(dbError);

      await expect(service.findById('class-1', 'school-1')).rejects.toBe(
        dbError,
      );
    });
  });

  describe('findMany', () => {
    it('passes pagination and the caller schoolId through and maps items to DTOs', async () => {
      classes.findMany.mockResolvedValue({
        items: [existingClass],
        total: 1,
        page: 1,
        limit: 20,
      });
      const query: ListClassesQueryDto = { page: 1, limit: 20 };

      const result = await service.findMany(query, 'school-1');

      expect(classes.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        schoolId: 'school-1',
      });
      expect(result).toEqual({
        items: [{ id: 'class-1', name: 'Grade 5-A', schoolId: 'school-1' }],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      classes.findMany.mockRejectedValue(dbError);

      await expect(
        service.findMany({ page: 1, limit: 20 }, 'school-1'),
      ).rejects.toBe(dbError);
    });
  });
});
