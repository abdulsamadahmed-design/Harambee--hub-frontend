import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../services/api";

export default function useFetch(path) {
  const [reloadCount, setReloadCount] = useState(0);

  const [result, setResult] = useState({
    request: null,
    data: null,
    error: null,
  });

  const request = useMemo(
    () => ({ path, reloadCount }),
    [path, reloadCount]
  );

  useEffect(() => {
    if (!path) return;

    let cancelled = false;

    api
      .get(path)
      .then((data) => {
        if (!cancelled) {
          setResult({ request, data, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ request, data: null, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, request]);

  const refetch = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  if (!path) {
    return {
      data: null,
      loading: false,
      error: null,
      refetch,
    };
  }

  const loading = result.request !== request;

  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    refetch,
  };
}