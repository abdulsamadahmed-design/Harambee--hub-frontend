import { useState, useEffect } from "react";
import api from "../services/api";

// Loads data from the backend. Example: const { data, loading, error } = useFetch("/campaigns");
export default function useFetch(path) {
  const [reloadCount, setReloadCount] = useState(0);
  // The last finished request, saved together with the request it belongs to
  const [result, setResult] = useState({ request: null, data: null, error: null });

  // A new request starts when the path changes or refetch is called
  const request = `${path}#${reloadCount}`;

  useEffect(() => {
    if (!path) return;
    let cancelled = false; // stops an old request from overwriting a newer one

    api
      .get(path)
      .then((data) => {
        if (!cancelled) setResult({ request, data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setResult({ request, data: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [path, request]);

  // We are loading until the answer for the current request has arrived
  const loading = Boolean(path) && result.request !== request;

  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    refetch: () => setReloadCount((count) => count + 1),
  };
}
