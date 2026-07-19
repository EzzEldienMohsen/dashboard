import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';

describe('CreatorController', () => {
  let controller: CreatorController;
  let service: jest.Mocked<Pick<CreatorService, 'find'>>;

  beforeEach(() => {
    service = { find: jest.fn() };
    controller = new CreatorController(service as unknown as CreatorService);
  });

  it('delegates find to the service', async () => {
    const creator = {
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
    service.find.mockResolvedValue(creator);

    await expect(controller.find()).resolves.toBe(creator);
    expect(service.find).toHaveBeenCalledWith();
  });
});
