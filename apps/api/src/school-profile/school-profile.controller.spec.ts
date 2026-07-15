import { SchoolProfileController } from './school-profile.controller';
import { SchoolProfileService } from './school-profile.service';

describe('SchoolProfileController', () => {
  let controller: SchoolProfileController;
  let service: jest.Mocked<Pick<SchoolProfileService, 'find'>>;

  beforeEach(() => {
    service = { find: jest.fn() };
    controller = new SchoolProfileController(
      service as unknown as SchoolProfileService,
    );
  });

  it('delegates find to the service', async () => {
    const profile = {
      id: 'profile-1',
      name: 'Riverside International School',
      mission: 'To nurture curious, confident learners.',
      foundedYear: 1998,
      address: '42 Riverside Avenue',
      contactEmail: 'info@riverside.example',
      contactPhone: null,
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };
    service.find.mockResolvedValue(profile);

    await expect(controller.find()).resolves.toBe(profile);
    expect(service.find).toHaveBeenCalledWith();
  });
});
