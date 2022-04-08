import { normalizeUpdator } from '../../old';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suite
describe('normalizeUpdator', () => {
  // Test
  it('should return the same function', () => {
    const updator = (data: string) => data;
    expect(normalizeUpdator(updator)).toBe(updator);
  });

  it('should return a function returning given value', () => {
    const updator = normalizeUpdator('updated');
    expect(updator('test')).toBe('updated');
  });
});
