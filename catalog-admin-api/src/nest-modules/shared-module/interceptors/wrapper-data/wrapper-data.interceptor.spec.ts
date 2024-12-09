import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from './wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should wrap body with data property', async () => {
      const observable$ = interceptor.intercept({} as any, {
        handle: () => of({ name: 'test' }),
      });

      const result = await lastValueFrom(observable$);

      expect(result).toEqual({ data: { name: 'test' } });
    });

    it('should not wrap body with data property if it is null', async () => {
      const observable$ = interceptor.intercept({} as any, {
        handle: () => of(null),
      });

      const result = await lastValueFrom(observable$);

      expect(result).toBeNull();
    });

    it('should not wrap body with data property if it already has meta property', async () => {
      const data = { data: { name: 'test' }, meta: { total: 1 } };
      const observable$ = interceptor.intercept({} as any, {
        handle: () => of(data),
      });

      const result = await lastValueFrom(observable$);

      expect(result).toEqual(data);
    });
  });
});
