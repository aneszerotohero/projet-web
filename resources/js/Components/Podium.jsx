import React from 'react';
import { motion } from 'framer-motion';

export default function Podium({ top3 = [] }) {
  const colors = ['#FFD700', '#60A5FA', '#94A3B8'];
  return (
    <div className="flex items-end gap-4">
      {top3.map((p, i) => (
        <motion.div key={p.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="text-center">
          <div style={{ background: colors[i], height: `${120 + (2 - i) * 30}px`, width: '100px' }} className="rounded-t p-2 flex items-end justify-center">{p.moyenne_cycle?.toFixed(2)}</div>
          <div className="mt-2 font-semibold">{p.nom} {p.prenom}</div>
          <div className="text-sm">#{i+1}</div>
        </motion.div>
      ))}
    </div>
  );
}
