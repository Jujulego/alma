import { PromiseResource } from '../src';

// Setup
let resolve: (data: string) => void;
let reject: (err: unknown) => void;
let resource: PromiseResource<string>;

beforeEach(() => {
  resource = new PromiseResource(
    new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    })
  );
});

// Tests
describe('PromiseResource', () => {
  it('should succeed & resolve when promise resolve', async () => {
    resolve('test');

    await expect(resource).resolves.toBe('test');

    expect(resource.status).toBe('success');
    expect(resource.read()).toBe('test');
  });

  it('should fail & reject when promise reject', async () => {
    reject(new Error('test'));

    await expect(resource).rejects.toEqual(new Error('test'));

    expect(resource.status).toBe('error');
    expect(() => resource.read()).toThrow(new Error('test'));
  });
});

describe('PromiseResource.then', () => {
  it('should return a new PromiseResource that will resolve at the same time', async () => {
    const res = resource.then((txt) => txt.length);

    resolve('test');

    await expect(resource).resolves.toBe('test');
    await expect(res).resolves.toBe(4);

    expect(res.status).toBe('success');
    expect(res.read()).toBe(4);
  });

  it('should fail & reject when promise reject', async () => {
    const res = resource.then((txt) => txt.length);

    reject(new Error('test'));

    await expect(resource).rejects.toEqual(new Error('test'));
    await expect(res).rejects.toEqual(new Error('test'));

    expect(res.status).toBe('error');
    expect(() => res.read()).toThrow(new Error('test'));
  });
});
