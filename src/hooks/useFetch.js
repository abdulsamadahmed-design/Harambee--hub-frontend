import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// Loads data from the backend.
export default function useFetch(path) {
  const [requestId, setRequestId] = useState(0);
  const [lastPath, setLastPath] = useState(path);
  const [result, setResult] = useState({
    requestId: null,
    data: null,
    error: null,
  });

  // A changed path starts a new request.
  if (path !== lastPath) {
    setLastPath(path);
    setRequestId((id) => id + 1);
  }

  useEffect(() => {
    if (!path) return;

    let cancelled = false;

    api
      .get(path)
      .then((data) => {
        if (!cancelled) {
          setResult({ requestId, data, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            requestId,
            data: null,
            error: err.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, requestId]);

  const refetch = useCallback(() => {
    setRequestId((id) => id + 1);
  }, []);

  if (!path) {
    return { data: null, loading: false, error: null, refetch };
  }

  const loading = result.requestId !== requestId;

  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    refetch,
  };
}
