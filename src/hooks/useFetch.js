import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// Loads data from the backend. Example: const { data, loading, error } = useFetch("/campaigns");
export default function useFetch(path) {
  const [data, setData] = useState(null); // the answer from the backend
  const [loading, setLoading] = useState(Boolean(path)); // true while we wait
  const [error, setError] = useState(null); // an error message, if something went wrong

  // The function that asks the backend; useCallback keeps it stable between renders
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(path);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // runs whether it worked or failed
    }
  }, [path]);

  // Ask the backend when the page opens, and again if the path changes
  useEffect(() => {
    if (path) {
      fetchData();
    }
  }, [path, fetchData]);

  // refetch lets a page reload the data, for example after creating a campaign
  return { data, loading, error, refetch: fetchData };
}
