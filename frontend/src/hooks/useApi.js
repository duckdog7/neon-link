import { useState, useEffect, useCallback } from 'react';

export function useApi(url, interval = 30_000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, interval);
    return () => clearInterval(id);
  }, [fetch_, interval]);

  return { data, error, loading, refetch: fetch_ };
}
