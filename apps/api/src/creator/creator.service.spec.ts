import { Test } from '@nestjs/testing';
import { CreatorService } from './creator.service';
import {
  CREATOR_REPOSITORY,
  type ICreatorRepository,
} from './interfaces/creator-repository.interface';
import { CreatorNotFoundException } from '../common/exceptions/creator-not-found.exception';

describe('CreatorService', () => {
  let service: CreatorService;

  const creator: jest.Mocked<ICreatorRepository> = {
    find: jest.fn(),
  };

  const existingCreator = {
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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreatorService,
        { provide: CREATOR_REPOSITORY, useValue: creator },
      ],
    }).compile();

    service = moduleRef.get(CreatorService);
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('returns the mapped DTO when the creator profile exists', async () => {
      creator.find.mockResolvedValue(existingCreator);

      const result = await service.find();

      expect(creator.find).toHaveBeenCalledWith();
      expect(result).toEqual(existingCreator);
    });

    it('throws CreatorNotFoundException when unconfigured', async () => {
      creator.find.mockResolvedValue(null);

      await expect(service.find()).rejects.toBeInstanceOf(
        CreatorNotFoundException,
      );
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      creator.find.mockRejectedValue(dbError);

      await expect(service.find()).rejects.toBe(dbError);
    });
  });
});
