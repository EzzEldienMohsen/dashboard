import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

function toDto(payload: Record<string, unknown>): PaginationQueryDto {
  return plainToInstance(PaginationQueryDto, payload);
}

describe('PaginationQueryDto', () => {
  it('defaults page to 1 and limit to 20 when omitted', async () => {
    const dto = toDto({});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('coerces numeric query-string values', async () => {
    const dto = toDto({ page: '3', limit: '50' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(50);
  });

  it('rejects a page below 1', async () => {
    const errors = await validate(toDto({ page: '0' }));

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects a limit above 100', async () => {
    const errors = await validate(toDto({ limit: '101' }));

    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('rejects a non-integer page', async () => {
    const errors = await validate(toDto({ page: '1.5' }));

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });
});
