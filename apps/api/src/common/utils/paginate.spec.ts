import { paginate } from './paginate';

describe('paginate', () => {
  it('computes skip from page/limit and forwards take', async () => {
    const findMany = jest.fn().mockResolvedValue(['a', 'b']);
    const count = jest.fn().mockResolvedValue(42);

    const result = await paginate({ page: 3, limit: 10 }, findMany, count);

    expect(findMany).toHaveBeenCalledWith({ skip: 20, take: 10 });
    expect(count).toHaveBeenCalledWith();
    expect(result).toEqual({
      items: ['a', 'b'],
      total: 42,
      page: 3,
      limit: 10,
    });
  });

  it('uses skip 0 on the first page', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);

    await paginate({ page: 1, limit: 20 }, findMany, count);

    expect(findMany).toHaveBeenCalledWith({ skip: 0, take: 20 });
  });

  it('runs findMany and count concurrently', async () => {
    const order: string[] = [];
    const findMany = jest.fn().mockImplementation(async () => {
      order.push('findMany-start');
      await Promise.resolve();
      order.push('findMany-end');
      return [];
    });
    const count = jest.fn().mockImplementation(async () => {
      order.push('count-start');
      await Promise.resolve();
      order.push('count-end');
      return 0;
    });

    await paginate({ page: 1, limit: 20 }, findMany, count);

    expect(order[0]).toBe('findMany-start');
    expect(order[1]).toBe('count-start');
  });
});
