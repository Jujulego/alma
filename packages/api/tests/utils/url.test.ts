import { normalizeUrl } from '../../src';

describe('normalizeUrl', () => {
  // Test
  it('should return the same function', () => {
    const builder = (arg: string) => `/test/${arg}`;
    const url = normalizeUrl(builder);

    expect(url).toBe(builder);
    expect(url('arg')).toBe('/test/arg');
  });

  it('should return a function returning given url', () => {
    const url = normalizeUrl('/test');

    expect(url()).toBe('/test');
  });
});
