import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get(url).then(res => {
      if (mounted) {
        setData(res.data);
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        setError(err);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, deps);

  return { data, loading, error };
}
