import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function ChartWrapper({ type = 'bar', data = {}, options = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    const chart = new Chart(ctx, { type, data, options });
    return () => chart.destroy();
  }, [type, data, options]);

  return <canvas ref={ref} />;
}
