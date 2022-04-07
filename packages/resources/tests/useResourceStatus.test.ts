import { act, renderHook } from '@testing-library/react-hooks';

import { Resource, useResourceStatus } from '../src';

// Setup
let resource: Resource<string>;

beforeEach(() => {
  resource = new Resource();
});

// Tests
describe('useResourceStatus', () => {
  it('should return current resource status ("pending" then "success")', () => {
    const { result } = renderHook(() => useResourceStatus(resource));

    // "pending" at start
    expect(result.current).toBe('pending');

    // Change to "success"
    act(() => resource.success('result'));
    expect(result.current).toBe('success');
    expect(result.all).toHaveLength(2);
  });

  it('should return current resource status ("success" only)', () => {
    resource.success('result');
    const { result } = renderHook(() => useResourceStatus(resource));

    // "success" at start
    expect(result.current).toBe('success');
    expect(result.all).toHaveLength(1);
  });

  it('should return current resource status ("pending" then "error")', () => {
    const { result } = renderHook(() => useResourceStatus(resource));

    // "pending" at start
    expect(result.current).toBe('pending');

    // Change to "success"
    act(() => resource.error(new Error('fail')));
    expect(result.current).toBe('error');
  });

  it('should return current resource status ("error" only)', () => {
    resource.error(new Error('fail'));
    const { result } = renderHook(() => useResourceStatus(resource));

    // "error" at start
    expect(result.current).toBe('error');
    expect(result.all).toHaveLength(1);
  });
});
