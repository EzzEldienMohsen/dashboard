import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListAnnouncementsQueryDto } from './list-announcements-query.dto';

function toDto(payload: Record<string, unknown>): ListAnnouncementsQueryDto {
  return plainToInstance(ListAnnouncementsQueryDto, payload);
}

describe('ListAnnouncementsQueryDto', () => {
  it('allows category to be omitted', async () => {
    const errors = await validate(toDto({}));

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid category', async () => {
    const errors = await validate(toDto({ category: 'EXAM' }));

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid category', async () => {
    const errors = await validate(toDto({ category: 'NOT_A_CATEGORY' }));

    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('still enforces the inherited pagination constraints', async () => {
    const errors = await validate(toDto({ page: '0' }));

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });
});
