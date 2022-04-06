import { Resource, ResourceUpdateEvent } from '../src';

// Setup
let resource: Resource<string>;
const updateEventSpy = jest.fn<void, [ResourceUpdateEvent<string>]>();

beforeEach(() => {
  resource = new Resource();

  updateEventSpy.mockReset();
  resource.addEventListener('update', updateEventSpy);
});

// Tests
describe('initial "pending" state', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(resource.status).toBe('pending');
  });

  it('should throw a promise when we try to read', () => {
    expect(() => resource.read()).toThrow(expect.any(Promise));
  });
});

describe('"pending" => "success"', () => {
  it('should emit the "update" event', () => {
    // Change resource to "success" state
    resource.success('result');
    expect(resource.status).toBe('success');

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new ResourceUpdateEvent({
      status: 'success',
      result: 'result'
    }));
  });

  it('should resolve the promise thrown by read', async () => {
    // Get promise from read()
    const prom: Promise<void> = (() => {
      try {
        resource.read();
      } catch (err) {
        return err;
      }

      throw new Error('Resource.read() did not throw !');
    })();

    // Change resource to "success" state
    resource.success('result');
    expect(resource.status).toBe('success');

    // Check promise
    await expect(prom).resolves.toBeUndefined();
  });

  it('should return "result" on next read calls', () => {
    // Change resource to "success" state
    resource.success('result');
    expect(resource.status).toBe('success');

    // Check event
    expect(resource.read()).toBe('result');
  });
});

describe('"pending" => "error"', () => {
  it('should emit the "update" event', () => {
    // Change resource to "error" state
    resource.error(new Error('fail'));
    expect(resource.status).toBe('error');

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new ResourceUpdateEvent({
      status: 'error',
      result: new Error('fail')
    }));
  });

  it('should resolve the promise thrown by read', async () => {
    // Get promise from read()
    const prom: Promise<void> = (() => {
      try {
        resource.read();
      } catch (err) {
        return err;
      }

      throw new Error('Resource.read() did not throw !');
    })();

    // Change resource to "error" state
    resource.error(new Error('fail'));
    expect(resource.status).toBe('error');

    // Check promise
    await expect(prom).resolves.toBeUndefined();
  });

  it('should trow "fail" on next read calls', () => {
    // Change resource to "error" state
    resource.error(new Error('fail'));
    expect(resource.status).toBe('error');

    // Check event
    expect(() => resource.read()).toThrow(new Error('fail'));
  });
});
