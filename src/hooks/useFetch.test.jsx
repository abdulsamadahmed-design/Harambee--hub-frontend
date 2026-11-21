// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import api from "../services/api";
import useFetch from "./useFetch";

// Replace the real api with a fake one, so no backend is needed
vi.mock("../services/api", () => ({ default: { get: vi.fn() } }));

// A promise we finish by hand, to control which answer arrives first
function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  api.get.mockReset();
});

describe("useFetch", () => {
  it("loads data on the first render", async () => {
    api.get.mockResolvedValue({ items: [1] });
    const { result } = renderHook(() => useFetch("/campaigns"));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ items: [1] });
    expect(result.current.error).toBeNull();
  });

  it("reports a failed request", async () => {
    api.get.mockRejectedValue(new Error("Boom"));
    const { result } = renderHook(() => useFetch("/campaigns"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Boom");
    expect(result.current.data).toBeNull();
  });

  it("loads again when the path changes", async () => {
    api.get.mockImplementation((path) => Promise.resolve({ path }));
    const { result, rerender } = renderHook(({ path }) => useFetch(path), {
      initialProps: { path: "/a" },
    });
    await waitFor(() => expect(result.current.data).toEqual({ path: "/a" }));
    rerender({ path: "/b" });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ path: "/b" }));
  });

  it("ignores a late answer from an old request", async () => {
    const first = deferred();
    const second = deferred();
    api.get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(({ path }) => useFetch(path), {
      initialProps: { path: "/slow" },
    });
    rerender({ path: "/fast" });
    await act(async () => {
      second.resolve({ from: "fast" });
    });
    await waitFor(() => expect(result.current.data).toEqual({ from: "fast" }));
    await act(async () => {
      first.resolve({ from: "slow" });
    });
    expect(result.current.data).toEqual({ from: "fast" });
  });

  it("does nothing for an empty path", () => {
    const { result } = renderHook(() => useFetch(null));
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ data: null, loading: false, error: null });
  });

  it("shows no old data when the path becomes empty", async () => {
    api.get.mockResolvedValue({ ok: true });
    const { result, rerender } = renderHook(({ path }) => useFetch(path), {
      initialProps: { path: "/a" },
    });
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    rerender({ path: null });
    expect(result.current).toMatchObject({ data: null, loading: false, error: null });
  });

  it("treats the same path after an empty path as a new request", async () => {
    const again = deferred();
    api.get.mockResolvedValueOnce({ n: 1 }).mockReturnValueOnce(again.promise);
    const { result, rerender } = renderHook(({ path }) => useFetch(path), {
      initialProps: { path: "/a" },
    });
    await waitFor(() => expect(result.current.data).toEqual({ n: 1 }));
    rerender({ path: null });
    rerender({ path: "/a" });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => {
      again.resolve({ n: 2 });
    });
    await waitFor(() => expect(result.current.data).toEqual({ n: 2 }));
  });

  it("refetch asks again and stays the same function", async () => {
    api.get.mockResolvedValueOnce({ n: 1 }).mockResolvedValueOnce({ n: 2 });
    const { result, rerender } = renderHook(() => useFetch("/a"));
    await waitFor(() => expect(result.current.data).toEqual({ n: 1 }));
    const firstRefetch = result.current.refetch;
    rerender();
    expect(result.current.refetch).toBe(firstRefetch);
    act(() => result.current.refetch());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ n: 2 }));
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});