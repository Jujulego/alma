import { makeApiPromise } from '../src';

// Setup
let prom: Promise<string>;
let resolve: (res: string) => void;
let cancel: () => void;

beforeEach(() => {
  jest.resetAllMocks();

  cancel = jest.fn();
  prom = new Promise<string>((res) => { resolve = res; });
});

// Test suites
describe('ApiPromise', () => {
  it('should be a usable promise', async () => {
    const api = makeApiPromise(prom, cancel);

    // Should be a usable
    resolve('test');
    await expect(api).resolves.toBe('test');
  });

  it('should have cancel method', async () => {
    const api = makeApiPromise(prom, cancel);

    // Should have cancel method
    expect(api.cancel).toBe(cancel);
  });
});

describe('ApiPromise.then', () => {
  it('should return a usable promise', async () => {
    const api = makeApiPromise(prom, cancel).then((txt) => 'working ' + txt);

    // Should be a usable
    resolve('test');
    await expect(api).resolves.toBe('working test');
  });

  it('should propagate cancel method', async () => {
    const api = makeApiPromise(prom, cancel).then((txt) => 'working ' + txt);

    // Should have cancel method
    expect(api.cancel).toBe(cancel);
  });
});

describe('ApiPromise.catch', () => {
  it('should return a usable promise', async () => {
    const api = makeApiPromise(prom, cancel).catch(() => undefined);

    // Should be a usable
    resolve('test');
    await expect(api).resolves.toBe('test');
  });

  it('should propagate cancel method', async () => {
    const api = makeApiPromise(prom, cancel).catch(() => undefined);

    // Should have cancel method
    expect(api.cancel).toBe(cancel);
  });
});