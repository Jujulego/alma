import { AbortResource } from '../src';

// Tests
describe('AbortPromise.abort', () => {
  it('should call the abort function', async () => {
    const abort = jest.fn();
    const res = new AbortResource(new Promise(() => undefined), { abort });

    res.abort();

    expect(abort).toHaveBeenCalled();
  });

  it('should call the abort "parent" function', async () => {
    const abort = jest.fn();
    const res1 = new AbortResource(new Promise(() => undefined), { abort });
    const res2 = res1.then(() => null);

    res2.abort();

    expect(abort).toHaveBeenCalled();
  });
});
