import React, { createContext, useContext, useState } from 'react';

const RankingContext = createContext(null);

export function RankingProvider({ children }) {
  const [filters, setFilters] = useState({ semestre: null, specialite_id: null, option_id: null, search: '' });
  const [pagination, setPagination] = useState({ page: 1, perPage: 20 });

  return (
    <RankingContext.Provider value={{ filters, setFilters, pagination, setPagination }}>
      {children}
    </RankingContext.Provider>
  );
}

export function useRanking() {
  const ctx = useContext(RankingContext);
  if (!ctx) throw new Error('useRanking must be used inside RankingProvider');
  return ctx;
}
