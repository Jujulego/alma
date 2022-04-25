import { ApiResource, ApiResponse } from '../src';

// Constants
const response: ApiResponse<string> = {
  status: 200,
  statusText: 'OK',
  headers: {},
  data: 'test'
};

// Setup
let resolve: (data: ApiResponse<string>) => void;
let resource: ApiResource<string>;
let controller: AbortController;

beforeEach(() => {
  controller = new AbortController();
  resource = new ApiResource(
    new Promise<ApiResponse<string>>((res) => {
      resolve = res;
    }),
    controller,
  );

  jest.spyOn(controller, 'abort');
});

// Tests
describe('ApiResource.subscribe', () => {
  it('should call callback when promise succeed', async () => {
    const cb = jest.fn();
    resource.subscribe(cb);

    resolve(response);
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).toHaveBeenCalledWith(response);
  });

  it('should abort when all subscription are unsubscribed', async () => {
    const cb = jest.fn();

    const unsub1 = resource.subscribe(cb);
    const unsub2 = resource.subscribe(cb);

    // 1st should do nothing
    unsub1();
    await new Promise((resolve) => setTimeout(resolve));

    expect(controller.abort).not.toHaveBeenCalled();

    // 2nd should abort
    unsub2();
    await new Promise((resolve) => setTimeout(resolve));

    expect(controller.abort).toHaveBeenCalled();
  });

  it('should prevent cb calls when all subscription are unsubscribed', async () => {
    const cb = jest.fn();
    const unsub = resource.subscribe(cb);

    unsub();

    resolve(response);
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).not.toHaveBeenCalled();
  });

  it('should prevent abort if read has been used', async () => {
    const cb = jest.fn();
    const unsub = resource.subscribe(cb);

    expect(() => resource.read()).toThrow(expect.any(Promise));

    unsub();

    resolve(response);
    await new Promise((resolve) => setTimeout(resolve));

    expect(cb).not.toHaveBeenCalled();
    expect(controller.abort).not.toHaveBeenCalled();
  });
});
