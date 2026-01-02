import { useState } from 'react';

export default function useFilter(initial = {}) {
  const [filters, setFilters] = useState(initial);

  function set(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function reset() { setFilters(initial); }

  return { filters, set, reset };
}
