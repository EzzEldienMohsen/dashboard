import { Test } from '@nestjs/testing';
import { StudentsService } from './students.service';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from './interfaces/student-repository.interface';
import { StudentNotFoundException } from '../common/exceptions/student-not-found.exception';
import type { ListStudentsQueryDto } from './dto/list-students-query.dto';

describe('StudentsService', () => {
  let service: StudentsService;

  const students: jest.Mocked<IStudentRepository> = {
    findById: jest.fn(),
    findMany: jest.fn(),
  };

  const existingStudent = {
    id: 'student-1',
    firstName: 'Jane',
    lastName: 'Doe',
    classId: 'class-1',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: STUDENT_REPOSITORY, useValue: students },
      ],
    }).compile();

    service = moduleRef.get(StudentsService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the mapped DTO when the student exists', async () => {
      students.findById.mockResolvedValue(existingStudent);

      const result = await service.findById('student-1');

      expect(students.findById).toHaveBeenCalledWith('student-1');
      expect(result).toEqual({
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Doe',
        classId: 'class-1',
      });
    });

    it('throws StudentNotFoundException when the student does not exist', async () => {
      students.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        StudentNotFoundException,
      );
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      students.findById.mockRejectedValue(dbError);

      await expect(service.findById('student-1')).rejects.toBe(dbError);
    });
  });

  describe('findMany', () => {
    it('passes pagination and classId filter through and maps items to DTOs', async () => {
      students.findMany.mockResolvedValue({
        items: [existingStudent],
        total: 1,
        page: 1,
        limit: 20,
      });
      const query: ListStudentsQueryDto = {
        page: 1,
        limit: 20,
        classId: 'class-1',
      };

      const result = await service.findMany(query);

      expect(students.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        classId: 'class-1',
      });
      expect(result).toEqual({
        items: [
          {
            id: 'student-1',
            firstName: 'Jane',
            lastName: 'Doe',
            classId: 'class-1',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      students.findMany.mockRejectedValue(dbError);

      await expect(service.findMany({ page: 1, limit: 20 })).rejects.toBe(
        dbError,
      );
    });
  });
});
