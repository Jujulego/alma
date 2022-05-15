import { AbortHolder, AbortResource } from '../src';

// Setup
let resolve: (data: string) => void;
let resource: AbortResource<string>;
let holder: AbortHolder;

beforeEach(() => {
  holder = { abort: jest.fn() };
  resource = new AbortResource(
    new Promise<string>((res) => {
      resolve = res;
    }),
    holder,
  );
});

// Tests
describe('AbortResource.abort', () => {
  it('should call the abort function', async () => {
    resource.abort();

    expect(holder.abort).toHaveBeenCalled();
  });

  it('should call the "parent" abort function (then)', async () => {
    const res = resource.then(() => null);
    res.abort();

    expect(holder.abort).toHaveBeenCalled();
  });

  it('should call the "parent" abort function (catch)', async () => {
    const res = resource.catch(() => null);
    res.abort();

    expect(holder.abort).toHaveBeenCalled();
  });
});

describe('AbortResource.subscribe', () => {
  it('should call callback when promise succeed', async () => {
    const cb = jest.fn();
    resource.subscribe(cb);

    resolve('test');
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).toHaveBeenCalledWith('test');
  });

  it('should abort when all subscription are unsubscribed', async () => {
    const cb = jest.fn();

    const unsub1 = resource.subscribe(cb);
    const unsub2 = resource.subscribe(cb);

    // 1st should do nothing
    unsub1();
    await new Promise((resolve) => setTimeout(resolve));

    expect(holder.abort).not.toHaveBeenCalled();

    // 2nd should abort
    unsub2();
    await new Promise((resolve) => setTimeout(resolve));

    expect(holder.abort).toHaveBeenCalled();
  });

  it('should prevent cb calls when all subscription are unsubscribed', async () => {
    const cb = jest.fn();
    const unsub = resource.subscribe(cb);

    unsub();

    resolve('test');
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).not.toHaveBeenCalled();
  });

  it('should prevent abort if read has been used', async () => {
    const cb = jest.fn();
    const unsub = resource.subscribe(cb);

    expect(() => resource.read()).toThrow(expect.any(Promise));

    unsub();

    resolve('test');
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).not.toHaveBeenCalled();
    expect(holder.abort).not.toHaveBeenCalled();
  });
});
